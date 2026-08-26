import { query } from '../config/database.js';

export const getAttendance = async (req, res) => {
  try {
    const { month, year, employee_id } = req.query;
    
    let sql = `
      SELECT a.*, e.fullname, e.code as employee_code, d.name as department_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // Lọc theo tháng/năm
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      sql += ` AND a.date >= ? AND a.date <= ?`;
      params.push(startDate, endDate);
    }

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND a.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND a.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY a.date DESC, e.fullname ASC`;
    const records = await query.all(sql, params);
    
    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu chấm công:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const markAttendance = async (req, res) => {
  const { date, check_in, check_out, status, note, employee_id } = req.body;
  const empId = employee_id || req.user.employeeId;
  
  if (!empId) {
    return res.status(400).json({ message: 'Không xác định được nhân viên.' });
  }

  try {
    const exist = await query.get('SELECT id FROM attendance WHERE employee_id = ? AND date = ?', [empId, date]);
    
    if (exist) {
      // Cập nhật
      await query.run(`
        UPDATE attendance 
        SET check_in = ?, check_out = ?, status = ?, note = ?
        WHERE id = ?
      `, [check_in || null, check_out || null, status || 'Có mặt', note || '', exist.id]);
      return res.json({ message: 'Cập nhật chấm công thành công.' });
    } else {
      // Thêm mới
      await query.run(`
        INSERT INTO attendance (employee_id, date, check_in, check_out, status, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [empId, date, check_in || null, check_out || null, status || 'Có mặt', note || '']);
      return res.status(201).json({ message: 'Ghi nhận chấm công thành công.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi ghi nhận chấm công.' });
  }
};
