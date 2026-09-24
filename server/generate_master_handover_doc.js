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
  console.log('--- Truy vấn 57 nhân sự từ cơ sở dữ liệu ---');

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
      spacing: { before: 260, after: 120 },
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
      spacing: { before: 160, after: 80 },
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

  function buildUserRows(userList, startIdx = 1, roleColor = "2563EB") {
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
      "✓ Xem toàn bộ 11 phòng ban/kho/xưởng\n✓ Xem 100% hồ sơ & hợp đồng nhân sự\n✓ Xem bảng chấm công toàn công ty\n✓ Xem toàn bộ điểm KPI các phòng ban\n✓ Xem 100% BẢNG LƯƠNG TOÀN CÔNG TY\n✓ Xem báo cáo thống kê & nhật ký audit log",
      "✓ Thêm, sửa, xóa hồ sơ nhân viên\n✓ Tạo, gia hạn & in hợp đồng lao động\n✓ Phê duyệt đơn nghỉ phép / OT toàn cty\n✓ Thiết lập chỉ tiêu & chốt điểm KPI tháng\n✓ TÍNH TOÁN, KHÓA & XUẤT BẢNG LƯƠNG\n✓ Quản trị tài khoản, phân quyền & sao lưu"
    ],
    [
      "CẤP 2 - MANAGER\n(Trưởng phòng / Quản lý)",
      "• 8 Quản lý:\n- Thu Tâm (Kho Cần Thơ)\n- Tuyết Hường (Kho Mỹ Tho)\n- Quốc Hùng (Kế toán)\n- Huy Hoàng (R&D)\n- Tấn Hưng (Kinh doanh)\n- Thái Cần (Xưởng gối)\n- Minh Lý (Xưởng nệm)\n- Bảo Châu (Kế toán xưởng)",
      "✓ Xem danh sách nhân viên phòng mình\n✓ Xem bảng chấm công phòng mình phụ trách\n✓ Xem chi tiết KPI nhân viên phòng mình\n✓ XEM BẢNG LƯƠNG NHÂN VIÊN PHÒNG MÌNH\n✓ Xem phiếu lương cá nhân của chính mình\n🔒 TUYỆT ĐỐI KHÔNG xem lương Ban Giám Đốc\n🔒 KHÔNG xem lương phòng ban khác",
      "✓ Điểm danh & chấm công nhân viên phòng mình\n✓ Phê duyệt đơn xin nghỉ phép / OT của cấp dưới\n✓ Chấm điểm & đánh giá % KPI tháng của nhân viên\n✓ Đề xuất khen thưởng / kỷ luật cho nhân viên\n✓ Tạo yêu cầu cấp phát & báo hỏng tài sản phòng"
    ],
    [
      "CẤP 3 - EMPLOYEE\n(Nhân viên)",
      "• Toàn bộ 46 nhân sự còn lại trong công ty",
      "✓ Xem thông tin hồ sơ của chính mình (Profile)\n✓ Xem lịch sử chấm công & ngày phép cá nhân\n✓ XEM DUY NHẤT PHIẾU LƯƠNG CÁ NHÂN\n✓ Xem Sơ đồ tổ chức\n✓ Xem Văn bản, quy định & tài sản được cấp\n🔒 TUYỆT ĐỐI KHÔNG xem KPI (của mình & người khác)\n🔒 KHÔNG xem danh sách nhân viên trong công ty\n🔒 ẨN 100% MỨC LƯƠNG CỦA TẤT CẢ NGƯỜI KHÁC",
      "✓ Thực hiện điểm danh chấm công hàng ngày\n✓ Gửi đơn xin nghỉ phép, đi muộn, làm thêm giờ\n✓ Gửi ý kiến đề xuất tại Hòm thư & Sáng kiến\n✓ Báo hỏng công cụ dụng cụ / tài sản được giao\n✓ Tự đổi mật khẩu tài khoản cá nhân"
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
    ["1", "vieta032\n(Trúc Xinh)", "CẤP 1\nADMIN", "1. Vào /payroll kiểm tra bảng lương\n2. Vào /employees xem danh sách\n3. Vào /attendance duyệt đơn", "✓ Thấy 100% 57 nhân sự & toàn bộ 11 phòng ban\n✓ Tính được bảng lương toàn công ty\n✓ Duyệt được tất cả đơn từ"],
    ["2", "vieta036\n(Tấn Hưng)", "CẤP 2\nMANAGER", "1. Vào /payroll xem lương phòng ban\n2. Vào /payroll xem phiếu cá nhân\n3. Thử xem lương phòng khác hoặc BGĐ", "✓ Thấy 7 nhân sự Phòng Kinh doanh\n✓ Xem được phiếu lương của chính mình\n🔒 Ẩn hoàn toàn lương Ban Giám Đốc và phòng khác"],
    ["3", "vieta003\n(Thu Tâm)", "CẤP 2\nMANAGER", "1. Vào /attendance chấm công\n2. Vào /kpi chấm điểm tháng\n3. Vào /payroll kiểm tra", "✓ Quản lý đúng 7 nhân sự Kho Cần Thơ\n✓ Chấm điểm KPI đúng nhân viên kho\n✓ Chỉ thấy bảng lương Kho Cần Thơ"],
    ["4", "vieta004\n(Thúy Vy)", "CẤP 3\nEMPLOYEE", "1. Vào /payroll xem bảng lương\n2. Vào /attendance gửi đơn phép\n3. Vào /employees xem danh bạ", "✓ Chỉ xuất hiện duy nhất 1 phiếu lương của mình\n✓ Gửi đơn phép thành công về Trưởng phòng\n🔒 Ẩn 100% mức lương người khác"],
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
    rows: [getTableHeaders("DC2626"), ...buildUserRows(adminUsers, 1, "DC2626")]
  });

  const managerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders("D97706"), ...buildUserRows(managerUsers, 1, "D97706")]
  });

  const employeeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders("2563EB"), ...buildUserRows(employeeUsers, 1, "2563EB")]
  });

  const fullTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [getTableHeaders("0284C7"), ...buildUserRows(users, 1, "0284C7")]
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
                text: "HỒ SƠ BÀN GIAO TOÀN DIỆN, MA TRẬN PHÂN QUYỀN, DANH SÁCH TÀI KHOẢN & HƯỚNG DẪN NGHIỆM THU",
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
          createBulletPoint("QUY TẮC MẬT KHẨU BẢO MẬT CAO: ", "Mỗi người có 1 mật khẩu riêng biệt (chữ HOA + chữ thường + số + ký tự đặc biệt). Không thể đoán mật khẩu của nhau."),

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
          createSectionTitle("PHẦN III: HƯỚNG DẪN SỬ DỤNG VÀ VẬN HÀNH NGHIỆP VỤ CHO PHÒNG HCNS"),
          
          createSubTitle("1. QUẢN LÝ HỒ SƠ NHÂN SỰ & TỰ ĐỘNG IN HỢP ĐỒNG LAO ĐỘNG (/employees, /contracts)", "0284C7"),
          createBulletPoint("Hồ sơ nhân sự (/employees): ", "Theo dõi danh sách 57 nhân sự, lọc theo 11 phòng ban, cập nhật thông tin cá nhân, CCCD, ngày sinh, chức danh và mức lương ngạch bậc chuẩn."),
          createBulletPoint("📄 Tự động in Hợp đồng lao động chuẩn (/contracts): ", "Vào menu 'Hợp đồng lao động' hoặc chọn nhân viên cụ thể -> Bấm 'In Hợp đồng'. Hệ thống tự động trích xuất đầy đủ thông tin: Họ tên, CMND/CCCD, địa chỉ, ngạch bậc lương, phụ cấp, người đại diện theo pháp luật và xuất ra file Word (.docx) hoặc in trực tiếp PDF chuẩn theo quy chế lao động công ty."),

          createSubTitle("2. CHẤM CÔNG, QUẢN LÝ NGHỈ PHÉP & LÀM THÊM GIỜ (/attendance)", "0284C7"),
          createBulletPoint("Bảng chấm công tổng hợp: ", "Theo dõi dữ liệu 26 ngày công chuẩn theo từng tháng, tự động tính số ngày làm việc thực tế, số ngày nghỉ phép năm, nghỉ không lương, giờ đi muộn/về sớm."),
          createBulletPoint("Phê duyệt đơn từ trực tuyến: ", "Vào tab 'Đơn xin nghỉ phép / Đi muộn / OT' -> Quản lý hoặc HCNS bấm Duyệt (Approve) hoặc Từ chối (Reject) kèm lý do phản hồi cho nhân viên."),
          createBulletPoint("Chốt công tháng: ", "Bấm nút 'Đồng bộ bảng công' trước khi tính lương để tự động chuyển số ngày công thực tế và giờ OT sang phân hệ Tính lương."),

          createSubTitle("3. QUẢN LÝ KPI & ĐÁNH GIÁ THÁNG (/kpi)", "0284C7"),
          createBulletPoint("Thiết lập hạn mức KPI: ", "Chọn tháng/năm cần đánh giá (ví dụ: Tháng 08/2026), thiết lập mức thưởng trách nhiệm định mức theo chức danh (1.000.000đ, 2.000.000đ,...)."),
          createBulletPoint("Chấm điểm & Tự động tính tiền: ", "Trưởng phòng hoặc HCNS chấm điểm theo tỷ lệ % hoàn thành (100%, 80%, 50%,...) -> Hệ thống tự động tính tiền Thưởng trách nhiệm thực nhận và Thưởng hiệu suất (Performance Bonus)."),

          createSubTitle("4. TÍNH TOÁN, DUYỆT & XUẤT BẢNG LƯƠNG (/payroll)", "0284C7"),
          createBulletPoint("Bước 1 - Chọn kỳ lương: ", "Chọn Tháng và Năm cần lập bảng lương trên thanh công cụ."),
          createBulletPoint("Bước 2 - Tính lương tự động: ", "Bấm 'Tính lương tự động' -> Hệ thống lấy 100% dữ liệu gốc: Lương ngạch bậc theo ngày công + Tiền OT (x1.5) + Tiền KPI + Phụ cấp ăn/điện thoại - BHXH (10.5%) - Công đoàn (1%) - Tạm ứng/Giảm trừ."),
          createBulletPoint("Bước 3 - Xuất Báo cáo: ", "Bấm 'Xuất Bảng Lương Excel' để lưu trữ hoặc trình Ban Giám Đốc phê duyệt; Bấm 'Gửi phiếu lương' để nhân viên tự tra cứu trên tài khoản cá nhân."),

          createSubTitle("5. 💡 HÒM THƯ & SÁNG KIẾN CẢI TIẾN SẢN XUẤT (/innovations)", "0284C7"),
          createBulletPoint("Mục đích: ", "Khuyến khích công nhân viên tại các xưởng sản xuất, kho bãi và văn phòng đóng góp các ý tưởng cải tiến kỹ thuật, tiết kiệm nguyên vật liệu, tối ưu quy trình làm việc."),
          createBulletPoint("Nhân viên gửi sáng kiến: ", "Nhân viên gửi ý tưởng kèm mô tả hiệu quả dự kiến (tiết kiệm chi phí, tăng năng suất, an toàn lao động), có thể đính kèm tài liệu/hình ảnh và chọn chế độ Gửi ẩn danh hoặc Công khai."),
          createBulletPoint("Thẩm định & Duyệt thưởng: ", "Ban Giám Đốc và Phòng HCNS tiếp nhận đề xuất, đánh giá tính khả thi và duyệt mức Thưởng sáng kiến -> Số tiền thưởng tự động được cộng vào kỳ lương của nhân viên."),

          createSubTitle("6. 📦 QUẢN LÝ TÀI SẢN & CÔNG CỤ DỤNG CỤ (CCDC) (/assets)", "0284C7"),
          createBulletPoint("Quản lý danh mục tài sản: ", "Theo dõi danh mục máy móc xưởng nệm/gối, xe tải giao hàng kho Cần Thơ/Mỹ Tho, máy tính văn phòng, tình trạng sử dụng, thời gian khấu hao và giá trị còn lại."),
          createBulletPoint("Theo dõi cấp phát: ", "Gán tài sản/công cụ cho từng nhân viên hoặc từng phòng ban phụ trách chịu trách nhiệm quản lý."),
          createBulletPoint("Xử lý phiếu báo hỏng: ", "Nhân viên tạo phiếu báo hỏng tài sản trực tuyến khi gặp sự cố; Trưởng phòng và Bộ phận kỹ thuật tiếp nhận xử lý, cập nhật chi phí sửa chữa và thời gian hoàn thành."),

          createSubTitle("7. 🏆 KHEN THƯỞNG & KỶ LUẬT ĐỒNG BỘ BẢNG LƯƠNG (/rewards)", "0284C7"),
          createBulletPoint("Ban hành Khen thưởng: ", "Lập quyết định khen thưởng cá nhân/tập thể xuất sắc, khen thưởng đột xuất kèm số tiền thưởng -> Tự động cộng vào cột Thưởng khác trên Bảng lương."),
          createBulletPoint("Ghi nhận Kỷ luật: ", "Ghi nhận các biên bản vi phạm nội quy, đi muộn, vi phạm an toàn lao động kèm số tiền phạt -> Tự động trừ vào cột Giảm trừ kỷ luật trên Bảng lương."),

          createSubTitle("8. 🌳 SƠ ĐỒ TỔ CHỨC ĐỘNG & DANH BẠ CÔNG TY (/settings/departments-positions, /employees)", "0284C7"),
          createBulletPoint("Trực quan hóa bộ máy: ", "Hiển thị cây phả hệ tổ chức toàn diện từ Ban Giám Đốc -> Khối Văn phòng, Kho Cần Thơ, Kho Mỹ Tho, Xưởng Nệm, Xưởng Gối, Phòng Kinh doanh, Phòng Marketing."),
          createBulletPoint("Cơ cấu nhân sự: ", "Xem nhanh số lượng nhân sự, danh sách chức danh và nhân viên trực thuộc từng phòng ban theo thời gian thực."),

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
    console.log(`ĐÃ XUẤT THÀNH CÔNG FILE BÀN GIAO DUY NHẤT: ${masterPath}`);
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
}

buildMasterDoc().then(() => {
  console.log('=== HOÀN TẤT XUẤT HỒ SƠ BÀN GIAO DUY NHẤT ===');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
