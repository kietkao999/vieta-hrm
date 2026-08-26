import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';

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
    const dbPath = path.resolve(__dirname, '../../hrm.db');

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
