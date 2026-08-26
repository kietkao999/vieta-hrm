import express from 'express';
import { getContracts, getContractById, createContract, updateContract, deleteContract } from '../controllers/contractController.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(authMiddleware);

// Cấu hình Multer lưu file hợp đồng
const uploadDir = path.resolve(__dirname, '../../uploads');
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
    cb(null, 'contract-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

router.post('/upload-file', requireRoles(['ADMIN', 'HR']), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file nào được tải lên.' });
  }
  const document_url = `/uploads/${req.file.filename}`;
  return res.json({ document_url });
});

router.get('/', getContracts);
router.get('/:id', getContractById);
router.post('/', requireRoles(['ADMIN', 'HR']), createContract);
router.put('/:id', requireRoles(['ADMIN', 'HR']), updateContract);
router.delete('/:id', requireRoles(['ADMIN']), deleteContract);

export default router;
