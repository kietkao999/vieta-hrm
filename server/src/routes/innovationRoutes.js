import express from 'express';
import { getInnovations, createInnovation, updateInnovation, deleteInnovation } from '../controllers/innovationController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getInnovations);
router.post('/', createInnovation); // Tất cả nhân viên đều có thể đề xuất
router.put('/:id', updateInnovation); // Nhân viên sửa của mình, quản lý duyệt
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deleteInnovation);

export default router;
