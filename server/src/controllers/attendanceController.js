import { query } from '../config/database.js';
import { syncAttendanceToPayrollForMonth } from './payrollController.js';

export const getAttendance = async (req, res) => {
  try {
    const { month, year, employee_id, department_id, status, search, from_date, to_date } = req.query;
    
    let sql = `
      SELECT a.*, e.fullname, e.code as employee_code, d.name as department_name, pos.name as position_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON (e.department_id = d.id OR e.department_id = d.name)
      LEFT JOIN positions pos ON e.position_id = pos.id
      WHERE 1=1
    `;
    const params = [];

    // Lọc theo ngày hoặc tháng/năm
    if (from_date && to_date) {
      sql += ` AND a.date >= ? AND a.date <= ?`;
      params.push(from_date, to_date);
    } else if (month && year) {
      const mStr = month.toString().padStart(2, '0');
      const startDate = `${year}-${mStr}-01`;
      const endDate = `${year}-${mStr}-31`;
      sql += ` AND a.date >= ? AND a.date <= ?`;
      params.push(startDate, endDate);
    } else if (year) {
      sql += ` AND a.date LIKE ?`;
      params.push(`${year}-%`);
    }

    if (department_id && department_id !== 'all') {
      sql += ` AND (e.department_id = ? OR d.name = ?)`;
      params.push(department_id, department_id);
    }

    if (status && status !== 'all') {
      sql += ` AND a.status LIKE ?`;
      params.push(`%${status}%`);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ` AND (e.fullname LIKE ? OR e.code LIKE ?)`;
      params.push(term, term);
    }

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND a.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      const currentManager = await query.get('SELECT department_id FROM employees WHERE id = ?', [req.user.employeeId]);
      const deptId = currentManager?.department_id;
      if (deptId) {
        sql += ` AND (e.department_id = ? OR e.id = ?)`;
        params.push(deptId, req.user.employeeId);
      } else {
        sql += ` AND a.employee_id = ?`;
        params.push(req.user.employeeId);
      }
    } else if (employee_id && employee_id !== 'all') {
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
    } else {
      // Thêm mới
      await query.run(`
        INSERT INTO attendance (employee_id, date, check_in, check_out, status, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [empId, date, check_in || null, check_out || null, status || 'Có mặt', note || '']);
    }

    // Tự động đồng bộ số ngày công sang Bảng Lương tháng trực tuyến
    if (date) {
      const parts = date.split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        syncAttendanceToPayrollForMonth(m, y, empId).catch(err => {
          console.warn('Lỗi tự động đồng bộ chấm công sang lương:', err.message);
        });
      }
    }

    return res.json({ message: 'Ghi nhận chấm công và cập nhật bảng lương thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi ghi nhận chấm công.' });
  }
};

/* ═══════════════════════════════════════════════════════════════
   CẤU HÌNH & XỬ LÝ MA TRẬN CHẤM CÔNG CHUẨN GOOGLE SHEETS
   ═══════════════════════════════════════════════════════════════ */

export const SHEETS_CONFIG = [
  {
    key: 'van_phong',
    name: 'Khối Văn Phòng',
    sheetName: 'VĂN PHÒNG',
    managerName: 'Huỳnh Thị Trúc Xinh',
    managerCode: 'VietA 032',
    deptIds: [9, 7], // Khối văn phòng + Ban giám đốc
    description: 'Chấm công bởi Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)'
  },
  {
    key: 'marketing',
    name: 'Phòng Marketing',
    sheetName: 'MARKETING',
    managerName: 'Huỳnh Thị Trúc Xinh',
    managerCode: 'VietA 032',
    deptIds: [13],
    description: 'Chấm công bởi Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)'
  },
  {
    key: 'can_tho',
    name: 'Kho Cần Thơ',
    sheetName: 'CẦN THƠ',
    managerName: 'Nguyễn Thị Thu Tâm',
    managerCode: 'VietA 003',
    deptIds: [8],
    description: 'Chấm công bởi Nguyễn Thị Thu Tâm (Quản lý Kho Cần Thơ)'
  },
  {
    key: 'xuong_sx',
    name: 'Xưởng Sản Xuất Nệm',
    sheetName: 'XƯỞNG SẢN XUẤT',
    managerName: 'Trần Minh Lý',
    managerCode: 'VietA 050',
    deptIds: [10],
    description: 'Chấm công bởi Trần Minh Lý (Quản đốc Xưởng sản xuất nệm)'
  },
  {
    key: 'my_tho',
    name: 'Kho Mỹ Tho',
    sheetName: 'MỸ THO',
    managerName: 'Dương Thị Tuyết Hường',
    managerCode: 'VietA 015',
    deptIds: [11],
    description: 'Chấm công bởi Dương Thị Tuyết Hường (Quản lý Kho Mỹ Tho)'
  },
  {
    key: 'kho_goi',
    name: 'Xưởng Sản Xuất Gối',
    sheetName: 'KHO GỐI',
    managerName: 'Dương Thị Tuyết Hường',
    managerCode: 'VietA 015',
    deptIds: [14],
    description: 'Chấm công bởi Dương Thị Tuyết Hường (Quản lý Kho Gối)'
  },
  {
    key: 'kinh_doanh',
    name: 'Phòng Kinh Doanh',
    sheetName: 'KINH DOANH',
    managerName: 'Phạm Tấn Hưng',
    managerCode: 'VietA 036',
    deptIds: [12],
    description: 'Chấm công bởi Phạm Tấn Hưng (Trưởng phòng Kinh doanh)'
  }
];

export const canUserEditSheet = (user, employee, sheetKey) => {
  if (!user) return false;
  if (user.roleName === 'ADMIN') return true;

  const empCode = (employee?.code || '').toLowerCase().trim();
  const empName = (employee?.fullname || '').toLowerCase().trim();
  const username = (user.username || '').toLowerCase().trim();

  if (sheetKey === 'van_phong' || sheetKey === 'marketing') {
    return username === 'vieta032' || empCode.includes('032') || empName.includes('trúc xinh');
  }
  if (sheetKey === 'can_tho') {
    return username === 'vieta003' || empCode.includes('003') || empName.includes('thu tâm');
  }
  if (sheetKey === 'xuong_sx') {
    return username === 'vieta050' || empCode.includes('050') || empName.includes('minh lý');
  }
  if (sheetKey === 'my_tho' || sheetKey === 'kho_goi') {
    return username === 'vieta015' || empCode.includes('015') || empName.includes('tuyết hường');
  }
  if (sheetKey === 'kinh_doanh') {
    return username === 'vieta036' || empCode.includes('036') || empName.includes('tấn hưng');
  }

  return false;
};

export const statusToSymbol = (status) => {
  if (!status) return '';
  const s = status.trim().toLowerCase();
  if (s === 'x' || s.includes('có mặt') || s.includes('đi làm')) return 'X';
  if (s === 'nn' || s.includes('nửa ngày') || s.includes('1/2')) return 'NN';
  if (s === 'p' || s.includes('phép')) return 'P';
  if (s === 'kl' || s.includes('không lương')) return 'KL';
  if (s === 'ct' || s.includes('công tác')) return 'CT';
  if (s === 'l' || s.includes('lễ')) return 'L';
  if (s === 'off' || s.includes('tuần') || s.includes('nghỉ hàng tuần')) return 'OFF';
  if (s === 'ts' || s.includes('thai sản')) return 'TS';
  return s.toUpperCase();
};

export const symbolToStatus = (symbol) => {
  const s = (symbol || '').trim().toUpperCase();
  switch (s) {
    case 'X':
      return { status: 'Có mặt', check_in: '08:00', check_out: '17:00', note: 'Đi làm cả ngày (1 công)' };
    case 'NN':
      return { status: 'Nghỉ nửa ngày', check_in: '08:00', check_out: '12:00', note: 'Làm nửa ngày (0.5 công)' };
    case 'P':
      return { status: 'Nghỉ phép', check_in: null, check_out: null, note: 'Nghỉ phép năm' };
    case 'KL':
      return { status: 'Nghỉ không lương', check_in: null, check_out: null, note: 'Nghỉ không lương' };
    case 'CT':
      return { status: 'Công tác', check_in: '08:00', check_out: '17:00', note: 'Đi công tác' };
    case 'L':
      return { status: 'Nghỉ lễ', check_in: null, check_out: null, note: 'Nghỉ lễ hưởng lương' };
    case 'OFF':
      return { status: 'Nghỉ tuần', check_in: null, check_out: null, note: 'Nghỉ hằng tuần (OFF)' };
    case 'TS':
      return { status: 'Nghỉ thai sản', check_in: null, check_out: null, note: 'Nghỉ thai sản' };
    default:
      return null;
  }
};

const getDaysInMonth = (year, month) => {
  const count = new Date(year, month, 0).getDate();
  const days = [];
  const DOW_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let d = 1; d <= count; d++) {
    const dt = new Date(year, month - 1, d);
    const dow = DOW_VN[dt.getDay()];
    days.push({
      day: d,
      dow,
      isSunday: dow === 'CN',
      dateStr: `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
    });
  }
  return days;
};

// 1. Lấy danh sách tabs sheet kèm quyền hạn
export const getSheetsConfig = async (req, res) => {
  try {
    let currentEmp = null;
    if (req.user?.employeeId) {
      currentEmp = await query.get('SELECT id, code, fullname FROM employees WHERE id = ?', [req.user.employeeId]);
    }

    const configs = SHEETS_CONFIG.map(sc => ({
      ...sc,
      canEdit: canUserEditSheet(req.user, currentEmp, sc.key)
    }));

    return res.json({
      isAdmin: req.user?.roleName === 'ADMIN',
      userFullName: currentEmp?.fullname || req.user?.username,
      sheets: configs
    });
  } catch (error) {
    console.error('Lỗi lấy sheets config:', error);
    return res.status(500).json({ message: 'Lỗi tải cấu hình mẫu chấm công.' });
  }
};

// 2. Lấy dữ liệu ma trận chấm công của 1 sheet trong tháng
export const getSheetMatrix = async (req, res) => {
  try {
    const { month, year, sheet_key } = req.query;
    const mNum = parseInt(month, 10) || new Date().getMonth() + 1;
    const yNum = parseInt(year, 10) || new Date().getFullYear();
    const sheetCfg = SHEETS_CONFIG.find(s => s.key === sheet_key) || SHEETS_CONFIG[0];

    let currentEmp = null;
    if (req.user?.employeeId) {
      currentEmp = await query.get('SELECT id, code, fullname FROM employees WHERE id = ?', [req.user.employeeId]);
    }
    const canEdit = canUserEditSheet(req.user, currentEmp, sheetCfg.key);

    const days = getDaysInMonth(yNum, mNum);
    const startDate = `${yNum}-${mNum.toString().padStart(2, '0')}-01`;
    const endDate = `${yNum}-${mNum.toString().padStart(2, '0')}-${days.length.toString().padStart(2, '0')}`;

    // Lấy nhân viên thuộc sheet
    const placeholders = sheetCfg.deptIds.map(() => '?').join(',');
    const employees = await query.all(`
      SELECT e.id, e.code, e.fullname, d.name as department_name, pos.name as position_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions pos ON e.position_id = pos.id
      WHERE e.department_id IN (${placeholders})
      ORDER BY 
        CASE 
          WHEN pos.name LIKE '%giám đốc%' OR pos.name LIKE '%phó%' THEN 1
          WHEN pos.name LIKE '%trưởng phòng%' OR pos.name LIKE '%quản lý%' OR pos.name LIKE '%quản đốc%' OR pos.name LIKE '%trưởng nhóm%' THEN 2
          ELSE 3
        END,
        e.id ASC
    `, sheetCfg.deptIds);

    if (employees.length === 0) {
      return res.json({
        sheet: sheetCfg,
        canEdit,
        days,
        matrix: []
      });
    }

    // Lấy tất cả lượt chấm công trong tháng của các nhân viên này
    const empIds = employees.map(e => e.id);
    const empPlaceholders = empIds.map(() => '?').join(',');
    const attRecords = await query.all(`
      SELECT employee_id, date, status, check_in, check_out, ot_hours, cut_hours, late_minutes, note
      FROM attendance
      WHERE employee_id IN (${empPlaceholders})
        AND date >= ? AND date <= ?
    `, [...empIds, startDate, endDate]);

    // Gom dữ liệu theo nhân viên và theo ngày
    const attMap = {};
    for (const rec of attRecords) {
      const key = `${rec.employee_id}_${rec.date}`;
      attMap[key] = rec;
    }

    const matrix = employees.map((emp, idx) => {
      let workDays = 0;
      let paidLeaves = 0;
      let totalOt = 0;
      let totalCut = 0;

      const dayData = {};
      for (const d of days) {
        const rec = attMap[`${emp.id}_${d.dateStr}`];
        if (rec) {
          const sym = statusToSymbol(rec.status);
          const ot = Number(rec.ot_hours) || 0;
          const cut = Number(rec.cut_hours) || 0;
          dayData[d.day] = {
            symbol: sym,
            ot_hours: ot,
            cut_hours: cut,
            late_minutes: Number(rec.late_minutes) || 0,
            note: rec.note || ''
          };

          if (sym === 'X' || sym === 'CT' || sym === 'L') {
            workDays += 1;
          } else if (sym === 'NN') {
            workDays += 0.5;
          }
          if (sym === 'P') {
            paidLeaves += 1;
          }
          totalOt += ot;
          totalCut += cut;
        } else {
          dayData[d.day] = {
            symbol: '',
            ot_hours: 0,
            cut_hours: 0,
            late_minutes: 0,
            note: ''
          };
        }
      }

      return {
        stt: idx + 1,
        employee_id: emp.id,
        code: emp.code,
        fullname: emp.fullname,
        department_name: emp.department_name,
        position_name: emp.position_name,
        days: dayData,
        summary: {
          workDays: Number(workDays.toFixed(1)),
          paidLeaves,
          totalOt: Number(totalOt.toFixed(1)),
          totalCut: Number(totalCut.toFixed(1))
        }
      };
    });

    return res.json({
      sheet: sheetCfg,
      canEdit,
      days,
      matrix
    });
  } catch (error) {
    console.error('Lỗi lấy ma trận chấm công:', error);
    return res.status(500).json({ message: 'Lỗi tải ma trận chấm công.' });
  }
};

// 3. Lưu hàng loạt ma trận chấm công (lưu trữ lâu dài vào CSDL)
export const saveSheetMatrix = async (req, res) => {
  try {
    const { month, year, sheet_key, updates } = req.body;
    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);
    const sheetCfg = SHEETS_CONFIG.find(s => s.key === sheet_key);

    if (!sheetCfg) {
      return res.status(400).json({ message: 'Sheet không hợp lệ.' });
    }

    // Kiểm tra phân quyền chặt chẽ
    let currentEmp = null;
    if (req.user?.employeeId) {
      currentEmp = await query.get('SELECT id, code, fullname FROM employees WHERE id = ?', [req.user.employeeId]);
    }
    const canEdit = canUserEditSheet(req.user, currentEmp, sheetCfg.key);
    if (!canEdit) {
      return res.status(403).json({
        message: `Bạn không có quyền chấm công cho bộ phận này! Người phụ trách được phân công là: ${sheetCfg.managerName}.`
      });
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.json({ message: 'Không có dữ liệu thay đổi để lưu.', affected: 0 });
    }

    const updater = currentEmp?.fullname || req.user?.username || 'Quản lý';
    const now = new Date().toISOString();
    let savedCount = 0;

    for (const item of updates) {
      const { employee_id, day, symbol, ot_hours, cut_hours, late_minutes, note } = item;
      const dayStr = day.toString().padStart(2, '0');
      const mStr = mNum.toString().padStart(2, '0');
      const dateStr = `${yNum}-${mStr}-${dayStr}`;

      const sym = (symbol || '').trim().toUpperCase();
      const ot = parseFloat(ot_hours) || 0;
      const cut = parseFloat(cut_hours) || 0;
      const late = parseInt(late_minutes, 10) || 0;

      if (!sym && ot === 0 && cut === 0 && late === 0) {
        // Xóa bản ghi nếu xóa trắng
        await query.run('DELETE FROM attendance WHERE employee_id = ? AND date = ?', [employee_id, dateStr]);
        savedCount++;
        continue;
      }

      const stInfo = symbolToStatus(sym) || { status: 'Có mặt', check_in: '08:00', check_out: '17:00', note: sym };

      await query.run(`
        INSERT INTO attendance (employee_id, date, check_in, check_out, status, ot_hours, cut_hours, late_minutes, note, updated_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(employee_id, date) DO UPDATE SET
          check_in = excluded.check_in,
          check_out = excluded.check_out,
          status = excluded.status,
          ot_hours = excluded.ot_hours,
          cut_hours = excluded.cut_hours,
          late_minutes = excluded.late_minutes,
          note = excluded.note,
          updated_by = excluded.updated_by
      `, [
        employee_id,
        dateStr,
        stInfo.check_in,
        stInfo.check_out,
        stInfo.status,
        ot,
        cut,
        late,
        note || stInfo.note,
        updater,
        now
      ]);

      savedCount++;
    }

    // Tự động đồng bộ số ngày công và tăng ca sang Bảng Lương tháng trực tuyến
    await syncAttendanceToPayrollForMonth(mNum, yNum).catch(err => {
      console.warn('Lỗi tự động đồng bộ ma trận chấm công sang bảng lương:', err.message);
    });

    return res.json({
      message: `Đã lưu thành công ${savedCount} ô chấm công cho [${sheetCfg.name}] và tự động liên kết cập nhật Bảng Lương!`,
      affected: savedCount
    });
  } catch (error) {
    console.error('Lỗi lưu ma trận chấm công:', error);
    return res.status(500).json({ message: 'Lỗi lưu dữ liệu chấm công.' });
  }
};

// 4. Xuất file Excel chuẩn 100% mẫu Google Sheets
export const exportSheetExcel = async (req, res) => {
  try {
    const { month, year, sheet_key } = req.query;
    const mNum = parseInt(month, 10) || new Date().getMonth() + 1;
    const yNum = parseInt(year, 10) || new Date().getFullYear();
    const days = getDaysInMonth(yNum, mNum);

    const XLSXModule = await import('xlsx');
    const XLSX = XLSXModule.default || XLSXModule;
    const wb = XLSX.utils.book_new();

    const sheetsToExport = (sheet_key && sheet_key !== 'all')
      ? SHEETS_CONFIG.filter(s => s.key === sheet_key)
      : SHEETS_CONFIG;

    for (const sheetCfg of sheetsToExport) {
      const placeholders = sheetCfg.deptIds.map(() => '?').join(',');
      const employees = await query.all(`
        SELECT e.id, e.code, e.fullname, d.name as department_name, pos.name as position_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions pos ON e.position_id = pos.id
        WHERE e.department_id IN (${placeholders})
        ORDER BY 
          CASE 
            WHEN pos.name LIKE '%giám đốc%' OR pos.name LIKE '%phó%' THEN 1
            WHEN pos.name LIKE '%trưởng phòng%' OR pos.name LIKE '%quản lý%' OR pos.name LIKE '%quản đốc%' OR pos.name LIKE '%trưởng nhóm%' THEN 2
            ELSE 3
          END,
          e.id ASC
      `, sheetCfg.deptIds);

      const startDate = `${yNum}-${mNum.toString().padStart(2, '0')}-01`;
      const endDate = `${yNum}-${mNum.toString().padStart(2, '0')}-${days.length.toString().padStart(2, '0')}`;

      let attMap = {};
      if (employees.length > 0) {
        const empIds = employees.map(e => e.id);
        const empPlaceholders = empIds.map(() => '?').join(',');
        const attRecords = await query.all(`
          SELECT employee_id, date, status, ot_hours, cut_hours, late_minutes
          FROM attendance
          WHERE employee_id IN (${empPlaceholders})
            AND date >= ? AND date <= ?
        `, [...empIds, startDate, endDate]);

        for (const rec of attRecords) {
          attMap[`${rec.employee_id}_${rec.date}`] = rec;
        }
      }

      // Xây dựng ma trận dòng giống Google Sheets
      const sheetData = [];

      // Row 0: Tiêu đề
      sheetData.push(["BẢNG CHẤM CÔNG – LÀM VIỆC, NGHỈ PHÉP NĂM VÀ NGÀY CÔNG HƯỞNG LƯƠNG"]);
      // Row 1: Thông tin tháng, năm
      sheetData.push(["THÁNG", mNum, "NĂM", yNum, "Quy định nội bộ", "Phép năm tối đa 2 ngày/tháng", `Bộ phận: ${sheetCfg.name}`, `Người phụ trách: ${sheetCfg.managerName}`]);
      // Row 2: Thứ trong tuần
      const r2 = [null, null, null, null, null];
      for (const d of days) r2.push(d.dow);
      r2.push("CÔNG THỰC TẾ", "PHÉP NĂM", "TĂNG CA (H)", "CẮT GIỜ (H)");
      sheetData.push(r2);

      // Row 3: Header cột
      const r3 = ["STT", "Mã NV", "HỌ VÀ TÊN", "BỘ PHẬN", "CHỨC VỤ"];
      for (const d of days) r3.push(`NGÀY ${d.day}`);
      r3.push("CÔNG THỰC TẾ", "PHÉP NĂM", "TĂNG CA (H)", "CẮT GIỜ (H)");
      sheetData.push(r3);

      // Row 4: Số ngày
      const r4 = [null, null, null, null, null];
      for (const d of days) r4.push(d.day);
      sheetData.push(r4);

      // Dữ liệu từng nhân viên
      employees.forEach((emp, idx) => {
        let workDays = 0;
        let paidLeaves = 0;
        let totalOt = 0;
        let totalCut = 0;

        const mainRow = [idx + 1, emp.code, emp.fullname, emp.department_name, emp.position_name];
        const otRow = [null, null, "  ↳ Tăng ca (giờ)", null, null];
        const lateRow = [null, null, "  ↳ Cắt giờ (giờ)", null, null];

        for (const d of days) {
          const rec = attMap[`${emp.id}_${d.dateStr}`];
          if (rec) {
            const sym = statusToSymbol(rec.status);
            const ot = Number(rec.ot_hours) || 0;
            const cut = Number(rec.cut_hours) || 0;

            mainRow.push(sym || null);
            otRow.push(ot > 0 ? ot : null);
            lateRow.push(cut > 0 ? cut : null);

            if (sym === 'X' || sym === 'CT' || sym === 'L') workDays += 1;
            else if (sym === 'NN') workDays += 0.5;
            if (sym === 'P') paidLeaves += 1;
            totalOt += ot;
            totalCut += cut;
          } else {
            mainRow.push(null);
            otRow.push(null);
            lateRow.push(null);
          }
        }

        mainRow.push(Number(workDays.toFixed(1)), paidLeaves, Number(totalOt.toFixed(1)), Number(totalCut.toFixed(1)));
        otRow.push(null, null, Number(totalOt.toFixed(1)), null);
        lateRow.push(null, null, null, Number(totalCut.toFixed(1)));

        sheetData.push(mainRow);
        sheetData.push(otRow);
        sheetData.push(lateRow);
      });

      // Chú thích chân trang chuẩn Google Sheet
      sheetData.push([]);
      sheetData.push(["LƯU Ý: Cảnh báo >2 ngày phép/tháng chỉ là giới hạn nội bộ của công ty; không dùng giới hạn này để làm mất quyền nghỉ hằng năm theo luật."]);
      sheetData.push(["NGÀY CÔNG HƯỞNG LƯƠNG: Tự động tính X + P + CT. Lễ (L) và ngày nghỉ hằng tuần (OFF) không cộng vào cột này theo yêu cầu của bảng theo dõi; cách tính lương thực tế cần thống nhất với phương pháp trả lương của công ty."]);
      sheetData.push(["MÃ CHẤM CÔNG: X = đi làm (1 công); P = phép năm; KL = nghỉ không lương; CT = công tác; L = lễ hưởng lương; TS = thai sản; NN = làm 1/2 ngày (0.5 công); OFF = nghỉ hằng tuần."]);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // Căn chỉnh độ rộng cột
      ws['!cols'] = [
        { wch: 6 },  // STT
        { wch: 12 }, // Mã NV
        { wch: 25 }, // Họ tên
        { wch: 20 }, // Bộ phận
        { wch: 22 }, // Chức vụ
        ...days.map(() => ({ wch: 5 })),
        { wch: 15 }, // Công thực tế
        { wch: 12 }, // Phép năm
        { wch: 12 }  // Tăng ca
      ];

      XLSX.utils.book_append_sheet(wb, ws, sheetCfg.sheetName);
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `BANG_CHAM_CONG_VIET_A_T${mNum}_${yNum}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buf);
  } catch (error) {
    console.error('Lỗi xuất file Excel chấm công:', error);
    return res.status(500).json({ message: 'Lỗi xuất file Excel.' });
  }
};

