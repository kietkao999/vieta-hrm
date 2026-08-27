import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { query, dbPath } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await query.all(`
      SELECT * FROM audit_logs
      ORDER BY id DESC
      LIMIT 200
    `);
    return res.json(logs);
  } catch (error) {
    console.error('Lỗi khi lấy audit logs:', error);
    return res.status(500).json({ message: 'Không thể tải nhật ký thao tác.' });
  }
};

export const backupDatabase = async (req, res) => {
  try {
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ message: 'Không tìm thấy file cơ sở dữ liệu.' });
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '-');
    const backupName = `viet_a_hrm_backup_${dateStr}_${timeStr}.db`;

    res.download(dbPath, backupName, (err) => {
      if (err) {
        console.error('Lỗi khi tải file backup:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Không thể xuất bản sao lưu cơ sở dữ liệu.' });
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi thực hiện backup:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi sao lưu dữ liệu.' });
  }
};

export const restoreDatabase = async (req, res) => {
  try {
    const secret = req.headers['x-restore-secret'];
    if (secret !== 'vieta-hrm-restore-secret-key-2026') {
      return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp file database (.db) để khôi phục.' });
    }

    const uploadedFilePath = req.file.path;

    // Đóng kết nối SQLite đang mở trước khi ghi đè tệp tin
    db.close((err) => {
      if (err) {
        console.error('Lỗi khi đóng kết nối SQLite:', err);
      }

      try {
        // Sao chép đè tệp tin cơ sở dữ liệu vật lý
        fs.copyFileSync(uploadedFilePath, dbPath);
        fs.unlinkSync(uploadedFilePath); // Xóa file upload tạm
        
        console.log('Cơ sở dữ liệu đã được khôi phục thành công. Hệ thống đang khởi động lại...');
        
        res.json({ message: 'Khôi phục dữ liệu thành công! Hệ thống đang khởi động lại...' });

        // Khởi động lại container bằng cách exit 0 để Railway load lại DB mới hoàn toàn
        setTimeout(() => {
          process.exit(0);
        }, 500);
      } catch (copyErr) {
        console.error('Lỗi khi sao chép đè file database:', copyErr);
        res.status(500).json({ message: 'Lỗi ghi đè file cơ sở dữ liệu.' });
      }
    });

  } catch (error) {
    console.error('Lỗi khi khôi phục database:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi khôi phục dữ liệu.' });
  }
};

export const checkDatabase = async (req, res) => {
  try {
    const secret = req.headers['x-restore-secret'];
    if (secret !== 'vieta-hrm-restore-secret-key-2026') {
      return res.status(403).json({ message: 'Không có quyền thực hiện.' });
    }

    const exists = fs.existsSync(dbPath);
    let size = 0;
    if (exists) {
      size = fs.statSync(dbPath).size;
    }

    let employeeCount = 0;
    let tableError = null;
    try {
      const result = await query.get('SELECT COUNT(*) as total FROM employees');
      employeeCount = result ? result.total : 0;
    } catch (e) {
      tableError = e.message;
    }

    let rolesCount = 0;
    try {
      const result = await query.get('SELECT COUNT(*) as total FROM roles');
      rolesCount = result ? result.total : 0;
    } catch (e) {}

    return res.json({
      dbPath,
      exists,
      sizeBytes: size,
      employeeCount,
      rolesCount,
      tableError,
      envDbPath: process.env.DB_PATH || 'NOT_SET'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
