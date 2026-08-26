import express from 'express';
import { getAuditLogs, backupDatabase } from '../controllers/systemController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRoles(['ADMIN']));

router.get('/audit-logs', getAuditLogs);
router.get('/backup', backupDatabase);

export default router;
