import mongoose from 'mongoose';
import { categories, priorities, sentiments, statuses, escalations } from '../config.js';
const text = { type: String, required: true, trim: true };
const supportCaseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true, index: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  transcript: { ...text, maxlength: 50000 },
  summary: { ...text, maxlength: 5000 }, customerIssue: { ...text, maxlength: 3000 }, customerIntent: { ...text, maxlength: 2000 },
  category: { type: String, enum: categories, default: 'Other' }, priority: { type: String, enum: priorities, default: 'Medium' },
  sentiment: { type: String, enum: sentiments, default: 'Neutral' }, keyInformation: [{ type: String, maxlength: 1000 }],
  troubleshootingAttempted: [{ type: String, maxlength: 1000 }], followUpRequired: { ...text, maxlength: 2000 },
  recommendedNextAction: { ...text, maxlength: 2000 }, escalation: { type: String, enum: escalations, default: 'Not Required' },
  requestedOutcome: { ...text, maxlength: 2000 }, status: { type: String, enum: statuses, default: 'New' }
}, { timestamps: true });
supportCaseSchema.index({ customerIssue: 'text', customerIntent: 'text', transcript: 'text', summary: 'text' });
supportCaseSchema.pre('validate', async function assignCaseId(next) {
  if (this.caseId) return next();
  const year = new Date().getFullYear();
  const count = await mongoose.model('SupportCase').countDocuments({});
  this.caseId = `V2C-${year}-${String(count + 1).padStart(6, '0')}`;
  next();
});
export default mongoose.model('SupportCase', supportCaseSchema);
