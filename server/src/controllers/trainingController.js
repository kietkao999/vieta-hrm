import { query } from '../config/database.js';

export const getTrainings = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM training WHERE 1=1';
    const params = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY start_date DESC';
    const courses = await query.all(sql, params);
    
    return res.json(courses);
  } catch (error) {
    console.error('Lỗi lấy khóa đào tạo:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const createTraining = async (req, res) => {
  const { course_name, provider, start_date, end_date, cost, status, notes } = req.body;
  if (!course_name) return res.status(400).json({ message: 'Tên khóa học là bắt buộc.' });

  try {
    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO training (course_name, provider, start_date, end_date, cost, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [course_name, provider || '', start_date || null, end_date || null, cost || 0, status || 'Lên kế hoạch', notes || '', now, now]);

    return res.status(201).json({ message: 'Tạo khóa đào tạo thành công.', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tạo khóa đào tạo.' });
  }
};

export const updateTraining = async (req, res) => {
  const { id } = req.params;
  const { course_name, provider, start_date, end_date, cost, status, notes } = req.body;
  
  try {
    const course = await query.get('SELECT * FROM training WHERE id = ?', [id]);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa đào tạo.' });

    const now = new Date().toISOString();
    await query.run(`
      UPDATE training 
      SET course_name = ?, provider = ?, start_date = ?, end_date = ?, cost = ?, status = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [course_name, provider || '', start_date || null, end_date || null, cost || 0, status || 'Lên kế hoạch', notes || '', now, id]);

    return res.json({ message: 'Cập nhật khóa đào tạo thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi cập nhật khóa đào tạo.' });
  }
};

export const deleteTraining = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await query.get('SELECT * FROM training WHERE id = ?', [id]);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa đào tạo.' });

    await query.run('DELETE FROM training WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa khóa đào tạo.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xóa khóa đào tạo.' });
  }
};
