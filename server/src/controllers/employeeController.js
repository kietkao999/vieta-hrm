import { query } from '../config/database.js';
import XLSX from 'xlsx';

// Helper kiểm tra quản lý Tuyết Hường (quản lý Kho Mỹ Tho + Xưởng sản xuất gối)
export const isTuyetHuong = (user, employee) => {
  if (!user && !employee) return false;
  const username = (user?.username || '').toLowerCase().trim();
  const code = (employee?.code || user?.employeeCode || '').toLowerCase().trim();
  const fullname = (employee?.fullname || user?.fullname || '').toLowerCase().trim();
  return username === 'vieta015' || code.includes('015') || fullname.includes('tuyết hường') || fullname.includes('tuyet huong');
};

// Helper lấy danh sách department_id của Quản lý
const getManagerDeptIds = async (user) => {
  let emp = null;
  if (user.employeeId) {
    emp = await query.get('SELECT id, code, fullname, department_id FROM employees WHERE id = ?', [user.employeeId]);
  }
  
  if (isTuyetHuong(user, emp)) {
    return [11, 14]; // Kho Mỹ Tho (11) và Xưởng sản xuất gối (14)
  }

  const deptId = user.departmentId || emp?.department_id || null;
  return deptId ? [deptId] : [];
};

// Lấy danh sách nhân viên với lọc, tìm kiếm, phân trang & bảo mật lương tuyệt đối
export const getEmployees = async (req, res) => {
  try {
    const { search, department_id, branch_id, status, page = 1, limit = 1000 } = req.query;
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

    // Phân quyền bảo mật: Trưởng phòng KHÔNG ĐƯỢC xem nhân sự phòng ban khác
    const isFullAdmin = req.user.roleName === 'ADMIN' || req.user.roleName === 'HR';
    const isManager = req.user.roleName === 'MANAGER';
    let managerDeptIds = [];

    if (isManager) {
      managerDeptIds = await getManagerDeptIds(req.user);
      if (managerDeptIds.length > 0) {
        if (department_id && department_id !== 'all') {
          const selectedDept = parseInt(department_id, 10);
          if (managerDeptIds.includes(selectedDept)) {
            sql += ' AND (e.department_id = ? OR e.department_id = (SELECT name FROM departments WHERE id = ?))';
            params.push(selectedDept, selectedDept);
          } else {
            const placeholders = managerDeptIds.map(() => '?').join(',');
            sql += ` AND (e.department_id IN (${placeholders}) OR e.department_id IN (SELECT name FROM departments WHERE id IN (${placeholders})))`;
            params.push(...managerDeptIds, ...managerDeptIds);
          }
        } else {
          const placeholders = managerDeptIds.map(() => '?').join(',');
          sql += ` AND (e.department_id IN (${placeholders}) OR e.department_id IN (SELECT name FROM departments WHERE id IN (${placeholders})))`;
          params.push(...managerDeptIds, ...managerDeptIds);
        }
      } else {
        sql += ' AND 1=0';
      }
    } else if (req.user.roleName === 'EMPLOYEE') {
      sql += ' AND e.id = ?';
      params.push(req.user.employeeId || -1);
    } else if (department_id && department_id !== 'all') {
      // ADMIN/HR lọc theo phòng ban nếu được chọn
      sql += ' AND (e.department_id = ? OR e.department_id = (SELECT name FROM departments WHERE id = ?))';
      params.push(department_id, department_id);
    }

    // Tìm kiếm theo tên, mã NV, email, số ĐT
    if (search) {
      sql += ' AND (e.fullname LIKE ? OR e.code LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.cccd LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
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

    // Thống kê nhanh số lượng nhân sự theo trạng thái (chính xác theo phạm vi phòng ban/quản lý)
    let statsSql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN e.status IN ('Đang làm việc', 'Thử việc') THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN e.status = 'Đang làm việc' THEN 1 ELSE 0 END) as working,
        SUM(CASE WHEN e.status = 'Thử việc' THEN 1 ELSE 0 END) as probation,
        SUM(CASE WHEN e.status = 'Đã nghỉ việc' THEN 1 ELSE 0 END) as resigned,
        SUM(CASE WHEN e.status = 'Nghỉ thai sản' THEN 1 ELSE 0 END) as maternity
      FROM employees e
      WHERE 1=1
    `;
    const statsParams = [];
    if (isManager && managerDeptIds.length > 0) {
      const placeholders = managerDeptIds.map(() => '?').join(',');
      statsSql += ` AND (e.department_id IN (${placeholders}) OR e.department_id IN (SELECT name FROM departments WHERE id IN (${placeholders})))`;
      statsParams.push(...managerDeptIds, ...managerDeptIds);
    } else if (req.user.roleName === 'EMPLOYEE') {
      statsSql += ' AND e.id = ?';
      statsParams.push(req.user.employeeId || -1);
    } else if (department_id && department_id !== 'all') {
      statsSql += ' AND (e.department_id = ? OR e.department_id = (SELECT name FROM departments WHERE id = ?))';
      statsParams.push(department_id, department_id);
    }

    const summaryStatsRow = await query.get(statsSql, statsParams);
    const summaryStats = {
      total: summaryStatsRow?.total || 0,
      active: summaryStatsRow?.active || 0,
      working: summaryStatsRow?.working || 0,
      probation: summaryStatsRow?.probation || 0,
      resigned: summaryStatsRow?.resigned || 0,
      maternity: summaryStatsRow?.maternity || 0
    };

    // Phân trang
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' ORDER BY e.code ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const rawEmployees = await query.all(sql, params);

    // Phân quyền bảo mật lương tuyệt đối:
    // Chỉ ADMIN mới thấy toàn bộ mức lương của tất cả mọi người.
    // MANAGER & EMPLOYEE chỉ thấy mức lương của chính mình, các trường lương của người khác bị ẩn cứng trên Server.
    const safeEmployees = rawEmployees.map(e => {
      const isSelf = req.user.employeeId && e.id === req.user.employeeId;
      const empDept = parseInt(e.department_id, 10);
      const isDeptStaff = isManager && (managerDeptIds.includes(empDept) || managerDeptIds.includes(e.department_id));

      if (!isFullAdmin && !isSelf) {
        return {
          ...e,
          tier_salary: null,
          grade_salary: null,
          base_salary: null,
          allowance: null,
          kpi_bonus: null,
          bank_account: null,
          bank_name: null,
          cccd: isDeptStaff ? e.cccd : null,
          address: isDeptStaff ? e.address : null
        };
      }
      return e;
    });

    return res.json({
      data: safeEmployees,
      summaryStats,
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
    let sql = 'SELECT id, code, fullname, department_id FROM employees WHERE 1=1';
    const params = [];
    if (req.user?.roleName === 'MANAGER') {
      const managerDeptId = await getManagerDeptId(req.user);
      if (managerDeptId) {
        sql += ' AND (department_id = ? OR department_id = (SELECT name FROM departments WHERE id = ?))';
        params.push(managerDeptId, managerDeptId);
      }
    } else if (req.user?.roleName === 'EMPLOYEE') {
      sql += ' AND id = ?';
      params.push(req.user.employeeId || -1);
    }
    sql += ' ORDER BY fullname ASC';
    const employees = await query.all(sql, params);
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Chi tiết 1 nhân viên (Bảo mật lương & Phân quyền theo phòng ban)
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

    const isFullAdmin = req.user.roleName === 'ADMIN' || req.user.roleName === 'HR';
    const isSelf = req.user.employeeId && emp.id === req.user.employeeId;
    const isManager = req.user.roleName === 'MANAGER';

    // Trưởng phòng KHÔNG ĐƯỢC xem hồ sơ nhân sự của phòng ban khác
    if (isManager) {
      const managerDeptId = await getManagerDeptId(req.user);
      const isDeptStaff = (emp.department_id === managerDeptId) || 
                          (req.user.departmentName && emp.department_name === req.user.departmentName);
      if (!isDeptStaff && !isSelf) {
        return res.status(403).json({ message: 'Bạn không có quyền xem hồ sơ nhân sự của phòng ban khác.' });
      }
    } else if (req.user.roleName === 'EMPLOYEE' && !isSelf) {
      return res.status(403).json({ message: 'Bạn chỉ có quyền xem hồ sơ cá nhân của mình.' });
    }

    const isDeptStaff = isManager && (emp.department_id === req.user.departmentId);

    // Nếu không phải ADMIN và không phải chính mình: Ẩn tuyệt đối các trường bảo mật lương
    if (!isFullAdmin && !isSelf) {
      emp.tier_salary = null;
      emp.grade_salary = null;
      emp.base_salary = null;
      emp.allowance = null;
      emp.kpi_bonus = null;
      emp.bank_account = null;
      emp.bank_name = null;
      if (!isDeptStaff) {
        emp.cccd = null;
        emp.address = null;
      }
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
    status, contract_type, base_salary, allowance, kpi_bonus, notes,
    tier, grade, tier_salary, grade_salary,
    resignation_date, resignation_reason
  } = req.body;

  try {
    if (!code || !fullname) {
      return res.status(400).json({ message: 'Mã nhân viên và họ tên là bắt buộc.' });
    }

    const exist = await query.get('SELECT id FROM employees WHERE code = ?', [code.trim()]);
    if (exist) {
      return res.status(400).json({ message: 'Mã nhân viên đã tồn tại trong hệ thống.' });
    }

    const tSalary = parseFloat(tier_salary) || 0;
    const gSalary = parseFloat(grade_salary) || 0;
    const bSalary = parseFloat(base_salary) || (tSalary + gSalary);

    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO employees (
        code, fullname, avatar, dob, gender, phone, email, cccd, address,
        join_date, branch_id, department_id, position_id, manager_id,
        status, contract_type, base_salary, allowance, kpi_bonus, notes,
        tier, grade, tier_salary, grade_salary, resignation_date, resignation_reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code.trim(), fullname.trim(), avatar || '', dob || null, gender || '',
      phone || '', email || '', cccd || '', address || '',
      join_date || null, branch_id || null, department_id || null,
      position_id || null, manager_id || null,
      status || 'Thử việc', contract_type || '', bSalary, allowance || 0,
      kpi_bonus || 0, notes || '',
      tier || '', grade || '', tSalary, gSalary,
      resignation_date || null, resignation_reason || null, now, now
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
    status, contract_type, base_salary, allowance, kpi_bonus, notes,
    tier, grade, tier_salary, grade_salary,
    resignation_date, resignation_reason
  } = req.body;

  try {
    const emp = await query.get('SELECT id, department_id, position_id, tier, grade, tier_salary, grade_salary, base_salary, status FROM employees WHERE id = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ message: 'Nhân viên không tồn tại.' });

    if (!code || !fullname) {
      return res.status(400).json({ message: 'Mã nhân viên và họ tên là bắt buộc.' });
    }

    const dup = await query.get('SELECT id FROM employees WHERE code = ? AND id != ?', [code.trim(), req.params.id]);
    if (dup) return res.status(400).json({ message: 'Mã nhân viên đã tồn tại.' });

    const tSalary = tier_salary !== undefined ? (parseFloat(tier_salary) || 0) : (emp.tier_salary || 0);
    const gSalary = grade_salary !== undefined ? (parseFloat(grade_salary) || 0) : (emp.grade_salary || 0);
    const bSalary = base_salary !== undefined ? (parseFloat(base_salary) || 0) : (tSalary + gSalary || emp.base_salary || 0);

    const newDeptId = department_id ? parseInt(department_id, 10) : null;
    const newPosId = position_id ? parseInt(position_id, 10) : null;
    const oldDeptId = emp.department_id ? parseInt(emp.department_id, 10) : null;
    const oldPosId = emp.position_id ? parseInt(emp.position_id, 10) : null;

    const now = new Date().toISOString();

    // Tự động ghi nhận lịch sử điều chuyển công tác vào work_history nếu có thay đổi phòng ban hoặc chức vụ
    if (newDeptId !== oldDeptId || newPosId !== oldPosId) {
      const todayStr = now.split('T')[0];
      try {
        await query.run(`
          UPDATE work_history 
          SET end_date = ? 
          WHERE employee_id = ? AND (end_date IS NULL OR end_date = '')
        `, [todayStr, req.params.id]);

        await query.run(`
          INSERT INTO work_history (employee_id, department_id, position_id, start_date, notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          req.params.id,
          newDeptId,
          newPosId,
          todayStr,
          `Điều chuyển công tác (Phòng ban mới: ID ${newDeptId}, Vị trí mới: ID ${newPosId})`,
          now
        ]);
      } catch (whErr) {
        console.warn('Lỗi tự động ghi nhận work_history:', whErr.message);
      }
    }

    // Nếu trạng thái chuyển sang Đã nghỉ việc, tự động khóa tài khoản đăng nhập để bảo mật
    if (status === 'Đã nghỉ việc') {
      await query.run('UPDATE users SET is_active = 0, updated_at = ? WHERE employee_id = ?', [now, req.params.id]);
    } else if (emp.status === 'Đã nghỉ việc' && (status === 'Đang làm việc' || status === 'Thử việc')) {
      // Nếu kích hoạt đi làm lại, mở khóa tài khoản
      await query.run('UPDATE users SET is_active = 1, updated_at = ? WHERE employee_id = ?', [now, req.params.id]);
    }

    await query.run(`
      UPDATE employees SET
        code = ?, fullname = ?, avatar = ?, dob = ?, gender = ?,
        phone = ?, email = ?, cccd = ?, address = ?,
        join_date = ?, branch_id = ?, department_id = ?, position_id = ?,
        manager_id = ?, status = ?, contract_type = ?,
        base_salary = ?, allowance = ?, kpi_bonus = ?, notes = ?,
        tier = ?, grade = ?, tier_salary = ?, grade_salary = ?,
        resignation_date = ?, resignation_reason = ?, updated_at = ?
      WHERE id = ?
    `, [
      code.trim(), fullname.trim(), avatar || '', dob || null, gender || '',
      phone || '', email || '', cccd || '', address || '',
      join_date || null, branch_id || null, department_id || null,
      position_id || null, manager_id || null,
      status || 'Thử việc', contract_type || '',
      bSalary, allowance || 0, kpi_bonus || 0, notes || '',
      tier !== undefined ? tier : (emp.tier || ''),
      grade !== undefined ? grade : (emp.grade || ''),
      tSalary, gSalary,
      resignation_date !== undefined ? resignation_date : null,
      resignation_reason !== undefined ? resignation_reason : null,
      now, req.params.id
    ]);

    return res.json({ message: 'Cập nhật hồ sơ nhân viên thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật nhân viên:', error);
    return res.status(500).json({ message: 'Không thể cập nhật hồ sơ nhân viên.' });
  }
};

// Ghi nhận nhân sự nghỉ việc (giữ nguyên 100% hồ sơ, khóa tài khoản, bảo toàn bảng lương cũ)
export const markEmployeeResigned = async (req, res) => {
  try {
    const { id } = req.params;
    const { resignation_date, resignation_reason, handover_notes } = req.body;

    const emp = await query.get('SELECT id, fullname, code, status, notes FROM employees WHERE id = ?', [id]);
    if (!emp) return res.status(404).json({ message: 'Nhân viên không tồn tại.' });

    const resignDate = resignation_date || new Date().toISOString().split('T')[0];
    const reasonText = resignation_reason || 'Nghỉ việc theo nguyện vọng cá nhân';
    const now = new Date().toISOString();

    let combinedNotes = emp.notes || '';
    const resignLog = `[Nghỉ việc ngày ${resignDate}]: Lý do: ${reasonText}${handover_notes ? ` | Bàn giao: ${handover_notes}` : ''}`;
    combinedNotes = combinedNotes ? `${combinedNotes}\n${resignLog}` : resignLog;

    await query.run(`
      UPDATE employees 
      SET status = 'Đã nghỉ việc',
          resignation_date = ?,
          resignation_reason = ?,
          notes = ?,
          updated_at = ?
      WHERE id = ?
    `, [
      resignDate,
      reasonText,
      combinedNotes,
      now,
      id
    ]);

    // Khóa tài khoản đăng nhập để bảo mật thông tin nội bộ
    await query.run('UPDATE users SET is_active = 0, updated_at = ? WHERE employee_id = ?', [now, id]);

    return res.json({
      message: `Đã cập nhật nhân sự "${emp.fullname}" (${emp.code}) sang trạng thái "Đã nghỉ việc". Toàn bộ hồ sơ lương tháng cũ, hợp đồng và dữ liệu chấm công được bảo toàn nguyên vẹn 100%.`,
      employee: {
        id: emp.id,
        fullname: emp.fullname,
        code: emp.code,
        status: 'Đã nghỉ việc',
        resignation_date: resignDate,
        resignation_reason: reasonText
      }
    });
  } catch (error) {
    console.error('Lỗi ghi nhận nghỉ việc:', error);
    return res.status(500).json({ message: 'Không thể cập nhật trạng thái nghỉ việc.' });
  }
};

// Xóa nhân viên (Bảo vệ dữ liệu lịch sử tài chính & bảng lương)
export const deleteEmployee = async (req, res) => {
  try {
    const emp = await query.get('SELECT id, fullname, code FROM employees WHERE id = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ message: 'Nhân viên không tồn tại.' });

    // Kiểm tra dữ liệu lịch sử quan trọng: bảng lương, chấm công, hợp đồng
    const hasPayrolls = await query.get('SELECT COUNT(*) as c FROM payrolls WHERE employee_id = ?', [req.params.id]);
    const hasAttendance = await query.get('SELECT COUNT(*) as c FROM attendance WHERE employee_id = ?', [req.params.id]);
    const hasContracts = await query.get('SELECT COUNT(*) as c FROM contracts WHERE employee_id = ?', [req.params.id]);

    const totalRecords = (hasPayrolls?.c || 0) + (hasAttendance?.c || 0) + (hasContracts?.c || 0);

    if (totalRecords > 0) {
      return res.status(400).json({
        message: `Nhân viên "${emp.fullname}" (${emp.code}) đã có ${hasPayrolls?.c || 0} kỳ lương và ${hasAttendance?.c || 0} bản ghi chấm công lịch sử. Để bảo toàn số liệu tài chính & pháp lý, bạn không thể xóa vĩnh viễn nhân sự này. Vui lòng sử dụng tính năng "Báo nghỉ việc" (Chuyển trạng thái 'Đã nghỉ việc') để giữ nguyên vẹn toàn bộ hồ sơ lương tháng cũ.`
      });
    }

    // Kiểm tra ràng buộc: có user liên kết không?
    const linkedUser = await query.get('SELECT id FROM users WHERE employee_id = ?', [req.params.id]);
    if (linkedUser) {
      return res.status(400).json({ message: 'Không thể xóa. Nhân viên này đang có tài khoản đăng nhập liên kết. Vui lòng xóa tài khoản trước.' });
    }

    // Xóa các dữ liệu phụ thuộc không quan trọng nếu có
    await query.run('DELETE FROM leave_requests WHERE employee_id = ?', [req.params.id]);
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
    const isFullAdmin = req.user.roleName === 'ADMIN' || req.user.roleName === 'HR';
    const isManager = req.user.roleName === 'MANAGER';

    if (!isFullAdmin && !isManager) {
      return res.status(403).json({ message: 'Bạn không có quyền xuất danh sách nhân viên.' });
    }

    let filterSql = '';
    const filterParams = [];
    if (isManager) {
      const managerDeptId = await getManagerDeptId(req.user);
      if (managerDeptId) {
        filterSql = ' AND (e.department_id = ? OR e.department_id = (SELECT name FROM departments WHERE id = ?))';
        filterParams.push(managerDeptId, managerDeptId);
      }
    }

    const rawEmployees = await query.all(`
      SELECT e.id, e.code as 'Mã NV', e.fullname as 'Họ và Tên', e.gender as 'Giới tính',
             e.dob as 'Ngày sinh', e.phone as 'Số ĐT', e.email as 'Email',
             e.cccd as 'CCCD', e.address as 'Địa chỉ',
             d.name as 'Phòng ban', p.name as 'Chức vụ', b.name as 'Chi nhánh',
             e.join_date as 'Ngày vào làm', e.status as 'Trạng thái',
             e.contract_type as 'Loại hợp đồng',
             e.base_salary as 'Lương cơ bản', e.allowance as 'Phụ cấp',
             e.kpi_bonus as 'Thưởng KPI',
             e.notes as 'Ghi chú'
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE 1=1 ${filterSql}
      ORDER BY e.code ASC
    `, filterParams);

    // Nếu là Manager, bảo mật tuyệt đối lương của người khác khi xuất file
    const employees = rawEmployees.map(emp => {
      const isSelf = req.user.employeeId && emp.id === req.user.employeeId;
      const cleanItem = { ...emp };
      delete cleanItem.id;
      if (isManager && !isSelf) {
        cleanItem['Lương cơ bản'] = '***';
        cleanItem['Phụ cấp'] = '***';
        cleanItem['Thưởng KPI'] = '***';
      }
      return cleanItem;
    });

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
