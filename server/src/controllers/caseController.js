import SupportCase from '../models/SupportCase.js';
import Note from '../models/Note.js';
import { statuses, priorities, categories, sentiments, escalations } from '../config.js';
const editable = ['transcript','summary','customerIssue','customerIntent','category','priority','sentiment','keyInformation','troubleshootingAttempted','followUpRequired','recommendedNextAction','escalation','requestedOutcome','status'];
const selectFields = obj => Object.fromEntries(editable.filter(key => obj[key] !== undefined).map(key => [key, obj[key]]));
export async function createCase(req, res) { const fields = selectFields(req.body); const missing = ['transcript','summary','customerIssue','customerIntent','followUpRequired','recommendedNextAction','requestedOutcome'].filter(key => !fields[key]?.trim?.()); if (missing.length) return res.status(400).json({ message: `Required fields missing: ${missing.join(', ')}` }); const item = await SupportCase.create({ ...fields, agent: req.user._id }); res.status(201).json({ case: item }); }
export async function listCases(req, res) {
  const { search = '', status, priority, category, sentiment, escalation, sort = 'newest', page = 1, limit = 20 } = req.query;
  const filter = { agent: req.user._id };
  if (search.trim()) { const pattern = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); filter.$or = ['caseId', 'customerIssue', 'customerIntent', 'transcript', 'summary', 'category'].map(field => ({ [field]: pattern })); }
  for (const [key, valid] of Object.entries({ status: statuses, priority: priorities, category: categories, sentiment: sentiments, escalation: escalations })) if (req.query[key] && valid.includes(req.query[key])) filter[key] = req.query[key];
  const sorting = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
  const safeLimit = Math.min(Math.max(Number(limit), 1), 100), skip = (Math.max(Number(page), 1) - 1) * safeLimit;
  const casesQuery = sort === 'priority'
    ? SupportCase.aggregate([{ $match: filter }, { $addFields: { priorityOrder: { $indexOfArray: [priorities, '$priority'] } } }, { $sort: { priorityOrder: -1, createdAt: -1 } }, { $skip: skip }, { $limit: safeLimit }])
    : SupportCase.find(filter).sort(sorting).skip(skip).limit(safeLimit).lean();
  const [cases, total] = await Promise.all([casesQuery, SupportCase.countDocuments(filter)]);
  res.json({ cases, total, page: Number(page), pages: Math.ceil(total / safeLimit) });
}
async function findOwned(caseId, agent) { return SupportCase.findOne({ caseId, agent }); }
export async function getCase(req, res) { const item = await findOwned(req.params.caseId, req.user._id); if (!item) return res.status(404).json({ message: 'Case not found.' }); res.json({ case: item }); }
export async function updateCase(req, res) { const item = await findOwned(req.params.caseId, req.user._id); if (!item) return res.status(404).json({ message: 'Case not found.' }); Object.assign(item, selectFields(req.body)); await item.save(); res.json({ case: item }); }
export async function deleteCase(req, res) { const item = await findOwned(req.params.caseId, req.user._id); if (!item) return res.status(404).json({ message: 'Case not found.' }); await Note.deleteMany({ case: item._id }); await item.deleteOne(); res.status(204).end(); }
export async function notes(req, res) { const item = await findOwned(req.params.caseId, req.user._id); if (!item) return res.status(404).json({ message: 'Case not found.' }); const notes = await Note.find({ case: item._id }).populate('agent', 'name email').sort({ createdAt: -1 }); res.json({ notes }); }
export async function addNote(req, res) { const item = await findOwned(req.params.caseId, req.user._id); if (!item) return res.status(404).json({ message: 'Case not found.' }); if (!req.body.note?.trim()) return res.status(400).json({ message: 'Note text is required.' }); const note = await Note.create({ case: item._id, agent: req.user._id, note: req.body.note }); await note.populate('agent', 'name email'); res.status(201).json({ note }); }
export async function stats(req, res) { const base = { agent: req.user._id }; const [byStatus, highPriority, followUp, insights, recent] = await Promise.all([
  SupportCase.aggregate([{ $match: base }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  SupportCase.countDocuments({ ...base, priority: { $in: ['High', 'Critical'] } }), SupportCase.countDocuments({ ...base, followUpRequired: { $ne: 'Not provided' } }),
  SupportCase.aggregate([{ $match: base }, { $facet: { category: [{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }], negative: [{ $match: { sentiment: { $in: ['Negative', 'Very Negative'] } } }, { $count: 'count' }], escalation: [{ $match: { escalation: { $in: ['Recommended', 'Required'] } } }, { $count: 'count' }] } }]),
  SupportCase.find(base).sort({ createdAt: -1 }).limit(6).lean()
]);
  const mapped = Object.fromEntries(byStatus.map(x => [x._id, x.count])); const i = insights[0];
  res.json({ total: byStatus.reduce((sum, x) => sum + x.count, 0), new: mapped.New || 0, inReview: mapped['In Review'] || 0, resolved: mapped.Resolved || 0, highPriority, followUp, insights: { commonCategory: i.category[0]?._id || 'No cases yet', negative: i.negative[0]?.count || 0, escalation: i.escalation[0]?.count || 0 }, recent });
}
