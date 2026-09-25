import { query } from './src/config/database.js';

async function seedPaymentRequests() {
  const count = await query.get('SELECT COUNT(*) as total FROM payment_requests');
  if (count.total === 0) {
    const adminUser = await query.get('SELECT id, employee_id FROM users WHERE role_id = 1 LIMIT 1');
    const mgrUser = await query.get('SELECT id, employee_id FROM users WHERE role_id = 3 LIMIT 1');

    if (adminUser) {
      // 1. Mẫu 01/ĐN-DV (Mua dịch vụ)
      const res1 = await query.run(`
        INSERT INTO payment_requests (
          code, user_id, employee_id, type, department, reason, priority,
          total_amount, amount_in_words, payment_method, attachments, attached_documents,
          status, hod_approved_by, hod_approved_at, hod_comment, created_at, updated_at
        ) VALUES (
          'DNDV-202609-001', ?, ?, 'SERVICE_PURCHASE', 'Xưởng sản xuất nệm',
          'Đề nghị bảo dưỡng định kỳ hệ thống máy cắt mút xốp và thuê xe tải giao hàng đại lý Cần Thơ',
          'KHANCAP', 8500000, 'Tám triệu năm trăm nghìn đồng chẵn', 'BANK_TRANSFER',
          '[]', '["Báo giá của nhà cung cấp", "Hợp đồng kinh tế / Đơn đặt hàng"]',
          'PENDING_ACCOUNTANT', ?, datetime('now', '-2 hours'), 'Đồng ý cho bảo dưỡng máy gấp phục vụ sản xuất',
          datetime('now', '-1 days'), datetime('now')
        )
      `, [mgrUser ? mgrUser.id : adminUser.id, mgrUser ? mgrUser.employee_id : adminUser.employee_id, adminUser.id]);

      await query.run(`
        INSERT INTO request_items (request_id, item_name, provider, expected_date, amount, purpose, note)
        VALUES 
        (?, 'Bảo dưỡng & thay lưỡi máy cắt mút tự động', 'Công ty Cơ khí Tân Phát', '2026-09-28', 5500000, 'Phục vụ xưởng sản xuất nệm', 'Bảo hành 6 tháng'),
        (?, 'Thuê xe tải 3.5 tấn vận chuyển nệm Cần Thơ', 'Chành xe Thành Bưởi', '2026-09-29', 3000000, 'Giao hàng đại lý', 'Chuyến 1 chiều')
      `, [res1.lastID, res1.lastID]);

      // 2. Mẫu 02/ĐNTT-VA (Đề nghị thanh toán)
      await query.run(`
        INSERT INTO payment_requests (
          code, user_id, employee_id, type, department, reason, priority,
          total_amount, amount_in_words, payment_method, bank_name, bank_account_number, bank_account_name,
          attachments, attached_documents, status, hod_approved_by, hod_approved_at, hod_comment,
          acc_approved_by, acc_approved_at, acc_comment, dir_approved_by, dir_approved_at, dir_comment,
          created_at, updated_at
        ) VALUES (
          'DNTT-202609-001', ?, ?, 'PAYMENT_REQUEST', 'Khối văn phòng',
          'Thanh toán chi phí in ấn catalogue sản phẩm Nệm Cao Su Việt Á và quà tặng đối tác Quý 3/2026',
          'BINHTHUONG', 12800000, 'Mười hai triệu tám trăm nghìn đồng chẵn', 'BANK_TRANSFER',
          'Vietcombank (VCB)', '0123456789012', 'CONG TY IN AN QUANG MINH',
          '[]', '["Hóa đơn Giá trị gia tăng (GTGT)", "Biên bản nghiệm thu / Bàn giao"]',
          'APPROVED', ?, datetime('now', '-3 days'), 'Hồ sơ đầy đủ',
          ?, datetime('now', '-2 days'), 'Đã kiểm tra chứng từ GTGT hợp lệ',
          ?, datetime('now', '-1 days'), 'Duyệt chi theo hạn mức Quý 3',
          datetime('now', '-4 days'), datetime('now')
        )
      `, [adminUser.id, adminUser.employee_id, adminUser.id, adminUser.id, adminUser.id]);
    }
    console.log('Đã tạo dữ liệu mẫu thành công cho module Đề xuất & Phê duyệt.');
  }
}

seedPaymentRequests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
