import 'dotenv/config';

const aiProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const aiKey = aiProvider === 'groq'
  ? (process.env.GROQ_API_KEY || process.env.AI_API_KEY || '')
  : (process.env.AI_API_KEY || '');

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/voice2case',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  aiProvider,
  // GROQ_API_KEY is preferred for Groq; AI_API_KEY remains a provider-neutral fallback.
  aiKey,
  aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
  transcriptionModel: process.env.TRANSCRIPTION_MODEL || 'whisper-1'
};

export const categories = ['Account','Billing','Technical Issue','Product','Login','Order','Delivery','Refund','Cancellation','Other'];
export const priorities = ['Low','Medium','High','Critical'];
export const sentiments = ['Positive','Neutral','Frustrated','Negative','Very Negative'];
export const statuses = ['New','In Review','Resolved','Closed'];
export const escalations = ['Not Required','Recommended','Required'];
