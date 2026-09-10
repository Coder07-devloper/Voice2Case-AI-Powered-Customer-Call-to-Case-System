import OpenAI from 'openai';
import { config, categories, priorities, sentiments, escalations } from '../config.js';

const schema = { name: 'support_case_analysis', strict: true, schema: { type: 'object', additionalProperties: false, required: ['summary','customerIssue','customerIntent','category','priority','sentiment','keyInformation','troubleshootingAttempted','followUpRequired','recommendedNextAction','escalation','requestedOutcome'], properties: {
  summary: { type: 'string' }, customerIssue: { type: 'string' }, customerIntent: { type: 'string' }, category: { type: 'string', enum: categories }, priority: { type: 'string', enum: priorities }, sentiment: { type: 'string', enum: sentiments }, keyInformation: { type: 'array', items: { type: 'string' } }, troubleshootingAttempted: { type: 'array', items: { type: 'string' } }, followUpRequired: { type: 'string' }, recommendedNextAction: { type: 'string' }, escalation: { type: 'string', enum: escalations }, requestedOutcome: { type: 'string' }
} } };

function getClient() {
  // Groq intentionally exposes an OpenAI-compatible API. Using the same SDK keeps
  // the provider switch small and leaves the rest of the application unchanged.
  if (!['openai', 'groq'].includes(config.aiProvider)) {
    const error = new Error(`Unsupported AI_PROVIDER: ${config.aiProvider}. Use "openai" or "groq".`); error.status = 503; throw error;
  }
  return new OpenAI({ apiKey: config.aiKey, ...(config.aiProvider === 'groq' ? { baseURL: 'https://api.groq.com/openai/v1' } : {}) });
}
export async function analyzeTranscript(transcript) {
  if (!config.aiKey) { const error = new Error('AI is not configured. Add AI_API_KEY to enable analysis, or complete the case manually.'); error.status = 503; throw error; }
  const client = getClient();
  try {
    const response = await client.chat.completions.create({ model: config.aiModel, response_format: { type: 'json_schema', json_schema: schema }, messages: [
      { role: 'system', content: 'You create precise internal support-case documentation. Analyze only the supplied conversation. Never invent facts, customer details, or attempted steps. Use "Not provided" for unavailable scalar information and [] for unavailable lists. Extract only steps actually mentioned. Recommendations may be reasonable but must be clearly concise. Select exactly the supplied enum values. Set priority based on impact/urgency expressed, not guesswork.' },
      { role: 'user', content: `Conversation transcript:\n${transcript}` }
    ] });
    const value = JSON.parse(response.choices[0]?.message?.content || '');
    for (const key of schema.schema.required) if (value[key] === undefined) throw new Error('AI response was incomplete.');
    return value;
  } catch (cause) {
    if (cause.message?.includes('AI response')) throw cause;
    // Keep credentials and provider payloads out of the browser while making setup errors actionable.
    console.error(`AI analysis provider error: HTTP ${cause.status || 'unknown'}${cause.code ? ` (${cause.code})` : ''}`);
    const messages = {
      401: 'The configured AI_API_KEY is invalid or expired. Update it in server/.env and restart the server.',
      403: 'The configured AI account does not have access to this model. Check AI_MODEL and account permissions.',
      404: 'The configured AI_MODEL was not found. Check AI_MODEL in server/.env.',
      429: 'The AI provider rate limit or account quota was reached. Check the AI account and try again shortly.'
    };
    const error = new Error(messages[cause.status] || 'Conversation analysis failed. Please retry or complete the case manually.'); error.status = 502; throw error;
  }
}
