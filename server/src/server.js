import express from 'express'; import mongoose from 'mongoose'; import cors from 'cors'; import fs from 'fs';
import { config } from './config.js'; import authRoutes from './routes/authRoutes.js'; import caseRoutes from './routes/caseRoutes.js'; import aiRoutes from './routes/aiRoutes.js'; import { errorHandler, notFound } from './middleware/errors.js';
fs.mkdirSync('uploads', { recursive: true });
const app = express(); app.use(cors({ origin: config.clientUrl, credentials: false })); app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', authRoutes); app.use('/api/cases', caseRoutes); app.use('/api/ai', aiRoutes); app.use(notFound); app.use(errorHandler);
if (!config.jwtSecret) console.warn('JWT_SECRET is not set. Add it to server/.env before production.');
mongoose.connect(config.mongoUri).then(() => app.listen(config.port, () => console.log(`Voice2Case API listening on ${config.port}`))).catch(error => { console.error(`MongoDB connection failed: ${error.message}`); process.exit(1); });
