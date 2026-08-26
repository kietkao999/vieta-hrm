import { query } from '../config/database.js';

// Lấy danh sách khen thưởng
export const getRewards = async (req, res) => {
  try {
    const { year, employee_id, reward_type } = req.query;

    let sql = `
      SELECT r.*, e.fullname, e.code as employee_code, d.name as department_name, p.name as position_name
      FROM rewards r
      JOIN employees e ON r.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      sql += ` AND strftime('%Y', r.date) = ?`;
      params.push(year);
    }

    if (reward_type) {
      sql += ` AND r.reward_type = ?`;
      params.push(reward_type);
    }

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND r.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND r.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY r.date DESC, r.created_at DESC`;
    const records = await query.all(sql, params);

    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu khen thưởng:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Thêm khen thưởng mới
export const createReward = async (req, res) => {
  const { employee_id, title, content, date, reward_type, value } = req.body;

  if (!employee_id || !title || !date) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (Nhân viên, Tiêu đề, Ngày).' });
  }

  try {
    const emp = await query.get('SELECT id FROM employees WHERE id = ?', [employee_id]);
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });

    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO rewards (employee_id, title, content, date, reward_type, value, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [employee_id, title, content || '', date, reward_type || 'Tiền mặt', value || 0, now]);

    return res.status(201).json({ message: 'Thêm khen thưởng thành công.', id: result.lastID });
  } catch (error) {
    console.error('Lỗi thêm khen thưởng:', error);
    return res.status(500).json({ message: 'Lỗi thêm khen thưởng.' });
  }
};

// Cập nhật khen thưởng
export const updateReward = async (req, res) => {
  const { id } = req.params;
  const { employee_id, title, content, date, reward_type, value } = req.body;

  try {
    const reward = await query.get('SELECT * FROM rewards WHERE id = ?', [id]);
    if (!reward) return res.status(404).json({ message: 'Không tìm thấy bản ghi khen thưởng.' });

    await query.run(`
      UPDATE rewards 
      SET employee_id = ?, title = ?, content = ?, date = ?, reward_type = ?, value = ?
      WHERE id = ?
    `, [
      employee_id || reward.employee_id,
      title || reward.title,
      content !== undefined ? content : reward.content,
      date || reward.date,
      reward_type || reward.reward_type,
      value !== undefined ? value : reward.value,
      id
    ]);

    return res.json({ message: 'Cập nhật khen thưởng thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật khen thưởng:', error);
    return res.status(500).json({ message: 'Lỗi cập nhật khen thưởng.' });
  }
};

// Xóa khen thưởng
export const deleteReward = async (req, res) => {
  const { id } = req.params;
  try {
    const reward = await query.get('SELECT * FROM rewards WHERE id = ?', [id]);
    if (!reward) return res.status(404).json({ message: 'Không tìm thấy bản ghi khen thưởng.' });

    await query.run('DELETE FROM rewards WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa khen thưởng.' });
  } catch (error) {
    console.error('Lỗi xóa khen thưởng:', error);
    return res.status(500).json({ message: 'Lỗi xóa khen thưởng.' });
  }
};
