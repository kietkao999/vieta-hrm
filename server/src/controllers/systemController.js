import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query, dbPath } from '../config/database.js';

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

    // Sao chép đè cơ sở dữ liệu vật lý
    fs.copyFileSync(uploadedFilePath, dbPath);
    fs.unlinkSync(uploadedFilePath); // Xóa file upload tạm

    console.log('Cơ sở dữ liệu đã được khôi phục thành công. Hệ thống đang khởi động lại...');

    res.json({ message: 'Khôi phục dữ liệu thành công! Hệ thống đang khởi động lại...' });

    // Khởi động lại container bằng cách exit 0, Railway sẽ tự khởi chạy lại container mới tải tệp DB này.
    setTimeout(() => {
      process.exit(0);
    }, 1000);

  } catch (error) {
    console.error('Lỗi khi khôi phục database:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi khôi phục dữ liệu.' });
  }
};
