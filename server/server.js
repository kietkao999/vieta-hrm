import app from './src/app.js';
import { initDatabase } from './src/config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Đảm bảo database đã được khởi tạo
    await initDatabase();
    
    // Tự động chạy migration đồng bộ nhân sự & phòng ban khi khởi động
    try {
      const { runMigration } = await import('./src/config/run_migration.js');
      await runMigration();
    } catch (migError) {
      console.error('Lỗi chạy tự động migration:', migError);
    }
    
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
