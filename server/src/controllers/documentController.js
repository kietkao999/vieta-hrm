import { query } from '../config/database.js';

// Danh mục văn bản, quy định & phúc lợi mặc định (Seed Data)
export const DEFAULT_DOCUMENTS = [
  {
    title: 'Nội Quy Công Ty 2026',
    category: 'Nội quy & Quy chế',
    file_name: 'NỘI QUY CÔNG TY TNHH TMSX VIỆT Á 2026 (NB).docx',
    file_url: '',
    file_size: '2.4 MB',
    file_type: 'docx',
    effective_date: '2026-08-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Áp dụng tháng 8/2026. Quy định chuẩn mực kỷ luật lao động, thời giờ làm việc, nghỉ ngơi, văn hóa doanh nghiệp và bảo vệ tài sản công ty.',
    status: 'Đang hiệu lực',
    created_by: 'Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)'
  },
  {
    title: 'Phúc Lợi Công Ty 2026',
    category: 'Chính sách & Phúc lợi',
    file_name: 'CHÍNH SÁCH PHÚC LỢI 2026.docx',
    file_url: '',
    file_size: '1.8 MB',
    file_type: 'docx',
    effective_date: '2026-09-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Áp dụng tháng 9/2026. Quy chế chế độ hiếu hỷ, sinh nhật, du lịch nghỉ dưỡng thường niên, trợ cấp khó khăn đột xuất và thưởng các ngày Lễ, Tết.',
    status: 'Đang hiệu lực',
    created_by: 'Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)'
  },
  {
    title: 'Bộ Đào Tạo Hội Nhập',
    category: 'Đào tạo & Hướng dẫn',
    file_name: 'BỘ ĐÀO TẠO HỘI NHẬP CÔNG TY VIỆT Á.docx',
    file_url: '',
    file_size: '3.1 MB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Nhân sự mới gia nhập',
    description: 'Tài liệu hướng dẫn hội nhập cho nhân sự mới: Tổng quan công ty Nệm Việt Á, sơ đồ tổ chức, nội quy cơ bản, hệ thống trao đổi thông tin nội bộ.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự'
  },
  {
    title: 'Mẫu Đề Xuất Tuyển Dụng Nhân Sự',
    category: 'Biểu mẫu nhân sự',
    file_name: 'MẪU ĐỀ XUẤT TUYỂN DỤNG NHÂN SỰ.docx',
    file_url: '',
    file_size: '512 KB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Trưởng phòng / Quản lý',
    description: 'Biểu mẫu đăng ký nhu cầu tuyển dụng bổ sung nhân sự định kỳ hoặc đột xuất dành cho Trưởng bộ phận, Quản lý kho và Xưởng sản xuất.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự'
  },
  {
    title: 'Thư Mời Nhận Việc (Offer Letter)',
    category: 'Biểu mẫu nhân sự',
    file_name: 'Thư Mời Nhận Việc.docx',
    file_url: '',
    file_size: '420 KB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Phòng HCNS & Ứng viên',
    description: 'Mẫu thư mời nhận việc chuẩn hóa của Công ty TNHH TM SX Việt Á, quy định vị trí, mức lương, thời gian thử việc và chế độ đãi ngộ ban đầu.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự'
  },
  {
    title: 'Quy Định An Toàn Lao Động',
    category: 'Nội quy & Quy chế',
    file_name: 'QUY ĐỊNH AN TOÀN LAO ĐỘNG.docx',
    file_url: '',
    file_size: '1.5 MB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Khối Xưởng & Kho bãi',
    description: 'Quy chuẩn an toàn vệ sinh lao động, phòng chống cháy nổ, trang bị bảo hộ lao động và quy trình vận hành máy móc an toàn tại kho xưởng.',
    status: 'Đang hiệu lực',
    created_by: 'Ban Quản trị & Ban An toàn'
  },
  {
    title: 'Chính Sách Hỗ Trợ Chi Phí Nhân Viên Đi Hỗ Trợ',
    category: 'Chính sách & Phúc lợi',
    file_name: 'TB 73 HỖ TRỢ CHI PHÍ NV ĐI HỖ TRỢ.docx',
    file_url: '',
    file_size: '890 KB',
    file_type: 'docx',
    effective_date: '2026-06-01',
    applicable_to: 'Nhân viên đi công tác/hỗ trợ',
    description: 'Thông báo số 73 quy định về mức hỗ trợ công tác phí, phụ cấp ăn ở, phương tiện di chuyển đối với nhân sự điều động hỗ trợ các chi nhánh tỉnh.',
    status: 'Đang hiệu lực',
    created_by: 'Ban Giám đốc'
  },
  {
    title: 'Thông Báo Điều Chỉnh Hệ Số Lương Tầng + Bậc',
    category: 'Lương & Đãi ngộ',
    file_name: 'THÔNG BÁO 18_ĐIỀU CHỈNH LƯƠNG CÁC BỘ PHẬN TRONG CÔNG TY.docx',
    file_url: '',
    file_size: '1.2 MB',
    file_type: 'docx',
    effective_date: '2026-05-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Thông báo số 18 về việc điều chỉnh khung thang bảng lương, hệ số lương tầng, hệ số bậc lương áp dụng chính thức từ tháng 05/2026.',
    status: 'Đang hiệu lực',
    created_by: 'Ban Giám đốc'
  }
];

// Lấy danh sách văn bản quy định
export const getDocuments = async (req, res) => {
  try {
    const { category, search, status } = req.query;

    let sql = `SELECT * FROM documents WHERE 1=1`;
    const params = [];

    if (category && category !== 'all' && category !== 'Tất cả') {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      sql += ` AND (title LIKE ? OR description LIKE ? OR file_name LIKE ? OR applicable_to LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    sql += ` ORDER BY id ASC`;

    const docs = await query.all(sql, params);

    // Tính toán thống kê theo từng danh mục
    const stats = {
      total: docs.length,
      rules: docs.filter(d => d.category === 'Nội quy & Quy chế').length,
      welfare: docs.filter(d => d.category === 'Chính sách & Phúc lợi').length,
      salary: docs.filter(d => d.category === 'Lương & Đãi ngộ').length,
      forms: docs.filter(d => d.category === 'Biểu mẫu nhân sự').length,
      training: docs.filter(d => d.category === 'Đào tạo & Hướng dẫn').length
    };

    res.json({
      success: true,
      data: docs,
      stats
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách văn bản quy định:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách văn bản.' });
  }
};

// Lấy chi tiết 1 văn bản
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await query.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu yêu cầu.' });
    }
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết văn bản:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Thêm văn bản mới
export const createDocument = async (req, res) => {
  try {
    const {
      title,
      category,
      file_name,
      file_url,
      file_size,
      file_type,
      effective_date,
      applicable_to,
      description,
      status
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Tiêu đề và Danh mục văn bản.' });
    }

    const now = new Date().toISOString();
    const created_by = req.user?.full_name || req.user?.username || 'Quản trị viên';

    const result = await query.run(
      `INSERT INTO documents (
        title, category, file_name, file_url, file_size, file_type,
        effective_date, applicable_to, description, status, created_by,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        category,
        file_name || '',
        file_url || '',
        file_size || '1.0 MB',
        file_type || 'docx',
        effective_date || now.split('T')[0],
        applicable_to || 'Toàn thể CBNV',
        description || '',
        status || 'Đang hiệu lực',
        created_by,
        now,
        now
      ]
    );

    const newDoc = await query.get('SELECT * FROM documents WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Đã thêm văn bản quy định thành công.',
      data: newDoc
    });
  } catch (error) {
    console.error('Lỗi khi tạo văn bản:', error);
    res.status(500).json({ message: 'Lỗi khi tạo mới văn bản.' });
  }
};

// Cập nhật văn bản
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      file_name,
      file_url,
      file_size,
      file_type,
      effective_date,
      applicable_to,
      description,
      status
    } = req.body;

    const existing = await query.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy văn bản để cập nhật.' });
    }

    const now = new Date().toISOString();

    await query.run(
      `UPDATE documents SET
        title = ?,
        category = ?,
        file_name = ?,
        file_url = ?,
        file_size = ?,
        file_type = ?,
        effective_date = ?,
        applicable_to = ?,
        description = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        title ?? existing.title,
        category ?? existing.category,
        file_name ?? existing.file_name,
        file_url ?? existing.file_url,
        file_size ?? existing.file_size,
        file_type ?? existing.file_type,
        effective_date ?? existing.effective_date,
        applicable_to ?? existing.applicable_to,
        description ?? existing.description,
        status ?? existing.status,
        now,
        id
      ]
    );

    const updated = await query.get('SELECT * FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cập nhật văn bản thành công.',
      data: updated
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật văn bản:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật văn bản.' });
  }
};

// Xóa văn bản
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy văn bản để xóa.' });
    }

    await query.run('DELETE FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Đã xóa văn bản thành công.'
    });
  } catch (error) {
    console.error('Lỗi khi xóa văn bản:', error);
    res.status(500).json({ message: 'Lỗi khi xóa văn bản.' });
  }
};
