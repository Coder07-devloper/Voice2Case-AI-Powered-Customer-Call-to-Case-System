import fs from 'fs/promises';
import path from 'path';

const formats = {
  '.mp3': { mime: 'audio/mpeg' },
  '.wav': { mime: 'audio/wav' },
  '.m4a': { mime: 'audio/mp4' },
  '.webm': { mime: 'audio/webm' }
};

const acceptedMimeTypes = new Set([
  'audio/mpeg', 'audio/mp3', 'audio/x-mp3', 'audio/x-mpeg',
  'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave',
  'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/webm'
]);

export function isAudioUploadCandidate(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  return Boolean(formats[extension]) && (acceptedMimeTypes.has(file.mimetype) || file.mimetype === 'application/octet-stream');
}

function detectFormat(bytes) {
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WAVE') return '.wav';
  if (bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return '.webm';
  if (bytes.subarray(4, 8).toString('ascii') === 'ftyp') return '.m4a';
  if (bytes.subarray(0, 3).toString('ascii') === 'ID3') return '.mp3';
  // MPEG audio frame sync. Scan the initial portion so MP3s without ID3 metadata work too.
  for (let index = 0; index < bytes.length - 1; index += 1) if (bytes[index] === 0xff && (bytes[index + 1] & 0xe0) === 0xe0) return '.mp3';
  return null;
}

export async function validateUploadedAudio(file) {
  const expectedExtension = path.extname(file.originalname || '').toLowerCase();
  const expected = formats[expectedExtension];
  if (!expected || !isAudioUploadCandidate(file)) {
    const error = new Error('Unsupported audio format. Use a valid MP3, WAV, M4A, or WebM recording.'); error.status = 400; throw error;
  }

  const handle = await fs.open(file.path, 'r');
  let bytes;
  try { const buffer = Buffer.alloc(64 * 1024); const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0); bytes = buffer.subarray(0, bytesRead); }
  finally { await handle.close(); }

  const detectedExtension = detectFormat(bytes);
  if (!detectedExtension || detectedExtension !== expectedExtension) {
    const error = new Error('The uploaded file extension does not match a supported audio stream. Export it as a standard MP3, WAV, M4A, or WebM file and try again.'); error.status = 400; throw error;
  }

  // Multer receives a browser-provided MIME type. Use the detected format for the
  // provider upload so a generic browser MIME type cannot turn valid audio into octet-stream.
  return { ...file, detectedMimeType: expected.mime };
}
