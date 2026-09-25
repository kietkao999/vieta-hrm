import { query } from '../config/database.js';
import { logAudit } from '../middleware/audit.js';
import { numberToVietnameseWords } from '../utils/numberToVietnameseWords.js';

/**
 * Tự động tạo mã đề xuất theo chuẩn:
 * DNDV-YYYY-0001 (Đề nghị mua dịch vụ - Phần 1)
 * DNTT-YYYY-0001 (Đề nghị thanh toán - Phần 3)
 */
async function generateCode(type) {
  const prefix = type === 'PURCHASE' ? 'DNDV' : 'DNTT';
  const year = new Date().getFullYear();
  const codePrefix = `${prefix}-${year}-`;

  const table = type === 'PURCHASE' ? 'purchase_requests' : 'payment_requests';
  const lastRecord = await query.get(
    `SELECT code FROM ${table} WHERE code LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${codePrefix}%`]
  );

  let seq = 1;
  if (lastRecord && lastRecord.code) {
    const parts = lastRecord.code.split('-');
    if (parts.length >= 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }
  }

  return `${codePrefix}${String(seq).padStart(4, '0')}`;
}

// ==========================================
// 1. PHẦN 1: GIẤY ĐỀ NGHỊ MUA DỊCH VỤ (Mẫu 01/ĐN-DV)
// ==========================================

export const createPurchaseRequest = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const {
      department,
      approver_department,
      target_approver_id,
      purpose,
      priority = 'BINHTHUONG',
      items = [],
      attachments = []
    } = req.body;

    if (!purpose || !purpose.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập lý do / mục đích đề nghị mua dịch vụ.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Vui lòng nhập ít nhất 1 hạng mục dịch vụ cần mua.' });
    }

    const dept = (department && department.trim()) || req.user.departmentName || 'Chung';
    const approverDept = (approver_department && approver_department.trim()) || dept;
    const totalEstimated = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);

    if (totalEstimated <= 0) {
      return res.status(400).json({ message: 'Tổng chi phí ước tính phải lớn hơn 0 VNĐ.' });
    }

    const code = await generateCode('PURCHASE');
    const nowIso = new Date().toISOString();

    const insertResult = await query.run(
      `INSERT INTO purchase_requests (
        code, user_id, employee_id, department, approver_department, target_approver_id,
        purpose, priority, total_estimated_amount, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_HOD', ?, ?)`,
      [
        code,
        req.user.userId,
        req.user.employeeId || null,
        dept,
        approverDept,
        target_approver_id || null,
        purpose.trim(),
        priority,
        totalEstimated,
        nowIso,
        nowIso
      ]
    );

    const purchaseId = insertResult.lastID;

    // Lưu các mục chi tiết
    for (const it of items) {
      if (it.service_name && it.service_name.trim()) {
        await query.run(
          `INSERT INTO purchase_request_items (
            request_id, service_name, supplier_name, due_date, amount, note
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            purchaseId,
            it.service_name.trim(),
            it.supplier_name || '',
            it.due_date || '',
            parseFloat(it.amount) || 0,
            it.note || ''
          ]
        );
      }
    }

    // Lưu các file đính kèm nếu có
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        await query.run(
          `INSERT INTO request_attachments (
            purchase_request_id, file_type, file_name, file_url, file_size, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            purchaseId,
            att.file_type || 'BAO_GIA_HOP_DONG',
            att.file_name || 'File đính kèm',
            att.file_url,
            att.file_size || '',
            nowIso
          ]
        );
      }
    }

    await logAudit(
      req.user.userId,
      req.user.username,
      'Tạo Giấy đề nghị mua dịch vụ (Mẫu 01/ĐN-DV)',
      ip,
      `Mã phiếu: ${code} - Gửi duyệt: ${approverDept} - Dự toán: ${totalEstimated.toLocaleString('vi-VN')} VNĐ`
    );

    const created = await getPurchaseRequestDetail(purchaseId);
    return res.status(201).json({
      message: 'Tạo Giấy đề nghị mua dịch vụ thành công.',
      data: created
    });
  } catch (error) {
    console.error('Lỗi khi tạo đề nghị mua dịch vụ:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo đề nghị mua dịch vụ.', error: error.message });
  }
};

export const getPurchaseRequests = async (req, res) => {
  try {
    const {
      status,
      department,
      priority,
      search,
      tab = 'all',
      limit = 100,
      offset = 0
    } = req.query;

    const userRole = req.user.roleName;
    const userId = req.user.userId;
    const userDept = req.user.departmentName;

    let whereConditions = [];
    let params = [];

    if (userRole === 'EMPLOYEE' || tab === 'my_requests') {
      whereConditions.push('pr.user_id = ?');
      params.push(userId);
    } else if (userRole === 'MANAGER' && tab !== 'all') {
      if (tab === 'to_approve') {
        whereConditions.push("(pr.status = 'PENDING_HOD' AND (pr.approver_department = ? OR (pr.approver_department IS NULL AND pr.department = ?) OR pr.target_approver_id = ?))");
        params.push(userDept, userDept, userId);
      } else {
        whereConditions.push('(pr.user_id = ? OR pr.department = ? OR pr.approver_department = ? OR pr.target_approver_id = ?)');
        params.push(userId, userDept, userDept, userId);
      }
    }

    if (status && status !== 'ALL') {
      whereConditions.push('pr.status = ?');
      params.push(status);
    }

    if (department && department !== 'ALL') {
      whereConditions.push('(pr.department = ? OR pr.approver_department = ?)');
      params.push(department, department);
    }

    if (priority && priority !== 'ALL') {
      whereConditions.push('pr.priority = ?');
      params.push(priority);
    }

    if (search && search.trim()) {
      whereConditions.push('(pr.code LIKE ? OR pr.purpose LIKE ? OR e.fullname LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        pr.*,
        u.username as creator_username,
        e.fullname as creator_name,
        e.code as creator_emp_code,
        e.avatar as creator_avatar,
        p.name as creator_position,
        (SELECT COUNT(*) FROM purchase_request_items WHERE request_id = pr.id) as item_count,
        (SELECT COUNT(*) FROM request_attachments WHERE purchase_request_id = pr.id) as attachment_count,
        (SELECT id FROM payment_requests WHERE purchase_request_id = pr.id LIMIT 1) as linked_payment_id,
        (SELECT code FROM payment_requests WHERE purchase_request_id = pr.id LIMIT 1) as linked_payment_code,
        (SELECT status FROM payment_requests WHERE purchase_request_id = pr.id LIMIT 1) as linked_payment_status,
        hod_u.username as hod_username, hod_e.fullname as hod_fullname,
        rej_u.username as rej_username, rej_e.fullname as rej_fullname
      FROM purchase_requests pr
      JOIN users u ON pr.user_id = u.id
      LEFT JOIN employees e ON pr.employee_id = e.id OR u.employee_id = e.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN users hod_u ON pr.hod_approved_by = hod_u.id
      LEFT JOIN employees hod_e ON hod_u.employee_id = hod_e.id
      LEFT JOIN users rej_u ON pr.rejected_by = rej_u.id
      LEFT JOIN employees rej_e ON rej_u.employee_id = rej_e.id
      ${whereSql}
      ORDER BY 
        CASE pr.priority WHEN 'KHANCAP' THEN 1 WHEN 'BINHTHUONG' THEN 2 ELSE 3 END,
        pr.id DESC
      LIMIT ? OFFSET ?
    `;

    const records = await query.all(sql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    // Nạp đầy đủ danh mục items và attachments cho mỗi phiếu đề nghị mua
    for (const r of records) {
      r.items = await query.all('SELECT * FROM purchase_request_items WHERE request_id = ? ORDER BY id ASC', [r.id]);
      r.attachments = await query.all('SELECT * FROM request_attachments WHERE purchase_request_id = ? ORDER BY id ASC', [r.id]);
    }

    return res.json({
      data: records,
      total: records.length
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề nghị mua dịch vụ:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách đề nghị mua dịch vụ.', error: error.message });
  }
};

export const getPurchaseRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await getPurchaseRequestDetail(id);
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đề nghị mua dịch vụ.' });
    }

    if (req.user.roleName === 'EMPLOYEE' && record.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem phiếu đề nghị của người khác.' });
    }

    return res.json({ data: record });
  } catch (error) {
    console.error('Lỗi lấy chi tiết đề nghị mua dịch vụ:', error);
    return res.status(500).json({ message: 'Lỗi lấy chi tiết phiếu.', error: error.message });
  }
};

export const approvePurchaseRequest = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const { id } = req.params;
    const { comment = '' } = req.body;
    const userRole = req.user.roleName;
    const userId = req.user.userId;
    const userDept = req.user.departmentName;

    const request = await query.get('SELECT * FROM purchase_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đề nghị mua dịch vụ.' });
    }

    // Kiểm tra quyền duyệt: Admin hoặc Trưởng phòng nhận duyệt hoặc Trưởng phòng ban người tạo
    const targetDept = request.approver_department || request.department;
    const isAuthorized =
      userRole === 'ADMIN' ||
      (userRole === 'MANAGER' && (userDept === targetDept || userDept === request.department || userId === request.target_approver_id));

    if (!isAuthorized) {
      return res.status(403).json({
        message: `Chỉ Trưởng phòng ban được chỉ định duyệt (${targetDept}) hoặc Ban Giám Đốc mới có quyền duyệt phiếu này.`
      });
    }

    const nowIso = new Date().toISOString();
    await query.run(
      `UPDATE purchase_requests SET 
        status = 'APPROVED',
        hod_approved_by = ?,
        hod_approved_at = ?,
        hod_comment = ?,
        updated_at = ?
      WHERE id = ?`,
      [userId, nowIso, comment.trim(), nowIso, id]
    );

    await logAudit(
      userId,
      req.user.username,
      'Phê duyệt Giấy đề nghị mua dịch vụ (Mẫu 01/ĐN-DV)',
      ip,
      `Mã phiếu: ${request.code} - Ý kiến: ${comment || 'Đã đồng ý chủ trương'}`
    );

    const updated = await getPurchaseRequestDetail(id);
    return res.json({
      message: 'Đã phê duyệt chủ trương mua dịch vụ thành công. Giờ đây có thể tạo Giấy đề nghị thanh toán.',
      data: updated
    });
  } catch (error) {
    console.error('Lỗi duyệt đề nghị mua dịch vụ:', error);
    return res.status(500).json({ message: 'Lỗi khi duyệt phiếu.', error: error.message });
  }
};

export const rejectPurchaseRequest = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Vui lòng cung cấp lý do từ chối.' });
    }

    const request = await query.get('SELECT * FROM purchase_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đề nghị mua dịch vụ.' });
    }

    if (req.user.roleName === 'EMPLOYEE') {
      return res.status(403).json({ message: 'Bạn không có quyền từ chối phiếu.' });
    }

    const nowIso = new Date().toISOString();
    await query.run(
      `UPDATE purchase_requests SET 
        status = 'REJECTED',
        rejection_reason = ?,
        rejected_by = ?,
        rejected_at = ?,
        updated_at = ?
      WHERE id = ?`,
      [reason.trim(), req.user.userId, nowIso, nowIso, id]
    );

    await logAudit(
      req.user.userId,
      req.user.username,
      'Từ chối Giấy đề nghị mua dịch vụ',
      ip,
      `Mã phiếu: ${request.code} - Lý do: ${reason}`
    );

    const updated = await getPurchaseRequestDetail(id);
    return res.json({ message: 'Đã từ chối phiếu đề nghị.', data: updated });
  } catch (error) {
    console.error('Lỗi từ chối đề nghị mua dịch vụ:', error);
    return res.status(500).json({ message: 'Lỗi khi từ chối phiếu.', error: error.message });
  }
};

export const deletePurchaseRequest = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const { id } = req.params;
    const request = await query.get('SELECT * FROM purchase_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu.' });
    }

    if (req.user.roleName !== 'ADMIN') {
      if (request.user_id !== req.user.userId) {
        return res.status(403).json({ message: 'Bạn chỉ có thể xóa phiếu của chính mình.' });
      }
      if (request.status !== 'PENDING_HOD') {
        return res.status(400).json({ message: 'Không thể xóa phiếu đã được phê duyệt.' });
      }
    }

    await query.run('DELETE FROM purchase_request_items WHERE request_id = ?', [id]);
    await query.run('DELETE FROM request_attachments WHERE purchase_request_id = ?', [id]);
    await query.run('DELETE FROM purchase_requests WHERE id = ?', [id]);

    await logAudit(req.user.userId, req.user.username, 'Xóa Giấy đề nghị mua dịch vụ', ip, `Mã phiếu: ${request.code}`);
    return res.json({ message: 'Đã xóa phiếu đề nghị thành công.' });
  } catch (error) {
    console.error('Lỗi khi xóa phiếu đề nghị:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa phiếu.', error: error.message });
  }
};

// ==========================================
// 2. PHẦN 3: GIẤY ĐỀ NGHỊ THANH TOÁN (Mẫu 02/ĐNTT-VA)
// ==========================================

export const createPaymentRequest = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const {
      purchase_request_id = null,
      department,
      approver_department,
      target_approver_id,
      payment_content,
      total_amount,
      payment_method = 'CHUYEN_KHOAN',
      bank_name,
      bank_account_number,
      bank_account_holder,
      attachments = []
    } = req.body;

    if (!payment_content || !payment_content.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập nội dung đề nghị thanh toán.' });
    }

    const amountNum = parseFloat(total_amount) || 0;
    if (amountNum <= 0) {
      return res.status(400).json({ message: 'Số tiền thanh toán phải lớn hơn 0 VNĐ.' });
    }

    if (payment_method === 'CHUYEN_KHOAN' && (!bank_account_number || !bank_account_holder)) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Số tài khoản và Tên chủ tài khoản thụ hưởng.' });
    }

    const dept = (department && department.trim()) || req.user.departmentName || 'Chung';
    const approverDept = (approver_department && approver_department.trim()) || dept;
    const code = await generateCode('PAYMENT');
    const amountInWords = numberToVietnameseWords(amountNum);
    const nowIso = new Date().toISOString();

    const insertResult = await query.run(
      `INSERT INTO payment_requests (
        code, purchase_request_id, user_id, employee_id, department,
        approver_department, target_approver_id, payment_content, total_amount,
        amount_in_words, payment_method, bank_name, bank_account_number,
        bank_account_holder, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_HOD', ?, ?)`,
      [
        code,
        purchase_request_id || null,
        req.user.userId,
        req.user.employeeId || null,
        dept,
        approverDept,
        target_approver_id || null,
        payment_content.trim(),
        amountNum,
        amountInWords,
        payment_method,
        bank_name || '',
        bank_account_number || '',
        bank_account_holder || '',
        nowIso,
        nowIso
      ]
    );

    const paymentId = insertResult.lastID;

    // Lưu các hóa đơn / chứng từ Phần 2 đính kèm
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        await query.run(
          `INSERT INTO request_attachments (
            payment_request_id, purchase_request_id, file_type, file_name, file_url, file_size, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            paymentId,
            purchase_request_id || null,
            att.file_type || 'HOA_DON_GTGT',
            att.file_name || 'Hóa đơn / Chứng từ',
            att.file_url,
            att.file_size || '',
            nowIso
          ]
        );
      }
    }

    await logAudit(
      req.user.userId,
      req.user.username,
      'Tạo Giấy đề nghị thanh toán (Mẫu 02/ĐNTT-VA)',
      ip,
      `Mã phiếu: ${code} - Gửi duyệt: ${approverDept} - Số tiền: ${amountNum.toLocaleString('vi-VN')} VNĐ`
    );

    const created = await getPaymentRequestDetail(paymentId);
    return res.status(201).json({
      message: 'Tạo Giấy đề nghị thanh toán thành công.',
      data: created
    });
  } catch (error) {
    console.error('Lỗi khi tạo đề nghị thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo đề nghị thanh toán.', error: error.message });
  }
};

export const getPaymentRequests = async (req, res) => {
  try {
    const {
      status,
      department,
      search,
      tab = 'all',
      limit = 100,
      offset = 0
    } = req.query;

    const userRole = req.user.roleName;
    const userId = req.user.userId;
    const userDept = req.user.departmentName;

    let whereConditions = [];
    let params = [];

    if (userRole === 'EMPLOYEE' || tab === 'my_requests') {
      whereConditions.push('pay.user_id = ?');
      params.push(userId);
    } else if (userRole === 'MANAGER' && tab !== 'all') {
      if (tab === 'to_approve') {
        whereConditions.push("(pay.status = 'PENDING_HOD' AND (pay.approver_department = ? OR (pay.approver_department IS NULL AND pay.department = ?) OR pay.target_approver_id = ?))");
        params.push(userDept, userDept, userId);
      } else {
        whereConditions.push('(pay.user_id = ? OR pay.department = ? OR pay.approver_department = ? OR pay.target_approver_id = ?)');
        params.push(userId, userDept, userDept, userId);
      }
    }

    if (status && status !== 'ALL') {
      whereConditions.push('pay.status = ?');
      params.push(status);
    }

    if (department && department !== 'ALL') {
      whereConditions.push('(pay.department = ? OR pay.approver_department = ?)');
      params.push(department, department);
    }

    if (search && search.trim()) {
      whereConditions.push('(pay.code LIKE ? OR pay.payment_content LIKE ? OR e.fullname LIKE ? OR pay.bank_account_holder LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        pay.*,
        u.username as creator_username,
        e.fullname as creator_name,
        e.code as creator_emp_code,
        e.avatar as creator_avatar,
        p.name as creator_position,
        pr.code as purchase_code,
        pr.purpose as purchase_purpose,
        (SELECT COUNT(*) FROM request_attachments WHERE payment_request_id = pay.id) as attachment_count,
        hod_u.username as hod_username, hod_e.fullname as hod_fullname,
        acc_u.username as acc_username, acc_e.fullname as acc_fullname,
        bod_u.username as bod_username, bod_e.fullname as bod_fullname,
        paid_u.username as paid_username, paid_e.fullname as paid_fullname,
        rej_u.username as rej_username, rej_e.fullname as rej_fullname
      FROM payment_requests pay
      JOIN users u ON pay.user_id = u.id
      LEFT JOIN employees e ON pay.employee_id = e.id OR u.employee_id = e.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN purchase_requests pr ON pay.purchase_request_id = pr.id
      LEFT JOIN users hod_u ON pay.hod_approved_by = hod_u.id
      LEFT JOIN employees hod_e ON hod_u.employee_id = hod_e.id
      LEFT JOIN users acc_u ON pay.acc_approved_by = acc_u.id
      LEFT JOIN employees acc_e ON acc_u.employee_id = acc_e.id
      LEFT JOIN users bod_u ON pay.bod_approved_by = bod_u.id
      LEFT JOIN employees bod_e ON bod_u.employee_id = bod_e.id
      LEFT JOIN users paid_u ON pay.paid_by = paid_u.id
      LEFT JOIN employees paid_e ON paid_u.employee_id = paid_e.id
      LEFT JOIN users rej_u ON pay.rejected_by = rej_u.id
      LEFT JOIN employees rej_e ON rej_u.employee_id = rej_e.id
      ${whereSql}
      ORDER BY pay.id DESC
      LIMIT ? OFFSET ?
    `;

    const records = await query.all(sql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    // Nạp danh sách chứng từ đính kèm cho mỗi phiếu thanh toán
    for (const r of records) {
      r.attachments = await query.all('SELECT * FROM request_attachments WHERE payment_request_id = ? ORDER BY id ASC', [r.id]);
    }

    return res.json({
      data: records,
      total: records.length
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề nghị thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách thanh toán.', error: error.message });
  }
};

export const getPaymentRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await getPaymentRequestDetail(id);
    if (!record) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu đề nghị thanh toán.' });
    }

    if (req.user.roleName === 'EMPLOYEE' && record.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xem phiếu thanh toán của người khác.' });
    }

    return res.json({ data: record });
  } catch (error) {
    console.error('Lỗi lấy chi tiết đề nghị thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi lấy chi tiết phiếu.', error: error.message });
  }
};

export const approvePaymentRequest = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const { id } = req.params;
    const { comment = '', isPayment = false, paymentProof = '' } = req.body;
    const userRole = req.user.roleName;
    const userId = req.user.userId;
    const userDept = req.user.departmentName;

    const request = await query.get('SELECT * FROM payment_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ message: 'Phiếu thanh toán không tồn tại.' });
    }

    if (request.status === 'REJECTED') {
      return res.status(400).json({ message: 'Phiếu này đã bị từ chối.' });
    }
    if (request.status === 'PAID') {
      return res.status(400).json({ message: 'Phiếu này đã hoàn tất chi tiền.' });
    }

    const nowIso = new Date().toISOString();
    let nextStatus = request.status;
    let updateFields = [];
    let updateParams = [];

    const targetDept = request.approver_department || request.department;

    if (isPayment || (request.status === 'PENDING_BOD' && userRole === 'ADMIN' && req.body.directPay)) {
      nextStatus = 'PAID';
      updateFields.push('status = ?', 'paid_by = ?', 'paid_at = ?', 'payment_proof = ?', 'updated_at = ?');
      updateParams.push(nextStatus, userId, nowIso, paymentProof || '', nowIso);
    } else if (request.status === 'PENDING_HOD') {
      // Cần Trưởng phòng hoặc ADMIN
      const isAuthorized =
        userRole === 'ADMIN' ||
        (userRole === 'MANAGER' && (userDept === targetDept || userDept === request.department || userId === request.target_approver_id));

      if (!isAuthorized) {
        return res.status(403).json({ message: `Chỉ Trưởng phòng ban được chỉ định duyệt (${targetDept}) hoặc Ban Giám Đốc mới có quyền duyệt cấp 1.` });
      }
      nextStatus = 'PENDING_ACC';
      updateFields.push('status = ?', 'hod_approved_by = ?', 'hod_approved_at = ?', 'hod_comment = ?', 'updated_at = ?');
      updateParams.push(nextStatus, userId, nowIso, comment.trim(), nowIso);
    } else if (request.status === 'PENDING_ACC') {
      // Cần Kế toán hoặc ADMIN
      if (!['ADMIN', 'HR'].includes(userRole) && userDept !== 'Khối văn phòng' && userDept !== 'Phòng Kế toán') {
        return res.status(403).json({ message: 'Chỉ Phòng Kế toán hoặc Ban Quản trị mới có quyền thẩm định tài chính cấp 2.' });
      }
      nextStatus = 'PENDING_BOD';
      updateFields.push('status = ?', 'acc_approved_by = ?', 'acc_approved_at = ?', 'acc_comment = ?', 'updated_at = ?');
      updateParams.push(nextStatus, userId, nowIso, comment.trim(), nowIso);
    } else if (request.status === 'PENDING_BOD') {
      // Cần Ban Giám Đốc (ADMIN)
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Chỉ Ban Giám Đốc (Cấp 1 - ADMIN) mới có quyền duyệt chi tối cao.' });
      }
      nextStatus = 'PAID';
      updateFields.push('status = ?', 'bod_approved_by = ?', 'bod_approved_at = ?', 'bod_comment = ?', 'paid_by = ?', 'paid_at = ?', 'updated_at = ?');
      updateParams.push(nextStatus, userId, nowIso, comment.trim(), userId, nowIso, nowIso);
    }

    updateParams.push(id);
    await query.run(`UPDATE payment_requests SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);

    await logAudit(
      userId,
      req.user.username,
      'Phê duyệt Giấy đề nghị thanh toán',
      ip,
      `Mã phiếu: ${request.code} - Chuyển sang: ${nextStatus}`
    );

    const updated = await getPaymentRequestDetail(id);
    return res.json({
      message: `Đã duyệt thành công. Trạng thái: ${nextStatus}`,
      data: updated
    });
  } catch (error) {
    console.error('Lỗi khi duyệt phiếu thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi khi duyệt phiếu.', error: error.message });
  }
};

export const rejectPaymentRequest = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Vui lòng cung cấp lý do từ chối.' });
    }

    const request = await query.get('SELECT * FROM payment_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ message: 'Phiếu thanh toán không tồn tại.' });
    }

    if (req.user.roleName === 'EMPLOYEE') {
      return res.status(403).json({ message: 'Bạn không có quyền từ chối phiếu.' });
    }

    const nowIso = new Date().toISOString();
    await query.run(
      `UPDATE payment_requests SET 
        status = 'REJECTED',
        rejection_reason = ?,
        rejected_by = ?,
        rejected_at = ?,
        updated_at = ?
      WHERE id = ?`,
      [reason.trim(), req.user.userId, nowIso, nowIso, id]
    );

    await logAudit(req.user.userId, req.user.username, 'Từ chối Giấy đề nghị thanh toán', ip, `Mã: ${request.code} - Lý do: ${reason}`);
    const updated = await getPaymentRequestDetail(id);
    return res.json({ message: 'Đã từ chối phiếu thanh toán thành công.', data: updated });
  } catch (error) {
    console.error('Lỗi khi từ chối phiếu thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi khi từ chối phiếu.', error: error.message });
  }
};

export const deletePaymentRequest = async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  try {
    const { id } = req.params;
    const request = await query.get('SELECT * FROM payment_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ message: 'Phiếu không tồn tại.' });
    }

    if (req.user.roleName !== 'ADMIN') {
      if (request.user_id !== req.user.userId) {
        return res.status(403).json({ message: 'Bạn chỉ có thể xóa phiếu của mình.' });
      }
      if (request.status !== 'PENDING_HOD') {
        return res.status(400).json({ message: 'Không thể xóa phiếu đã chuyển cấp duyệt.' });
      }
    }

    await query.run('DELETE FROM request_attachments WHERE payment_request_id = ?', [id]);
    await query.run('DELETE FROM payment_requests WHERE id = ?', [id]);

    await logAudit(req.user.userId, req.user.username, 'Xóa Giấy đề nghị thanh toán', ip, `Mã: ${request.code}`);
    return res.json({ message: 'Đã xóa phiếu thanh toán thành công.' });
  } catch (error) {
    console.error('Lỗi khi xóa phiếu thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa phiếu.', error: error.message });
  }
};

// ==========================================
// 3. PHẦN 2: CHỨNG TỪ & HÓA ĐƠN ĐÍNH KÈM
// ==========================================

export const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    await query.run('DELETE FROM request_attachments WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa chứng từ đính kèm thành công.' });
  } catch (error) {
    console.error('Lỗi xóa file đính kèm:', error);
    return res.status(500).json({ message: 'Lỗi xóa file đính kèm.', error: error.message });
  }
};

// ==========================================
// 4. STATS THỐNG KÊ TOÀN DIỆN
// ==========================================

export const getFullStats = async (req, res) => {
  try {
    const userRole = req.user.roleName;
    const userId = req.user.userId;
    const userDept = req.user.departmentName;

    let pFilter = '';
    let payFilter = '';
    let params = [];

    if (userRole === 'EMPLOYEE') {
      pFilter = 'WHERE user_id = ?';
      payFilter = 'WHERE user_id = ?';
      params = [userId];
    } else if (userRole === 'MANAGER') {
      pFilter = 'WHERE (user_id = ? OR department = ? OR approver_department = ? OR target_approver_id = ?)';
      payFilter = 'WHERE (user_id = ? OR department = ? OR approver_department = ? OR target_approver_id = ?)';
      params = [userId, userDept, userDept, userId];
    }

    const purchaseStats = await query.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING_HOD' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(total_estimated_amount) as total_amount
      FROM purchase_requests ${pFilter}`,
      params
    );

    const paymentStats = await query.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('PENDING_HOD', 'PENDING_ACC', 'PENDING_BOD') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END) as total_paid_amount,
        SUM(total_amount) as total_amount
      FROM payment_requests ${payFilter}`,
      params
    );

    return res.json({
      purchase: {
        total: purchaseStats.total || 0,
        pending: purchaseStats.pending || 0,
        approved: purchaseStats.approved || 0,
        rejected: purchaseStats.rejected || 0,
        totalAmount: purchaseStats.total_amount || 0
      },
      payment: {
        total: paymentStats.total || 0,
        pending: paymentStats.pending || 0,
        paid: paymentStats.paid || 0,
        rejected: paymentStats.rejected || 0,
        totalPaidAmount: paymentStats.total_paid_amount || 0,
        totalAmount: paymentStats.total_amount || 0
      }
    });
  } catch (error) {
    console.error('Lỗi thống kê:', error);
    return res.status(500).json({ message: 'Lỗi lấy số liệu thống kê.', error: error.message });
  }
};

// ==========================================
// HELPERS
// ==========================================

async function getPurchaseRequestDetail(id) {
  const sql = `
    SELECT 
      pr.*,
      u.username as creator_username,
      e.fullname as creator_name,
      e.code as creator_emp_code,
      e.avatar as creator_avatar,
      p.name as creator_position,
      b.name as creator_branch,
      (SELECT id FROM payment_requests WHERE purchase_request_id = pr.id LIMIT 1) as linked_payment_id,
      (SELECT code FROM payment_requests WHERE purchase_request_id = pr.id LIMIT 1) as linked_payment_code,
      (SELECT status FROM payment_requests WHERE purchase_request_id = pr.id LIMIT 1) as linked_payment_status,
      hod_u.username as hod_username, hod_e.fullname as hod_fullname,
      rej_u.username as rej_username, rej_e.fullname as rej_fullname
    FROM purchase_requests pr
    JOIN users u ON pr.user_id = u.id
    LEFT JOIN employees e ON pr.employee_id = e.id OR u.employee_id = e.id
    LEFT JOIN positions p ON e.position_id = p.id
    LEFT JOIN branches b ON e.branch_id = b.id
    LEFT JOIN users hod_u ON pr.hod_approved_by = hod_u.id
    LEFT JOIN employees hod_e ON hod_u.employee_id = hod_e.id
    LEFT JOIN users rej_u ON pr.rejected_by = rej_u.id
    LEFT JOIN employees rej_e ON rej_u.employee_id = rej_e.id
    WHERE pr.id = ?
  `;

  const record = await query.get(sql, [id]);
  if (!record) return null;

  const items = await query.all(
    'SELECT * FROM purchase_request_items WHERE request_id = ? ORDER BY id ASC',
    [id]
  );

  const attachments = await query.all(
    'SELECT * FROM request_attachments WHERE purchase_request_id = ? ORDER BY id ASC',
    [id]
  );

  return {
    ...record,
    items: items || [],
    attachments: attachments || []
  };
}

async function getPaymentRequestDetail(id) {
  const sql = `
    SELECT 
      pay.*,
      u.username as creator_username,
      e.fullname as creator_name,
      e.code as creator_emp_code,
      e.avatar as creator_avatar,
      p.name as creator_position,
      b.name as creator_branch,
      pr.code as purchase_code,
      pr.purpose as purchase_purpose,
      pr.total_estimated_amount as purchase_estimated_amount,
      hod_u.username as hod_username, hod_e.fullname as hod_fullname,
      acc_u.username as acc_username, acc_e.fullname as acc_fullname,
      bod_u.username as bod_username, bod_e.fullname as bod_fullname,
      paid_u.username as paid_username, paid_e.fullname as paid_fullname,
      rej_u.username as rej_username, rej_e.fullname as rej_fullname
    FROM payment_requests pay
    JOIN users u ON pay.user_id = u.id
    LEFT JOIN employees e ON pay.employee_id = e.id OR u.employee_id = e.id
    LEFT JOIN positions p ON e.position_id = p.id
    LEFT JOIN branches b ON e.branch_id = b.id
    LEFT JOIN purchase_requests pr ON pay.purchase_request_id = pr.id
    LEFT JOIN users hod_u ON pay.hod_approved_by = hod_u.id
    LEFT JOIN employees hod_e ON hod_u.employee_id = hod_e.id
    LEFT JOIN users acc_u ON pay.acc_approved_by = acc_u.id
    LEFT JOIN employees acc_e ON acc_u.employee_id = acc_e.id
    LEFT JOIN users bod_u ON pay.bod_approved_by = bod_u.id
    LEFT JOIN employees bod_e ON bod_u.employee_id = bod_e.id
    LEFT JOIN users paid_u ON pay.paid_by = paid_u.id
    LEFT JOIN employees paid_e ON paid_u.employee_id = paid_e.id
    LEFT JOIN users rej_u ON pay.rejected_by = rej_u.id
    LEFT JOIN employees rej_e ON rej_u.employee_id = rej_e.id
    WHERE pay.id = ?
  `;

  const record = await query.get(sql, [id]);
  if (!record) return null;

  const attachments = await query.all(
    'SELECT * FROM request_attachments WHERE payment_request_id = ? ORDER BY id ASC',
    [id]
  );

  let purchaseItems = [];
  if (record.purchase_request_id) {
    purchaseItems = await query.all(
      'SELECT * FROM purchase_request_items WHERE request_id = ? ORDER BY id ASC',
      [record.purchase_request_id]
    );
  }

  return {
    ...record,
    attachments: attachments || [],
    purchase_items: purchaseItems || []
  };
}

export const getComboRequestData = async (req, res) => {
  try {
    const { type, id } = req.params;
    let purchaseData = null;
    let paymentData = null;
    let allAttachments = [];

    if (type.toUpperCase() === 'PURCHASE') {
      purchaseData = await getPurchaseRequestDetail(id);
      if (purchaseData) {
        // Tìm payment request liên kết nếu có
        const linkedPayment = await query.get(
          'SELECT id FROM payment_requests WHERE purchase_request_id = ? LIMIT 1',
          [purchaseData.id]
        );
        if (linkedPayment) {
          paymentData = await getPaymentRequestDetail(linkedPayment.id);
        }
      }
    } else {
      paymentData = await getPaymentRequestDetail(id);
      if (paymentData && paymentData.purchase_request_id) {
        purchaseData = await getPurchaseRequestDetail(paymentData.purchase_request_id);
      }
    }

    if (purchaseData && purchaseData.attachments) {
      allAttachments = [...allAttachments, ...purchaseData.attachments];
    }
    if (paymentData && paymentData.attachments) {
      const existingUrls = new Set(allAttachments.map(a => a.file_url));
      paymentData.attachments.forEach(a => {
        if (!existingUrls.has(a.file_url)) {
          allAttachments.push(a);
        }
      });
    }

    return res.json({
      success: true,
      data: {
        purchase_request: purchaseData,
        payment_request: paymentData,
        attachments: allAttachments
      }
    });
  } catch (err) {
    console.error('Lỗi lấy dữ liệu in combo 3 tờ:', err);
    return res.status(500).json({ message: 'Lỗi lấy dữ liệu combo 3 tờ', error: err.message });
  }
};
