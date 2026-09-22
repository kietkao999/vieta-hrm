import app from './src/app.js';
import { initDatabase } from './src/config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Đảm bảo database đã được khởi tạo cấu trúc bảng
    await initDatabase();
    
    // Lưu ý: Toàn bộ dữ liệu nhân sự, lương, KPI hiện được quản trị & cập nhật trực tiếp qua Web UI.
    // Tự động ghi đè migration đã được tắt để bảo toàn 100% các thay đổi của người dùng.
    
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
