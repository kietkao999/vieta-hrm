import express from 'express';
import { getSummaryReport, getPayrollReport, getAttendanceReport, getKpiReport } from '../controllers/reportController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);
router.use(requireRoles(['ADMIN', 'HR', 'MANAGER']));

router.get('/summary', getSummaryReport);
router.get('/payroll', getPayrollReport);
router.get('/attendance', getAttendanceReport);
router.get('/kpi', getKpiReport);

export default router;
