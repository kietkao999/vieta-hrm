import { query } from '../config/database.js';

// Lấy danh sách sáng kiến & ý kiến đóng góp
export const getInnovations = async (req, res) => {
  try {
    const { year, employee_id, status, category, target_unit, search, scope } = req.query;

    let sql = `
      SELECT i.*, e.fullname, e.code as employee_code, e.avatar, d.name as department_name, p.name as position_name
      FROM innovations i
      JOIN employees e ON i.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (year) {
      sql += ` AND strftime('%Y', i.date) = ?`;
      params.push(year);
    }

    if (status) {
      sql += ` AND i.status = ?`;
      params.push(status);
    }

    if (category) {
      sql += ` AND i.category = ?`;
      params.push(category);
    }

    if (target_unit) {
      sql += ` AND i.target_unit = ?`;
      params.push(target_unit);
    }

    if (search) {
      sql += ` AND (i.title LIKE ? OR i.content LIKE ? OR i.efficiency LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Phân quyền hiển thị theo Role & Đơn vị nhận (Recipient Routing)
    if (req.user.roleName === 'EMPLOYEE') {
      if (scope === 'my') {
        // Chỉ xem sáng kiến của chính mình
        sql += ` AND i.employee_id = ?`;
        params.push(req.user.employeeId);
      } else {
        // Xem sáng kiến của chính mình HOẶC các sáng kiến công khai đã được xem xét/áp dụng/khen thưởng
        sql += ` AND (i.employee_id = ? OR i.status IN ('Đã áp dụng thành công', 'Thử nghiệm', 'Khen thưởng', 'Đã triển khai', 'Đang thẩm định'))`;
        params.push(req.user.employeeId);
      }
    } else if (req.user.roleName === 'MANAGER') {
      // Quản lý cấp phòng / kho / xưởng:
      // CHỈ xem được:
      // 1. Góp ý gửi đích danh đến phòng ban / chức danh của Quản lý đó
      // 2. Góp ý do chính Quản lý đó gửi đi
      // 3. Các sáng kiến công khai đã được áp dụng / khen thưởng
      // TUYỆT ĐỐI KHÔNG xem được góp ý / khiếu nại gửi đến "Ban Giám Đốc" hoặc phòng ban khác!
      
      const managerInfo = await query.get(
        `SELECT e.id, d.name as dept_name, p.name as pos_name
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         WHERE e.id = ?`,
        [req.user.employeeId]
      );

      const deptName = managerInfo?.dept_name || '';
      const posName = managerInfo?.pos_name || '';

      if (scope === 'my') {
        sql += ` AND i.employee_id = ?`;
        params.push(req.user.employeeId);
      } else {
        sql += ` AND (
          i.employee_id = ?
          OR i.status IN ('Đã áp dụng thành công', 'Thử nghiệm', 'Khen thưởng', 'Đã triển khai')
          OR (
            i.target_unit != 'Ban Giám Đốc' 
            AND i.target_unit != 'Trưởng Phòng Hành Chính Nhân Sự'
            AND (
              i.target_unit = ? 
              OR i.target_unit = ?
              OR (? != '' AND (i.target_unit LIKE '%' || ? || '%' OR ? LIKE '%' || i.target_unit || '%'))
              OR (? != '' AND (i.target_unit LIKE '%' || ? || '%' OR ? LIKE '%' || i.target_unit || '%'))
            )
          )
        )`;
        params.push(
          req.user.employeeId,
          posName,
          deptName,
          deptName, deptName, deptName,
          posName, posName, posName
        );
      }

      if (employee_id) {
        sql += ` AND i.employee_id = ?`;
        params.push(employee_id);
      }
    } else {
      // CẤP 1 - ADMIN (Ban Giám Đốc, Huỳnh Thị Trúc Xinh, Phan Tuấn Kiệt)
      // Toàn quyền xem tất cả hòm thư (Bao gồm Ban Giám Đốc, Trưởng phòng HCNS và tất cả phòng ban)
      if (scope === 'my') {
        sql += ` AND i.employee_id = ?`;
        params.push(req.user.employeeId);
      } else if (employee_id) {
        sql += ` AND i.employee_id = ?`;
        params.push(employee_id);
      }
    }

    sql += ` ORDER BY i.date DESC, i.id DESC`;
    const records = await query.all(sql, params);

    // Xử lý bảo mật danh tính cho các bài gửi nặc danh (100% ẩn thông tin nhân viên nếu không phải tác giả)
    const sanitizedRecords = records.map(record => {
      const isAuthor = record.employee_id === req.user.employeeId;

      if (record.is_anonymous === 1 && !isAuthor) {
        return {
          ...record,
          fullname: 'Thành viên Việt Á (Nặc danh 🔒)',
          employee_code: '***',
          avatar: null,
          department_name: 'Bảo mật'
        };
      }
      return record;
    });

    return res.json(sanitizedRecords);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Thêm sáng kiến mới (tất cả nhân viên đều có thể đề xuất)
export const createInnovation = async (req, res) => {
  const {
    title,
    content,
    date,
    category,
    target_unit,
    is_anonymous,
    attachment_url,
    efficiency,
    cost_savings,
    productivity_increase,
    value_created
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập tiêu đề ý kiến / sáng kiến.' });
  }

  try {
    const employee_id = req.user.employeeId || req.body.employee_id;
    if (!employee_id) {
      return res.status(400).json({ message: 'Tài khoản chưa liên kết hồ sơ nhân viên để gửi sáng kiến.' });
    }

    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO innovations (
        employee_id, title, content, date, category, target_unit,
        is_anonymous, attachment_url, status, efficiency, cost_savings,
        productivity_increase, value_created, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Chờ tiếp nhận', ?, ?, ?, ?, ?, ?)
    `, [
      employee_id,
      title.trim(),
      content ? content.trim() : '',
      date || now.split('T')[0],
      category || 'Cải tiến sản xuất nệm/gối',
      target_unit || 'Toàn công ty',
      is_anonymous ? 1 : 0,
      attachment_url || '',
      efficiency || '',
      Number(cost_savings) || 0,
      productivity_increase || '',
      value_created || '',
      now,
      now
    ]);

    return res.status(201).json({
      message: 'Gửi ý kiến / sáng kiến cải tiến thành công!',
      id: result.lastID
    });
  } catch (error) {
    console.error('Lỗi đề xuất sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi gửi sáng kiến.' });
  }
};

// Cập nhật / Duyệt / Thẩm định sáng kiến
export const updateInnovation = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    content,
    date,
    category,
    target_unit,
    is_anonymous,
    attachment_url,
    status,
    efficiency,
    cost_savings,
    productivity_increase,
    value_created,
    response_notes,
    reward_amount
  } = req.body;

  try {
    const innov = await query.get('SELECT * FROM innovations WHERE id = ?', [id]);
    if (!innov) return res.status(404).json({ message: 'Không tìm thấy sáng kiến.' });

    const now = new Date().toISOString();
    const isEmployee = req.user.roleName === 'EMPLOYEE';
    const isManager = req.user.roleName === 'MANAGER';

    // Nhân viên chỉ sửa được sáng kiến của mình khi còn ở trạng thái chờ
    if (isEmployee) {
      if (innov.employee_id !== req.user.employeeId) {
        return res.status(403).json({ message: 'Bạn chỉ được chỉnh sửa sáng kiến của mình.' });
      }
      if (innov.status !== 'Chờ tiếp nhận' && innov.status !== 'Đề xuất') {
        return res.status(403).json({ message: 'Không thể sửa sáng kiến đang trong quá trình thẩm định hoặc đã áp dụng.' });
      }

      await query.run(`
        UPDATE innovations 
        SET title = ?, content = ?, date = ?, category = ?, target_unit = ?,
            is_anonymous = ?, attachment_url = ?, efficiency = ?, 
            cost_savings = ?, productivity_increase = ?, value_created = ?, updated_at = ?
        WHERE id = ?
      `, [
        title || innov.title,
        content !== undefined ? content : innov.content,
        date || innov.date,
        category || innov.category,
        target_unit || innov.target_unit,
        is_anonymous !== undefined ? (is_anonymous ? 1 : 0) : innov.is_anonymous,
        attachment_url !== undefined ? attachment_url : innov.attachment_url,
        efficiency !== undefined ? efficiency : innov.efficiency,
        cost_savings !== undefined ? Number(cost_savings) : innov.cost_savings,
        productivity_increase !== undefined ? productivity_increase : innov.productivity_increase,
        value_created !== undefined ? value_created : innov.value_created,
        now,
        id
      ]);
    } else if (isManager) {
      // MANAGER: Kiểm tra thẩm quyền đơn vị tiếp nhận
      // Không được can thiệp vào các góp ý gửi đích danh cho Ban Giám Đốc hoặc Trưởng phòng HCNS hoặc đơn vị khác
      if (innov.target_unit === 'Ban Giám Đốc' || innov.target_unit === 'Trưởng Phòng Hành Chính Nhân Sự') {
        return res.status(403).json({ message: 'Bạn không có thẩm quyền xử lý góp ý gửi đích danh cho Ban Giám Đốc / Phòng HCNS.' });
      }

      const managerInfo = await query.get(
        `SELECT e.id, d.name as dept_name, p.name as pos_name
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         WHERE e.id = ?`,
        [req.user.employeeId]
      );

      const deptName = managerInfo?.dept_name || '';
      const posName = managerInfo?.pos_name || '';

      const isTargetMatched = 
        innov.target_unit === posName ||
        innov.target_unit === deptName ||
        (deptName && (innov.target_unit.includes(deptName) || deptName.includes(innov.target_unit))) ||
        (posName && (innov.target_unit.includes(posName) || posName.includes(innov.target_unit))) ||
        innov.employee_id === req.user.employeeId;

      if (!isTargetMatched) {
        return res.status(403).json({ message: 'Bạn chỉ có thẩm quyền phản hồi các góp ý gửi đến đúng phòng ban / đơn vị bạn quản lý.' });
      }

      const responder = req.user.fullname || req.user.username || posName || 'Quản Lý Đơn Vị';
      
      await query.run(`
        UPDATE innovations 
        SET status = ?, response_notes = ?, response_by = ?, response_date = ?,
            reward_amount = ?, updated_at = ?
        WHERE id = ?
      `, [
        status || innov.status,
        response_notes !== undefined ? response_notes : innov.response_notes,
        response_notes ? responder : innov.response_by,
        response_notes ? now.split('T')[0] : innov.response_date,
        reward_amount !== undefined ? Number(reward_amount) : innov.reward_amount,
        now,
        id
      ]);
    } else {
      // CẤP 1 - ADMIN: Toàn quyền cập nhật, thẩm định, phản hồi và khen thưởng
      const responder = req.user.fullname || req.user.username || 'Ban Giám Đốc';
      
      await query.run(`
        UPDATE innovations 
        SET title = ?, content = ?, date = ?, category = ?, target_unit = ?,
            status = ?, efficiency = ?, cost_savings = ?, productivity_increase = ?, 
            value_created = ?, response_notes = ?, response_by = ?, response_date = ?,
            reward_amount = ?, updated_at = ?
        WHERE id = ?
      `, [
        title || innov.title,
        content !== undefined ? content : innov.content,
        date || innov.date,
        category || innov.category,
        target_unit || innov.target_unit,
        status || innov.status,
        efficiency !== undefined ? efficiency : innov.efficiency,
        cost_savings !== undefined ? Number(cost_savings) : innov.cost_savings,
        productivity_increase !== undefined ? productivity_increase : innov.productivity_increase,
        value_created !== undefined ? value_created : innov.value_created,
        response_notes !== undefined ? response_notes : innov.response_notes,
        response_notes ? responder : innov.response_by,
        response_notes ? now.split('T')[0] : innov.response_date,
        reward_amount !== undefined ? Number(reward_amount) : innov.reward_amount,
        now,
        id
      ]);
    }

    return res.json({ message: 'Cập nhật sáng kiến thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi cập nhật sáng kiến.' });
  }
};

// Ủng hộ / Like sáng kiến
export const toggleLikeInnovation = async (req, res) => {
  const { id } = req.params;
  try {
    const innov = await query.get('SELECT * FROM innovations WHERE id = ?', [id]);
    if (!innov) return res.status(404).json({ message: 'Không tìm thấy sáng kiến.' });

    const newLikes = (innov.likes_count || 0) + 1;
    await query.run('UPDATE innovations SET likes_count = ? WHERE id = ?', [newLikes, id]);

    return res.json({ message: 'Đã gửi lượt ủng hộ!', likes_count: newLikes });
  } catch (error) {
    console.error('Lỗi like sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi thao tác.' });
  }
};

// Xóa sáng kiến
export const deleteInnovation = async (req, res) => {
  const { id } = req.params;
  try {
    const innov = await query.get('SELECT * FROM innovations WHERE id = ?', [id]);
    if (!innov) return res.status(404).json({ message: 'Không tìm thấy sáng kiến.' });

    // Phân quyền xóa: Admin hoặc chính tác giả khi còn ở trạng thái chờ tiếp nhận
    if (req.user.roleName !== 'ADMIN') {
      if (innov.employee_id !== req.user.employeeId) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa sáng kiến này.' });
      }
      if (innov.status !== 'Chờ tiếp nhận' && innov.status !== 'Đề xuất') {
        return res.status(403).json({ message: 'Không thể xóa góp ý đang thẩm định hoặc đã xử lý.' });
      }
    }

    await query.run('DELETE FROM innovations WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa sáng kiến.' });
  } catch (error) {
    console.error('Lỗi xóa sáng kiến:', error);
    return res.status(500).json({ message: 'Lỗi xóa sáng kiến.' });
  }
};
