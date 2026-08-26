import express from 'express';
import { getKpis, createKpi, updateKpi, deleteKpi } from '../controllers/kpiController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getKpis);
router.post('/', requireRoles(['ADMIN', 'HR', 'MANAGER']), createKpi);
router.put('/:id', requireRoles(['ADMIN', 'HR', 'MANAGER']), updateKpi);
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deleteKpi);

export default router;
