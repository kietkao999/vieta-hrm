import { query } from './database.js';

const DEPARTMENTS = [
  "Ban giám đốc",
  "Khối văn phòng",
  "Phòng kinh doanh",
  "Phòng Marketing",
  "Xưởng sản xuất nệm",
  "Xưởng sản xuất gối",
  "Kho Mỹ Tho",
  "Kho Cần Thơ"
];

const POSITIONS = {
  "Ban giám đốc": [
    "Giám đốc",
    "Phó Giám đốc",
    "Trợ lý Giám đốc"
  ],
  "Khối văn phòng": [
    "Trưởng phòng kế toán",
    "Trưởng phòng HCNS",
    "Trợ lý Giám đốc",
    "Kế toán thu mua",
    "Kế toán thuế",
    "Trưởng phòng R&D",
    "Nhân viên phòng tổ chức"
  ],
  "Phòng kinh doanh": [
    "Trưởng phòng kinh doanh",
    "Kế toán kinh doanh",
    "Nhân viên kinh doanh"
  ],
  "Phòng Marketing": [
    "Trưởng phòng Marketing",
    "Nhân viên Marketing"
  ],
  "Xưởng sản xuất nệm": [
    "Quản lý xưởng",
    "Phó quản lý xưởng",
    "Kế toán xưởng sản xuất",
    "Nhân viên phun keo",
    "Nhân viên may viền",
    "Nhân viên may tay",
    "Nhân viên may một kim",
    "Nhân viên vô vali",
    "Nhân viên vô áo",
    "Nhân viên cắt vải",
    "Tài xế xưởng sản xuất"
  ],
  "Xưởng sản xuất gối": [
    "Trưởng nhóm thổi gối",
    "Nhân viên thổi gối",
    "Nhân viên may gối"
  ],
  "Kho Mỹ Tho": [
    "Quản lý kho Mỹ Tho",
    "Phó quản lý kho Mỹ Tho",
    "Kế toán kho Mỹ Tho",
    "Đội trưởng đội tài xế",
    "Nhân viên kho Mỹ Tho",
    "Nhân viên giao hàng Mỹ Tho",
    "Tài xế Mỹ Tho"
  ],
  "Kho Cần Thơ": [
    "Quản lý kho Cần Thơ",
    "Kế toán kho Cần Thơ",
    "Nhân viên kho Cần Thơ",
    "Nhân viên giao hàng Cần Thơ",
    "Tài xế Cần Thơ"
  ]
};

const EMPLOYEES_DATA = [
  { code: "VietA 002", name: "Võ Minh Cường", dept: "Ban giám đốc", pos: "Phó Giám đốc" },
  { code: "VietA 003", name: "Nguyễn Thị Thu Tâm", dept: "Kho Cần Thơ", pos: "Quản lý kho Cần Thơ" },
  { code: "VietA 004", name: "Nguyễn Thị Thúy Vy", dept: "Khối văn phòng", pos: "Kế toán thu mua" },
  { code: "VietA 006", name: "Phạm Thanh Phong", dept: "Kho Cần Thơ", pos: "Kế toán kho Cần Thơ" },
  { code: "VietA 007", name: "Trần Thanh Hoài", dept: "Kho Cần Thơ", pos: "Tài xế Cần Thơ" },
  { code: "VietA 009", name: "Huỳnh Ngọc Dư", dept: "Kho Cần Thơ", pos: "Nhân viên kho Cần Thơ" },
  { code: "VietA 010", name: "Nguyễn Hải Duy", dept: "Kho Cần Thơ", pos: "Nhân viên giao hàng Cần Thơ" },
  { code: "VietA 011", name: "Lý Minh Trung", dept: "Kho Cần Thơ", pos: "Nhân viên kho Cần Thơ" },
  { code: "VietA 012", name: "Võ Huỳnh Đông Nghi", dept: "Xưởng sản xuất nệm", pos: "Phó quản lý xưởng" },
  { code: "VietA 013", name: "Hồ Minh Thuận", dept: "Kho Cần Thơ", pos: "Nhân viên giao hàng Cần Thơ" },
  { code: "VietA 015", name: "Dương Thị Tuyết Hường", dept: "Kho Mỹ Tho", pos: "Quản lý kho Mỹ Tho" },
  { code: "VietA 016", name: "Nguyễn Thị Quỳnh Như", dept: "Kho Mỹ Tho", pos: "Phó quản lý kho Mỹ Tho" },
  { code: "VietA 017", name: "Trần Lương Ngọc Khánh", dept: "Kho Mỹ Tho", pos: "Kế toán kho Mỹ Tho" },
  { code: "VietA 018", name: "Nguyễn Thị Ngọc Trâm", dept: "Kho Mỹ Tho", pos: "Kế toán kho Mỹ Tho" },
  { code: "VietA 019", name: "Đoàn Hoài Linh", dept: "Kho Mỹ Tho", pos: "Đội trưởng đội tài xế" },
  { code: "VietA 020", name: "Đặng Hoàng Tuấn", dept: "Kho Mỹ Tho", pos: "Tài xế Mỹ Tho" },
  { code: "VietA 022", name: "Nguyễn Tuấn Kiệt", dept: "Kho Mỹ Tho", pos: "Nhân viên giao hàng Mỹ Tho" },
  { code: "VietA 023", name: "Nguyễn Hoàng Quân", dept: "Kho Mỹ Tho", pos: "Nhân viên giao hàng Mỹ Tho" },
  { code: "VietA 024", name: "Nguyễn Hữu Tài", dept: "Phòng kinh doanh", pos: "Nhân viên kinh doanh" },
  { code: "VietA 026", name: "Phạm Minh Phúc", dept: "Kho Mỹ Tho", pos: "Nhân viên kho Mỹ Tho" },
  { code: "VietA 027", name: "Phạm Ngọc Hiển", dept: "Kho Mỹ Tho", pos: "Nhân viên kho Mỹ Tho" },
  { code: "VietA 028", name: "Trần Hữu Lộc", dept: "Kho Mỹ Tho", pos: "Nhân viên kho Mỹ Tho" },
  { code: "VietA 029", name: "Nguyễn Thị Thanh Tú", dept: "Kho Mỹ Tho", pos: "Kế toán kho Mỹ Tho" },
  { code: "VietA 031", name: "Nguyễn Quốc Hùng", dept: "Khối văn phòng", pos: "Trưởng phòng kế toán" },
  { code: "VietA 032", name: "Huỳnh Thị Trúc Xinh", dept: "Khối văn phòng", pos: "Trưởng phòng HCNS" },
  { code: "VietA 033", name: "Nguyễn Quốc Huy", dept: "Khối văn phòng", pos: "Trợ lý Giám đốc" },
  { code: "VietA 034", name: "Lê Thị Mỹ Phúc", dept: "Khối văn phòng", pos: "Kế toán thuế" },
  { code: "VietA 035", name: "Lê Huy Hoàng", dept: "Khối văn phòng", pos: "Trưởng phòng R&D" },
  { code: "VietA 036", name: "Phạm Tấn Hưng", dept: "Phòng kinh doanh", pos: "Trưởng phòng kinh doanh" },
  { code: "VietA 037", name: "Nguyễn Thị Kim Hoàng", dept: "Phòng kinh doanh", pos: "Kế toán kinh doanh" },
  { code: "VietA 038", name: "Phạm Thị Xuân Khoa", dept: "Phòng kinh doanh", pos: "Nhân viên kinh doanh" },
  { code: "VietA 040", name: "Võ Thanh Sơn", dept: "Phòng kinh doanh", pos: "Nhân viên kinh doanh" },
  { code: "VietA 041", name: "Phạm Phước Lành", dept: "Phòng kinh doanh", pos: "Nhân viên kinh doanh" },
  { code: "VietA 042", name: "Ngô Thanh Tín", dept: "Phòng kinh doanh", pos: "Nhân viên kinh doanh" },
  { code: "VietA 043", name: "Phan Tuấn Kiệt", dept: "Phòng Marketing", pos: "Trưởng phòng Marketing" },
  { code: "VietA 046", name: "Nguyễn Thái Cần", dept: "Xưởng sản xuất gối", pos: "Trưởng nhóm thổi gối" },
  { code: "VietA 047", name: "Nguyễn Thành Lợi", dept: "Xưởng sản xuất gối", pos: "Nhân viên thổi gối" },
  { code: "VietA 049", name: "Nguyễn Thị Ngọc", dept: "Xưởng sản xuất gối", pos: "Nhân viên may gối" },
  { code: "VietA 050", name: "Trần Minh Lý", dept: "Xưởng sản xuất nệm", pos: "Quản lý xưởng" },
  { code: "VietA 052", name: "Nguyễn Minh Văn", dept: "Kho Mỹ Tho", pos: "Nhân viên giao hàng Mỹ Tho" },
  { code: "VietA 053", name: "Trịnh Dương Minh Nhựt", dept: "Xưởng sản xuất nệm", pos: "Nhân viên phun keo" },
  { code: "VietA 054", name: "Võ Hoàng Tín", dept: "Xưởng sản xuất nệm", pos: "Nhân viên may viền" },
  { code: "VietA 055", name: "Phan Quốc Khôi", dept: "Xưởng sản xuất nệm", pos: "Tài xế xưởng sản xuất" },
  { code: "VietA 056", name: "Trần Thị Bảo Châu", dept: "Xưởng sản xuất nệm", pos: "Kế toán xưởng sản xuất" },
  { code: "VietA 058", name: "Nguyễn Thị Kim Hòa", dept: "Xưởng sản xuất nệm", pos: "Nhân viên may tay" },
  { code: "VietA 060", name: "Trần Thị Kim Quyên", dept: "Xưởng sản xuất nệm", pos: "Nhân viên may một kim" },
  { code: "VietA 061", name: "Lê Thanh Hồng", dept: "Xưởng sản xuất nệm", pos: "Nhân viên may một kim" },
  { code: "VietA 063", name: "Lê Ngọc Tuấn", dept: "Xưởng sản xuất nệm", pos: "Nhân viên vô vali" },
  { code: "VietA 066", name: "Nguyễn Thị Thùy Trang", dept: "Xưởng sản xuất nệm", pos: "Kế toán xưởng sản xuất" },
  { code: "VietA 069", name: "Trương Hồng Quân", dept: "Kho Mỹ Tho", pos: "Tài xế Mỹ Tho" },
  { code: "VietA 070", name: "Nguyễn Thanh Hải", dept: "Xưởng sản xuất nệm", pos: "Nhân viên phun keo" },
  { code: "VietA 071", name: "Nguyễn Dương Tiển", dept: "Xưởng sản xuất nệm", pos: "Nhân viên vô áo" },
  { code: "VietA 074", name: "Nguyễn Thị Ngọc Huệ", dept: "Xưởng sản xuất nệm", pos: "Nhân viên cắt vải" },
  { code: "VietA 078", name: "Cổ Hoàn Lâm", dept: "Khối văn phòng", pos: "Nhân viên phòng tổ chức" },
  { code: "VietA 080", name: "Nguyễn Minh Tấn Phát", dept: "Xưởng sản xuất nệm", pos: "Nhân viên phun keo" },
  { code: "VietA 081", name: "Trần Gia Khải", dept: "Kho Mỹ Tho", pos: "Nhân viên giao hàng Mỹ Tho" },
  { code: "VietA 082", name: "Nguyễn Huỳnh Trung Tín", dept: "Kho Mỹ Tho", pos: "Nhân viên giao hàng Mỹ Tho" }
];

export async function runMigration() {
  try {
    console.log('--- KHỞI CHẠY MIGRATION DỮ LIỆU ---');

    // Tắt kiểm tra khóa ngoại tạm thời
    await query.run('PRAGMA foreign_keys = OFF');

    // 1. Đồng bộ Phòng ban
    console.log('Đồng bộ Phòng ban...');
    for (const name of DEPARTMENTS) {
      const exist = await query.get('SELECT id FROM departments WHERE name = ?', [name]);
      if (exist) {
        await query.run('UPDATE departments SET is_active = 1 WHERE id = ?', [exist.id]);
      } else {
        await query.run('INSERT INTO departments (name, branch_id, is_active) VALUES (?, 1, 1)', [name]);
      }
    }

    // Các phòng ban khác không nằm trong danh sách chính thức
    const allDepts = await query.all('SELECT id, name FROM departments');
    for (const d of allDepts) {
      if (!DEPARTMENTS.includes(d.name)) {
        // Kiểm tra xem có nhân viên đang sử dụng không
        const usage = await query.get('SELECT COUNT(*) as count FROM employees WHERE department_id = ?', [d.id]);
        if (usage.count > 0) {
          console.log(`Vô hiệu hóa phòng ban đang sử dụng: ${d.name}`);
          await query.run('UPDATE departments SET is_active = 0 WHERE id = ?', [d.id]);
        } else {
          console.log(`Xóa phòng ban không sử dụng: ${d.name}`);
          await query.run('DELETE FROM departments WHERE id = ?', [d.id]);
        }
      }
    }

    // Lấy map của phòng ban để mapping nhanh
    const deptRows = await query.all('SELECT id, name FROM departments');
    const deptMap = {};
    for (const d of deptRows) {
      deptMap[d.name] = d.id;
    }

    // 2. Đồng bộ Chức vụ
    console.log('Đồng bộ Chức vụ...');
    const officialPositionsList = [];
    for (const [deptName, posList] of Object.entries(POSITIONS)) {
      const deptId = deptMap[deptName];
      for (const posName of posList) {
        officialPositionsList.push({ name: posName, deptId });
        const exist = await query.get('SELECT id FROM positions WHERE name = ?', [posName]);
        if (exist) {
          await query.run('UPDATE positions SET department_id = ?, is_active = 1 WHERE id = ?', [deptId, exist.id]);
        } else {
          await query.run('INSERT INTO positions (name, department_id, is_active) VALUES (?, ?, 1)', [posName, deptId]);
        }
      }
    }

    // Các chức vụ khác không nằm trong danh sách chính thức
    const allPositions = await query.all('SELECT id, name FROM positions');
    const officialPosNames = officialPositionsList.map(p => p.name);
    for (const p of allPositions) {
      if (!officialPosNames.includes(p.name)) {
        const usage = await query.get('SELECT COUNT(*) as count FROM employees WHERE position_id = ?', [p.id]);
        if (usage.count > 0) {
          console.log(`Vô hiệu hóa chức vụ đang sử dụng: ${p.name}`);
          await query.run('UPDATE positions SET is_active = 0 WHERE id = ?', [p.id]);
        } else {
          console.log(`Xóa chức vụ không sử dụng: ${p.name}`);
          await query.run('DELETE FROM positions WHERE id = ?', [p.id]);
        }
      }
    }

    // Lấy map của chức vụ
    const posRows = await query.all('SELECT id, name FROM positions');
    const posMap = {};
    for (const p of posRows) {
      posMap[p.name] = p.id;
    }

    // 3. Cập nhật / Thêm mới 57 Nhân sự
    console.log('Đồng bộ 57 Nhân sự...');
    let updatedCount = 0;
    let insertedCount = 0;
    const now = new Date().toISOString();

    for (const emp of EMPLOYEES_DATA) {
      const deptId = deptMap[emp.dept];
      const posId = posMap[emp.pos];

      if (!deptId) {
        console.error(`Lỗi: Không tìm thấy phòng ban "${emp.dept}"`);
        continue;
      }
      if (!posId) {
        console.error(`Lỗi: Không tìm thấy chức vụ "${emp.pos}"`);
        continue;
      }

      // Tìm nhân viên theo mã nhân sự
      const exist = await query.get('SELECT id, status, notes FROM employees WHERE code = ?', [emp.code]);
      
      // Dọn dẹp ký hiệu HV137, HV297, HV307 nếu là VietA 080, 081, 082
      let status = exist ? exist.status : 'Đang làm việc';
      let notes = exist ? exist.notes : '';
      if (emp.code === 'VietA 080' || emp.code === 'VietA 081' || emp.code === 'VietA 082') {
        status = 'Đang làm việc'; // Set chính thức/đang làm việc
        if (notes) {
          notes = notes.replace(/HV137|HV297|HV307/gi, '').trim();
        }
      }

      if (exist) {
        // Cập nhật thông tin nhân sự
        await query.run(`
          UPDATE employees 
          SET fullname = ?, department_id = ?, position_id = ?, status = ?, notes = ?, updated_at = ?
          WHERE id = ?
        `, [emp.name, deptId, posId, status, notes || null, now, exist.id]);
        updatedCount++;
      } else {
        // Thêm mới nếu không tồn tại
        await query.run(`
          INSERT INTO employees (
            code, fullname, avatar, dob, gender, phone, email, cccd, address,
            join_date, branch_id, department_id, position_id, manager_id,
            status, contract_type, base_salary, allowance, kpi_bonus, notes, created_at, updated_at
          ) VALUES (?, ?, '', '', '', '', '', '', '', ?, 1, ?, ?, NULL, ?, '', 0, 0, 0, ?, ?, ?)
        `, [emp.code, emp.name, now.slice(0, 10), deptId, posId, status, notes || null, now, now]);
        insertedCount++;
      }
    }

    console.log(`Đồng bộ nhân sự thành công: Đã cập nhật ${updatedCount}, thêm mới ${insertedCount}.`);

    // Dọn dẹp thêm bất kỳ chuỗi HV nào trong mã hoặc ghi chú cho 080, 081, 082
    const targetCodes = ['VietA 080', 'VietA 081', 'VietA 082'];
    for (const tc of targetCodes) {
      const emp = await query.get('SELECT id, fullname, notes, code FROM employees WHERE code = ?', [tc]);
      if (emp) {
        // Clean notes
        let newNotes = emp.notes || '';
        newNotes = newNotes.replace(/HV137|HV297|HV307/gi, '').trim();
        let newFullname = emp.fullname || '';
        newFullname = newFullname.replace(/HV137|HV297|HV307/gi, '').trim();
        let newCode = emp.code || '';
        newCode = newCode.replace(/HV137|HV297|HV307/gi, '').trim();

        await query.run('UPDATE employees SET fullname = ?, code = ?, notes = ?, status = ? WHERE id = ?', 
          [newFullname, newCode, newNotes || null, 'Đang làm việc', emp.id]);
      }
    }

    // 4. Kiểm tra tài khoản hệ thống của admin, hr_manager, dept_manager
    console.log('Kiểm tra liên kết tài khoản hệ thống...');
    const adminEmp = await query.get("SELECT id FROM employees WHERE code = 'VietA 032'");
    if (adminEmp) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [adminEmp.id, 'admin']);
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [adminEmp.id, 'hr_manager']);
    }
    const mgrEmp = await query.get("SELECT id FROM employees WHERE code = 'VietA 036'");
    if (mgrEmp) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [mgrEmp.id, 'dept_manager']);
    }
    const empUser = await query.get("SELECT id FROM employees WHERE code = 'VietA 002'");
    if (empUser) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [empUser.id, 'employee1']);
    }

    // Bật lại kiểm tra khóa ngoại
    await query.run('PRAGMA foreign_keys = ON');

    // 5. Thống kê kết quả
    const countEmps = await query.get('SELECT COUNT(*) as total FROM employees');
    const countDepts = await query.get('SELECT COUNT(*) as total FROM departments WHERE is_active = 1');
    const countPositions = await query.get('SELECT COUNT(*) as total FROM positions WHERE is_active = 1');
    console.log('\n================ MIGRATION REPORT ================');
    console.log(`- Tổng nhân sự trong DB: ${countEmps.total}`);
    console.log(`- Tổng phòng ban đang hoạt động: ${countDepts.total}`);
    console.log(`- Tổng chức vụ đang hoạt động: ${countPositions.total}`);
    console.log('==================================================');
  } catch (error) {
    console.error('Lỗi khi chạy migration:', error);
    throw error;
  }
}
