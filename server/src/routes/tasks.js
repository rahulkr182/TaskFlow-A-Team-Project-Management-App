import { Router } from 'express';
import { getTasks, createTask, getTask, updateTask, deleteTask, moveTask, reorderTasks, uploadAttachment, removeAttachment } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(auth);
router.get('/project/:projectId', getTasks);
router.post('/project/:projectId', createTask);
router.put('/reorder', reorderTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/move', moveTask);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:attachmentId', removeAttachment);

export default router;
