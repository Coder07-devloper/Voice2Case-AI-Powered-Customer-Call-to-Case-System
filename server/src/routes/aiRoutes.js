import { Router } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { analyze, transcribe } from '../controllers/aiController.js';
import { isAudioUploadCandidate } from '../services/audioUploadValidation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 },
  // MIME is only a first pass because browsers may label downloaded MP3s as octet-stream.
  // The controller verifies the audio header after Multer has saved the temporary file.
  fileFilter: (req, file, cb) => {
    if (isAudioUploadCandidate(file)) return cb(null, true);
    const error = new Error('Unsupported audio format. Use a valid MP3, WAV, M4A, or WebM recording.');
    error.status = 400;
    return cb(error);
  }
});
router.use(auth);
router.post('/analyze', asyncHandler(analyze));
router.post('/transcribe', upload.single('audio'), asyncHandler(transcribe));
export default router;
