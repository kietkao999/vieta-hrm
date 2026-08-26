import express from 'express';
import { getSeniority, getWorkHistory, createWorkHistory, deleteWorkHistory } from '../controllers/seniorityController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getSeniority);
router.get('/work-history', getWorkHistory);
router.post('/work-history', requireRoles(['ADMIN', 'HR']), createWorkHistory);
router.delete('/work-history/:id', requireRoles(['ADMIN', 'HR']), deleteWorkHistory);

export default router;
