import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './src/config/database.js';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, ShadingType } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateDoc() {
  // Query all users with employee and department details
  const sql = `
    SELECT 
      u.id as user_id,
      u.username,
      u.role_id,
      r.name as role_name,
      e.code as employee_code,
      e.fullname as full_name,
      p.name as position,
      d.name as department_name,
      e.email,
      e.phone
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    LEFT JOIN roles r ON u.role_id = r.id
    ORDER BY u.role_id ASC, d.name ASC, e.code ASC
  `;

  const users = await query.all(sql);
  console.log(`Found ${users.length} accounts in database.`);

  // Password mapping according to high security rules
  function generateStrongPassword(roleId, employeeCode, username) {
    if (username === 'admin') return 'VietA#Admin@Root!9X9';
    if (username === 'hr_manager') return 'VietA#HR@Admin!8K8';
    if (username === 'dept_manager') return 'VietA#Manager@Dept!7M7';
    if (username === 'employee1') return 'VietA#Admin@002!8X';

    const cleanCode = (employeeCode || username || '').replace(/\D/g, '').padStart(3, '0');
    
    if (roleId === 1) {
      return `VietA#Admin@${cleanCode || '001'}!8X`;
    } else if (roleId === 3) {
      return `VietA#Mgr@${cleanCode}$9Q`;
    } else {
      return `VietA#Emp@${cleanCode}*7W`;
    }
  }

  function getAccountDetails(u) {
    let roleLevel = '';
    let defaultPassword = generateStrongPassword(u.role_id, u.employee_code, u.username);
    let salaryPermission = '';

    if (u.role_id === 1) {
      roleLevel = 'CẤP 1 - ADMIN';
      salaryPermission = 'Toàn quyền: Xem toàn bộ 11 phòng ban và toàn công ty';
    } else if (u.role_id === 3) {
      roleLevel = 'CẤP 2 - MANAGER';
      salaryPermission = 'Lương phòng ban phụ trách & Phiếu lương cá nhân';
    } else {
      roleLevel = 'CẤP 3 - EMPLOYEE';
      salaryPermission = 'Chỉ xem duy nhất phiếu lương cá nhân';
    }

    return {
      roleLevel,
      defaultPassword,
      salaryPermission
    };
  }

  // Helpers for Word table
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  };

  const headerBorder = {
    top: { style: BorderStyle.SINGLE, size: 6, color: "0284C7" },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: "0284C7" },
    left: { style: BorderStyle.SINGLE, size: 6, color: "0284C7" },
    right: { style: BorderStyle.SINGLE, size: 6, color: "0284C7" },
  };

  function createHeaderCell(text, widthPercent) {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      borders: headerBorder,
      shading: { fill: "0284C7", type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({
              text: text,
              bold: true,
              color: "FFFFFF",
              font: "Times New Roman",
              size: 20 // 10pt
            })
          ]
        })
      ]
    });
  }

  function createDataCell(text, widthPercent, align = AlignmentType.LEFT, isBold = false, textColor = "000000", bgColor = null) {
    const cellOptions = {
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      borders: cellBorder,
      children: [
        new Paragraph({
          alignment: align,
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: text || "-",
              bold: isBold,
              color: textColor,
              font: "Times New Roman",
              size: 19 // 9.5pt
            })
          ]
        })
      ]
    };
    if (bgColor) {
      cellOptions.shading = { fill: bgColor, type: ShadingType.CLEAR };
    }
    return new TableCell(cellOptions);
  }

  // Group users (official employee accounts vs system aliases)
  const officialUsers = users.filter(u => !['admin', 'hr_manager', 'dept_manager', 'employee1'].includes(u.username));
  const adminUsers = officialUsers.filter(u => u.role_id === 1);
  const managerUsers = officialUsers.filter(u => u.role_id === 3);
  const employeeUsers = officialUsers.filter(u => u.role_id === 4 || (![1, 3].includes(u.role_id)));

  function buildUserRows(userList, startIdx = 1) {
    return userList.map((u, index) => {
      const details = getAccountDetails(u);
      const isEven = index % 2 === 1;
      const rowBg = isEven ? "F8FAFC" : "FFFFFF";

      return new TableRow({
        children: [
          createDataCell(String(startIdx + index), 5, AlignmentType.CENTER, false, "333333", rowBg),
          createDataCell(u.username || u.employee_code || "", 14, AlignmentType.LEFT, true, "0F172A", rowBg),
          createDataCell(u.full_name || "", 18, AlignmentType.LEFT, true, "1E293B", rowBg),
          createDataCell(u.department_name || "Chưa phân bổ", 17, AlignmentType.LEFT, false, "334155", rowBg),
          createDataCell(u.position || "", 16, AlignmentType.LEFT, false, "475569", rowBg),
          createDataCell(details.roleLevel, 14, AlignmentType.CENTER, true, u.role_id === 1 ? "DC2626" : (u.role_id === 3 ? "D97706" : "2563EB"), rowBg),
          createDataCell(details.defaultPassword, 16, AlignmentType.CENTER, true, "059669", rowBg),
        ]
      });
    });
  }

  function getTableHeaders() {
    return new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell("STT", 5),
        createHeaderCell("Tên đăng nhập", 14),
        createHeaderCell("Họ và Tên", 18),
        createHeaderCell("Phòng ban / Đơn vị", 17),
        createHeaderCell("Chức vụ", 16),
        createHeaderCell("Phân quyền", 14),
        createHeaderCell("Mật khẩu", 16),
      ]
    });
  }

  // Admin table
  const adminTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders(), ...buildUserRows(adminUsers, 1)]
  });

  // Manager table
  const managerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders(), ...buildUserRows(managerUsers, 1)]
  });

  // Employee table
  const employeeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders(), ...buildUserRows(employeeUsers, 1)]
  });

  // Summary table
  const allUsersTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders(), ...buildUserRows(officialUsers, 1)]
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            }
          }
        },
        children: [
          // Title block
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 80 },
            children: [
              new TextRun({
                text: "CÔNG TY TNHH NỆM VIỆT Á",
                bold: true,
                font: "Times New Roman",
                size: 28, // 14pt
                color: "1E3A8A"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({
                text: "HỆ THỐNG QUẢN TRỊ NHÂN SỰ & TIỀN LƯƠNG (HRM)",
                font: "Times New Roman",
                size: 22,
                bold: true,
                color: "475569"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
              new TextRun({
                text: "DANH SÁCH TÀI KHOẢN, MẬT KHẨU & PHÂN QUYỀN TOÀN BỘ THÀNH VIÊN",
                bold: true,
                font: "Times New Roman",
                size: 30, // 15pt
                color: "B91C1C"
              })
            ]
          }),

          // System overview
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: "1. QUY ĐỊNH PHÂN CẤP BẢO MẬT VÀ PHÂN QUYỀN HỆ THỐNG",
                bold: true,
                font: "Times New Roman",
                size: 24,
                color: "0F172A"
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: "• Đường dẫn truy cập hệ thống: ", font: "Times New Roman", size: 22 }),
              new TextRun({ text: "https://hrmvieta.up.railway.app", bold: true, color: "0284C7", font: "Times New Roman", size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: "• CẤP 1 - ADMIN (Toàn quyền quản trị): ", bold: true, color: "DC2626", font: "Times New Roman", size: 22 }),
              new TextRun({ text: "Mật khẩu mặc định ", font: "Times New Roman", size: 22 }),
              new TextRun({ text: "Admin@123", bold: true, color: "059669", font: "Times New Roman", size: 22 }),
              new TextRun({ text: ". Toàn quyền quản trị hệ thống, xem và tính bảng lương toàn công ty (11 phòng ban/kho/xưởng).", font: "Times New Roman", size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: "• CẤP 2 - MANAGER (Trưởng phòng / Quản lý Kho & Xưởng): ", bold: true, color: "D97706", font: "Times New Roman", size: 22 }),
              new TextRun({ text: "Mật khẩu mặc định ", font: "Times New Roman", size: 22 }),
              new TextRun({ text: "Manager@123", bold: true, color: "059669", font: "Times New Roman", size: 22 }),
              new TextRun({ text: ". Quản lý nhân sự, chấm công, KPI và xem bảng lương các thành viên trong phòng ban/kho/xưởng phụ trách + phiếu lương cá nhân. Tuyệt đối không xem được lương Ban Giám Đốc và phòng ban khác.", font: "Times New Roman", size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 240 },
            children: [
              new TextRun({ text: "• CẤP 3 - EMPLOYEE (Nhân viên): ", bold: true, color: "2563EB", font: "Times New Roman", size: 22 }),
              new TextRun({ text: "Mật khẩu mặc định ", font: "Times New Roman", size: 22 }),
              new TextRun({ text: "VietA@2026", bold: true, color: "059669", font: "Times New Roman", size: 22 }),
              new TextRun({ text: ". Tra cứu hồ sơ, chấm công, KPI và xem duy nhất phiếu lương cá nhân. Ẩn 100% mức lương của tất cả người khác.", font: "Times New Roman", size: 22 })
            ]
          }),

          // Section 2: Admin list
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: `2. DANH SÁCH TÀI KHOẢN CẤP 1 - ADMIN (${adminUsers.length} tài khoản)`,
                bold: true,
                font: "Times New Roman",
                size: 24,
                color: "DC2626"
              })
            ]
          }),
          adminTable,

          // Section 3: Manager list
          new Paragraph({
            spacing: { before: 250, after: 100 },
            children: [
              new TextRun({
                text: `3. DANH SÁCH TÀI KHOẢN CẤP 2 - MANAGER (${managerUsers.length} tài khoản)`,
                bold: true,
                font: "Times New Roman",
                size: 24,
                color: "D97706"
              })
            ]
          }),
          managerTable,

          // Section 4: Employee list
          new Paragraph({
            spacing: { before: 250, after: 100 },
            children: [
              new TextRun({
                text: `4. DANH SÁCH TÀI KHOẢN CẤP 3 - EMPLOYEE (${employeeUsers.length} tài khoản)`,
                bold: true,
                font: "Times New Roman",
                size: 24,
                color: "2563EB"
              })
            ]
          }),
          employeeTable,

          // Section 5: Full combined table
          new Paragraph({
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({
                text: `5. BẢNG TỔNG HỢP TOÀN BỘ ${officialUsers.length} NHÂN VIÊN VÀ TÀI KHOẢN CÔNG TY`,
                bold: true,
                font: "Times New Roman",
                size: 24,
                color: "0F172A"
              })
            ]
          }),
          allUsersTable,

          // Footer / Signature block
          new Paragraph({
            spacing: { before: 300, after: 80 },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Cần Thơ, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
                font: "Times New Roman",
                italic: true,
                size: 22
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 0, after: 100 },
            children: [
              new TextRun({
                text: "BAN GIÁM ĐỐC / PHÒNG HCNS",
                bold: true,
                font: "Times New Roman",
                size: 22
              })
            ]
          })
        ]
      }
    ]
  });

  const outputPath1 = path.resolve(__dirname, '../DANH_SACH_TAI_KHOAN_VA_PHAN_QUYEN_HRM_VIET_A.docx');
  const outputPath2 = path.resolve(__dirname, 'uploads/documents/danh_sach_tai_khoan_va_phan_quyen_hrm_viet_a.docx');

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath1, buffer);
  console.log(`Saved successfully to: ${outputPath1}`);

  if (fs.existsSync(path.dirname(outputPath2))) {
    fs.writeFileSync(outputPath2, buffer);
    console.log(`Saved copy to: ${outputPath2}`);
  }
}

generateDoc().then(() => {
  console.log("Done!");
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
