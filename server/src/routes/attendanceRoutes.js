import express from 'express';
import {
  getAttendance,
  markAttendance,
  getSheetsConfig,
  getSheetMatrix,
  saveSheetMatrix,
  exportSheetExcel
} from '../controllers/attendanceController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// Ma trận chấm công & xuất Excel chuẩn Google Sheet
router.get('/sheets-config', getSheetsConfig);
router.get('/sheet-matrix', getSheetMatrix);
router.post('/save-sheet-matrix', requireRoles(['ADMIN', 'HR', 'MANAGER']), saveSheetMatrix);
router.get('/export-excel', exportSheetExcel);

// API cơ bản
router.get('/', getAttendance);
router.post('/', requireRoles(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']), markAttendance);

export default router;

