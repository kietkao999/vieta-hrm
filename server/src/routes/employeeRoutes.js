import express from 'express';
import {
  getEmployees, getAllEmployeesSimple, getEmployeeById,
  createEmployee, updateEmployee, deleteEmployee, exportEmployeesExcel
} from '../controllers/employeeController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// Danh sách đơn giản (dropdown)
router.get('/simple', getAllEmployeesSimple);

// Xuất Excel
router.get('/export-excel', requireRoles(['ADMIN', 'HR']), exportEmployeesExcel);

// CRUD chính
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', requireRoles(['ADMIN', 'HR']), createEmployee);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateEmployee);
router.delete('/:id', requireRoles(['ADMIN']), deleteEmployee);

export default router;
