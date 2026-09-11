import { query } from '../config/database.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await query.all(`
      SELECT d.*, b.name as branch_name,
             (
               SELECT COUNT(*) 
               FROM employees e 
               LEFT JOIN positions p ON e.position_id = p.id
               WHERE e.department_id = d.id 
                  OR e.department_id = d.name
                  OR p.department_id = d.id
             ) as employee_count
      FROM departments d
      LEFT JOIN branches b ON d.branch_id = b.id
      ORDER BY d.id ASC
    `);
    return res.json(departments);
  } catch (error) {
    console.error('Lỗi lấy danh sách phòng ban:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách phòng ban.' });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await query.get(`
      SELECT d.*, b.name as branch_name
      FROM departments d LEFT JOIN branches b ON d.branch_id = b.id
      WHERE d.id = ?
    `, [req.params.id]);
    if (!dept) return res.status(404).json({ message: 'Phòng ban không tồn tại.' });
    return res.json(dept);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const createDepartment = async (req, res) => {
  const { name, branch_id } = req.body;
  try {
    if (!name) return res.status(400).json({ message: 'Tên phòng ban không được để trống.' });
    const exist = await query.get('SELECT id FROM departments WHERE name = ?', [name.trim()]);
    if (exist) return res.status(400).json({ message: 'Tên phòng ban đã tồn tại.' });
    const result = await query.run(
      'INSERT INTO departments (name, branch_id) VALUES (?, ?)',
      [name.trim(), branch_id || null]
    );
    return res.status(201).json({ message: 'Tạo phòng ban thành công.', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tạo phòng ban.' });
  }
};

export const updateDepartment = async (req, res) => {
  const { name, branch_id, is_active } = req.body;
  try {
    const dept = await query.get('SELECT id FROM departments WHERE id = ?', [req.params.id]);
    if (!dept) return res.status(404).json({ message: 'Phòng ban không tồn tại.' });
    if (!name) return res.status(400).json({ message: 'Tên phòng ban không được để trống.' });
    const dup = await query.get('SELECT id FROM departments WHERE name = ? AND id != ?', [name.trim(), req.params.id]);
    if (dup) return res.status(400).json({ message: 'Tên phòng ban đã tồn tại.' });
    await query.run(
      'UPDATE departments SET name = ?, branch_id = ?, is_active = ? WHERE id = ?',
      [name.trim(), branch_id || null, is_active !== undefined ? is_active : 1, req.params.id]
    );
    return res.json({ message: 'Cập nhật phòng ban thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể cập nhật phòng ban.' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await query.get('SELECT id FROM departments WHERE id = ?', [req.params.id]);
    if (!dept) return res.status(404).json({ message: 'Phòng ban không tồn tại.' });
    const emps = await query.get('SELECT COUNT(*) as count FROM employees WHERE department_id = ?', [req.params.id]);
    if (emps.count > 0) return res.status(400).json({ message: `Không thể xóa. Phòng ban đang có ${emps.count} nhân viên.` });
    await query.run('DELETE FROM departments WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Xóa phòng ban thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể xóa phòng ban.' });
  }
};

export const getDepartmentEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    let dept = await query.get(`
      SELECT d.*, b.name as branch_name 
      FROM departments d 
      LEFT JOIN branches b ON d.branch_id = b.id 
      WHERE d.id = ?
    `, [id]);
    
    if (!dept) {
      dept = await query.get(`
        SELECT d.*, b.name as branch_name 
        FROM departments d 
        LEFT JOIN branches b ON d.branch_id = b.id 
        WHERE d.name = ?
      `, [id]);
    }

    if (!dept) return res.status(404).json({ message: 'Phòng ban không tồn tại.' });

    const employees = await query.all(`
      SELECT DISTINCT e.id, e.code, e.fullname, e.gender, e.phone, e.email, e.status, e.join_date,
             COALESCE(pos.name, 'Nhân viên') as position_name,
             COALESCE(b.name, dept_b.name, 'Văn phòng Trụ sở chính') as branch_name
      FROM employees e
      LEFT JOIN positions pos ON e.position_id = pos.id
      LEFT JOIN branches b ON e.branch_id = b.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN branches dept_b ON d.branch_id = dept_b.id
      WHERE e.department_id = ? 
         OR e.department_id = ?
         OR d.name = ?
         OR pos.department_id = ?
      ORDER BY e.code ASC
    `, [dept.id, dept.name, dept.name, dept.id]);

    return res.json({
      department: dept,
      employees: employees || []
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách nhân sự phòng ban:', error);
    return res.status(500).json({ message: 'Lỗi lấy danh sách nhân sự.' });
  }
};
