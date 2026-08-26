import { query } from '../config/database.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await query.all(`
      SELECT d.*, b.name as branch_name,
             (SELECT COUNT(*) FROM employees WHERE department_id = d.id) as employee_count
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
  const { name, branch_id } = req.body;
  try {
    const dept = await query.get('SELECT id FROM departments WHERE id = ?', [req.params.id]);
    if (!dept) return res.status(404).json({ message: 'Phòng ban không tồn tại.' });
    if (!name) return res.status(400).json({ message: 'Tên phòng ban không được để trống.' });
    const dup = await query.get('SELECT id FROM departments WHERE name = ? AND id != ?', [name.trim(), req.params.id]);
    if (dup) return res.status(400).json({ message: 'Tên phòng ban đã tồn tại.' });
    await query.run(
      'UPDATE departments SET name = ?, branch_id = ? WHERE id = ?',
      [name.trim(), branch_id || null, req.params.id]
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
