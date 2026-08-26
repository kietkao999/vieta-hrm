import bcrypt from 'bcryptjs';
import { initDatabase, query } from './database.js';

/**
 * Migration Script: Cập nhật toàn bộ nhân sự chính thức cho Công ty Việt Á
 * - Giữ nguyên 4 tài khoản hệ thống (admin, hr_manager, dept_manager, employee1)
 * - Cập nhật hồ sơ nhân viên demo thành nhân viên thực tế
 * - Thêm 54 nhân sự chính thức theo danh sách SOURCE OF TRUTH
 * - Thêm cột kpi_bonus vào bảng employees
 */
const migrate = async () => {
  try {
    console.log('========================================');
    console.log('BẮT ĐẦU CẬP NHẬT DỮ LIỆU NHÂN SỰ');
    console.log('========================================');
    
    await initDatabase();

    // === BƯỚC 0: Đếm nhân viên TRƯỚC KHI cập nhật ===
    const beforeCount = await query.get('SELECT COUNT(*) as total FROM employees');
    console.log(`\nTổng nhân viên TRƯỚC khi cập nhật: ${beforeCount.total}`);
    const beforeList = await query.all('SELECT code, fullname FROM employees ORDER BY id');
    console.log('Danh sách hiện tại:', beforeList.map(e => `${e.code} - ${e.fullname}`));

    // === BƯỚC 1: Thêm cột kpi_bonus nếu chưa có ===
    console.log('\n--- Bước 1: Kiểm tra và thêm cột kpi_bonus ---');
    try {
      await query.run('ALTER TABLE employees ADD COLUMN kpi_bonus REAL DEFAULT 0');
      console.log('Đã thêm cột kpi_bonus vào bảng employees.');
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log('Cột kpi_bonus đã tồn tại, bỏ qua.');
      } else {
        throw e;
      }
    }

    // === BƯỚC 2: Tạo các phòng ban mới theo danh sách thực tế ===
    console.log('\n--- Bước 2: Cập nhật phòng ban ---');
    const realDepartments = [
      'Ban giám đốc',
      'Kho Cần Thơ',
      'Khối văn phòng',
      'Xưởng sản xuất nệm',
      'Kho Mỹ Tho',
      'Phòng kinh doanh',
      'Phòng Marketing',
      'Xưởng sản xuất gối'
    ];

    // Xóa departments cũ (demo) và tạo mới
    // Trước tiên, tắt foreign key check tạm thời
    await query.run('PRAGMA foreign_keys = OFF');
    
    // Xóa departments cũ
    await query.run('DELETE FROM departments');
    console.log('Đã xóa phòng ban demo cũ.');
    
    // Insert phòng ban mới
    for (const deptName of realDepartments) {
      await query.run('INSERT INTO departments (name, branch_id) VALUES (?, 1)', [deptName]);
    }
    console.log(`Đã tạo ${realDepartments.length} phòng ban thực tế.`);

    // Lấy mapping department name -> id
    const deptRows = await query.all('SELECT id, name FROM departments');
    const deptMap = {};
    for (const d of deptRows) {
      deptMap[d.name] = d.id;
    }
    console.log('Department mapping:', deptMap);

    // === BƯỚC 3: Tạo các chức vụ mới theo danh sách thực tế ===
    console.log('\n--- Bước 3: Cập nhật chức vụ ---');
    // Xóa positions cũ
    await query.run('DELETE FROM positions');
    console.log('Đã xóa chức vụ demo cũ.');

    // Danh sách chức vụ unique từ danh sách nhân sự
    const realPositions = [
      { name: 'Phó giám đốc', dept: 'Ban giám đốc' },
      { name: 'Quản Lý', dept: 'Kho Cần Thơ' },
      { name: 'Kế toán thu mua', dept: 'Khối văn phòng' },
      { name: 'Kế Toán Kho', dept: 'Kho Cần Thơ' },
      { name: 'Chuyên viên Tài Xế', dept: 'Kho Cần Thơ' },
      { name: 'Nv Kho', dept: 'Kho Cần Thơ' },
      { name: 'NV Phụ Xe', dept: 'Kho Cần Thơ' },
      { name: 'Phó quản lý kho', dept: 'Xưởng sản xuất nệm' },
      { name: 'Quản lý kho', dept: 'Kho Mỹ Tho' },
      { name: 'Chuyên viên Kế toán', dept: 'Kho Mỹ Tho' },
      { name: 'Đội trưởng đội tài xế', dept: 'Kho Mỹ Tho' },
      { name: 'Chuyên viên Tài xế', dept: 'Kho Mỹ Tho' },
      { name: 'Nhân viên giao hàng', dept: 'Kho Mỹ Tho' },
      { name: 'NV Kinh doanh', dept: 'Phòng kinh doanh' },
      { name: 'Nhân viên kho', dept: 'Kho Mỹ Tho' },
      { name: 'Trưởng phòng kế toán', dept: 'Khối văn phòng' },
      { name: 'Trưởng phòng HCNS', dept: 'Khối văn phòng' },
      { name: 'Trợ lý TGĐ', dept: 'Khối văn phòng' },
      { name: 'Chuyên viên kế toán công ty', dept: 'Khối văn phòng' },
      { name: 'Trưởng phòng R&D', dept: 'Khối văn phòng' },
      { name: 'Trưởng phòng KD', dept: 'Phòng kinh doanh' },
      { name: 'Kế toán kinh doanh', dept: 'Phòng kinh doanh' },
      { name: 'Trưởng phòng MKT', dept: 'Phòng Marketing' },
      { name: 'Trưởng nhóm thổi gối', dept: 'Xưởng sản xuất gối' },
      { name: 'Nhân viên thổi gối', dept: 'Xưởng sản xuất gối' },
      { name: 'Chuyên viên may gối', dept: 'Xưởng sản xuất gối' },
      { name: 'Quản lý', dept: 'Xưởng sản xuất nệm' },
      { name: 'Nhân viên may viền', dept: 'Xưởng sản xuất nệm' },
      { name: 'Chuyên viên thành phẩm', dept: 'Xưởng sản xuất nệm' },
      { name: 'Chuyên viên Tài xế xưởng sản xuất', dept: 'Xưởng sản xuất nệm' },
      { name: 'Nhân viên kế toán xưởng sản xuất', dept: 'Xưởng sản xuất nệm' },
      { name: 'Nhân viên may miệng', dept: 'Xưởng sản xuất nệm' },
      { name: 'Nhân viên may một kim', dept: 'Xưởng sản xuất nệm' },
      { name: 'Nhân viên vô vali', dept: 'Xưởng sản xuất nệm' },
      { name: 'Nhân viên tài xế', dept: 'Kho Mỹ Tho' },
      { name: 'Nhân viên vô áo', dept: 'Xưởng sản xuất nệm' },
      { name: 'Nhân viên cắt vải', dept: 'Xưởng sản xuất nệm' },
      { name: 'Nhân viên phòng tổ chức', dept: 'Khối văn phòng' },
      { name: 'Nhân viên phun keo', dept: 'Xưởng sản xuất nệm' },
    ];

    for (const pos of realPositions) {
      const deptId = deptMap[pos.dept] || null;
      await query.run('INSERT INTO positions (name, department_id) VALUES (?, ?)', [pos.name, deptId]);
    }
    console.log(`Đã tạo ${realPositions.length} chức vụ thực tế.`);

    // Lấy mapping position name -> id
    const posRows = await query.all('SELECT id, name FROM positions');
    const posMap = {};
    for (const p of posRows) {
      posMap[p.name] = p.id;
    }
    console.log('Position mapping:', posMap);

    // === BƯỚC 4: Xóa toàn bộ dữ liệu liên quan đến employees demo ===
    console.log('\n--- Bước 4: Xóa dữ liệu demo ---');
    // Xóa các bảng phụ thuộc
    await query.run('DELETE FROM attendance');
    await query.run('DELETE FROM leave_requests');
    await query.run('DELETE FROM contracts');
    await query.run('DELETE FROM payroll');
    await query.run('DELETE FROM kpi');
    await query.run('DELETE FROM notifications');
    await query.run('DELETE FROM rewards');
    await query.run('DELETE FROM discipline');
    await query.run('DELETE FROM innovations');
    await query.run('DELETE FROM work_history');
    await query.run('DELETE FROM training_participants');
    await query.run('DELETE FROM career_paths');
    console.log('Đã xóa dữ liệu phụ thuộc demo.');

    // Xóa toàn bộ employees hiện tại
    await query.run('DELETE FROM employees');
    console.log('Đã xóa toàn bộ nhân viên demo.');

    // Reset autoincrement
    await query.run("DELETE FROM sqlite_sequence WHERE name='employees'");

    // === BƯỚC 5: Insert 54 nhân sự chính thức ===
    console.log('\n--- Bước 5: Import 54 nhân sự chính thức ---');
    const now = new Date().toISOString();

    const employees = [
      { code: 'VietA 002', fullname: 'Võ Minh Cường', dept: 'Ban giám đốc', pos: 'Phó giám đốc', kpi_bonus: 2500000, dob: '1996-09-15', join_date: '2019-01-01' },
      { code: 'VietA 003', fullname: 'Nguyễn Thị Thu Tâm', dept: 'Kho Cần Thơ', pos: 'Quản Lý', kpi_bonus: 2000000, dob: '2000-12-20', join_date: '2021-12-17' },
      { code: 'VietA 004', fullname: 'Nguyễn Thị Thúy Vy', dept: 'Khối văn phòng', pos: 'Kế toán thu mua', kpi_bonus: 1000000, dob: '1998-02-14', join_date: '2024-04-15' },
      { code: 'VietA 006', fullname: 'Phạm Thanh Phong', dept: 'Kho Cần Thơ', pos: 'Kế Toán Kho', kpi_bonus: 1000000, dob: '2002-12-13', join_date: '2026-01-26' },
      { code: 'VietA 007', fullname: 'Trần Thanh Hoài', dept: 'Kho Cần Thơ', pos: 'Chuyên viên Tài Xế', kpi_bonus: 1000000, dob: '1990-11-11', join_date: '2021-12-17' },
      { code: 'VietA 009', fullname: 'Huỳnh Ngọc Dư', dept: 'Kho Cần Thơ', pos: 'Nv Kho', kpi_bonus: 1000000, dob: '1988-01-06', join_date: '2026-03-07' },
      { code: 'VietA 010', fullname: 'Nguyễn Hải Duy', dept: 'Kho Cần Thơ', pos: 'NV Phụ Xe', kpi_bonus: 1000000, dob: '2005-08-18', join_date: '2025-08-27' },
      { code: 'VietA 011', fullname: 'Lý Minh Trung', dept: 'Kho Cần Thơ', pos: 'Nv Kho', kpi_bonus: 1000000, dob: '2005-12-16', join_date: '2026-03-02' },
      { code: 'VietA 012', fullname: 'Võ Huỳnh Đông Nghi', dept: 'Xưởng sản xuất nệm', pos: 'Phó quản lý kho', kpi_bonus: 1500000, dob: '1998-12-20', join_date: '2024-04-15' },
      { code: 'VietA 013', fullname: 'Hồ Minh Thuận', dept: 'Kho Cần Thơ', pos: 'NV Phụ Xe', kpi_bonus: 1000000, dob: '1997-04-08', join_date: '2024-07-15' },
      { code: 'VietA 015', fullname: 'Dương Thị Tuyết Hường', dept: 'Kho Mỹ Tho', pos: 'Quản lý kho', kpi_bonus: 2000000, dob: '1996-07-04', join_date: '2024-06-01' },
      { code: 'VietA 016', fullname: 'Nguyễn Thị Quỳnh Như', dept: 'Kho Mỹ Tho', pos: 'Phó quản lý kho', kpi_bonus: 1500000, dob: '2003-08-12', join_date: '2022-05-15' },
      { code: 'VietA 017', fullname: 'Trần Lương Ngọc Khánh', dept: 'Kho Mỹ Tho', pos: 'Chuyên viên Kế toán', kpi_bonus: 1000000, dob: '2002-12-18', join_date: '2024-03-04' },
      { code: 'VietA 018', fullname: 'Nguyễn Thị Ngọc Trâm', dept: 'Kho Mỹ Tho', pos: 'Chuyên viên Kế toán', kpi_bonus: 1000000, dob: '2002-12-09', join_date: '2025-02-21' },
      { code: 'VietA 019', fullname: 'Đoàn Hoài Linh', dept: 'Kho Mỹ Tho', pos: 'Đội trưởng đội tài xế', kpi_bonus: 1000000, dob: '1996-10-12', join_date: '2020-03-07' },
      { code: 'VietA 020', fullname: 'Đặng Hoàng Tuấn', dept: 'Kho Mỹ Tho', pos: 'Chuyên viên Tài xế', kpi_bonus: 1000000, dob: '1994-07-18', join_date: '2022-05-11' },
      { code: 'VietA 022', fullname: 'Nguyễn Tuấn Kiệt', dept: 'Kho Mỹ Tho', pos: 'Nhân viên giao hàng', kpi_bonus: 1000000, dob: '1994-08-17', join_date: '2021-02-22' },
      { code: 'VietA 023', fullname: 'Nguyễn Hoàng Quân', dept: 'Kho Mỹ Tho', pos: 'Nhân viên giao hàng', kpi_bonus: 1000000, dob: '1985-11-11', join_date: '2026-03-02' },
      { code: 'VietA 024', fullname: 'Nguyễn Hữu Tài', dept: 'Phòng kinh doanh', pos: 'NV Kinh doanh', kpi_bonus: 2000000, dob: '2006-01-16', join_date: '2022-08-01' },
      { code: 'VietA 026', fullname: 'Phạm Minh Phúc', dept: 'Kho Mỹ Tho', pos: 'Nhân viên kho', kpi_bonus: 1000000, dob: '2008-10-29', join_date: '2025-12-22' },
      { code: 'VietA 027', fullname: 'Phạm Ngọc Hiển', dept: 'Kho Mỹ Tho', pos: 'Nhân viên kho', kpi_bonus: 1000000, dob: '1993-04-30', join_date: '2024-02-29' },
      { code: 'VietA 028', fullname: 'Trần Hữu Lộc', dept: 'Kho Mỹ Tho', pos: 'Nhân viên kho', kpi_bonus: 1000000, dob: '2003-03-14', join_date: '2025-06-09' },
      { code: 'VietA 029', fullname: 'Nguyễn Thị Thanh Tú', dept: 'Kho Mỹ Tho', pos: 'Chuyên viên Kế toán', kpi_bonus: 1000000, dob: '1996-12-01', join_date: '2024-07-24' },
      { code: 'VietA 031', fullname: 'Nguyễn Quốc Hùng', dept: 'Khối văn phòng', pos: 'Trưởng phòng kế toán', kpi_bonus: 2000000, dob: '1995-09-09', join_date: '2026-04-02' },
      { code: 'VietA 032', fullname: 'Huỳnh Thị Trúc Xinh', dept: 'Khối văn phòng', pos: 'Trưởng phòng HCNS', kpi_bonus: 2000000, dob: '1989-03-20', join_date: '2024-05-02' },
      { code: 'VietA 033', fullname: 'Nguyễn Quốc Huy', dept: 'Khối văn phòng', pos: 'Trợ lý TGĐ', kpi_bonus: 1000000, dob: '1999-03-09', join_date: '2024-11-29' },
      { code: 'VietA 034', fullname: 'Lê Thị Mỹ Phúc', dept: 'Khối văn phòng', pos: 'Chuyên viên kế toán công ty', kpi_bonus: 1000000, dob: '2000-06-17', join_date: '2025-02-05' },
      { code: 'VietA 035', fullname: 'Lê Huy Hoàng', dept: 'Khối văn phòng', pos: 'Trưởng phòng R&D', kpi_bonus: 2000000, dob: '1983-01-01', join_date: '2023-09-05' },
      { code: 'VietA 036', fullname: 'Phạm Tấn Hưng', dept: 'Phòng kinh doanh', pos: 'Trưởng phòng KD', kpi_bonus: 2000000, dob: '1993-11-14', join_date: '2015-10-01' },
      { code: 'VietA 037', fullname: 'Nguyễn Thị Kim Hoàng', dept: 'Phòng kinh doanh', pos: 'Kế toán kinh doanh', kpi_bonus: 1000000, dob: '1995-07-09', join_date: '2026-02-25' },
      { code: 'VietA 038', fullname: 'Phạm Thị Xuân Khoa', dept: 'Phòng kinh doanh', pos: 'NV Kinh doanh', kpi_bonus: 1000000, dob: '2001-01-01', join_date: '2025-02-14' },
      { code: 'VietA 040', fullname: 'Võ Thanh Sơn', dept: 'Phòng kinh doanh', pos: 'NV Kinh doanh', kpi_bonus: 1000000, dob: '1996-07-29', join_date: '2025-07-01' },
      { code: 'VietA 041', fullname: 'Phạm Phước Lành', dept: 'Phòng kinh doanh', pos: 'NV Kinh doanh', kpi_bonus: 2000000, dob: '1992-06-02', join_date: '2023-09-11' },
      { code: 'VietA 042', fullname: 'Ngô Thanh Tín', dept: 'Phòng kinh doanh', pos: 'NV Kinh doanh', kpi_bonus: 2000000, dob: '2002-04-22', join_date: '2020-12-24' },
      { code: 'VietA 043', fullname: 'Phan Tuấn Kiệt', dept: 'Phòng Marketing', pos: 'Trưởng phòng MKT', kpi_bonus: 2000000, dob: '1998-10-28', join_date: '2020-10-02' },
      { code: 'VietA 046', fullname: 'Nguyễn Thái Cần', dept: 'Xưởng sản xuất gối', pos: 'Trưởng nhóm thổi gối', kpi_bonus: 1000000, dob: '1991-02-15', join_date: '2022-04-01' },
      { code: 'VietA 047', fullname: 'Nguyễn Thành Lợi', dept: 'Xưởng sản xuất gối', pos: 'Nhân viên thổi gối', kpi_bonus: 1000000, dob: '2005-12-30', join_date: '2023-12-03' },
      { code: 'VietA 049', fullname: 'Nguyễn Thị Ngọc', dept: 'Xưởng sản xuất gối', pos: 'Chuyên viên may gối', kpi_bonus: 1000000, dob: '1973-11-20', join_date: '2023-11-10' },
      { code: 'VietA 050', fullname: 'Trần Minh Lý', dept: 'Xưởng sản xuất nệm', pos: 'Quản lý', kpi_bonus: 2000000, dob: '1988-08-24', join_date: '2023-05-29' },
      { code: 'VietA 052', fullname: 'Nguyễn Minh Văn', dept: 'Kho Mỹ Tho', pos: 'Nhân viên giao hàng', kpi_bonus: 1000000, dob: '2002-01-28', join_date: '2025-03-12' },
      { code: 'VietA 053', fullname: 'Trịnh Dương Minh Nhựt', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên may viền', kpi_bonus: 1000000, dob: '2006-08-11', join_date: '2025-05-12' },
      { code: 'VietA 054', fullname: 'Võ Hoàng Tín', dept: 'Xưởng sản xuất nệm', pos: 'Chuyên viên thành phẩm', kpi_bonus: 1000000, dob: '2003-11-30', join_date: '2024-03-18' },
      { code: 'VietA 055', fullname: 'Phan Quốc Khôi', dept: 'Xưởng sản xuất nệm', pos: 'Chuyên viên Tài xế xưởng sản xuất', kpi_bonus: 1000000, dob: '1986-06-06', join_date: '2024-05-06' },
      { code: 'VietA 056', fullname: 'Trần Thị Bảo Châu', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên kế toán xưởng sản xuất', kpi_bonus: 1000000, dob: '2000-03-02', join_date: '2024-05-08' },
      { code: 'VietA 058', fullname: 'Nguyễn Thị Kim Hòa', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên may miệng', kpi_bonus: 1000000, dob: '1969-06-04', join_date: '2024-05-13' },
      { code: 'VietA 060', fullname: 'Trần Thị Kim Quyên', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên may một kim', kpi_bonus: 1000000, dob: '1978-10-26', join_date: '2024-06-04' },
      { code: 'VietA 061', fullname: 'Lê Thanh Hồng', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên may một kim', kpi_bonus: 1000000, dob: '1970-01-01', join_date: '2025-02-10' },
      { code: 'VietA 063', fullname: 'Lê Ngọc Tuấn', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên vô vali', kpi_bonus: 1000000, dob: '1990-03-16', join_date: '2025-02-18' },
      { code: 'VietA 066', fullname: 'Nguyễn Thị Thùy Trang', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên kế toán xưởng sản xuất', kpi_bonus: 1000000, dob: '1990-01-01', join_date: '2025-10-01' },
      { code: 'VietA 069', fullname: 'Trương Hồng Quân', dept: 'Kho Mỹ Tho', pos: 'Nhân viên tài xế', kpi_bonus: 1000000, dob: '1989-06-18', join_date: '2026-05-26' },
      { code: 'VietA 071', fullname: 'Nguyễn Dương Tiển', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên vô áo', kpi_bonus: 1000000, dob: '1986-10-16', join_date: '2026-05-13' },
      { code: 'VietA 074', fullname: 'Nguyễn Thị Ngọc Huệ', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên cắt vải', kpi_bonus: 1000000, dob: '1997-10-28', join_date: '2026-05-25' },
      { code: 'VietA 078', fullname: 'Cổ Hoàn Lâm', dept: 'Khối văn phòng', pos: 'Nhân viên phòng tổ chức', kpi_bonus: 0, dob: '1983-11-02', join_date: '2026-06-01' },
      { code: 'VietA 080', fullname: 'Nguyễn Minh Tấn Phát', dept: 'Xưởng sản xuất nệm', pos: 'Nhân viên phun keo', kpi_bonus: 1000000, dob: '2009-11-26', join_date: '2026-07-13' },
    ];

    let insertedCount = 0;
    let errorCount = 0;

    for (const emp of employees) {
      const departmentId = deptMap[emp.dept] || null;
      const positionId = posMap[emp.pos] || null;

      if (!departmentId) {
        console.error(`LỖI: Không tìm thấy phòng ban "${emp.dept}" cho nhân viên ${emp.code}`);
        errorCount++;
        continue;
      }
      if (!positionId) {
        console.error(`LỖI: Không tìm thấy chức vụ "${emp.pos}" cho nhân viên ${emp.code}`);
        errorCount++;
        continue;
      }

      try {
        await query.run(`
          INSERT INTO employees (
            code, fullname, avatar, dob, gender, phone, email, cccd, address,
            join_date, branch_id, department_id, position_id, manager_id,
            status, contract_type, base_salary, allowance, kpi_bonus, notes, created_at, updated_at
          ) VALUES (?, ?, '', ?, '', '', '', '', '', ?, 1, ?, ?, NULL, 'Đang làm việc', '', 0, 0, ?, '', ?, ?)
        `, [
          emp.code, emp.fullname, emp.dob, emp.join_date,
          departmentId, positionId, emp.kpi_bonus, now, now
        ]);
        insertedCount++;
      } catch (e) {
        console.error(`LỖI insert ${emp.code}: ${e.message}`);
        errorCount++;
      }
    }
    console.log(`Đã insert ${insertedCount} nhân viên. Lỗi: ${errorCount}`);

    // === BƯỚC 6: Cập nhật liên kết user -> employee ===
    console.log('\n--- Bước 6: Cập nhật liên kết tài khoản hệ thống ---');
    
    // Tìm employee mới cho admin (Huỳnh Thị Trúc Xinh - Trưởng phòng HCNS - làm admin)
    const adminEmp = await query.get("SELECT id FROM employees WHERE code = 'VietA 032'");
    if (adminEmp) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [adminEmp.id, 'admin']);
      console.log(`Liên kết admin -> VietA 032 (Huỳnh Thị Trúc Xinh) id=${adminEmp.id}`);
    }

    // HR manager -> Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)
    if (adminEmp) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [adminEmp.id, 'hr_manager']);
      console.log(`Liên kết hr_manager -> VietA 032 (Huỳnh Thị Trúc Xinh) id=${adminEmp.id}`);
    }

    // dept_manager -> Phạm Tấn Hưng (Trưởng phòng KD) - trùng tên với demo
    const mgrEmp = await query.get("SELECT id FROM employees WHERE code = 'VietA 036'");
    if (mgrEmp) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [mgrEmp.id, 'dept_manager']);
      console.log(`Liên kết dept_manager -> VietA 036 (Phạm Tấn Hưng) id=${mgrEmp.id}`);
    }

    // employee1 -> Võ Minh Cường (Phó giám đốc)
    const empUser = await query.get("SELECT id FROM employees WHERE code = 'VietA 002'");
    if (empUser) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [empUser.id, 'employee1']);
      console.log(`Liên kết employee1 -> VietA 002 (Võ Minh Cường) id=${empUser.id}`);
    }

    // Bật lại foreign keys
    await query.run('PRAGMA foreign_keys = ON');

    // === BƯỚC 7: Kiểm tra kết quả cuối cùng ===
    console.log('\n========================================');
    console.log('KIỂM TRA KẾT QUẢ');
    console.log('========================================');

    const afterCount = await query.get('SELECT COUNT(*) as total FROM employees');
    console.log(`Tổng nhân viên SAU khi cập nhật: ${afterCount.total}`);

    // Kiểm tra duplicate
    const dups = await query.all('SELECT code, COUNT(*) as cnt FROM employees GROUP BY code HAVING cnt > 1');
    if (dups.length > 0) {
      console.error('CẢNH BÁO: Có mã nhân viên trùng:', dups);
    } else {
      console.log('✅ Không có duplicate employee_code.');
    }

    // Kiểm tra HV codes
    const hvCodes = await query.all("SELECT code FROM employees WHERE code LIKE 'HV%'");
    if (hvCodes.length > 0) {
      console.error('CẢNH BÁO: Còn mã HV:', hvCodes);
    } else {
      console.log('✅ Không còn mã HV nào.');
    }

    // Kiểm tra demo codes
    const demoCodes = await query.all("SELECT code FROM employees WHERE code LIKE 'NV%'");
    if (demoCodes.length > 0) {
      console.error('CẢNH BÁO: Còn mã NV demo:', demoCodes);
    } else {
      console.log('✅ Không còn mã NV demo.');
    }

    // Kiểm tra status
    const statusCheck = await query.all("SELECT DISTINCT status FROM employees");
    console.log('Trạng thái hiện có:', statusCheck.map(s => s.status));

    const wrongStatus = await query.all("SELECT code FROM employees WHERE status != 'Đang làm việc'");
    if (wrongStatus.length > 0) {
      console.error('CẢNH BÁO: Nhân viên có status không đúng:', wrongStatus);
    } else {
      console.log('✅ Tất cả status = "Đang làm việc".');
    }

    // Kiểm tra departments
    const deptCheck = await query.all('SELECT DISTINCT d.name FROM employees e JOIN departments d ON e.department_id = d.id ORDER BY d.name');
    console.log(`Phòng ban đang sử dụng (${deptCheck.length}):`, deptCheck.map(d => d.name));

    // Kiểm tra user links
    const userLinks = await query.all('SELECT u.username, u.employee_id, e.code, e.fullname FROM users u LEFT JOIN employees e ON u.employee_id = e.id');
    console.log('\nLiên kết User-Employee:');
    for (const ul of userLinks) {
      console.log(`  ${ul.username} -> ${ul.code || 'N/A'} (${ul.fullname || 'Không liên kết'})`);
    }

    // In danh sách đầy đủ
    console.log('\n--- DANH SÁCH 54 NHÂN SỰ CHÍNH THỨC ---');
    const finalList = await query.all(`
      SELECT e.code, e.fullname, d.name as dept, p.name as pos, e.kpi_bonus, e.dob, e.join_date, e.status
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      ORDER BY e.code ASC
    `);
    for (let i = 0; i < finalList.length; i++) {
      const e = finalList[i];
      console.log(`${i+1}. ${e.code} | ${e.fullname} | ${e.dept} | ${e.pos} | KPI: ${e.kpi_bonus} | ${e.dob} | ${e.join_date} | ${e.status}`);
    }

    console.log('\n========================================');
    console.log('BÁO CÁO TỔNG KẾT');
    console.log('========================================');
    console.log(`Nhân viên TRƯỚC: ${beforeCount.total}`);
    console.log(`Nhân viên SAU: ${afterCount.total}`);
    console.log(`Thêm mới: ${insertedCount}`);
    console.log(`Xóa demo: ${beforeCount.total}`);
    console.log(`Lỗi: ${errorCount}`);
    console.log('========================================');
    console.log('HOÀN TẤT CẬP NHẬT DỮ LIỆU NHÂN SỰ!');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('LỖI NGHIÊM TRỌNG:', error);
    process.exit(1);
  }
};

migrate();
