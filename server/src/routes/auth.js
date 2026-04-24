import { Router } from 'express';
import { register, login, refresh, getMe, updateMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);

export default router;
