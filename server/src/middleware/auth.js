import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';
export async function auth(req, res, next) {
  try { const token = req.headers.authorization?.replace(/^Bearer\s+/i, ''); if (!token) return res.status(401).json({ message: 'Authentication required.' }); const payload = jwt.verify(token, config.jwtSecret); const user = await User.findById(payload.id); if (!user) return res.status(401).json({ message: 'User no longer exists.' }); req.user = user; next(); }
  catch { res.status(401).json({ message: 'Invalid or expired session.' }); }
}
