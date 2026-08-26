import express from 'express';
import { getContracts, getContractById, createContract, updateContract, deleteContract } from '../controllers/contractController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getContracts);
router.get('/:id', getContractById);
router.post('/', requireRoles(['ADMIN', 'HR']), createContract);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateContract);
router.delete('/:id', requireRoles(['ADMIN']), deleteContract);

export default router;
