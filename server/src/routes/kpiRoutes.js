import express from 'express';
import { 
  getKpis, 
  initMonthlyKpis, 
  saveBulkKpis, 
  createOrUpdateKpi, 
  deleteKpi 
} from '../controllers/kpiController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getKpis);
router.post('/init', requireRoles(['ADMIN', 'HR']), initMonthlyKpis);
router.post('/bulk', requireRoles(['ADMIN', 'HR', 'MANAGER']), saveBulkKpis);
router.post('/', requireRoles(['ADMIN', 'HR', 'MANAGER']), createOrUpdateKpi);
router.put('/:id', requireRoles(['ADMIN', 'HR', 'MANAGER']), createOrUpdateKpi);
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deleteKpi);

export default router;
