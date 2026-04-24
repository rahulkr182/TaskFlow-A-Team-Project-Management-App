import { Router } from 'express';
import { getProjects, createProject, getProject, updateProject, deleteProject, inviteMember, removeMember } from '../controllers/projectController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', inviteMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
