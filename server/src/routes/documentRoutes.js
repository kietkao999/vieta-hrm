import express from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Tất cả endpoints đều cần đăng nhập
router.use(authMiddleware);

// Cấu hình Multer upload file văn bản / tài liệu
const uploadDir = path.resolve(__dirname, '../../uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Endpoint upload file (Admin / HR)
router.post('/upload-file', requireRoles(['ADMIN', 'HR']), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file nào được tải lên.' });
  }
  const file_url = `/uploads/documents/${req.file.filename}`;
  const file_size = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
  const file_type = path.extname(req.file.originalname).replace('.', '').toLowerCase();
  
  return res.json({
    success: true,
    file_url,
    file_name: req.file.originalname,
    file_size,
    file_type
  });
});

// Tra cứu danh sách & chi tiết (Mọi nhân sự: Admin, Manager, Employee)
router.get('/', getDocuments);
router.get('/:id', getDocumentById);

// Thao tác chỉnh sửa, thêm, xóa (Admin & HR)
router.post('/', requireRoles(['ADMIN', 'HR']), createDocument);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateDocument);
router.delete('/:id', requireRoles(['ADMIN', 'HR']), deleteDocument);

export default router;
