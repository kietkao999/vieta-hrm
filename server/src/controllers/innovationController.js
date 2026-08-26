import { query } from '../config/database.js';

// Lấy danh sách sáng kiến
export const getInnovations = async (req, res) => {
  try {
    const { year, employee_id, status } = req.query;

    let sql = `
      SELECT i.*, e.fullname, e.code as employee_code, d.name as department_name, p.name as position_name
      FROM innovations i
      JOIN employees e ON i.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      sql += ` AND strftime('%Y', i.date) = ?`;
      params.push(year);
    }

    if (status) {
      sql += ` AND i.status = ?`;
      params.push(status);
    }

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND i.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND i.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY i.date DESC, i.created_at DESC`;
    const records = await query.all(sql, params);

    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Thêm sáng kiến mới (tất cả nhân viên đều có thể đề xuất)
export const createInnovation = async (req, res) => {
  const { title, content, date, efficiency, cost_savings, productivity_increase, value_created } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Thiếu tiêu đề sáng kiến.' });
  }

  try {
    const employee_id = req.body.employee_id || req.user.employeeId;
    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO innovations (employee_id, title, content, date, status, efficiency, cost_savings, productivity_increase, value_created, created_at)
      VALUES (?, ?, ?, ?, 'Đề xuất', ?, ?, ?, ?, ?)
    `, [
      employee_id, title, content || '', date || now.split('T')[0],
      efficiency || '', cost_savings || 0, productivity_increase || '', value_created || '', now
    ]);

    return res.status(201).json({ message: 'Đề xuất sáng kiến thành công.', id: result.lastID });
  } catch (error) {
    console.error('Lỗi đề xuất sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi đề xuất sáng kiến.' });
  }
};

// Cập nhật / Duyệt sáng kiến
export const updateInnovation = async (req, res) => {
  const { id } = req.params;
  const { title, content, date, status, efficiency, cost_savings, productivity_increase, value_created } = req.body;

  try {
    const innov = await query.get('SELECT * FROM innovations WHERE id = ?', [id]);
    if (!innov) return res.status(404).json({ message: 'Không tìm thấy sáng kiến.' });

    // Nhân viên chỉ sửa được sáng kiến của mình khi chưa duyệt
    if (req.user.roleName === 'EMPLOYEE') {
      if (innov.employee_id !== req.user.employeeId) {
        return res.status(403).json({ message: 'Bạn chỉ được sửa sáng kiến của mình.' });
      }
      if (innov.status !== 'Đề xuất') {
        return res.status(403).json({ message: 'Không thể sửa sáng kiến đã được xét duyệt.' });
      }
    }

    await query.run(`
      UPDATE innovations 
      SET title = ?, content = ?, date = ?, status = ?, efficiency = ?, 
          cost_savings = ?, productivity_increase = ?, value_created = ?
      WHERE id = ?
    `, [
      title || innov.title,
      content !== undefined ? content : innov.content,
      date || innov.date,
      status || innov.status,
      efficiency !== undefined ? efficiency : innov.efficiency,
      cost_savings !== undefined ? cost_savings : innov.cost_savings,
      productivity_increase !== undefined ? productivity_increase : innov.productivity_increase,
      value_created !== undefined ? value_created : innov.value_created,
      id
    ]);

    return res.json({ message: 'Cập nhật sáng kiến thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi cập nhật sáng kiến.' });
  }
};

// Xóa sáng kiến
export const deleteInnovation = async (req, res) => {
  const { id } = req.params;
  try {
    const innov = await query.get('SELECT * FROM innovations WHERE id = ?', [id]);
    if (!innov) return res.status(404).json({ message: 'Không tìm thấy sáng kiến.' });

    await query.run('DELETE FROM innovations WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa sáng kiến.' });
  } catch (error) {
    console.error('Lỗi xóa sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi xóa sáng kiến.' });
  }
};
