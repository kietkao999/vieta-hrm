import { query } from '../config/database.js';

export const getLeaveRequests = async (req, res) => {
  try {
    const { status, employee_id } = req.query;
    
    let sql = `
      SELECT l.*, e.fullname, e.code as employee_code, d.name as department_name,
             p.name as position_name,
             (SELECT fullname FROM employees WHERE id = l.approved_by) as approver_name
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND l.status = ?`;
      params.push(status);
    }

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND l.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND l.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY l.created_at DESC`;
    const records = await query.all(sql, params);
    
    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu nghỉ phép:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const createLeaveRequest = async (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body;
  const empId = req.user.employeeId;
  
  if (!empId) {
    return res.status(400).json({ message: 'Không xác định được nhân viên.' });
  }
  
  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'Ngày bắt đầu và kết thúc là bắt buộc.' });
  }

  try {
    const s = new Date(start_date);
    const e = new Date(end_date);
    const diffTime = Math.abs(e - s);
    const days_count = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const now = new Date().toISOString();
    await query.run(`
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_count, reason, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Chờ duyệt', ?, ?)
    `, [empId, leave_type || 'Phép năm', start_date, end_date, days_count, reason || '', now, now]);
    return res.status(201).json({ message: 'Tạo đơn xin nghỉ phép thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tạo đơn xin nghỉ.' });
  }
};

export const updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body; // status: 'Đã duyệt', 'Từ chối'

  try {
    const leave = await query.get('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (!leave) return res.status(404).json({ message: 'Không tìm thấy đơn.' });

    // Kiểm tra quyền (chỉ HR/Admin hoặc Manager của phòng ban đó)
    if (req.user.roleName === 'EMPLOYEE') {
      return res.status(403).json({ message: 'Không có quyền duyệt đơn.' });
    }
    
    if (req.user.roleName === 'MANAGER') {
      const emp = await query.get('SELECT department_id FROM employees WHERE id = ?', [leave.employee_id]);
      if (emp.department_id !== req.user.departmentId) {
        return res.status(403).json({ message: 'Chỉ được duyệt đơn của nhân viên cùng phòng ban.' });
      }
    }

    const now = new Date().toISOString();
    await query.run(`
      UPDATE leave_requests 
      SET status = ?, approved_by = ?, updated_at = ?
      WHERE id = ?
    `, [status, req.user.employeeId || null, now, id]);

    return res.json({ message: `Đơn đã chuyển trạng thái: ${status}` });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi cập nhật trạng thái đơn.' });
  }
};

export const deleteLeaveRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    const leave = await query.get('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (!leave) return res.status(404).json({ message: 'Không tìm thấy đơn.' });

    // Nhân viên chỉ được xóa đơn 'Chờ duyệt' của mình
    if (req.user.roleName === 'EMPLOYEE') {
      if (leave.employee_id !== req.user.employeeId) {
        return res.status(403).json({ message: 'Không có quyền xóa đơn này.' });
      }
      if (leave.status !== 'Chờ duyệt') {
         return res.status(400).json({ message: 'Chỉ được xóa đơn đang chờ duyệt.' });
      }
    } else if (req.user.roleName === 'MANAGER') {
       // Tương tự, nếu Manager muốn xóa thì chỉ xóa đơn chờ duyệt của nhân viên phòng
       const emp = await query.get('SELECT department_id FROM employees WHERE id = ?', [leave.employee_id]);
       if (emp.department_id !== req.user.departmentId) {
         return res.status(403).json({ message: 'Chỉ được xóa đơn của nhân viên cùng phòng ban.' });
       }
    }

    await query.run('DELETE FROM leave_requests WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa đơn xin nghỉ phép.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xóa đơn.' });
  }
};
