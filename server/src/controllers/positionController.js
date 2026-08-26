import { query } from '../config/database.js';

export const getPositions = async (req, res) => {
  try {
    const positions = await query.all(`
      SELECT p.*, d.name as department_name,
             (SELECT COUNT(*) FROM employees WHERE position_id = p.id) as employee_count
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      ORDER BY p.id ASC
    `);
    return res.json(positions);
  } catch (error) {
    console.error('Lỗi lấy danh sách chức vụ:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách chức vụ.' });
  }
};

export const getPositionById = async (req, res) => {
  try {
    const pos = await query.get(`
      SELECT p.*, d.name as department_name
      FROM positions p LEFT JOIN departments d ON p.department_id = d.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (!pos) return res.status(404).json({ message: 'Chức vụ không tồn tại.' });
    return res.json(pos);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const createPosition = async (req, res) => {
  const { name, department_id } = req.body;
  try {
    if (!name) return res.status(400).json({ message: 'Tên chức vụ không được để trống.' });
    const exist = await query.get('SELECT id FROM positions WHERE name = ?', [name.trim()]);
    if (exist) return res.status(400).json({ message: 'Tên chức vụ đã tồn tại.' });
    const result = await query.run(
      'INSERT INTO positions (name, department_id) VALUES (?, ?)',
      [name.trim(), department_id || null]
    );
    return res.status(201).json({ message: 'Tạo chức vụ thành công.', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tạo chức vụ.' });
  }
};

export const updatePosition = async (req, res) => {
  const { name, department_id } = req.body;
  try {
    const pos = await query.get('SELECT id FROM positions WHERE id = ?', [req.params.id]);
    if (!pos) return res.status(404).json({ message: 'Chức vụ không tồn tại.' });
    if (!name) return res.status(400).json({ message: 'Tên chức vụ không được để trống.' });
    const dup = await query.get('SELECT id FROM positions WHERE name = ? AND id != ?', [name.trim(), req.params.id]);
    if (dup) return res.status(400).json({ message: 'Tên chức vụ đã tồn tại.' });
    await query.run(
      'UPDATE positions SET name = ?, department_id = ? WHERE id = ?',
      [name.trim(), department_id || null, req.params.id]
    );
    return res.json({ message: 'Cập nhật chức vụ thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể cập nhật chức vụ.' });
  }
};

export const deletePosition = async (req, res) => {
  try {
    const pos = await query.get('SELECT id FROM positions WHERE id = ?', [req.params.id]);
    if (!pos) return res.status(404).json({ message: 'Chức vụ không tồn tại.' });
    const emps = await query.get('SELECT COUNT(*) as count FROM employees WHERE position_id = ?', [req.params.id]);
    if (emps.count > 0) return res.status(400).json({ message: `Không thể xóa. Chức vụ đang có ${emps.count} nhân viên.` });
    await query.run('DELETE FROM positions WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Xóa chức vụ thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể xóa chức vụ.' });
  }
};
