import express from 'express';
import { getAttendance, markAttendance } from '../controllers/attendanceController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getAttendance);
router.post('/', requireRoles(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']), markAttendance);

export default router;
