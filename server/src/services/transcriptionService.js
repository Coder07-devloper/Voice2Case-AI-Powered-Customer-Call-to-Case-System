import fs from 'fs';
import OpenAI, { toFile } from 'openai';
import { config } from '../config.js';

function getClient() {
  if (!['openai', 'groq'].includes(config.aiProvider)) {
    const error = new Error(`Unsupported AI_PROVIDER: ${config.aiProvider}. Use "openai" or "groq".`); error.status = 503; throw error;
  }
  return new OpenAI({ apiKey: config.aiKey, ...(config.aiProvider === 'groq' ? { baseURL: 'https://api.groq.com/openai/v1' } : {}) });
}
export async function transcribeAudio(file) {
  if (!config.aiKey) { const error = new Error('Transcription is not configured. Add AI_API_KEY or paste a transcript instead.'); error.status = 503; throw error; }
  try {
    const client = getClient();
    // Multer's temporary path has no extension. Explicit metadata ensures the provider
    // receives the original audio filename and a verified MIME type rather than octet-stream.
    const upload = await toFile(fs.createReadStream(file.path), file.originalname, { type: file.detectedMimeType || file.mimetype });
    const result = await client.audio.transcriptions.create({ file: upload, model: config.transcriptionModel });
    return result.text;
  }
  catch (cause) {
    const detail = String(cause.message || '').replace(/(?:sk|gsk)-[A-Za-z0-9_-]+/g, '[redacted]').slice(0, 240);
    console.error(`Transcription provider error: HTTP ${cause.status || 'unknown'}${cause.code ? ` (${cause.code})` : ''}${detail ? ` — ${detail}` : ''}`);
    let message = 'Transcription failed. Please try again or paste the transcript manually.';
    if (cause.status === 401) message = 'The configured AI_API_KEY is invalid or expired. Update it in server/.env and restart the server.';
    else if (cause.status === 429) message = 'The AI provider rate limit or account quota was reached. Paste a transcript or try again later.';
    else if (cause.status === 413) message = 'The audio file is too large for the transcription provider. Use a smaller file or paste the transcript.';
    else if (cause.status === 400) message = `The transcription provider rejected this audio file${detail ? `: ${detail}` : '.'} Verify it is a valid MP3, WAV, M4A, or WebM recording—not merely a renamed file.`;
    const error = new Error(message); error.status = 502; throw error;
  }
  finally { fs.promises.unlink(file.path).catch(() => {}); }
}
