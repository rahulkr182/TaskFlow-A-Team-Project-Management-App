import { Router } from 'express';
import { getActivity } from '../controllers/activityController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.get('/project/:projectId', getActivity);

export default router;
