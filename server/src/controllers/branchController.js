import { query } from '../config/database.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await query.all('SELECT * FROM branches ORDER BY id ASC');
    return res.json(branches);
  } catch (error) {
    console.error('Lỗi lấy danh sách chi nhánh:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách chi nhánh.' });
  }
};

export const getBranchById = async (req, res) => {
  try {
    const branch = await query.get('SELECT * FROM branches WHERE id = ?', [req.params.id]);
    if (!branch) return res.status(404).json({ message: 'Chi nhánh không tồn tại.' });
    return res.json(branch);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const createBranch = async (req, res) => {
  const { name, address } = req.body;
  try {
    if (!name) return res.status(400).json({ message: 'Tên chi nhánh không được để trống.' });
    const exist = await query.get('SELECT id FROM branches WHERE name = ?', [name.trim()]);
    if (exist) return res.status(400).json({ message: 'Tên chi nhánh đã tồn tại.' });
    const result = await query.run('INSERT INTO branches (name, address) VALUES (?, ?)', [name.trim(), address || '']);
    return res.status(201).json({ message: 'Tạo chi nhánh thành công.', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tạo chi nhánh.' });
  }
};

export const updateBranch = async (req, res) => {
  const { name, address } = req.body;
  try {
    const branch = await query.get('SELECT id FROM branches WHERE id = ?', [req.params.id]);
    if (!branch) return res.status(404).json({ message: 'Chi nhánh không tồn tại.' });
    if (!name) return res.status(400).json({ message: 'Tên chi nhánh không được để trống.' });
    const dup = await query.get('SELECT id FROM branches WHERE name = ? AND id != ?', [name.trim(), req.params.id]);
    if (dup) return res.status(400).json({ message: 'Tên chi nhánh đã tồn tại.' });
    await query.run('UPDATE branches SET name = ?, address = ? WHERE id = ?', [name.trim(), address || '', req.params.id]);
    return res.json({ message: 'Cập nhật chi nhánh thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể cập nhật chi nhánh.' });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const branch = await query.get('SELECT id FROM branches WHERE id = ?', [req.params.id]);
    if (!branch) return res.status(404).json({ message: 'Chi nhánh không tồn tại.' });
    const deps = await query.get('SELECT COUNT(*) as count FROM departments WHERE branch_id = ?', [req.params.id]);
    if (deps.count > 0) return res.status(400).json({ message: `Không thể xóa. Chi nhánh đang có ${deps.count} phòng ban liên kết.` });
    await query.run('DELETE FROM branches WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Xóa chi nhánh thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể xóa chi nhánh.' });
  }
};
