import { query } from '../config/database.js';

export const logAudit = async (userId, username, action, ipAddress, details) => {
  try {
    const now = new Date().toISOString();
    await query.run(
      `INSERT INTO audit_logs (user_id, username, action, ip_address, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, username || 'Hệ thống/Khách', action, ipAddress || '127.0.0.1', details || '', now]
    );
  } catch (error) {
    console.error('Lỗi khi ghi nhật ký hệ thống:', error);
  }
};

// Middleware ghi log tự động cho các thao tác thay đổi dữ liệu (POST, PUT, DELETE)
export const auditMiddleware = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    res.send = originalSend;
    res.send(body);

    // Chỉ log các request làm thay đổi dữ liệu và thành công (2xx)
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      if (req.originalUrl.includes('/system/restore')) {
        return;
      }
      const username = req.user ? req.user.username : 'Khách';
      const userId = req.user ? req.user.userId : null;
      const action = `${req.method} ${req.originalUrl}`;
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
      
      let details = '';
      if (req.originalUrl.includes('login')) {
        details = 'Thực hiện đăng nhập hệ thống';
      } else {
        // Tránh log mật khẩu
        const bodyCopy = { ...req.body };
        if (bodyCopy.password) bodyCopy.password = '******';
        details = JSON.stringify(bodyCopy);
      }

      logAudit(userId, username, action, ip, details);
    }
  };
  next();
};
