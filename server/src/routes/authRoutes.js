import { Router } from 'express'; import { login, me, register } from '../controllers/authController.js'; import { auth } from '../middleware/auth.js'; import { asyncHandler } from '../middleware/asyncHandler.js';
const router = Router(); router.post('/register', asyncHandler(register)); router.post('/login', asyncHandler(login)); router.get('/me', auth, asyncHandler(me)); export default router;
