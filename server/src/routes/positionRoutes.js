import express from 'express';
import { getPositions, getPositionById, createPosition, updatePosition, deletePosition } from '../controllers/positionController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getPositions);
router.get('/:id', getPositionById);
router.post('/', requireRoles(['ADMIN', 'HR']), createPosition);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updatePosition);
router.delete('/:id', requireRoles(['ADMIN']), deletePosition);

export default router;
