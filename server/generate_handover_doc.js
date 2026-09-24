import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './src/config/database.js';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  AlignmentType, 
  WidthType, 
  BorderStyle, 
  ShadingType,
  HeadingLevel
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateHandoverDocument() {
  console.log('--- Đang truy vấn dữ liệu tài khoản và nhân sự ---');

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
  const officialUsers = users.filter(u => !['admin', 'hr_manager', 'dept_manager', 'employee1'].includes(u.username));
  const adminUsers = officialUsers.filter(u => u.role_id === 1);
  const managerUsers = officialUsers.filter(u => u.role_id === 3);
  const employeeUsers = officialUsers.filter(u => u.role_id === 4 || (![1, 3].includes(u.role_id)));

  // High Security Password mapping
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
    const defaultPassword = generateStrongPassword(u.role_id, u.employee_code, u.username);
    if (u.role_id === 1) {
      return {
        roleLevel: 'CẤP 1 - ADMIN',
        defaultPassword,
        permission: 'Toàn quyền quản trị hệ thống, nhân sự & tính lương toàn công ty'
      };
    } else if (u.role_id === 3) {
      return {
        roleLevel: 'CẤP 2 - MANAGER',
        defaultPassword,
        permission: 'Quản lý phòng ban/kho/xưởng, chấm công, KPI & xem lương bộ phận'
      };
    } else {
      return {
        roleLevel: 'CẤP 3 - EMPLOYEE',
        defaultPassword,
        permission: 'Tra cứu hồ sơ cá nhân, chấm công, KPI & phiếu lương của mình'
      };
    }
  }

  // Styles & Table Helpers
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

  function createHeaderCell(text, widthPercent, bg = "0284C7") {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      borders: headerBorder,
      shading: { fill: bg, type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 },
          children: [
            new TextRun({
              text: text,
              bold: true,
              color: "FFFFFF",
              font: "Times New Roman",
              size: 20
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
          spacing: { before: 70, after: 70 },
          children: [
            new TextRun({
              text: text || "-",
              bold: isBold,
              color: textColor,
              font: "Times New Roman",
              size: 19
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
          createDataCell(u.department_name || "Chưa phân bổ", 18, AlignmentType.LEFT, false, "334155", rowBg),
          createDataCell(u.position || "", 17, AlignmentType.LEFT, false, "475569", rowBg),
          createDataCell(details.roleLevel, 13, AlignmentType.CENTER, true, u.role_id === 1 ? "DC2626" : (u.role_id === 3 ? "D97706" : "2563EB"), rowBg),
          createDataCell(details.defaultPassword, 15, AlignmentType.CENTER, true, "059669", rowBg),
        ]
      });
    });
  }

  function getTableHeaders(bg = "0284C7") {
    return new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell("STT", 5, bg),
        createHeaderCell("Tên đăng nhập", 14, bg),
        createHeaderCell("Họ và Tên", 18, bg),
        createHeaderCell("Phòng ban / Đơn vị", 18, bg),
        createHeaderCell("Chức vụ", 17, bg),
        createHeaderCell("Phân quyền", 13, bg),
        createHeaderCell("Mật khẩu", 15, bg),
      ]
    });
  }

  function createSectionTitle(text, color = "1E3A8A") {
    return new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: text,
          bold: true,
          font: "Times New Roman",
          size: 24,
          color: color
        })
      ]
    });
  }

  function createSubTitle(text, color = "0284C7") {
    return new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({
          text: text,
          bold: true,
          font: "Times New Roman",
          size: 21,
          color: color
        })
      ]
    });
  }

  function createBulletPoint(boldPrefix, content) {
    return new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({ text: "• ", bold: true, color: "0284C7", font: "Times New Roman", size: 21 }),
        new TextRun({ text: boldPrefix, bold: true, font: "Times New Roman", size: 21, color: "0F172A" }),
        new TextRun({ text: content, font: "Times New Roman", size: 21, color: "334155" })
      ]
    });
  }

  function createStepGuide(stepNum, stepName, description, actionItems = []) {
    const pList = [
      new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({
            text: `Bước ${stepNum}: ${stepName}`,
            bold: true,
            font: "Times New Roman",
            size: 21,
            color: "0F172A"
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 20, after: 60 },
        children: [
          new TextRun({
            text: description,
            font: "Times New Roman",
            size: 20,
            italic: true,
            color: "475569"
          })
        ]
      })
    ];

    actionItems.forEach(item => {
      pList.push(
        new Paragraph({
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({ text: "  - ", bold: true, color: "059669", font: "Times New Roman", size: 20 }),
            new TextRun({ text: item, font: "Times New Roman", size: 20, color: "1E293B" })
          ]
        })
      );
    });

    return pList;
  }

  // Permission Matrix Table
  const permMatrixHeaders = new TableRow({
    tableHeader: true,
    children: [
      createHeaderCell("Phân hệ / Chức năng", 30, "1E3A8A"),
      createHeaderCell("Cấp 1 - ADMIN (HCNS/BGĐ)", 24, "DC2626"),
      createHeaderCell("Cấp 2 - MANAGER (Trưởng phòng)", 24, "D97706"),
      createHeaderCell("Cấp 3 - EMPLOYEE (Nhân viên)", 22, "2563EB"),
    ]
  });

  const matrixData = [
    ["1. Tổng quan & Thống kê Dashboard", "Toàn công ty (11 phòng ban)", "Phòng ban phụ trách", "Cá nhân"],
    ["2. Quản lý Hồ sơ & Hợp đồng", "Toàn quyền Thêm/Sửa/Xóa/In hợp đồng", "Xem nhân viên phòng mình", "Xem hồ sơ cá nhân"],
    ["3. Chấm công & Nghỉ phép", "Toàn quyền quản lý, duyệt đơn toàn cty", "Chấm công & duyệt đơn phòng ban", "Chấm công & gửi đơn cá nhân"],
    ["4. Quản lý KPI & Đánh giá tháng", "Toàn quyền giao KPI & chốt điểm cty", "Giao KPI & chấm điểm nhân viên", "Theo dõi điểm KPI của mình"],
    ["5. Bảng lương & Chi trả", "Toàn quyền tính lương, duyệt & xem 100%", "Xem lương nhân viên phòng mình", "Chỉ xem duy nhất phiếu lương mình"],
    ["6. Khen thưởng, Kỷ luật & Sáng kiến", "Toàn quyền phê duyệt & ban hành", "Đề xuất & thẩm định ý kiến", "Gửi sáng kiến & xem khen thưởng"],
    ["7. Tài sản, Đào tạo & Văn bản", "Toàn quyền quản lý tài sản & cấp phát", "Tạo yêu cầu & quản lý phòng ban", "Xem tài sản được giao & văn bản"],
    ["8. Cấu hình hệ thống & Phân quyền", "Toàn quyền quản trị tài khoản & log", "Không có quyền", "Không có quyền"],
  ];

  const permMatrixRows = matrixData.map((row, idx) => {
    const bg = idx % 2 === 1 ? "F8FAFC" : "FFFFFF";
    return new TableRow({
      children: [
        createDataCell(row[0], 30, AlignmentType.LEFT, true, "0F172A", bg),
        createDataCell(row[1], 24, AlignmentType.CENTER, false, "991B1B", bg),
        createDataCell(row[2], 24, AlignmentType.CENTER, false, "92400E", bg),
        createDataCell(row[3], 22, AlignmentType.CENTER, false, "1E40AF", bg),
      ]
    });
  });

  const matrixTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [permMatrixHeaders, ...permMatrixRows]
  });

  // User tables
  const adminTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders("DC2626"), ...buildUserRows(adminUsers, 1)]
  });

  const managerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders("D97706"), ...buildUserRows(managerUsers, 1)]
  });

  const employeeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders("2563EB"), ...buildUserRows(employeeUsers, 1)]
  });

  const fullTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders("0284C7"), ...buildUserRows(officialUsers, 1)]
  });

  // Handover Signatures Table
  const signTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "ĐẠI DIỆN BÊN BÀN GIAO (IT)", bold: true, font: "Times New Roman", size: 22, color: "0F172A" }),
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 700 },
                children: [
                  new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, font: "Times New Roman", size: 20, color: "64748B" })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Phan Tuấn Kiệt", bold: true, font: "Times New Roman", size: 22, color: "0F172A" })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "ĐẠI DIỆN BÊN TIẾP NHẬN (PHÒNG HCNS)", bold: true, font: "Times New Roman", size: 22, color: "0F172A" }),
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 700 },
                children: [
                  new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, font: "Times New Roman", size: 20, color: "64748B" })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Huỳnh Thị Trúc Xinh", bold: true, font: "Times New Roman", size: 22, color: "0F172A" })
                ]
              })
            ]
          }),
        ]
      })
    ]
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
          // Header Company
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({
                text: "CÔNG TY TNHH NỆM VIỆT Á",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: "1E3A8A"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: "HỆ THỐNG QUẢN TRỊ NHÂN SỰ & TIỀN LƯƠNG (VIỆT Á HRM)",
                bold: true,
                font: "Times New Roman",
                size: 22,
                color: "475569"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 200 },
            children: [
              new TextRun({
                text: "TÀI LIỆU BÀN GIAO & HƯỚNG DẪN VẬN HÀNH THỬ NGHIỆM CHO PHÒNG HCNS",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: "B91C1C"
              })
            ]
          }),

          // 1. TỔNG QUAN HỆ THỐNG
          createSectionTitle("PHẦN I: THÔNG TIN HỆ THỐNG & ĐƯỜNG DẪN TRUY CẬP"),
          createBulletPoint("Tên hệ thống: ", "Hệ thống Quản trị Nhân sự & Tiền lương Nệm Việt Á (Viet A HRM)."),
          createBulletPoint("Đường dẫn truy cập trực tuyến (Cloud): ", "https://hrmvieta.up.railway.app"),
          createBulletPoint("Môi trường nội bộ (Local / Dev): ", "http://localhost:5173 (Frontend) - Cổng 5000 (Backend API)."),
          createBulletPoint("Quy mô áp dụng thử nghiệm: ", "Toàn bộ 11 phòng ban, kho, xưởng sản xuất và 57 nhân sự công ty."),
          createBulletPoint("Mục tiêu thử nghiệm: ", "Kiểm thử nhập liệu hồ sơ nhân sự, tạo và duyệt đơn chấm công/nghỉ phép, giao chỉ tiêu KPI, tính thử bảng lương tháng 8/2026 và nghiệm thu quy trình vận hành."),

          // 2. MA TRẬN PHÂN QUYỀN
          createSectionTitle("PHẦN II: CƠ CHẾ PHÂN QUYỀN 3 CẤP ĐỘ & BẢO MẬT LƯƠNG"),
          new Paragraph({
            spacing: { before: 40, after: 100 },
            children: [
              new TextRun({
                text: "Hệ thống được thiết kế phân quyền 3 cấp độ độc lập, đáp ứng nghiêm ngặt tính bảo mật tiền lương và phân cấp quản lý:",
                font: "Times New Roman",
                size: 21,
                color: "334155"
              })
            ]
          }),
          matrixTable,

          // 3. HƯỚNG DẪN CHI TIẾT CHO PHÒNG HCNS (CẤP 1 - ADMIN)
          createSectionTitle("PHẦN III: HƯỚNG DẪN SỬ DỤNG CHI TIẾT DÀNH CHO PHÒNG NHÂN SỰ (HCNS)"),
          
          ...createStepGuide(1, "Đăng nhập & Quản trị tài khoản", "Sử dụng tài khoản Trưởng phòng HCNS hoặc Ban Giám Đốc để truy cập vào hệ thống:", [
            "Truy cập https://hrmvieta.up.railway.app trên trình duyệt Chrome, Edge, Safari hoặc điện thoại di động.",
            "Tên đăng nhập: vieta032 (hoặc alias: admin, hr_manager). Mật khẩu mặc định: Admin@123.",
            "Có thể đổi mật khẩu tại góc trên bên phải màn hình (click vào Avatar -> Thông tin cá nhân -> Đổi mật khẩu)."
          ]),

          ...createStepGuide(2, "Quản lý Danh mục & Hồ sơ nhân viên (/employees)", "Thực hiện theo dõi và cập nhật biến động nhân sự toàn công ty:", [
            "Vào menu 'Hồ sơ nhân viên': xem danh sách 57 nhân sự theo từng phòng ban, trạng thái làm việc (Đang làm việc, Thử việc, Đã nghỉ việc).",
            "Thêm nhân viên mới: Nhấn nút '+ Thêm nhân viên', điền đầy đủ Mã NV (VietA xxx), Họ tên, CCCD, Ngày sinh, Phòng ban, Chức vụ, Mức lương ngạch bậc.",
            "Xuất Excel / In hợp đồng: Nhấn vào nhân viên cụ thể -> 'In Hợp đồng lao động' hoặc 'Xuất hồ sơ nhân sự' file Word/PDF tự động."
          ]),

          ...createStepGuide(3, "Quản lý Chấm công & Phê duyệt Nghỉ phép (/attendance)", "Theo dõi ngày công, giờ OT và phê duyệt đơn từ:", [
            "Bảng chấm công tổng hợp: Xem bảng công 26 ngày chuẩn theo từng tháng, tự động tính số ngày làm việc thực tế, số ngày nghỉ phép năm, nghỉ không lương.",
            "Phê duyệt đơn từ: Vào tab 'Đơn xin nghỉ phép / Đi muộn / Làm thêm giờ' -> Duyệt (Approve) hoặc Từ chối (Reject) kèm lý do phản hồi cho nhân viên.",
            "Chốt công tháng: Nhấn nút 'Đồng bộ bảng công' trước khi tính lương để chuyển số ngày công sang phân hệ Tính lương."
          ]),

          ...createStepGuide(4, "Quản lý KPI & Đánh giá tháng (/kpi)", "Giao chỉ tiêu và chốt thưởng KPI hàng tháng:", [
            "Vào menu 'Quản lý KPI': Chọn tháng/năm cần đánh giá (ví dụ: Tháng 08/2026).",
            "Thiết lập KPI trách nhiệm: Gán mức thưởng trách nhiệm định mức (ví dụ: 1.000.000đ, 2.000.000đ,...).",
            "Chấm điểm & Đánh giá: Quản lý hoặc HCNS chấm điểm theo tỷ lệ % hoàn thành (100%, 80%, 50%,...) -> Hệ thống tự động tính tiền thưởng trách nhiệm thực nhận và điểm thưởng hiệu suất (Performance Bonus)."
          ]),

          ...createStepGuide(5, "Tính toán Bảng lương & Xuất phiếu lương (/payroll)", "Quy trình lập, kiểm tra và phát hành bảng lương toàn công ty:", [
            "Bước 5.1: Chọn Tháng và Năm cần lập bảng lương trên thanh công cụ.",
            "Bước 5.2: Nhấn 'Tính lương tự động' -> Hệ thống lấy 100% dữ liệu gốc: Lương ngạch bậc + Ngày công thực tế + Giờ OT (x1.5) + Tiền KPI + Phụ cấp ăn/điện thoại - BHXH (10.5%) - Công đoàn (1%) - Tạm ứng/Giảm trừ.",
            "Bước 5.3: Kiểm tra tổng quỹ lương theo từng phòng ban tại bảng tổng hợp.",
            "Bước 5.4: Nhấn 'Xuất Bảng Lương Excel' để lưu trữ hoặc nộp Ban Giám Đốc ký duyệt.",
            "Bước 5.5: Nhấn 'Gửi phiếu lương' để nhân viên tự tra cứu trên điện thoại/máy tính cá nhân."
          ]),

          ...createStepGuide(6, "Khen thưởng, Kỷ luật, Tài sản & Sáng kiến", "Quản lý chế độ phúc lợi và tài sản công ty:", [
            "Khen thưởng & Kỷ luật (/rewards): Lập quyết định khen thưởng đột xuất/tháng hoặc ghi nhận kỷ luật vi phạm nội quy, hệ thống tự động trừ/cộng vào kỳ lương tương ứng.",
            "Hòm thư & Sáng kiến (/innovations): Xem các đề xuất cải tiến của nhân viên, thẩm định tính khả thi và duyệt mức thưởng sáng kiến.",
            "Tài sản & Thiết bị (/assets): Quản lý danh mục máy móc, công cụ dụng cụ, theo dõi cấp phát tài sản cho từng nhân viên/phòng ban và xử lý phiếu báo hỏng."
          ]),

          // 4. HƯỚNG DẪN CHO TRƯỞNG PHÒNG (CẤP 2 - MANAGER)
          createSectionTitle("PHẦN IV: HƯỚNG DẪN DÀNH CHO TRƯỞNG PHÒNG / QUẢN LÝ KHO & XƯỞNG"),
          createBulletPoint("Tài khoản & Mật khẩu: ", "Tên đăng nhập theo mã nhân viên (vieta003, vieta015, vieta031, vieta036,...) | Mật khẩu: Manager@123."),
          createBulletPoint("Nghiệp vụ Chấm công: ", "Hàng ngày/tuần kiểm tra giờ vào ra của nhân viên thuộc phòng mình, duyệt các đơn xin phép của cấp dưới."),
          createBulletPoint("Nghiệp vụ Đánh giá KPI: ", "Đến kỳ đánh giá cuối tháng, vào menu KPI để chấm điểm % hoàn thành công việc của từng thành viên trực thuộc."),
          createBulletPoint("Xem Bảng lương phòng ban: ", "Truy cập menu 'Bảng lương' -> Chọn Tab 'Lương phòng ban' để kiểm tra bảng lương của nhân sự phòng mình; chọn Tab 'Phiếu lương cá nhân' để xem lương của chính mình."),
          createBulletPoint("Nguyên tắc bảo mật: ", "Trưởng phòng không thể xem được bảng lương của Ban Giám đốc (Admin) và không xem được bảng lương của phòng ban khác."),

          // 5. HƯỚNG DẪN CHO NHÂN VIÊN (CẤP 3 - EMPLOYEE)
          createSectionTitle("PHẦN V: HƯỚNG DẪN DÀNH CHO NHÂN VIÊN"),
          createBulletPoint("Tài khoản & Mật khẩu: ", "Tên đăng nhập là mã nhân viên viết liền (ví dụ: vieta001, vieta004,...) | Mật khẩu mặc định: VietA@2026."),
          createBulletPoint("Chấm công & Gửi đơn từ: ", "Nhân viên tự vào điểm danh hàng ngày, gửi đơn xin nghỉ phép, xin đi muộn về sớm hoặc đăng ký làm thêm giờ trực tiếp trên hệ thống."),
          createBulletPoint("Tra cứu KPI cá nhân: ", "Xem bảng chỉ tiêu công việc, tiến độ và điểm số đánh giá được Trưởng phòng phê duyệt."),
          createBulletPoint("Tra cứu Phiếu lương cá nhân: ", "Xem chi tiết phiếu lương hàng tháng (Lương cơ bản, ngày công, KPI, thưởng, giảm trừ và Thực nhận). Mức lương của các nhân viên khác hoàn toàn được ẩn tuyệt đối."),
          createBulletPoint("Gửi ý kiến / Sáng kiến: ", "Gửi các ý kiến đóng góp, sáng kiến cải tiến quy trình sản xuất hoặc báo hỏng thiết bị tại menu Hòm thư & Sáng kiến."),

          // 6. DANH SÁCH TOÀN BỘ TÀI KHOẢN
          createSectionTitle("PHẦN VI: DANH SÁCH CHI TIẾT TÀI KHOẢN TOÀN CÔNG TY (57 NHÂN SỰ)"),
          
          createSubTitle("1. DANH SÁCH TÀI KHOẢN CẤP 1 - ADMIN (3 TÀI KHOẢN CHÍNH THỨC)", "DC2626"),
          adminTable,

          createSubTitle("2. DANH SÁCH TÀI KHOẢN CẤP 2 - MANAGER (8 TÀI KHOẢN)", "D97706"),
          managerTable,

          createSubTitle("3. DANH SÁCH TÀI KHOẢN CẤP 3 - EMPLOYEE (46 TÀI KHOẢN)", "2563EB"),
          employeeTable,

          createSubTitle("4. BẢNG TỔNG HỢP TOÀN BỘ 57 NHÂN SỰ CÔNG TY", "0284C7"),
          fullTable,

          // 7. QUY ĐỊNH BẢO MẬT & HỖ TRỢ KỸ THUẬT
          createSectionTitle("PHẦN VII: QUY ĐỊNH BẢO MẬT & HỖ TRỢ KỸ THUẬT"),
          createBulletPoint("Bảo mật mật khẩu: ", "Yêu cầu tất cả nhân sự đổi mật khẩu sau lần đăng nhập đầu tiên để đảm bảo tính riêng tư."),
          createBulletPoint("Sao lưu dữ liệu: ", "Dữ liệu được lưu trữ tự động trên máy chủ SQLite/Cloud Database và có cơ chế backup định kỳ hàng ngày."),
          createBulletPoint("Kênh tiếp nhận hỗ trợ: ", "Mọi thắc mắc về kỹ thuật, phân quyền hoặc phát sinh lỗi trong quá trình sử dụng thử nghiệm xin vui lòng liên hệ Bộ phận CNTT / Quản trị hệ thống (Phan Tuấn Kiệt - 098.xxx.xxxx)."),

          // 8. BIÊN BẢN BÀN GIAO
          createSectionTitle("PHẦN VIII: BIÊN BẢN XÁC NHẬN BÀN GIAO HỆ THỐNG"),
          new Paragraph({
            spacing: { before: 60, after: 120 },
            children: [
              new TextRun({
                text: `Hôm nay, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}, tại Văn phòng Công ty TNHH Nệm Việt Á, hai bên thống nhất bàn giao và tiếp nhận hệ thống phần mềm Quản trị Nhân sự & Tiền lương (Viet A HRM) để đưa vào giai đoạn vận hành thử nghiệm.`,
                font: "Times New Roman",
                size: 21,
                italic: true,
                color: "1E293B"
              })
            ]
          }),
          signTable
        ]
      }
    ]
  });

  const outputPath1 = path.resolve(__dirname, '../TAI_LIEU_BAN_GIAO_VA_HUONG_DAN_SU_DUNG_HRM_VIET_A.docx');
  const outputPath2 = path.resolve(__dirname, 'uploads/documents/tai_lieu_ban_giao_va_huong_dan_su_dung_hrm_viet_a.docx');

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath1, buffer);
  console.log(`Đã lưu thành công file Word bàn giao tại: ${outputPath1}`);

  if (fs.existsSync(path.dirname(outputPath2))) {
    fs.writeFileSync(outputPath2, buffer);
    console.log(`Đã lưu bản sao lưu tại: ${outputPath2}`);
  }
}

generateHandoverDocument().then(() => {
  console.log('=== HOÀN TẤT TẠO TÀI LIỆU BÀN GIAO! ===');
  process.exit(0);
}).catch(err => {
  console.error('Lỗi tạo tài liệu:', err);
  process.exit(1);
});
