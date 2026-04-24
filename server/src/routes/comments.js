import { Router } from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.get('/task/:taskId', getComments);
router.post('/task/:taskId', addComment);
router.delete('/:id', deleteComment);

export default router;
