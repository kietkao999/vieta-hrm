import express from 'express';
import { getAuditLogs, backupDatabase, restoreDatabase } from '../controllers/systemController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cấu hình Multer để lưu tạm file database tải lên
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'restore-' + Date.now() + '.db');
  }
});
const upload = multer({ storage });

// Endpoint phục hồi database dùng secret key riêng (không cần token JWT của user)
router.post('/restore', upload.single('file'), restoreDatabase);

// Các endpoint hệ thống khác yêu cầu quyền đăng nhập admin
router.use(authMiddleware);
router.use(requireRoles(['ADMIN']));

router.get('/audit-logs', getAuditLogs);
router.get('/backup', backupDatabase);

export default router;
