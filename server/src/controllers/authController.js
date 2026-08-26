import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { logAudit } from '../middleware/audit.js';

const JWT_SECRET = process.env.JWT_SECRET || 'viet_a_hrm_jwt_secret_key_2026';

export const login = async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu.' });
    }

    // Tìm user và kèm role + employee info
    const user = await query.get(
      `SELECT u.id, u.username, u.password, u.is_active, u.role_id, r.name as roleName, r.display_name as roleDisplayName,
              e.id as employeeId, e.code as employeeCode, e.fullname, e.email, e.avatar, e.department_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN employees e ON u.employee_id = e.id
       WHERE u.username = ?`,
      [username.trim()]
    );

    if (!user) {
      await logAudit(null, username, 'Đăng nhập thất bại', ip, 'Tài khoản không tồn tại');
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    if (!user.is_active) {
      await logAudit(user.id, username, 'Đăng nhập thất bại', ip, 'Tài khoản đã bị khóa');
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      await logAudit(user.id, username, 'Đăng nhập thất bại', ip, 'Nhập sai mật khẩu');
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    // Tạo token JWT
    const payload = {
      userId: user.id,
      username: user.username,
      roleId: user.role_id,
      roleName: user.roleName,
      roleDisplayName: user.roleDisplayName,
      employeeId: user.employeeId,
      fullname: user.fullname,
      email: user.email,
      avatar: user.avatar,
      departmentId: user.department_id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    // Ghi audit log đăng nhập thành công
    await logAudit(user.id, user.username, 'Đăng nhập', ip, 'Đăng nhập hệ thống thành công');

    // Không trả về password hash
    delete user.password;

    return res.json({
      message: 'Đăng nhập thành công.',
      token,
      user
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await query.get(
      `SELECT u.id, u.username, u.is_active, u.role_id, r.name as roleName, r.display_name as roleDisplayName,
              e.id as employeeId, e.code as employeeCode, e.fullname, e.email, e.avatar, e.department_id, e.position_id, e.branch_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN employees e ON u.employee_id = e.id
       WHERE u.id = ?`,
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống.' });
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mới.' });
    }

    const user = await query.get('SELECT password FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    const now = new Date().toISOString();

    await query.run('UPDATE users SET password = ?, updated_at = ? WHERE id = ?', [hash, now, req.user.userId]);
    await logAudit(req.user.userId, req.user.username, 'Đổi mật khẩu', ip, 'Đổi mật khẩu thành công');

    return res.json({ message: 'Thay đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống.' });
  }
};
