import { query } from './src/config/database.js';

async function seedClosedWorkflow() {
  const adminUser = await query.get('SELECT id, employee_id FROM users WHERE role_id = 1 LIMIT 1');
  const mgrUser = await query.get('SELECT id, employee_id FROM users WHERE role_id = 3 LIMIT 1');

  if (!adminUser) return;

  // 1. Check or insert DNDV-2026-0001
  let pur = await query.get('SELECT id FROM purchase_requests WHERE code = ?', ['DNDV-2026-0001']);
  if (!pur) {
    const res1 = await query.run(`
      INSERT INTO purchase_requests (
        code, user_id, employee_id, department, purpose, priority,
        total_estimated_amount, status, hod_approved_by, hod_approved_at, hod_comment,
        created_at, updated_at
      ) VALUES (
        'DNDV-2026-0001', ?, ?, 'Xưởng sản xuất nệm',
        'Bảo dưỡng hệ thống máy cắt mút tự động & gia công dao cắt CNC định kỳ Quý 3/2026',
        'KHANCAP', 15800000, 'APPROVED', ?, datetime('now', '-2 days'), 'Đồng ý duyệt dự toán bảo trì máy xưởng nệm',
        datetime('now', '-3 days'), datetime('now', '-2 days')
      )
    `, [mgrUser ? mgrUser.id : adminUser.id, mgrUser ? mgrUser.employee_id : adminUser.employee_id, adminUser.id]);
    pur = { id: res1.lastID };

    await query.run(`
      INSERT INTO purchase_request_items (request_id, service_name, supplier_name, due_date, amount, note)
      VALUES 
      (?, 'Bảo dưỡng & thay bộ dao cắt mút bọt khí tự động', 'Công ty Cơ khí Tân Phát', '2026-09-30', 9800000, 'Bảo hành 12 tháng'),
      (?, 'Gia công nhiệt & cân chỉnh trục CNC xưởng nệm', 'Xưởng Cơ khí Chính xác Minh Đức', '2026-10-02', 6000000, 'Đã kiểm tra kỹ thuật')
    `, [pur.id, pur.id]);
  }

  // 2. Check or insert DNTT-2026-0001
  let pay = await query.get('SELECT id FROM payment_requests WHERE code = ?', ['DNTT-2026-0001']);
  if (!pay) {
    const resPay = await query.run(`
      INSERT INTO payment_requests (
        code, purchase_request_id, user_id, employee_id, department,
        payment_content, total_amount, amount_in_words, payment_method,
        bank_name, bank_account_number, bank_account_holder, status,
        hod_approved_by, hod_approved_at, hod_comment,
        acc_approved_by, acc_approved_at, acc_comment,
        created_at, updated_at
      ) VALUES (
        'DNTT-2026-0001', ?, ?, ?, 'Xưởng sản xuất nệm',
        'Thanh toán chi phí bảo dưỡng máy cắt mút tự động & gia công trục CNC theo Giấy đề nghị DNDV-2026-0001',
        15800000, 'Mười lăm triệu tám trăm nghìn đồng chẵn', 'CHUYEN_KHOAN',
        'Vietcombank (VCB)', '0123456789012', 'CONG TY CO KHI TAN PHAT', 'PENDING_BOD',
        ?, datetime('now', '-1 days'), 'Đã kiểm tra nghiệm thu hoàn thành',
        ?, datetime('now', '-6 hours'), 'Đã đối soát Hóa đơn GTGT & Biên bản nghiệm thu đầy đủ',
        datetime('now', '-1 days'), datetime('now')
      )
    `, [pur.id, mgrUser ? mgrUser.id : adminUser.id, mgrUser ? mgrUser.employee_id : adminUser.employee_id, adminUser.id, adminUser.id]);
    pay = { id: resPay.lastID };

    await query.run(`
      INSERT INTO request_attachments (payment_request_id, purchase_request_id, file_type, file_name, file_url, file_size, uploaded_at)
      VALUES 
      (?, ?, 'HOA_DON_GTGT', 'Hoa_don_GTGT_TanPhat_9800k.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', '1.2 MB', datetime('now', '-1 days')),
      (?, ?, 'BIEN_BAN_NGHIEM_THU', 'Bien_ban_nghiem_thu_may_cat.jpg', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800', '850 KB', datetime('now', '-1 days')),
      (?, ?, 'BAO_GIA_HOP_DONG', 'Hop_dong_dich_vu_co_khi.pdf', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800', '2.4 MB', datetime('now', '-1 days'))
    `, [pay.id, pur.id, pay.id, pur.id, pay.id, pur.id]);
  }

  // 3. Phiếu DNDV-2026-0002 (Đang chờ duyệt)
  let pur2 = await query.get('SELECT id FROM purchase_requests WHERE code = ?', ['DNDV-2026-0002']);
  if (!pur2) {
    const res2 = await query.run(`
      INSERT INTO purchase_requests (
        code, user_id, employee_id, department, purpose, priority,
        total_estimated_amount, status, created_at, updated_at
      ) VALUES (
        'DNDV-2026-0002', ?, ?, 'Phòng Marketing',
        'Thuê gian hàng triển lãm VietBuild TP.HCM và in backdrop giới thiệu Nệm Cao Su Thiên Nhiên Việt Á',
        'BINHTHUONG', 24500000, 'PENDING_HOD', datetime('now', '-4 hours'), datetime('now')
      )
    `, [adminUser.id, adminUser.employee_id]);

    await query.run(`
      INSERT INTO purchase_request_items (request_id, service_name, supplier_name, due_date, amount, note)
      VALUES 
      (?, 'Thuê mặt bằng gian hàng tiêu chuẩn 36m2', 'Công ty Triển lãm Quốc tế VietBuild', '2026-10-15', 18000000, 'Khu A trung tâm'),
      (?, 'Thiết kế thi công backdrop & quầy trưng bày', 'Công ty Quảng cáo Sáng Tạo Mới', '2026-10-14', 6500000, 'Chất liệu fomex cao cấp')
    `, [res2.lastID, res2.lastID]);
  }

  console.log('Đã nạp thành công bộ dữ liệu mẫu 3 phần!');
}

seedClosedWorkflow().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
