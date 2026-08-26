import express from 'express';
import { getUsers, getRoles, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// Chỉ ADMIN mới có quyền quản lý tài khoản và phân quyền
router.use(authMiddleware);
router.use(requireRoles(['ADMIN']));

router.get('/', getUsers);
router.get('/roles', getRoles);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
