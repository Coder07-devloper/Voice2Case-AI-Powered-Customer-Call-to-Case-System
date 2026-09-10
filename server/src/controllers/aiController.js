import { analyzeTranscript } from '../services/aiService.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import fs from 'fs';
import { validateUploadedAudio } from '../services/audioUploadValidation.js';
export async function analyze(req, res) { const transcript = req.body.transcript?.trim(); if (!transcript) return res.status(400).json({ message: 'A transcript is required.' }); if (transcript.length > 50000) return res.status(400).json({ message: 'Transcript must be 50,000 characters or fewer.' }); const analysis = await analyzeTranscript(transcript); res.json({ transcript, analysis }); }
export async function transcribe(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Please select a supported audio file.' });
  try { const audio = await validateUploadedAudio(req.file); const transcript = await transcribeAudio(audio); res.json({ transcript }); }
  catch (error) { fs.promises.unlink(req.file.path).catch(() => {}); throw error; }
}
