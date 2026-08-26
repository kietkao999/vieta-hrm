import { query } from '../config/database.js';

export const getKpis = async (req, res) => {
  try {
    const { month, year, employee_id } = req.query;
    
    let sql = `
      SELECT k.*, e.fullname, e.code as employee_code, d.name as department_name,
             (SELECT fullname FROM employees WHERE id = k.evaluator_id) as evaluator_name
      FROM kpi k
      JOIN employees e ON k.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (month && year) {
      sql += ` AND k.month = ? AND k.year = ?`;
      params.push(month.padStart(2, '0'), year);
    }

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND k.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND k.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY k.year DESC, k.month DESC, e.fullname ASC`;
    const records = await query.all(sql, params);
    
    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu KPI:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const createKpi = async (req, res) => {
  const { employee_id, month, year, criteria, target_score } = req.body;
  
  if (!employee_id || !month || !year || !criteria) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (Nhân viên, Tháng, Năm, Tiêu chí).' });
  }

  try {
    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO kpi (employee_id, month, year, criteria, target_score, achieved_score, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 'Chưa đánh giá', ?, ?)
    `, [employee_id, month.padStart(2, '0'), year, criteria, target_score || 100, now, now]);

    return res.status(201).json({ message: 'Giao KPI thành công.', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi giao KPI.' });
  }
};

export const updateKpi = async (req, res) => {
  const { id } = req.params;
  const { achieved_score, evaluator_comments, status } = req.body;
  
  try {
    const kpi = await query.get('SELECT * FROM kpi WHERE id = ?', [id]);
    if (!kpi) return res.status(404).json({ message: 'Không tìm thấy KPI.' });

    // Phân quyền: Manager đánh giá
    if (req.user.roleName === 'MANAGER') {
      const emp = await query.get('SELECT department_id FROM employees WHERE id = ?', [kpi.employee_id]);
      if (emp.department_id !== req.user.departmentId) {
        return res.status(403).json({ message: 'Chỉ được đánh giá KPI nhân viên cùng phòng ban.' });
      }
    }

    const now = new Date().toISOString();
    await query.run(`
      UPDATE kpi 
      SET achieved_score = ?, evaluator_id = ?, evaluator_comments = ?, status = ?, updated_at = ?
      WHERE id = ?
    `, [
      achieved_score || 0, req.user.employeeId || null, evaluator_comments || '', 
      status || 'Đã đánh giá', now, id
    ]);

    return res.json({ message: 'Đánh giá KPI thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi cập nhật KPI.' });
  }
};

export const deleteKpi = async (req, res) => {
  const { id } = req.params;
  try {
    const kpi = await query.get('SELECT * FROM kpi WHERE id = ?', [id]);
    if (!kpi) return res.status(404).json({ message: 'Không tìm thấy KPI.' });

    await query.run('DELETE FROM kpi WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa KPI.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xóa KPI.' });
  }
};
