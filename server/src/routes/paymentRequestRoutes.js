import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  // Phần 1: Mua dịch vụ
  createPurchaseRequest,
  getPurchaseRequests,
  getPurchaseRequestById,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  deletePurchaseRequest,
  // Phần 3: Thanh toán
  createPaymentRequest,
  getPaymentRequests,
  getPaymentRequestById,
  approvePaymentRequest,
  rejectPaymentRequest,
  deletePaymentRequest,
  // Phần 2: Chứng từ & File
  deleteAttachment,
  // Thống kê
  getFullStats
} from '../controllers/paymentRequestController.js';
import { authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(authMiddleware);

// Cấu hình Multer upload chứng từ & hóa đơn
const uploadDir = path.resolve(__dirname, '../../uploads/payment_requests');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Hàm giải mã tên file tiếng Việt UTF-8 từ multipart header
const fixUtf8Filename = (name) => {
  if (!name) return 'file';
  try {
    return Buffer.from(name, 'latin1').toString('utf8');
  } catch {
    return name;
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = fixUtf8Filename(file.originalname);
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e4);
    const safeBaseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_')
      .slice(0, 30);
    cb(null, `${safeBaseName}_${timestamp}_${randomSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // Tối đa 25MB
});

// Upload endpoint
router.post('/upload-attachment', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file nào được tải lên.' });
  }

  const fixedName = fixUtf8Filename(req.file.originalname);
  const file_url = `/uploads/payment_requests/${req.file.filename}`;
  const file_size_bytes = req.file.size;
  const file_size =
    file_size_bytes >= 1024 * 1024
      ? (file_size_bytes / (1024 * 1024)).toFixed(1) + ' MB'
      : Math.round(file_size_bytes / 1024) + ' KB';

  return res.json({
    success: true,
    file_url,
    file_name: fixedName,
    file_size,
    file_type: path.extname(fixedName).replace('.', '').toLowerCase()
  });
});

// Thống kê Dashboard
router.get('/stats', getFullStats);

// 1. PHẦN 1: MUA DỊCH VỤ (01/ĐN-DV)
router.get('/purchase', getPurchaseRequests);
router.get('/purchase/:id', getPurchaseRequestById);
router.post('/purchase', createPurchaseRequest);
router.post('/purchase/:id/approve', approvePurchaseRequest);
router.post('/purchase/:id/reject', rejectPurchaseRequest);
router.delete('/purchase/:id', deletePurchaseRequest);

// 2. PHẦN 3: ĐỀ NGHỊ THANH TOÁN (02/ĐNTT-VA)
router.get('/payment', getPaymentRequests);
router.get('/payment/:id', getPaymentRequestById);
router.post('/payment', createPaymentRequest);
router.post('/payment/:id/approve', approvePaymentRequest);
router.post('/payment/:id/reject', rejectPaymentRequest);
router.delete('/payment/:id', deletePaymentRequest);

// 3. PHẦN 2: CHỨNG TỪ GỐC
router.delete('/attachments/:id', deleteAttachment);

// Giữ tương thích ngược cho endpoint cũ
router.get('/', getPaymentRequests);
router.get('/:id', getPaymentRequestById);
router.post('/', createPaymentRequest);

export default router;
