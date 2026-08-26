import { query } from './src/config/database.js';

const updateName = async () => {
  try {
    await query.run('UPDATE employees SET fullname = ? WHERE code = ?', ['Huỳnh Thị Xinh (Admin)', 'NV0001']);
    console.log('Cập nhật database thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
};

updateName();
