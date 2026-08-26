import express from 'express';
import { getRewards, createReward, updateReward, deleteReward } from '../controllers/rewardController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getRewards);
router.post('/', requireRoles(['ADMIN', 'HR']), createReward);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateReward);
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deleteReward);

export default router;
