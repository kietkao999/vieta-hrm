import express from 'express';
import { getLeaveRequests, createLeaveRequest, updateLeaveStatus, deleteLeaveRequest } from '../controllers/leaveController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getLeaveRequests);
router.post('/', requireRoles(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']), createLeaveRequest);
router.put('/:id/status', requireRoles(['ADMIN', 'HR', 'MANAGER']), updateLeaveStatus);
router.delete('/:id', requireRoles(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']), deleteLeaveRequest);

export default router;
