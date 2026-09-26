import app from './src/app.js';
import { initDatabase } from './src/config/database.js';
import { syncAllUserPasswords } from './src/config/syncPasswords.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Đảm bảo database đã được khởi tạo cấu trúc bảng
    await initDatabase();
    
    // Đảm bảo toàn bộ 57 tài khoản luôn đồng bộ mật khẩu chính xác
    await syncAllUserPasswords();
    
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(` Máy chủ HRM Việt Á đang chạy tại cổng: ${PORT}`);
      console.log(` API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Không thể khởi động server do lỗi database:', error);
    process.exit(1);
  }
};

startServer();
