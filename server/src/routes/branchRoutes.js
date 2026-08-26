import express from 'express';
import { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } from '../controllers/branchController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getBranches);
router.get('/:id', getBranchById);
router.post('/', requireRoles(['ADMIN', 'HR']), createBranch);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateBranch);
router.delete('/:id', requireRoles(['ADMIN']), deleteBranch);

export default router;
