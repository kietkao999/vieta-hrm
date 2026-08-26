import { query } from '../config/database.js';
import XLSX from 'xlsx';

// Lấy danh sách nhân viên với lọc, tìm kiếm, phân trang
export const getEmployees = async (req, res) => {
  try {
    const { search, department_id, branch_id, status, page = 1, limit = 50 } = req.query;
    let sql = `
      SELECT e.*,
             d.name as department_name,
             p.name as position_name,
             b.name as branch_name,
             m.fullname as manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN branches b ON e.branch_id = b.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE 1=1
    `;
    const params = [];

    // Lọc theo phân quyền: Trưởng phòng chỉ xem nhân viên phòng mình
    if (req.user.roleName === 'MANAGER') {
      sql += ' AND e.department_id = ?';
      params.push(req.user.departmentId);
    }
    // Nhân viên chỉ xem chính mình
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ' AND e.id = ?';
      params.push(req.user.employeeId);
    }

    // Tìm kiếm theo tên, mã NV, email, số ĐT
    if (search) {
      sql += ' AND (e.fullname LIKE ? OR e.code LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.cccd LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    // Lọc theo phòng ban
    if (department_id) {
      sql += ' AND e.department_id = ?';
      params.push(department_id);
    }

    // Lọc theo chi nhánh
    if (branch_id) {
      sql += ' AND e.branch_id = ?';
      params.push(branch_id);
    }

    // Lọc theo trạng thái
    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    // Đếm tổng
    const countSql = sql.replace(/SELECT e\.\*[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await query.get(countSql, params);
    const total = countResult ? countResult.total : 0;

    // Phân trang
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' ORDER BY e.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const employees = await query.all(sql, params);

    return res.json({
      data: employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách nhân viên:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách nhân viên.' });
  }
};

// Lấy danh sách tất cả NV (dùng cho dropdown chọn quản lý)
export const getAllEmployeesSimple = async (req, res) => {
  try {
    const employees = await query.all(
      'SELECT id, code, fullname, department_id FROM employees ORDER BY fullname ASC'
    );
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Chi tiết 1 nhân viên
export const getEmployeeById = async (req, res) => {
  try {
    const emp = await query.get(`
      SELECT e.*,
             d.name as department_name,
             p.name as position_name,
             b.name as branch_name,
             m.fullname as manager_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN branches b ON e.branch_id = b.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (!emp) return res.status(404).json({ message: 'Nhân viên không tồn tại.' });

    // Phân quyền: nhân viên chỉ xem chính mình
    if (req.user.roleName === 'EMPLOYEE' && emp.id !== req.user.employeeId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem hồ sơ này.' });
    }

    // Trưởng phòng chỉ xem nhân viên cùng phòng
    if (req.user.roleName === 'MANAGER' && emp.department_id !== req.user.departmentId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem hồ sơ nhân viên phòng ban khác.' });
    }

    return res.json(emp);
  } catch (error) {
    console.error('Lỗi lấy chi tiết nhân viên:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Tạo mới nhân viên
export const createEmployee = async (req, res) => {
  const {
    code, fullname, avatar, dob, gender, phone, email, cccd, address,
    join_date, branch_id, department_id, position_id, manager_id,
    status, contract_type, base_salary, allowance, notes
  } = req.body;

  try {
    if (!code || !fullname) {
      return res.status(400).json({ message: 'Mã nhân viên và họ tên là bắt buộc.' });
    }

    const exist = await query.get('SELECT id FROM employees WHERE code = ?', [code.trim()]);
    if (exist) {
      return res.status(400).json({ message: 'Mã nhân viên đã tồn tại trong hệ thống.' });
    }

    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO employees (
        code, fullname, avatar, dob, gender, phone, email, cccd, address,
        join_date, branch_id, department_id, position_id, manager_id,
        status, contract_type, base_salary, allowance, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code.trim(), fullname.trim(), avatar || '', dob || null, gender || '',
      phone || '', email || '', cccd || '', address || '',
      join_date || null, branch_id || null, department_id || null,
      position_id || null, manager_id || null,
      status || 'Thử việc', contract_type || '', base_salary || 0, allowance || 0,
      notes || '', now, now
    ]);

    return res.status(201).json({ message: 'Tạo hồ sơ nhân viên thành công.', id: result.lastID });
  } catch (error) {
    console.error('Lỗi tạo nhân viên:', error);
    return res.status(500).json({ message: 'Không thể tạo hồ sơ nhân viên.' });
  }
};

// Cập nhật nhân viên
export const updateEmployee = async (req, res) => {
  const {
    code, fullname, avatar, dob, gender, phone, email, cccd, address,
    join_date, branch_id, department_id, position_id, manager_id,
    status, contract_type, base_salary, allowance, notes
  } = req.body;

  try {
    const emp = await query.get('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ message: 'Nhân viên không tồn tại.' });

    if (!code || !fullname) {
      return res.status(400).json({ message: 'Mã nhân viên và họ tên là bắt buộc.' });
    }

    const dup = await query.get('SELECT id FROM employees WHERE code = ? AND id != ?', [code.trim(), req.params.id]);
    if (dup) return res.status(400).json({ message: 'Mã nhân viên đã tồn tại.' });

    const now = new Date().toISOString();
    await query.run(`
      UPDATE employees SET
        code = ?, fullname = ?, avatar = ?, dob = ?, gender = ?,
        phone = ?, email = ?, cccd = ?, address = ?,
        join_date = ?, branch_id = ?, department_id = ?, position_id = ?,
        manager_id = ?, status = ?, contract_type = ?,
        base_salary = ?, allowance = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      code.trim(), fullname.trim(), avatar || '', dob || null, gender || '',
      phone || '', email || '', cccd || '', address || '',
      join_date || null, branch_id || null, department_id || null,
      position_id || null, manager_id || null,
      status || 'Thử việc', contract_type || '',
      base_salary || 0, allowance || 0, notes || '', now, req.params.id
    ]);

    return res.json({ message: 'Cập nhật hồ sơ nhân viên thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật nhân viên:', error);
    return res.status(500).json({ message: 'Không thể cập nhật hồ sơ nhân viên.' });
  }
};

// Xóa nhân viên
export const deleteEmployee = async (req, res) => {
  try {
    const emp = await query.get('SELECT id, fullname FROM employees WHERE id = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ message: 'Nhân viên không tồn tại.' });

    // Kiểm tra ràng buộc: có user liên kết không?
    const linkedUser = await query.get('SELECT id FROM users WHERE employee_id = ?', [req.params.id]);
    if (linkedUser) {
      return res.status(400).json({ message: 'Không thể xóa. Nhân viên này đang có tài khoản đăng nhập liên kết. Vui lòng xóa tài khoản trước.' });
    }

    // Xóa các dữ liệu phụ thuộc để tránh lỗi FOREIGN KEY constraint
    await query.run('DELETE FROM attendance WHERE employee_id = ?', [req.params.id]);
    await query.run('DELETE FROM leave_requests WHERE employee_id = ?', [req.params.id]);
    await query.run('DELETE FROM contracts WHERE employee_id = ?', [req.params.id]);
    await query.run('DELETE FROM payroll WHERE employee_id = ?', [req.params.id]);
    await query.run('DELETE FROM kpi WHERE employee_id = ?', [req.params.id]);
    await query.run('DELETE FROM notifications WHERE employee_id = ?', [req.params.id]);
    await query.run('DELETE FROM rewards WHERE employee_id = ?', [req.params.id]);

    await query.run('DELETE FROM employees WHERE id = ?', [req.params.id]);
    return res.json({ message: `Đã xóa nhân viên "${emp.fullname}" thành công.` });
  } catch (error) {
    console.error('Lỗi xóa nhân viên:', error);
    return res.status(500).json({ message: 'Không thể xóa nhân viên do lỗi dữ liệu liên kết.' });
  }
};

// Xuất Excel danh sách nhân viên
export const exportEmployeesExcel = async (req, res) => {
  try {
    const employees = await query.all(`
      SELECT e.code as 'Mã NV', e.fullname as 'Họ và Tên', e.gender as 'Giới tính',
             e.dob as 'Ngày sinh', e.phone as 'Số ĐT', e.email as 'Email',
             e.cccd as 'CCCD', e.address as 'Địa chỉ',
             d.name as 'Phòng ban', p.name as 'Chức vụ', b.name as 'Chi nhánh',
             e.join_date as 'Ngày vào làm', e.status as 'Trạng thái',
             e.contract_type as 'Loại hợp đồng',
             e.base_salary as 'Lương cơ bản', e.allowance as 'Phụ cấp',
             e.notes as 'Ghi chú'
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN branches b ON e.branch_id = b.id
      ORDER BY e.code ASC
    `);

    const ws = XLSX.utils.json_to_sheet(employees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nhân viên');

    // Tự set độ rộng cột
    ws['!cols'] = [
      { wch: 10 }, { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 14 },
      { wch: 25 }, { wch: 14 }, { wch: 35 }, { wch: 30 }, { wch: 25 },
      { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 12 }, { wch: 30 }
    ];

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Disposition', `attachment; filename=nhan_vien_viet_a_${dateStr}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (error) {
    console.error('Lỗi xuất Excel:', error);
    return res.status(500).json({ message: 'Không thể xuất file Excel.' });
  }
};
