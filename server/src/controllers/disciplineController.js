import { query } from '../config/database.js';

// Lấy danh sách kỷ luật
export const getDisciplines = async (req, res) => {
  try {
    const { year, employee_id, form } = req.query;

    let sql = `
      SELECT dc.*, 
             e.fullname, e.code as employee_code, 
             d.name as department_name,
             dm.fullname as decision_maker_name
      FROM discipline dc
      JOIN employees e ON dc.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees dm ON dc.decision_maker_id = dm.id
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      sql += ` AND strftime('%Y', dc.date) = ?`;
      params.push(year);
    }

    if (form) {
      sql += ` AND dc.form = ?`;
      params.push(form);
    }

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND dc.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND dc.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY dc.date DESC, dc.created_at DESC`;
    const records = await query.all(sql, params);

    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu kỷ luật:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Thêm kỷ luật mới
export const createDiscipline = async (req, res) => {
  const { employee_id, content, form, date, value } = req.body;

  if (!employee_id || !content || !form) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (Nhân viên, Nội dung, Hình thức).' });
  }

  try {
    const emp = await query.get('SELECT id FROM employees WHERE id = ?', [employee_id]);
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });

    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO discipline (employee_id, content, form, date, value, decision_maker_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [employee_id, content, form, date || now.split('T')[0], parseFloat(value) || 0, req.user.employeeId || null, now]);

    return res.status(201).json({ message: 'Thêm quyết định kỷ luật thành công.', id: result.lastID });
  } catch (error) {
    console.error('Lỗi thêm kỷ luật:', error);
    return res.status(500).json({ message: 'Lỗi thêm kỷ luật.' });
  }
};

// Cập nhật kỷ luật
export const updateDiscipline = async (req, res) => {
  const { id } = req.params;
  const { employee_id, content, form, date, value } = req.body;

  try {
    const disc = await query.get('SELECT * FROM discipline WHERE id = ?', [id]);
    if (!disc) return res.status(404).json({ message: 'Không tìm thấy bản ghi kỷ luật.' });

    await query.run(`
      UPDATE discipline 
      SET employee_id = ?, content = ?, form = ?, date = ?, value = ?, decision_maker_id = ?
      WHERE id = ?
    `, [
      employee_id || disc.employee_id,
      content || disc.content,
      form || disc.form,
      date || disc.date,
      value !== undefined ? (parseFloat(value) || 0) : (disc.value || 0),
      req.user.employeeId || disc.decision_maker_id,
      id
    ]);

    return res.json({ message: 'Cập nhật kỷ luật thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật kỷ luật:', error);
    return res.status(500).json({ message: 'Lỗi cập nhật kỷ luật.' });
  }
};

// Xóa kỷ luật
export const deleteDiscipline = async (req, res) => {
  const { id } = req.params;
  try {
    const disc = await query.get('SELECT * FROM discipline WHERE id = ?', [id]);
    if (!disc) return res.status(404).json({ message: 'Không tìm thấy bản ghi kỷ luật.' });

    await query.run('DELETE FROM discipline WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa bản ghi kỷ luật.' });
  } catch (error) {
    console.error('Lỗi xóa kỷ luật:', error);
    return res.status(500).json({ message: 'Lỗi xóa kỷ luật.' });
  }
};
