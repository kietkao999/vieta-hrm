import express from 'express';
import {
  getInnovations,
  createInnovation,
  updateInnovation,
  deleteInnovation,
  toggleLikeInnovation
} from '../controllers/innovationController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getInnovations);
router.post('/', createInnovation); // Tất cả nhân viên đều có thể gửi sáng kiến / đóng góp
router.post('/:id/like', toggleLikeInnovation); // Tương tác ủng hộ sáng kiến
router.put('/:id', updateInnovation); // Nhân viên sửa của mình, Quản lý / Admin thẩm định & khen thưởng
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deleteInnovation);

export default router;
