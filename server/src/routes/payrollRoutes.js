import express from 'express';
import { getPayroll, generatePayroll, createPayroll, updatePayroll, deletePayroll } from '../controllers/payrollController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getPayroll);
router.post('/generate', requireRoles(['ADMIN', 'HR']), generatePayroll);
router.post('/', requireRoles(['ADMIN', 'HR']), createPayroll);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updatePayroll);
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deletePayroll);

export default router;
