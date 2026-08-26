import express from 'express';
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', requireRoles(['ADMIN', 'HR']), createDepartment);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateDepartment);
router.delete('/:id', requireRoles(['ADMIN']), deleteDepartment);

export default router;
