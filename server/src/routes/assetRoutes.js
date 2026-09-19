import express from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  allocateAsset,
  getMaintenanceTickets,
  createMaintenanceTicket,
  updateMaintenanceTicket,
  getAssetStats,
  exportAssets
} from '../controllers/assetController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// Thống kê Dashboard tài sản
router.get('/stats', getAssetStats);

// Quản lý phiếu bảo trì & báo hỏng
router.get('/maintenance/tickets', getMaintenanceTickets);
router.post('/maintenance/tickets', createMaintenanceTicket);
router.put('/maintenance/tickets/:id', requireRoles(['ADMIN', 'MANAGER']), updateMaintenanceTicket);

// CRUD Danh mục tài sản
router.get('/export', exportAssets);
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', requireRoles(['ADMIN', 'MANAGER']), createAsset);
router.put('/:id', requireRoles(['ADMIN', 'MANAGER']), updateAsset);
router.delete('/:id', requireRoles(['ADMIN']), deleteAsset);

// Cấp phát & Thu hồi tài sản
router.post('/:id/allocate', requireRoles(['ADMIN', 'MANAGER']), allocateAsset);

export default router;
