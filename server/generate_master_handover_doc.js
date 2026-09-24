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
  ShadingType
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildMasterDoc() {
  console.log('--- Đang chuẩn bị dữ liệu 57 nhân sự và 16 phân hệ tính năng ---');

  const users = await query.all(`
    SELECT 
      e.code,
      u.username,
      e.fullname,
      d.name as dept_name,
      p.name as pos_name,
      r.name as role_name,
      u.role_id
    FROM users u
    JOIN employees e ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.role_id ASC, e.code ASC
  `);

  function getPass(roleId, code) {
    const num = code.replace(/\D/g, '').padStart(3, '0');
    if (roleId === 1) return `VietA#Admin@${num}!8X`;
    if (roleId === 3) return `VietA#Mgr@${num}$9Q`;
    return `VietA#Emp@${num}*7W`;
  }

  const adminUsers = users.filter(u => u.role_id === 1);
  const managerUsers = users.filter(u => u.role_id === 3);
  const employeeUsers = users.filter(u => u.role_id === 4);

  // Borders & Cell helpers
  const borderCell = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  };

  const borderHeader = {
    top: { style: BorderStyle.SINGLE, size: 6, color: "0284C7" },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: "0284C7" },
    left: { style: BorderStyle.SINGLE, size: 6, color: "0284C7" },
    right: { style: BorderStyle.SINGLE, size: 6, color: "0284C7" },
  };

  function createHeaderCell(text, widthPercent, bg = "0284C7") {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      borders: borderHeader,
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
      borders: borderCell,
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

  function createSectionTitle(text, color = "1E3A8A") {
    return new Paragraph({
      spacing: { before: 280, after: 120 },
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
      spacing: { before: 180, after: 80 },
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

  function createBulletPoint(boldPrefix, content, color = "0284C7") {
    return new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({ text: "• ", bold: true, color: color, font: "Times New Roman", size: 21 }),
        new TextRun({ text: boldPrefix, bold: true, font: "Times New Roman", size: 21, color: "0F172A" }),
        new TextRun({ text: content, font: "Times New Roman", size: 21, color: "334155" })
      ]
    });
  }

  function buildUserRows(userList, startIdx = 1) {
    return userList.map((u, index) => {
      const isEven = index % 2 === 1;
      const rowBg = isEven ? "F8FAFC" : "FFFFFF";
      const pass = getPass(u.role_id, u.code);

      return new TableRow({
        children: [
          createDataCell(String(startIdx + index), 5, AlignmentType.CENTER, false, "333333", rowBg),
          createDataCell(u.code, 12, AlignmentType.CENTER, false, "475569", rowBg),
          createDataCell(u.username, 14, AlignmentType.LEFT, true, "0F172A", rowBg),
          createDataCell(u.fullname, 18, AlignmentType.LEFT, true, "1E293B", rowBg),
          createDataCell(u.dept_name || "Chưa phân bổ", 17, AlignmentType.LEFT, false, "334155", rowBg),
          createDataCell(u.pos_name || "-", 16, AlignmentType.LEFT, false, "475569", rowBg),
          createDataCell(pass, 18, AlignmentType.CENTER, true, "059669", rowBg),
        ]
      });
    });
  }

  function getTableHeaders(bg = "0284C7") {
    return new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell("STT", 5, bg),
        createHeaderCell("Mã NV", 12, bg),
        createHeaderCell("Tên đăng nhập", 14, bg),
        createHeaderCell("Họ và Tên", 18, bg),
        createHeaderCell("Phòng ban / Đơn vị", 17, bg),
        createHeaderCell("Chức vụ", 16, bg),
        createHeaderCell("Mật khẩu bảo mật", 18, bg),
      ]
    });
  }

  // Permission Details Table
  const permDetailHeaders = new TableRow({
    tableHeader: true,
    children: [
      createHeaderCell("Cấp độ Phân quyền", 18, "1E3A8A"),
      createHeaderCell("Đối tượng áp dụng", 20, "1E3A8A"),
      createHeaderCell("PHẦN ĐƯỢC PHÉP XEM (READ)", 31, "059669"),
      createHeaderCell("PHẦN ĐƯỢC PHÉP THỰC HIỆN (ACTION)", 31, "DC2626"),
    ]
  });

  const permDetailData = [
    [
      "CẤP 1 - ADMIN\n(Toàn quyền Quản trị)",
      "• Võ Minh Cường (Phó GĐ)\n• Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)\n• Phan Tuấn Kiệt (IT/Marketing)",
      "✓ Xem toàn bộ 11 phòng ban/kho/xưởng\n✓ Xem 100% hồ sơ & hợp đồng nhân sự\n✓ Xem bảng chấm công toàn công ty\n✓ Xem toàn bộ điểm KPI các phòng ban\n✓ Xem 100% BẢNG LƯƠNG TOÀN CÔNG TY\n✓ Xem báo cáo thống kê & nhật ký audit log\n✓ Xem toàn bộ tài sản, văn bản, hòm thư",
      "✓ Thêm, sửa, xóa hồ sơ nhân viên\n✓ Tạo, gia hạn & in hợp đồng lao động\n✓ Phê duyệt đơn nghỉ phép / OT toàn cty\n✓ Thiết lập chỉ tiêu & chốt điểm KPI tháng\n✓ TÍNH TOÁN, KHÓA & XUẤT BẢNG LƯƠNG\n✓ Ban hành Khen thưởng, Kỷ luật\n✓ Thẩm định & duyệt thưởng Sáng kiến\n✓ Quản trị tài khoản, phân quyền & sao lưu"
    ],
    [
      "CẤP 2 - MANAGER\n(Trưởng phòng / Quản lý)",
      "• 8 Quản lý:\n- Thu Tâm (Kho Cần Thơ)\n- Tuyết Hường (Kho Mỹ Tho)\n- Quốc Hùng (Kế toán)\n- Huy Hoàng (R&D)\n- Tấn Hưng (Kinh doanh)\n- Thái Cần (Xưởng gối)\n- Minh Lý (Xưởng nệm)\n- Bảo Châu (Kế toán xưởng)\n(Khối VP do Huỳnh Thị Trúc Xinh quản lý)",
      "✓ Xem danh sách nhân viên phòng mình\n✓ Xem bảng chấm công phòng mình phụ trách\n✓ Xem chi tiết KPI nhân viên phòng mình\n✓ XEM BẢNG LƯƠNG NHÂN VIÊN PHÒNG MÌNH\n✓ Xem phiếu lương cá nhân của chính mình\n✓ Xem Sơ đồ tổ chức, Tài sản, Văn bản\n🔒 TUYỆT ĐỐI KHÔNG xem lương Ban Giám Đốc\n🔒 KHÔNG xem lương phòng ban khác",
      "✓ Điểm danh & chấm công nhân viên phòng mình\n✓ Phê duyệt đơn xin nghỉ phép / OT cấp dưới\n✓ Chấm điểm & đánh giá % KPI tháng nhân viên\n✓ Đề xuất khen thưởng / kỷ luật nhân viên phòng\n✓ Tạo yêu cầu cấp phát & báo hỏng tài sản phòng\n✓ Gửi sáng kiến cải tiến & đóng góp ý kiến"
    ],
    [
      "CẤP 3 - EMPLOYEE\n(Nhân viên)",
      "• Toàn bộ 46 nhân sự còn lại trong công ty",
      "✓ Xem thông tin hồ sơ của chính mình (Profile)\n✓ Xem lịch sử chấm công & ngày phép cá nhân\n✓ XEM DUY NHẤT PHIẾU LƯƠNG CÁ NHÂN\n✓ Xem Sơ đồ tổ chức công ty\n✓ Xem Văn bản, quy định & tài sản được giao\n✓ Xem danh sách sáng kiến công khai\n🔒 TUYỆT ĐỐI KHÔNG XEM KPI (của mình & người khác - ẩn menu KPI)\n🔒 KHÔNG XEM DANH SÁCH NHÂN VIÊN (ẩn menu Hồ sơ)\n🔒 ẨN 100% MỨC LƯƠNG CỦA TẤT CẢ NGƯỜI KHÁC",
      "✓ Thực hiện điểm danh chấm công hàng ngày\n✓ GỬI ĐƠN CÁ NHÂN: Xin nghỉ phép năm, nghỉ không lương, nghỉ ốm, đi muộn, tăng ca OT, giải trình công\n✓ GỬI HÒM THƯ & SÁNG KIẾN: Hiến kế cải tiến sản xuất, đóng góp ý kiến (có tùy chọn ẨN DANH)\n✓ Báo hỏng công cụ dụng cụ / tài sản được giao\n✓ Tự đổi mật khẩu tài khoản cá nhân"
    ]
  ];

  const permDetailRows = permDetailData.map((row, idx) => {
    const bg = idx % 2 === 1 ? "F8FAFC" : "FFFFFF";
    return new TableRow({
      children: [
        createDataCell(row[0], 18, AlignmentType.LEFT, true, idx === 0 ? "DC2626" : (idx === 1 ? "D97706" : "2563EB"), bg),
        createDataCell(row[1], 20, AlignmentType.LEFT, false, "1E293B", bg),
        createDataCell(row[2], 31, AlignmentType.LEFT, false, "065F46", bg),
        createDataCell(row[3], 31, AlignmentType.LEFT, false, "991B1B", bg),
      ]
    });
  });

  const permTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [permDetailHeaders, ...permDetailRows]
  });

  // Test Checklist Table
  const testHeaders = new TableRow({
    tableHeader: true,
    children: [
      createHeaderCell("STT", 6, "1E3A8A"),
      createHeaderCell("Tài khoản Test", 16, "1E3A8A"),
      createHeaderCell("Phân quyền", 14, "1E3A8A"),
      createHeaderCell("Hạng mục kiểm tra thực tế", 36, "1E3A8A"),
      createHeaderCell("Kết quả mong đợi chuẩn", 28, "059669"),
    ]
  });

  const testCases = [
    ["1", "vieta032\n(Trúc Xinh)", "CẤP 1\nADMIN", "1. Vào /payroll kiểm tra bảng lương\n2. Vào /employees xem danh sách\n3. Vào /attendance duyệt đơn\n4. Vào /kpi chốt điểm tháng", "✓ Thấy 100% 57 nhân sự & 11 phòng ban\n✓ Tính toán và xuất Excel lương toàn cty\n✓ Duyệt đơn phép toàn bộ nhân viên\n✓ Toàn quyền thiết lập & chốt KPI"],
    ["2", "vieta036\n(Tấn Hưng)", "CẤP 2\nMANAGER", "1. Vào /payroll xem lương phòng KD\n2. Vào /payroll xem phiếu cá nhân\n3. Thử xem lương phòng khác/BGĐ\n4. Vào /kpi chấm điểm phòng KD", "✓ Thấy 7 nhân sự Phòng Kinh doanh\n✓ Xem được phiếu lương của chính mình\n🔒 Ẩn hoàn toàn lương Ban Giám Đốc & phòng khác\n✓ Chấm điểm đúng 7 nhân sự kinh doanh"],
    ["3", "vieta003\n(Thu Tâm)", "CẤP 2\nMANAGER", "1. Vào /attendance chấm công kho\n2. Vào /kpi chấm điểm tháng\n3. Vào /payroll kiểm tra lương", "✓ Quản lý đúng 7 nhân sự Kho Cần Thơ\n✓ Chấm điểm KPI đúng nhân viên kho\n✓ Chỉ thấy bảng lương Kho Cần Thơ"],
    ["4", "vieta004\n(Thúy Vy)", "CẤP 3\nEMPLOYEE", "1. Vào /payroll xem bảng lương\n2. Vào /attendance gửi đơn phép\n3. Thử tìm menu /kpi và /employees\n4. Vào /innovations gửi sáng kiến", "✓ Chỉ thấy duy nhất 1 phiếu lương của mình\n✓ Gửi đơn phép thành công về Trưởng phòng\n🔒 Ẩn hoàn toàn menu KPI & menu Hồ sơ nhân viên\n✓ Gửi được sáng kiến ẩn danh/hiện danh"],
  ];

  const testRows = testCases.map((row, idx) => {
    const bg = idx % 2 === 1 ? "F8FAFC" : "FFFFFF";
    return new TableRow({
      children: [
        createDataCell(row[0], 6, AlignmentType.CENTER, false, "333333", bg),
        createDataCell(row[1], 16, AlignmentType.LEFT, true, "0F172A", bg),
        createDataCell(row[2], 14, AlignmentType.CENTER, true, idx === 0 ? "DC2626" : (idx <= 2 ? "D97706" : "2563EB"), bg),
        createDataCell(row[3], 36, AlignmentType.LEFT, false, "1E293B", bg),
        createDataCell(row[4], 28, AlignmentType.LEFT, false, "065F46", bg),
      ]
    });
  });

  const testTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [testHeaders, ...testRows]
  });

  // Account Tables
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
    rows: [getTableHeaders("0284C7"), ...buildUserRows(users, 1)]
  });

  // Sign Table
  const signTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ĐẠI DIỆN BÊN BÀN GIAO (IT)", bold: true, font: "Times New Roman", size: 22, color: "0F172A" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 800 }, children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, font: "Times New Roman", size: 20, color: "64748B" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phan Tuấn Kiệt", bold: true, font: "Times New Roman", size: 22, color: "0F172A" })] })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ĐẠI DIỆN BÊN TIẾP NHẬN (PHÒNG HCNS)", bold: true, font: "Times New Roman", size: 22, color: "0F172A" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 800 }, children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, font: "Times New Roman", size: 20, color: "64748B" })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Huỳnh Thị Trúc Xinh", bold: true, font: "Times New Roman", size: 22, color: "0F172A" })] })
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
              top: 900,
              bottom: 900,
              left: 1100,
              right: 1100,
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
                text: "CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT NỆM VIỆT Á",
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
            spacing: { before: 80, after: 220 },
            children: [
              new TextRun({
                text: "HỒ SƠ BÀN GIAO TOÀN DIỆN, CHI TIẾT TỪNG PHÂN HỆ TÍNH NĂNG, MA TRẬN PHÂN QUYỀN & DANH SÁCH TÀI KHOẢN",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: "B91C1C"
              })
            ]
          }),

          // PHẦN 1
          createSectionTitle("PHẦN I: THÔNG TIN TRUY CẬP VÀ QUY ĐỊNH ĐĂNG NHẬP DUY NHẤT"),
          createBulletPoint("Tên hệ thống: ", "Hệ thống Quản trị Nhân sự & Tiền lương Doanh nghiệp - Nệm Việt Á (HRM)."),
          createBulletPoint("Đường dẫn truy cập Cloud (Chính thức): ", "https://hrmvieta.up.railway.app"),
          createBulletPoint("Đường dẫn nội bộ Local: ", "http://localhost:5173"),
          createBulletPoint("Quy mô nhân sự & Đơn vị: ", "Toàn bộ 11 phòng ban/kho/xưởng và 57 nhân sự công ty."),
          createBulletPoint("QUY TẮC ĐĂNG NHẬP 1 CÁCH DUY NHẤT: ", "Tất cả nhân sự đăng nhập DUY NHẤT bằng cú pháp: vieta + [Mã số 3 chữ số] (chữ thường, viết liền không dấu, không cách). Ví dụ: vieta002, vieta032, vieta036, vieta004, vieta082."),
          createBulletPoint("QUY TẮC MẬT KHẨU BẢO MẬT CAO: ", "Mỗi người có 1 mật khẩu riêng biệt (chữ HOA + chữ thường + số + ký tự đặc biệt). Đã mã hóa Bcrypt 10 rounds, chống rò rỉ và đoán mật khẩu."),

          // PHẦN 2
          createSectionTitle("PHẦN II: MA TRẬN PHÂN QUYỀN CHI TIẾT (XEM GÌ & LÀM ĐƯỢC GÌ)"),
          new Paragraph({
            spacing: { before: 40, after: 100 },
            children: [
              new TextRun({
                text: "Bảng phân định ranh giới bảo mật và thẩm quyền thao tác giữa 3 cấp bậc trong doanh nghiệp:",
                font: "Times New Roman",
                size: 21,
                color: "334155"
              })
            ]
          }),
          permTable,

          // PHẦN 3
          createSectionTitle("PHẦN III: HƯỚNG DẪN CHI TIẾT 16 PHÂN HỆ TÍNH NĂNG CỦA ỨNG DỤNG"),
          
          createSubTitle("1. BÀN LÀM VIỆC TỔNG QUAN (DASHBOARD - /)", "1E3A8A"),
          createBulletPoint("Thống kê thời gian thực: ", "Hiển thị tổng số 57 nhân sự, tỷ lệ đi làm hôm nay, số lượng nhân sự vắng mặt/nghỉ phép, cảnh báo hợp đồng sắp hết hạn trong 30 ngày và danh sách sinh nhật trong tháng."),
          createBulletPoint("Phím tắt tác vụ nhanh: ", "Hỗ trợ nút bấm nhanh: Chấm công, Nộp đơn nghỉ phép, Xem bảng lương, Tra cứu phiếu lương cá nhân."),
          createBulletPoint("Phân quyền áp dụng: ", "Cấp 1 - Admin (Xem toàn công ty), Cấp 2 - Manager (Xem số liệu phòng ban mình), Cấp 3 - Employee (Xem tổng quan cá nhân)."),

          createSubTitle("2. SƠ ĐỒ TỔ CHỨC ĐỘNG & BỘ MÁY DOANH NGHIỆP (/settings/departments-positions)", "1E3A8A"),
          createBulletPoint("Cơ cấu cây tổ chức: ", "Trực quan hóa bộ máy doanh nghiệp từ Ban Giám Đốc -> 11 Đơn vị (Khối Văn phòng, Kho Cần Thơ, Kho Mỹ Tho, Xưởng Nệm, Xưởng Gối, Kinh doanh, Marketing, Kế toán, R&D, Giao hàng, Tạp vụ)."),
          createBulletPoint("Định biên & Quản lý trực tiếp: ", "Hiển thị rõ chức danh, số lượng nhân sự trực thuộc và người quản lý trực tiếp (Manager ID) của từng bộ phận."),
          createBulletPoint("Phân quyền áp dụng: ", "Tất cả 3 Cấp bậc (Admin, Manager, Employee) đều được xem để nắm rõ bộ máy công ty."),

          createSubTitle("3. QUẢN LÝ HỒ SƠ NHÂN VIÊN 360 ĐỘ (/employees)", "1E3A8A"),
          createBulletPoint("Hồ sơ điện tử toàn diện: ", "Lưu trữ đầy đủ Mã NV, Họ tên, Ngày sinh, CCCD/CMND, Quê quán, Địa chỉ, Số điện thoại, Email, Trình độ học vấn, Tài khoản ngân hàng chi trả lương."),
          createBulletPoint("Thiết lập ngạch bậc lương & Chế độ: ", "Quản lý Lương ngạch bậc, Lương đóng bảo hiểm xã hội, Phụ cấp trách nhiệm, Phụ cấp ăn trưa, Phụ cấp xăng xe điện thoại."),
          createBulletPoint("🔒 Phân quyền nghiêm ngặt: ", "Chỉ Cấp 1 (Admin) và Cấp 2 (Manager xem phòng mình); Cấp 3 (Employee) BỊ ẨN HOÀN TOÀN MENU để bảo mật danh bạ nội bộ."),

          createSubTitle("4. HỢP ĐỒNG LAO ĐỘNG & TỰ ĐỘNG IN WORD/PDF (/contracts)", "1E3A8A"),
          createBulletPoint("Quản lý vòng đời hợp đồng: ", "Quản lý HĐ Thử việc, HĐ xác định thời hạn (12 tháng, 24 tháng), HĐ không xác định thời hạn, cảnh báo tự động trước khi hết hạn 30 ngày."),
          createBulletPoint("📄 In hợp đồng 1 chạm: ", "Bấm nút 'In Hợp đồng' -> Hệ thống tự động trích xuất thông tin người lao động và đại diện pháp luật, xuất ngay file Word (.docx) hoặc PDF chuẩn quy chế công ty Nệm Việt Á."),
          createBulletPoint("Phân quyền áp dụng: ", "Chỉ Cấp 1 - Admin và Cấp 2 - Manager."),

          createSubTitle("5. CHẤM CÔNG & ĐIỂM DANH HÀNG NGÀY (/attendance)", "1E3A8A"),
          createBulletPoint("Điểm danh trực tuyến: ", "Nhân viên bấm Check-in / Check-out hàng ngày, hệ thống tự động ghi nhận giờ vào, giờ ra, số phút đi muộn / về sớm."),
          createBulletPoint("Bảng chấm công tổng hợp: ", "Theo dõi dữ liệu 26 ngày công chuẩn theo từng tháng, tự động tính số ngày làm việc thực tế, số ngày nghỉ phép năm, nghỉ không lương."),
          createBulletPoint("Theo dõi làm thêm giờ (OT): ", "Ghi nhận chính xác số giờ tăng ca ngày thường (hệ số x1.5), tăng ca chủ nhật (x2.0) và ngày lễ (x3.0) để đồng bộ sang bảng lương."),
          createBulletPoint("Phân quyền áp dụng: ", "Tất cả nhân sự (Admin xem toàn bộ; Manager xem & chấm công phòng mình; Employee xem lịch sử cá nhân)."),

          createSubTitle("6. QUẢN LÝ ĐƠN TỪ CÁ NHÂN TRỰC TUYẾN (/attendance?tab=leaves)", "1E3A8A"),
          createBulletPoint("Mục đích: ", "Giải quyết thủ tục hành chính liên quan đến ngày công làm việc của nhân viên."),
          createBulletPoint("Các loại đơn: ", "Đơn xin nghỉ phép năm, Nghỉ không lương, Nghỉ ốm đau/thai sản, Đi muộn/về sớm, Đăng ký làm thêm giờ (OT), Giải trình quên chấm công."),
          createBulletPoint("Quy trình phê duyệt: ", "Nhân viên gửi đơn -> Trưởng phòng / HCNS nhận thông báo -> Phê duyệt / Từ chối kèm lý do -> Tự động cập nhật vào Bảng công và Lương."),
          createBulletPoint("Phân quyền áp dụng: ", "Tất cả nhân sự đều được gửi đơn; Quản lý và Admin duyệt đơn."),

          createSubTitle("7. QUẢN LÝ KPI & ĐÁNH GIÁ HIỆU SUẤT THÁNG (/kpi)", "1E3A8A"),
          createBulletPoint("Thiết lập định mức KPI: ", "Chọn tháng cần đánh giá (ví dụ Tháng 08/2026), cấu hình mức thưởng trách nhiệm định mức theo chức danh (1.000.000đ, 2.000.000đ,...)."),
          createBulletPoint("Chấm điểm & Tự động tính thưởng: ", "Trưởng phòng chấm điểm theo tỷ lệ % hoàn thành (100%, 80%, 50%,...) -> Tự động tính tiền Thưởng trách nhiệm và Thưởng hiệu suất."),
          createBulletPoint("🔒 Phân quyền bảo mật cao: ", "Chỉ Cấp 1 (Admin) và Cấp 2 (Manager xem phòng mình); Cấp 3 (Employee) BỊ KHÓA & ẨN HOÀN TOÀN để tránh so bì nội bộ."),

          createSubTitle("8. TÍNH TOÁN, DUYỆT & XUẤT BẢNG LƯƠNG TỰ ĐỘNG (/payroll)", "1E3A8A"),
          createBulletPoint("Công thức tính lương chuẩn 100% dữ liệu thực: ", "Lương ngạch bậc thực nhận = (Lương ngạch bậc / 26) * Ngày công thực tế + Tiền OT (x1.5) + Tiền KPI + Phụ cấp ăn/điện thoại - BHXH (10.5%) - Công đoàn (1%) - Tạm ứng/Kỷ luật."),
          createBulletPoint("Xuất Bảng Lương Excel: ", "Xuất file Excel bảng lương tổng hợp 11 phòng ban đầy đủ công thức chuẩn bị trình ký Ban Giám Đốc."),
          createBulletPoint("Phát hành Phiếu lương (Payslip): ", "Bấm 'Gửi phiếu lương' để từng nhân viên tự tra cứu trên tài khoản cá nhân. Nhân viên chỉ thấy duy nhất phiếu lương của mình, ẨN 100% lương người khác."),
          createBulletPoint("Phân quyền xem lương: ", "Admin xem toàn cty; Manager xem phòng mình và phiếu cá nhân; Employee chỉ xem phiếu cá nhân."),

          createSubTitle("9. 💡 HÒM THƯ & SÁNG KIẾN CẢI TIẾN SẢN XUẤT (/innovations)", "1E3A8A"),
          createBulletPoint("Mục đích phát triển: ", "Khuyến khích cán bộ công nhân viên tại các xưởng sản xuất, kho bãi và văn phòng hiến kế cải tiến kỹ thuật, tiết kiệm nguyên vật liệu, nâng cao chất lượng nệm."),
          createBulletPoint("3 Nhóm chủ đề đóng góp: ", "1) Ý tưởng cải tiến sáng tạo; 2) Góp ý môi trường & phúc lợi; 3) Phản ánh khiếu nại kiến nghị nội bộ."),
          createBulletPoint("Chế độ Bảo mật danh tính: ", "Nhân viên có thể tùy chọn: Hiện tên công khai HOẶC Gửi ẨN DANH (bảo mật 100% thông tin người gửi)."),
          createBulletPoint("Thẩm định & Thưởng nóng: ", "Ban Giám Đốc & HCNS phê duyệt thưởng nóng (tiền mặt/quà) -> Số tiền thưởng tự động đồng bộ sang Bảng lương."),
          createBulletPoint("Phân quyền áp dụng: ", "Tất cả nhân sự (Admin, Manager, Employee) đều có quyền gửi sáng kiến và tương tác thả tim."),

          createSubTitle("10. 📦 QUẢN LÝ TÀI SẢN & CÔNG CỤ DỤNG CỤ (CCDC) (/assets)", "1E3A8A"),
          createBulletPoint("Danh mục tài sản máy móc: ", "Theo dõi máy móc xưởng nệm (máy may, máy cắt), xe tải giao hàng kho Cần Thơ/Mỹ Tho, máy tính thiết bị văn phòng, tình trạng và thời gian khấu hao."),
          createBulletPoint("Cấp phát & Báo hỏng trực tuyến: ", "Theo dõi nhân sự đang giữ tài sản; Nhân viên tạo phiếu báo hỏng khi có sự cố; Bộ phận kỹ thuật tiếp nhận xử lý và cập nhật chi phí."),
          createBulletPoint("Phân quyền áp dụng: ", "Tất cả 3 cấp bậc (Admin/Manager quản trị & điều phối, Employee xem tài sản được cấp & báo hỏng)."),

          createSubTitle("11. 🏆 KHEN THƯỞNG & KỶ LUẬT ĐỒNG BỘ BẢNG LƯƠNG (/rewards)", "1E3A8A"),
          createBulletPoint("Ban hành Khen thưởng: ", "Lập quyết định vinh danh cá nhân/tập thể xuất sắc kèm số tiền thưởng -> Tự động cộng vào cột Thưởng khác trên Bảng lương."),
          createBulletPoint("Ghi nhận Kỷ luật: ", "Lập biên bản xử lý vi phạm nội quy, đi muộn, vi phạm an toàn kèm mức phạt -> Tự động trừ vào cột Giảm trừ kỷ luật trên Bảng lương."),
          createBulletPoint("Phân quyền áp dụng: ", "Admin ban hành; Toàn bộ nhân viên xem được các quyết định khen thưởng công khai."),

          createSubTitle("12. VĂN BẢN, QUY ĐỊNH & CHÍNH SÁCH DOANH NGHIỆP (/documents)", "1E3A8A"),
          createBulletPoint("Thư viện quy chế số: ", "Lưu trữ Nội quy lao động 2026, Chính sách phúc lợi, Thông báo xử lý vi phạm nội bộ cấp Quản lý & Nhân viên, Quy trình an toàn lao động."),
          createBulletPoint("Tra cứu & Tải về: ", "Nhân viên tra cứu trực tiếp mọi lúc mọi nơi trên điện thoại hoặc máy tính, tải về các biểu mẫu hành chính chuẩn."),
          createBulletPoint("Phân quyền áp dụng: ", "Tất cả 3 cấp bậc (Admin quản trị thư viện; Manager và Employee tra cứu tải về)."),

          createSubTitle("13. ĐÀO TẠO & HỘI NHẬP NHÂN VIÊN MỚI (/training)", "1E3A8A"),
          createBulletPoint("Giáo trình hội nhập: ", "Tích hợp Bộ đào tạo hội nhập Công ty Nệm Việt Á, cẩm nang văn hóa ứng xử, hướng dẫn kỹ thuật xưởng may nệm, xưởng gối và quy trình bán hàng."),
          createBulletPoint("Theo dõi tiến độ học tập: ", "Giúp nhân sự mới nhanh chóng nắm bắt công việc và vượt qua thời gian thử việc thành công."),
          createBulletPoint("Phân quyền áp dụng: ", "Tất cả nhân sự trong công ty."),

          createSubTitle("14. BÁO CÁO THỐNG KÊ QUẢN TRỊ CAO CẤP (/reports)", "1E3A8A"),
          createBulletPoint("Thống kê nhân lực: ", "Phân tích cơ cấu nhân sự theo giới tính, độ tuổi, thâm niên công tác, trình độ và biến động nhân sự vào/ra."),
          createBulletPoint("Phân tích tài chính nhân sự: ", "Báo cáo tổng chi phí quỹ lương theo từng phòng ban, chi phí tăng ca OT, chi phí BHXH và biến động qua các tháng."),
          createBulletPoint("Phân quyền áp dụng: ", "Chỉ Cấp 1 - Admin và Cấp 2 - Manager."),

          createSubTitle("15. PHÂN QUYỀN & QUẢN TRỊ TÀI KHOẢN NGƯỜI DÙNG (/users)", "1E3A8A"),
          createBulletPoint("Quản lý 57 tài khoản: ", "Gán quyền 3 Cấp độ chuẩn (Admin, Manager, Employee), khóa tài khoản khi nhân viên nghỉ việc, cấp lại mật khẩu bảo mật cao."),
          createBulletPoint("Phân quyền áp dụng: ", "Chỉ Cấp 1 - Admin (Phòng HCNS & IT)."),

          createSubTitle("16. NHẬT KÝ HỆ THỐNG & SAO LƯU DỮ LIỆU (/audit-logs, /backup)", "1E3A8A"),
          createBulletPoint("Nhật ký Audit Log: ", "Ghi nhận 100% thao tác nhạy cảm (thêm/sửa nhân viên, tính lương, đổi mật khẩu, phê duyệt đơn từ) phục vụ tra cứu bảo mật."),
          createBulletPoint("Sao lưu & Khôi phục (Backup): ", "Tải bản backup Database SQLite định kỳ về máy tính lưu trữ an toàn, khôi phục dữ liệu 1-click khi cần thiết."),
          createBulletPoint("Phân quyền áp dụng: ", "Chỉ Cấp 1 - Admin."),

          // PHẦN 4
          createSectionTitle("PHẦN IV: DANH SÁCH CHI TIẾT 57 TÀI KHOẢN ĐĂNG NHẬP VÀ MẬT KHẨU"),
          
          createSubTitle("1. CẤP 1 - ADMIN (3 TÀI KHOẢN CHÍNH THỨC TOÀN QUYỀN)", "DC2626"),
          adminTable,

          createSubTitle("2. CẤP 2 - MANAGER (8 TÀI KHOẢN TRƯỞNG PHÒNG / QUẢN LÝ)", "D97706"),
          managerTable,

          createSubTitle("3. CẤP 3 - EMPLOYEE (46 TÀI KHOẢN NHÂN VIÊN)", "2563EB"),
          employeeTable,

          createSubTitle("4. BẢNG TỔNG HỢP TOÀN BỘ 57 NHÂN SỰ CÔNG TY", "0284C7"),
          fullTable,

          // PHẦN 5
          createSectionTitle("PHẦN V: KỊCH BẢN KIỂM TRA & NGHIỆM THU TÍNH NĂNG (TEST CASES)"),
          new Paragraph({
            spacing: { before: 40, after: 100 },
            children: [
              new TextRun({
                text: "Phòng Nhân sự và Ban Giám Đốc sử dụng bảng dưới đây để đăng nhập thử nghiệm và đối soát tính năng:",
                font: "Times New Roman",
                size: 21,
                color: "334155"
              })
            ]
          }),
          testTable,

          // PHẦN 6
          createSectionTitle("PHẦN VI: BIÊN BẢN KÝ NHẬN VÀ BÀN GIAO"),
          new Paragraph({
            spacing: { before: 60, after: 140 },
            children: [
              new TextRun({
                text: `Hôm nay, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}, tại Văn phòng Công ty TNHH Thương mại Sản xuất Nệm Việt Á, hai bên thống nhất bàn giao và tiếp nhận toàn bộ hệ thống phần mềm Quản trị Nhân sự & Tiền lương (Viet A HRM), danh sách tài khoản, mật khẩu và ma trận phân quyền để đưa vào vận hành thử nghiệm.`,
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

  const masterPath = path.resolve(__dirname, '../HO_SO_BAN_GIAO_VA_HUONG_DAN_SU_DUNG_HRM_VIET_A.docx');
  const backupPath = path.resolve(__dirname, 'uploads/documents/ho_so_ban_giao_va_huong_dan_su_dung_hrm_viet_a.docx');

  const buffer = await Packer.toBuffer(doc);
  try {
    fs.writeFileSync(masterPath, buffer);
    console.log(`ĐÃ XUẤT THÀNH CÔNG FILE BÀN GIAO DUY NHẤT (DOCX): ${masterPath}`);
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.warn(`File ${masterPath} đang mở trong Word, bỏ qua ghi đè.`);
    } else {
      throw err;
    }
  }

  if (fs.existsSync(path.dirname(backupPath))) {
    try {
      fs.writeFileSync(backupPath, buffer);
      console.log(`Đã lưu bản sao lưu tại: ${backupPath}`);
    } catch (e) {}
  }

  // Cập nhật kèm Markdown file
  const mdPath = path.resolve(__dirname, '../HO_SO_BAN_GIAO_VA_HUONG_DAN_SU_DUNG_HRM_VIET_A.md');
  const mdContent = `# CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT NỆM VIỆT Á
# HỆ THỐNG QUẢN TRỊ NHÂN SỰ & TIỀN LƯƠNG (VIỆT Á HRM)

---

## 📌 HỒ SƠ BÀN GIAO TOÀN DIỆN, CHI TIẾT TỪNG PHÂN HỆ TÍNH NĂNG, MA TRẬN PHÂN QUYỀN & DANH SÁCH TÀI KHOẢN

---

### PHẦN I: THÔNG TIN TRUY CẬP VÀ QUY ĐỊNH ĐĂNG NHẬP DUY NHẤT
• **Tên hệ thống:** Hệ thống Quản trị Nhân sự & Tiền lương Doanh nghiệp - Nệm Việt Á (HRM).  
• **Đường dẫn Cloud (Chính thức):** [https://hrmvieta.up.railway.app](https://hrmvieta.up.railway.app)  
• **Đường dẫn Local:** \`http://localhost:5173\`  
• **Quy mô:** Toàn bộ 11 phòng ban/kho/xưởng và 57 nhân sự công ty.  
• **QUY TẮC ĐĂNG NHẬP 1 CÁCH DUY NHẤT:** Tất cả nhân sự đăng nhập DUY NHẤT bằng cú pháp: \`vieta\` + [Mã số 3 chữ số] (chữ thường, viết liền không dấu, không cách). Ví dụ: \`vieta002\`, \`vieta032\`, \`vieta036\`, \`vieta004\`, \`vieta082\`.  
• **QUY TẮC MẬT KHẨU BẢO MẬT CAO:** Mỗi người có 1 mật khẩu riêng biệt (chữ HOA + chữ thường + số + ký tự đặc biệt). Không thể đoán mật khẩu của nhau.

---

### PHẦN II: MA TRẬN PHÂN QUYỀN CHI TIẾT (XEM GÌ & LÀM ĐƯỢC GÌ)

| Cấp độ Phân quyền | Đối tượng áp dụng | PHẦN ĐƯỢC PHÉP XEM (READ) | PHẦN ĐƯỢC PHÉP THỰC HIỆN (ACTION) |
| :--- | :--- | :--- | :--- |
| **CẤP 1 - ADMIN**<br>*(Toàn quyền Quản trị)* | • Võ Minh Cường (Phó GĐ)<br>• Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)<br>• Phan Tuấn Kiệt (IT/Marketing) | ✓ Xem toàn bộ 11 phòng ban/kho/xưởng<br>✓ Xem 100% hồ sơ & hợp đồng nhân sự<br>✓ Xem bảng chấm công toàn công ty<br>✓ Xem toàn bộ điểm KPI các phòng ban<br>✓ Xem 100% BẢNG LƯƠNG TOÀN CÔNG TY<br>✓ Xem báo cáo thống kê & nhật ký audit log<br>✓ Xem toàn bộ tài sản, văn bản, hòm thư | ✓ Thêm, sửa, xóa hồ sơ nhân viên<br>✓ Tạo, gia hạn & in hợp đồng lao động<br>✓ Phê duyệt đơn nghỉ phép / OT toàn cty<br>✓ Thiết lập chỉ tiêu & chốt điểm KPI tháng<br>✓ TÍNH TOÁN, KHÓA & XUẤT BẢNG LƯƠNG<br>✓ Ban hành Khen thưởng, Kỷ luật<br>✓ Thẩm định & duyệt thưởng Sáng kiến<br>✓ Quản trị tài khoản, phân quyền & sao lưu |
| **CẤP 2 - MANAGER**<br>*(Trưởng phòng / Quản lý)* | • 8 Quản lý phòng/kho/xưởng:<br>- Nguyễn Thị Thu Tâm (Kho Cần Thơ)<br>- Dương Thị Tuyết Hường (Kho Mỹ Tho)<br>- Nguyễn Quốc Hùng (Kế toán)<br>- Lê Huy Hoàng (R&D)<br>- Phạm Tấn Hưng (Kinh doanh)<br>- Nguyễn Thái Cần (Xưởng gối)<br>- Trần Minh Lý (Xưởng nệm)<br>- Trần Thị Bảo Châu (Kế toán xưởng)<br>*(Khối VP do Trúc Xinh quản lý)* | ✓ Xem danh sách nhân viên phòng mình<br>✓ Xem bảng chấm công phòng mình phụ trách<br>✓ Xem chi tiết KPI nhân viên phòng mình<br>✓ XEM BẢNG LƯƠNG NHÂN VIÊN PHÒNG MÌNH<br>✓ Xem phiếu lương cá nhân của chính mình<br>✓ Xem Sơ đồ tổ chức, Tài sản, Văn bản<br>🔒 TUYỆT ĐỐI KHÔNG xem lương Ban Giám Đốc<br>🔒 KHÔNG xem lương phòng ban khác | ✓ Điểm danh & chấm công nhân viên phòng mình<br>✓ Phê duyệt đơn xin nghỉ phép / OT cấp dưới<br>✓ Chấm điểm & đánh giá % KPI tháng nhân viên<br>✓ Đề xuất khen thưởng / kỷ luật nhân viên phòng<br>✓ Tạo yêu cầu cấp phát & báo hỏng tài sản phòng<br>✓ Gửi sáng kiến cải tiến & đóng góp ý kiến |
| **CẤP 3 - EMPLOYEE**<br>*(Nhân viên)* | • Toàn bộ 46 nhân sự còn lại trong công ty | ✓ Xem thông tin hồ sơ của chính mình (Profile)<br>✓ Xem lịch sử chấm công & ngày phép cá nhân<br>✓ XEM DUY NHẤT PHIẾU LƯƠNG CÁ NHÂN<br>✓ Xem Sơ đồ tổ chức công ty<br>✓ Xem Văn bản, quy định & tài sản được giao<br>✓ Xem danh sách sáng kiến công khai<br>🔒 TUYỆT ĐỐI KHÔNG XEM KPI (của mình & người khác - ẩn menu KPI)<br>🔒 KHÔNG XEM DANH SÁCH NHÂN VIÊN (ẩn menu Hồ sơ)<br>🔒 ẨN 100% MỨC LƯƠNG CỦA TẤT CẢ NGƯỜI KHÁC | ✓ Thực hiện điểm danh chấm công hàng ngày<br>✓ GỬI ĐƠN CÁ NHÂN: Xin nghỉ phép năm, nghỉ không lương, nghỉ ốm, đi muộn, tăng ca OT, giải trình công<br>✓ GỬI HÒM THƯ & SÁNG KIẾN: Hiến kế cải tiến sản xuất, đóng góp ý kiến (có tùy chọn ẨN DANH)<br>✓ Báo hỏng công cụ dụng cụ / tài sản được giao<br>✓ Tự đổi mật khẩu tài khoản cá nhân |

---

### PHẦN III: HƯỚNG DẪN CHI TIẾT 16 PHÂN HỆ TÍNH NĂNG CỦA ỨNG DỤNG

#### 1. Bàn làm việc tổng quan (Dashboard - \`/\`)
• **Thống kê thời gian thực:** Hiển thị tổng số 57 nhân sự, tỷ lệ đi làm hôm nay, số lượng nhân sự vắng mặt/nghỉ phép, cảnh báo hợp đồng sắp hết hạn trong 30 ngày và danh sách sinh nhật trong tháng.  
• **Phím tắt tác vụ nhanh:** Hỗ trợ nút bấm nhanh: Chấm công, Nộp đơn nghỉ phép, Xem bảng lương, Tra cứu phiếu lương cá nhân.  
• **Phân quyền áp dụng:** Cấp 1 - Admin (Xem toàn công ty), Cấp 2 - Manager (Xem số liệu phòng ban mình), Cấp 3 - Employee (Xem tổng quan cá nhân).

#### 2. Sơ đồ tổ chức động & Bộ máy doanh nghiệp (\`/settings/departments-positions\`)
• **Cơ cấu cây tổ chức:** Trực quan hóa bộ máy doanh nghiệp từ Ban Giám Đốc -> 11 Đơn vị (Khối Văn phòng, Kho Cần Thơ, Kho Mỹ Tho, Xưởng Nệm, Xưởng Gối, Kinh doanh, Marketing, Kế toán, R&D, Giao hàng, Tạp vụ).  
• **Định biên & Quản lý trực tiếp:** Hiển thị rõ chức danh, số lượng nhân sự trực thuộc và người quản lý trực tiếp (Manager ID) của từng bộ phận.  
• **Phân quyền áp dụng:** Tất cả 3 Cấp bậc (Admin, Manager, Employee) đều được xem để nắm rõ bộ máy công ty.

#### 3. Quản lý Hồ sơ Nhân viên 360 độ (\`/employees\`)
• **Hồ sơ điện tử toàn diện:** Lưu trữ đầy đủ Mã NV, Họ tên, Ngày sinh, CCCD/CMND, Quê quán, Địa chỉ, Số điện thoại, Email, Trình độ học vấn, Tài khoản ngân hàng chi trả lương.  
• **Thiết lập ngạch bậc lương & Chế độ:** Quản lý Lương ngạch bậc, Lương đóng bảo hiểm xã hội, Phụ cấp trách nhiệm, Phụ cấp ăn trưa, Phụ cấp xăng xe điện thoại.  
• 🔒 **Phân quyền nghiêm ngặt:** Chỉ Cấp 1 (Admin) và Cấp 2 (Manager xem phòng mình); Cấp 3 (Employee) BỊ ẨN HOÀN TOÀN MENU để bảo mật danh bạ nội bộ.

#### 4. Hợp đồng lao động & Tự động in Word/PDF (\`/contracts\`)
• **Quản lý vòng đời hợp đồng:** Quản lý HĐ Thử việc, HĐ xác định thời hạn (12 tháng, 24 tháng), HĐ không xác định thời hạn, cảnh báo tự động trước khi hết hạn 30 ngày.  
• 📄 **In hợp đồng 1 chạm:** Bấm nút 'In Hợp đồng' -> Hệ thống tự động trích xuất thông tin người lao động và đại diện pháp luật, xuất ngay file Word (.docx) hoặc PDF chuẩn quy chế công ty Nệm Việt Á.  
• **Phân quyền áp dụng:** Chỉ Cấp 1 - Admin và Cấp 2 - Manager.

#### 5. Chấm công & Điểm danh hàng ngày (\`/attendance\`)
• **Điểm danh trực tuyến:** Nhân viên bấm Check-in / Check-out hàng ngày, hệ thống tự động ghi nhận giờ vào, giờ ra, số phút đi muộn / về sớm.  
• **Bảng chấm công tổng hợp:** Theo dõi dữ liệu 26 ngày công chuẩn theo từng tháng, tự động tính số ngày làm việc thực tế, số ngày nghỉ phép năm, nghỉ không lương.  
• **Theo dõi làm thêm giờ (OT):** Ghi nhận chính xác số giờ tăng ca ngày thường (hệ số x1.5), tăng ca chủ nhật (x2.0) và ngày lễ (x3.0) để đồng bộ sang bảng lương.  
• **Phân quyền áp dụng:** Tất cả nhân sự (Admin xem toàn bộ; Manager xem & chấm công phòng mình; Employee xem lịch sử cá nhân).

#### 6. Quản lý Đơn từ cá nhân trực tuyến (\`/attendance?tab=leaves\`)
• **Mục đích:** Giải quyết thủ tục hành chính liên quan đến ngày công làm việc của nhân viên.  
• **Các loại đơn:** Đơn xin nghỉ phép năm, Nghỉ không lương, Nghỉ ốm đau/thai sản, Đi muộn/về sớm, Đăng ký làm thêm giờ (OT), Giải trình quên chấm công.  
• **Quy trình phê duyệt:** Nhân viên gửi đơn -> Trưởng phòng / HCNS nhận thông báo -> Phê duyệt / Từ chối kèm lý do -> Tự động cập nhật vào Bảng công và Lương.  
• **Phân quyền áp dụng:** Tất cả nhân sự đều được gửi đơn; Quản lý và Admin duyệt đơn.

#### 7. Quản lý KPI & Đánh giá hiệu suất tháng (\`/kpi\`)
• **Thiết lập định mức KPI:** Chọn tháng cần đánh giá (ví dụ Tháng 08/2026), cấu hình mức thưởng trách nhiệm định mức theo chức danh (1.000.000đ, 2.000.000đ,...).  
• **Chấm điểm & Tự động tính thưởng:** Trưởng phòng chấm điểm theo tỷ lệ % hoàn thành (100%, 80%, 50%,...) -> Tự động tính tiền Thưởng trách nhiệm và Thưởng hiệu suất.  
• 🔒 **Phân quyền bảo mật cao:** Chỉ Cấp 1 (Admin) và Cấp 2 (Manager xem phòng mình); Cấp 3 (Employee) BỊ KHÓA & ẨN HOÀN TOÀN để tránh so bì nội bộ.

#### 8. Tính toán, Duyệt & Xuất Bảng lương tự động (\`/payroll\`)
• **Công thức tính lương chuẩn 100% dữ liệu thực:**  
  * *Lương ngạch bậc thực nhận = (Lương ngạch bậc / 26) * Ngày công thực tế + Tiền OT (x1.5) + Tiền KPI + Phụ cấp ăn/điện thoại - BHXH (10.5%) - Công đoàn (1%) - Tạm ứng/Kỷ luật.*  
• **Xuất Bảng Lương Excel:** Xuất file Excel bảng lương tổng hợp 11 phòng ban đầy đủ công thức chuẩn bị trình ký Ban Giám Đốc.  
• **Phát hành Phiếu lương (Payslip):** Bấm 'Gửi phiếu lương' để từng nhân viên tự tra cứu trên tài khoản cá nhân. Nhân viên chỉ thấy duy nhất phiếu lương của mình, ẨN 100% lương người khác.  
• **Phân quyền xem lương:** Admin xem toàn cty; Manager xem phòng mình và phiếu cá nhân; Employee chỉ xem phiếu cá nhân.

#### 9. 💡 Hòm thư & Sáng kiến cải tiến sản xuất (\`/innovations\`)
• **Mục đích phát triển:** Khuyến khích cán bộ công nhân viên tại các xưởng sản xuất, kho bãi và văn phòng hiến kế cải tiến kỹ thuật, tiết kiệm nguyên vật liệu, nâng cao chất lượng nệm.  
• **3 Nhóm chủ đề đóng góp:** 1) Ý tưởng cải tiến sáng tạo; 2) Góp ý môi trường & phúc lợi; 3) Phản ánh khiếu nại kiến nghị nội bộ.  
• **Chế độ Bảo mật danh tính:** Nhân viên có thể tùy chọn: Hiện tên công khai HOẶC Gửi ẨN DANH (bảo mật 100% thông tin người gửi).  
• **Thẩm định & Thưởng nóng:** Ban Giám Đốc & HCNS phê duyệt thưởng nóng (tiền mặt/quà) -> Số tiền thưởng tự động đồng bộ sang Bảng lương.  
• **Phân quyền áp dụng:** Tất cả nhân sự (Admin, Manager, Employee) đều có quyền gửi sáng kiến và tương tác thả tim.

#### 10. 📦 Quản lý Tài sản & Công cụ dụng cụ (CCDC) (\`/assets\`)
• **Danh mục tài sản máy móc:** Theo dõi máy móc xưởng nệm (máy may, máy cắt), xe tải giao hàng kho Cần Thơ/Mỹ Tho, máy tính thiết bị văn phòng, tình trạng và thời gian khấu hao.  
• **Cấp phát & Báo hỏng trực tuyến:** Theo dõi nhân sự đang giữ tài sản; Nhân viên tạo phiếu báo hỏng khi có sự cố; Bộ phận kỹ thuật tiếp nhận xử lý và cập nhật chi phí.  
• **Phân quyền áp dụng:** Tất cả 3 cấp bậc (Admin/Manager quản trị & điều phối, Employee xem tài sản được cấp & báo hỏng).

#### 11. 🏆 Khen thưởng & Kỷ luật đồng bộ Bảng lương (\`/rewards\`)
• **Ban hành Khen thưởng:** Lập quyết định vinh danh cá nhân/tập thể xuất sắc kèm số tiền thưởng -> Tự động cộng vào cột Thưởng khác trên Bảng lương.  
• **Ghi nhận Kỷ luật:** Lập biên bản xử lý vi phạm nội quy, đi muộn, vi phạm an toàn kèm mức phạt -> Tự động trừ vào cột Giảm trừ kỷ luật trên Bảng lương.  
• **Phân quyền áp dụng:** Admin ban hành; Toàn bộ nhân viên xem được các quyết định khen thưởng công khai.

#### 12. Văn bản, Quy định & Chính sách Doanh nghiệp (\`/documents\`)
• **Thư viện quy chế số:** Lưu trữ Nội quy lao động 2026, Chính sách phúc lợi, Thông báo xử lý vi phạm nội bộ cấp Quản lý & Nhân viên, Quy trình an toàn lao động.  
• **Tra cứu & Tải về:** Nhân viên tra cứu trực tiếp mọi lúc mọi nơi trên điện thoại hoặc máy tính, tải về các biểu mẫu hành chính chuẩn.  
• **Phân quyền áp dụng:** Tất cả 3 cấp bậc (Admin quản trị thư viện; Manager và Employee tra cứu tải về).

#### 13. Đào tạo & Hội nhập Nhân viên mới (\`/training\`)
• **Giáo trình hội nhập:** Tích hợp Bộ đào tạo hội nhập Công ty Nệm Việt Á, cẩm nang văn hóa ứng xử, hướng dẫn kỹ thuật xưởng may nệm, xưởng gối và quy trình bán hàng.  
• **Theo dõi tiến độ học tập:** Giúp nhân sự mới nhanh chóng nắm bắt công việc và vượt qua thời gian thử việc thành công.  
• **Phân quyền áp dụng:** Tất cả nhân sự trong công ty.

#### 14. Báo cáo Thống kê Quản trị cao cấp (\`/reports\`)
• **Thống kê nhân lực:** Phân tích cơ cấu nhân sự theo giới tính, độ tuổi, thâm niên công tác, trình độ và biến động nhân sự vào/ra.  
• **Phân tích tài chính nhân sự:** Báo cáo tổng chi phí quỹ lương theo từng phòng ban, chi phí tăng ca OT, chi phí BHXH và biến động qua các tháng.  
• **Phân quyền áp dụng:** Chỉ Cấp 1 - Admin và Cấp 2 - Manager.

#### 15. Phân quyền & Quản trị Tài khoản Người dùng (\`/users\`)
• **Quản lý 57 tài khoản:** Gán quyền 3 Cấp độ chuẩn (Admin, Manager, Employee), khóa tài khoản khi nhân viên nghỉ việc, cấp lại mật khẩu bảo mật cao.  
• **Phân quyền áp dụng:** Chỉ Cấp 1 - Admin (Phòng HCNS & IT).

#### 16. Nhật ký Hệ thống & Sao lưu Dữ liệu (\`/audit-logs\`, \`/backup\`)
• **Nhật ký Audit Log:** Ghi nhận 100% thao tác nhạy cảm (thêm/sửa nhân viên, tính lương, đổi mật khẩu, phê duyệt đơn từ) phục vụ tra cứu bảo mật.  
• **Sao lưu & Khôi phục (Backup):** Tải bản backup Database SQLite định kỳ về máy tính lưu trữ an toàn, khôi phục dữ liệu 1-click khi cần thiết.  
• **Phân quyền áp dụng:** Chỉ Cấp 1 - Admin.

---

### PHẦN IV: DANH SÁCH CHI TIẾT 57 TÀI KHOẢN ĐĂNG NHẬP VÀ MẬT KHẨU

#### 1. CẤP 1 - ADMIN (3 TÀI KHOẢN CHÍNH THỨC TOÀN QUYỀN)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
${adminUsers.map((u, i) => `| ${i+1} | ${u.code} | **${u.username}** | **${u.fullname}** | ${u.dept_name || '-'} | ${u.pos_name || '-'} | \`${getPass(u.role_id, u.code)}\` |`).join('\n')}

#### 2. CẤP 2 - MANAGER (8 TÀI KHOẢN TRƯỞNG PHÒNG / QUẢN LÝ)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
${managerUsers.map((u, i) => `| ${i+1} | ${u.code} | **${u.username}** | **${u.fullname}** | ${u.dept_name || '-'} | ${u.pos_name || '-'} | \`${getPass(u.role_id, u.code)}\` |`).join('\n')}

#### 3. CẤP 3 - EMPLOYEE (46 TÀI KHOẢN NHÂN VIÊN)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
${employeeUsers.map((u, i) => `| ${i+1} | ${u.code} | **${u.username}** | **${u.fullname}** | ${u.dept_name || '-'} | ${u.pos_name || '-'} | \`${getPass(u.role_id, u.code)}\` |`).join('\n')}

#### 4. BẢNG TỔNG HỢP TOÀN BỘ 57 NHÂN SỰ CÔNG TY
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
${users.map((u, i) => `| ${i+1} | ${u.code} | **${u.username}** | **${u.fullname}** | ${u.dept_name || '-'} | ${u.pos_name || '-'} | \`${getPass(u.role_id, u.code)}\` |`).join('\n')}

---

### PHẦN V: KỊCH BẢN KIỂM TRA & NGHIỆM THU TÍNH NĂNG (TEST CASES)

| STT | Tài khoản Test | Phân quyền | Hạng mục kiểm tra thực tế | Kết quả mong đợi chuẩn |
| :---: | :--- | :---: | :--- | :--- |
| 1 | **vieta032**<br>(Trúc Xinh) | CẤP 1 - ADMIN | 1. Vào \`/payroll\` kiểm tra bảng lương<br>2. Vào \`/employees\` xem danh sách<br>3. Vào \`/attendance\` duyệt đơn<br>4. Vào \`/kpi\` chốt điểm tháng | ✓ Thấy 100% 57 nhân sự & 11 phòng ban<br>✓ Tính toán và xuất Excel lương toàn cty<br>✓ Duyệt đơn phép toàn bộ nhân viên<br>✓ Toàn quyền thiết lập & chốt KPI |
| 2 | **vieta036**<br>(Tấn Hưng) | CẤP 2 - MANAGER | 1. Vào \`/payroll\` xem lương phòng KD<br>2. Vào \`/payroll\` xem phiếu cá nhân<br>3. Thử xem lương phòng khác/BGĐ<br>4. Vào \`/kpi\` chấm điểm phòng KD | ✓ Thấy 7 nhân sự Phòng Kinh doanh<br>✓ Xem được phiếu lương của chính mình<br>🔒 Ẩn hoàn toàn lương Ban Giám Đốc & phòng khác<br>✓ Chấm điểm đúng 7 nhân sự kinh doanh |
| 3 | **vieta003**<br>(Thu Tâm) | CẤP 2 - MANAGER | 1. Vào \`/attendance\` chấm công kho<br>2. Vào \`/kpi\` chấm điểm tháng<br>3. Vào \`/payroll\` kiểm tra lương | ✓ Quản lý đúng 7 nhân sự Kho Cần Thơ<br>✓ Chấm điểm KPI đúng nhân viên kho<br>✓ Chỉ thấy bảng lương Kho Cần Thơ |
| 4 | **vieta004**<br>(Thúy Vy) | CẤP 3 - EMPLOYEE | 1. Vào \`/payroll\` xem bảng lương<br>2. Vào \`/attendance\` gửi đơn phép<br>3. Thử tìm menu \`/kpi\` và \`/employees\`<br>4. Vào \`/innovations\` gửi sáng kiến | ✓ Chỉ thấy duy nhất 1 phiếu lương của mình<br>✓ Gửi đơn phép thành công về Trưởng phòng<br>🔒 Ẩn hoàn toàn menu KPI & menu Hồ sơ nhân viên<br>✓ Gửi được sáng kiến ẩn danh/hiện danh |

---

### PHẦN VI: BIÊN BẢN KÝ NHẬN VÀ BÀN GIAO

*Hôm nay, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}, tại Văn phòng Công ty TNHH Thương mại Sản xuất Nệm Việt Á, hai bên thống nhất bàn giao và tiếp nhận toàn bộ hệ thống phần mềm Quản trị Nhân sự & Tiền lương (Viet A HRM), danh sách tài khoản, mật khẩu và ma trận phân quyền để đưa vào vận hành thử nghiệm.*

| ĐẠI DIỆN BÊN BÀN GIAO (IT) | ĐẠI DIỆN BÊN TIẾP NHẬN (PHÒNG HCNS) |
| :---: | :---: |
| *(Ký, ghi rõ họ tên)*<br><br><br><br><br>**Phan Tuấn Kiệt** | *(Ký, ghi rõ họ tên)*<br><br><br><br><br>**Huỳnh Thị Trúc Xinh** |
`;

  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`ĐÃ CẬP NHẬT THÀNH CÔNG FILE MARKDOWN: ${mdPath}`);
}

buildMasterDoc().then(() => {
  console.log('=== HOÀN TẤT XUẤT HỒ SƠ BÀN GIAO DUY NHẤT ===');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
