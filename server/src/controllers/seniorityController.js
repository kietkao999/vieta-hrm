import { query } from '../config/database.js';

// Lấy danh sách thâm niên nhân viên
export const getSeniority = async (req, res) => {
  try {
    let sql = `
      SELECT e.id, e.code, e.fullname, e.join_date, e.status, e.avatar,
             d.name as department_name, p.name as position_name, b.name as branch_name,
             CAST((julianday('now') - julianday(e.join_date)) / 365.25 AS INTEGER) as years_of_service,
             CAST(((julianday('now') - julianday(e.join_date)) - CAST((julianday('now') - julianday(e.join_date)) / 365.25 AS INTEGER) * 365.25) / 30.44 AS INTEGER) as months_remainder
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.status = 'Đang làm việc'
    `;
    const params = [];

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND e.id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    }

    sql += ` ORDER BY years_of_service DESC, months_remainder DESC`;
    const records = await query.all(sql, params);

    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu thâm niên:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Lấy lịch sử quá trình công tác
export const getWorkHistory = async (req, res) => {
  try {
    const { employee_id } = req.query;

    let sql = `
      SELECT wh.*, 
             e.fullname, e.code as employee_code,
             d.name as department_name, 
             p.name as position_name
      FROM work_history wh
      JOIN employees e ON wh.employee_id = e.id
      LEFT JOIN departments d ON wh.department_id = d.id
      LEFT JOIN positions p ON wh.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND wh.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND wh.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY wh.start_date DESC`;
    const records = await query.all(sql, params);

    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy lịch sử công tác:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Thêm lịch sử công tác
export const createWorkHistory = async (req, res) => {
  const { employee_id, department_id, position_id, start_date, end_date, notes } = req.body;

  if (!employee_id || !department_id || !position_id || !start_date) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  }

  try {
    const emp = await query.get('SELECT id FROM employees WHERE id = ?', [employee_id]);
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });

    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO work_history (employee_id, department_id, position_id, start_date, end_date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [employee_id, department_id, position_id, start_date, end_date || null, notes || '', now]);

    return res.status(201).json({ message: 'Thêm lịch sử công tác thành công.', id: result.lastID });
  } catch (error) {
    console.error('Lỗi thêm lịch sử công tác:', error);
    return res.status(500).json({ message: 'Lỗi thêm lịch sử công tác.' });
  }
};

// Xóa lịch sử công tác
export const deleteWorkHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const wh = await query.get('SELECT * FROM work_history WHERE id = ?', [id]);
    if (!wh) return res.status(404).json({ message: 'Không tìm thấy bản ghi.' });

    await query.run('DELETE FROM work_history WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa bản ghi lịch sử công tác.' });
  } catch (error) {
    console.error('Lỗi xóa lịch sử công tác:', error);
    return res.status(500).json({ message: 'Lỗi xóa lịch sử công tác.' });
  }
};
