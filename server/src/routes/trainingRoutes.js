import express from 'express';
import { getTrainings, createTraining, updateTraining, deleteTraining } from '../controllers/trainingController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getTrainings);
router.post('/', requireRoles(['ADMIN', 'HR']), createTraining);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateTraining);
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deleteTraining);

export default router;
