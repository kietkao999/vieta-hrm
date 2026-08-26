import { query } from '../config/database.js';

export const getContracts = async (req, res) => {
  try {
    const { status, employee_id } = req.query;
    
    let sql = `
      SELECT e.id as employee_id, e.code as employee_code, e.fullname, d.name as department_name,
             c.id as contract_id, c.contract_number, c.type as contract_type, c.start_date, c.end_date, 
             c.basic_salary, c.status as contract_status, c.notes, c.document_url
      FROM employees e
      LEFT JOIN contracts c ON e.id = c.employee_id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // Phân quyền
    if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND e.id = ?`;
      params.push(employee_id);
    }

    if (status === 'Chưa có hợp đồng') {
      sql += ` AND c.id IS NULL`;
    } else if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY c.status DESC, e.code ASC`;
    const records = await query.all(sql, params);
    
    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu hợp đồng:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await query.get(`
      SELECT c.*, e.fullname, e.code as employee_code, d.name as department_name
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE c.id = ?
    `, [id]);

    if (!contract) return res.status(404).json({ message: 'Không tìm thấy hợp đồng.' });

    // Kiểm tra quyền
    if (req.user.roleName === 'MANAGER') {
      const emp = await query.get('SELECT department_id FROM employees WHERE id = ?', [contract.employee_id]);
      if (emp.department_id !== req.user.departmentId) {
        return res.status(403).json({ message: 'Không có quyền xem hợp đồng phòng ban khác.' });
      }
    }

    return res.json(contract);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const createContract = async (req, res) => {
  const { employee_id, contract_number, type, start_date, end_date, basic_salary, status, notes, document_url } = req.body;
  
  if (!employee_id || !contract_number) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (Nhân viên, Số hợp đồng).' });
  }

  try {
    const exist = await query.get('SELECT id FROM contracts WHERE contract_number = ?', [contract_number]);
    if (exist) return res.status(400).json({ message: 'Số hợp đồng đã tồn tại.' });

    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO contracts (
        employee_id, contract_number, type, start_date, end_date, basic_salary, status, notes, document_url, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employee_id, contract_number, type || '', start_date || null, end_date || null,
      basic_salary || 0, status || 'Có hiệu lực', notes || '', document_url || '', now, now
    ]);

    // Update contract_type in employees table automatically
    await query.run('UPDATE employees SET contract_type = ?, base_salary = ? WHERE id = ?', [type, basic_salary, employee_id]);

    return res.status(201).json({ message: 'Tạo hợp đồng thành công.', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tạo hợp đồng.' });
  }
};

export const updateContract = async (req, res) => {
  const { id } = req.params;
  const { contract_number, type, start_date, end_date, basic_salary, status, notes, document_url, employee_id } = req.body;
  
  try {
    const contract = await query.get('SELECT * FROM contracts WHERE id = ?', [id]);
    if (!contract) return res.status(404).json({ message: 'Không tìm thấy hợp đồng.' });

    const dup = await query.get('SELECT id FROM contracts WHERE contract_number = ? AND id != ?', [contract_number, id]);
    if (dup) return res.status(400).json({ message: 'Số hợp đồng đã tồn tại.' });

    const now = new Date().toISOString();
    await query.run(`
      UPDATE contracts 
      SET contract_number = ?, type = ?, start_date = ?, end_date = ?, basic_salary = ?, status = ?, notes = ?, document_url = ?, updated_at = ?
      WHERE id = ?
    `, [
      contract_number, type || '', start_date || null, end_date || null,
      basic_salary || 0, status || 'Có hiệu lực', notes || '', document_url || '', now, id
    ]);

    // Sync to employee if active
    if (status === 'Có hiệu lực') {
      await query.run('UPDATE employees SET contract_type = ?, base_salary = ? WHERE id = ?', [type, basic_salary, employee_id || contract.employee_id]);
    }

    return res.json({ message: 'Cập nhật hợp đồng thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi cập nhật hợp đồng.' });
  }
};

export const deleteContract = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await query.get('SELECT * FROM contracts WHERE id = ?', [id]);
    if (!contract) return res.status(404).json({ message: 'Không tìm thấy hợp đồng.' });

    await query.run('DELETE FROM contracts WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa hợp đồng.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xóa hợp đồng.' });
  }
};
