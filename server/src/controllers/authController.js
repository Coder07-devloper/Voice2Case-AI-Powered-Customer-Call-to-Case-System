import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config.js';
const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
const tokenFor = user => jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
export async function register(req, res) { const { name, email, password } = req.body; if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' }); if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' }); const user = await User.create({ name, email, password }); res.status(201).json({ token: tokenFor(user), user: publicUser(user) }); }
export async function login(req, res) { const { email, password } = req.body; const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password'); if (!user || !(await user.comparePassword(password || ''))) return res.status(401).json({ message: 'Incorrect email or password.' }); res.json({ token: tokenFor(user), user: publicUser(user) }); }
export async function me(req, res) { res.json({ user: publicUser(req.user) }); }
