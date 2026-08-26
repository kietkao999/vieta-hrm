import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const users = await query.all(`
      SELECT u.id, u.username, u.role_id, u.employee_id, u.is_active, u.created_at,
             r.name as roleName, r.display_name as roleDisplayName,
             e.code as employeeCode, e.fullname as employeeName, e.email as employeeEmail
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.employee_id = e.id
      ORDER BY u.id DESC
    `);
    return res.json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách user:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách tài khoản.' });
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await query.all('SELECT * FROM roles ORDER BY id ASC');
    return res.json(roles);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách roles:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách quyền.' });
  }
};

export const createUser = async (req, res) => {
  const { username, password, role_id, employee_id } = req.body;
  try {
    if (!username || !password || !role_id) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
    }

    const exist = await query.get('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (exist) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại trên hệ thống.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();

    const result = await query.run(
      `INSERT INTO users (username, password, role_id, employee_id, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [username.trim(), passwordHash, role_id, employee_id || null, now, now]
    );

    return res.status(201).json({ message: 'Tạo tài khoản thành công.', userId: result.lastID });
  } catch (error) {
    console.error('Lỗi khi tạo user:', error);
    return res.status(500).json({ message: 'Không thể tạo tài khoản mới.' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role_id, employee_id, is_active, password } = req.body;
  try {
    const user = await query.get('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
    }

    const now = new Date().toISOString();

    if (password && password.trim() !== '') {
      // Cập nhật cả mật khẩu mới
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      await query.run(
        `UPDATE users
         SET role_id = ?, employee_id = ?, is_active = ?, password = ?, updated_at = ?
         WHERE id = ?`,
        [role_id, employee_id || null, is_active, passwordHash, now, id]
      );
    } else {
      // Cập nhật không đổi mật khẩu
      await query.run(
        `UPDATE users
         SET role_id = ?, employee_id = ?, is_active = ?, updated_at = ?
         WHERE id = ?`,
        [role_id, employee_id || null, is_active, now, id]
      );
    }

    return res.json({ message: 'Cập nhật tài khoản thành công.' });
  } catch (error) {
    console.error('Lỗi khi cập nhật user:', error);
    return res.status(500).json({ message: 'Không thể cập nhật tài khoản.' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Không cho tự xóa chính mình
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình.' });
    }

    const user = await query.get('SELECT id, username FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
    }

    // Không cho xóa admin gốc
    if (user.username === 'admin') {
      return res.status(400).json({ message: 'Không thể xóa tài khoản Admin hệ thống mặc định.' });
    }

    await query.run('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ message: 'Xóa tài khoản thành công.' });
  } catch (error) {
    console.error('Lỗi khi xóa user:', error);
    return res.status(500).json({ message: 'Không thể xóa tài khoản này.' });
  }
};
