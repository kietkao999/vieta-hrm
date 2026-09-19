import { query } from '../config/database.js';
import XLSX from 'xlsx';

// Danh sách tài sản mẫu chuẩn thực tế cho Nệm Việt Á
const SAMPLE_ASSETS = [
  {
    code: 'TS-OTO-01',
    name: 'Xe Tải Isuzu 2.5 Tấn (Giao hàng Cần Thơ)',
    category: 'Xe cộ & Vận tải',
    dept_name: 'Kho Cần Thơ',
    emp_code: 'VietA 007', // Trần Thanh Hoài (Tài xế Cần Thơ)
    serial_number: '65C-128.94',
    purchase_date: '2022-03-15',
    purchase_price: 480000000,
    status: 'Đang sử dụng',
    specifications: 'Tải trọng 2.5T, Thùng kín chở nệm, Máy dầu Euro 4',
    next_maintenance_date: '2026-10-15',
    location: 'Tổng Kho Cần Thơ',
    notes: 'Bảo hiểm và hạn đăng kiểm đến tháng 10/2026'
  },
  {
    code: 'TS-OTO-02',
    name: 'Xe Tải Hino 3.5 Tấn (Giao hàng Mỹ Tho & Miền Tây)',
    category: 'Xe cộ & Vận tải',
    dept_name: 'Kho Mỹ Tho',
    emp_code: 'VietA 023', // Nguyễn Hoàng Quân (Tài xế Mỹ Tho)
    serial_number: '63C-095.82',
    purchase_date: '2023-01-10',
    purchase_price: 620000000,
    status: 'Đang sử dụng',
    specifications: 'Tải trọng 3.5T, Thùng bạt kéo cao 2.2m chuyên nệm bông ép',
    next_maintenance_date: '2026-09-30',
    location: 'Tổng Kho Mỹ Tho',
    notes: 'Định mức tiêu hao 12L/100km'
  },
  {
    code: 'TS-MAY-01',
    name: 'Máy May Viền Nệm Tự Động Juki WB-3000',
    category: 'Máy móc sản xuất',
    dept_name: 'Xưởng sản xuất nệm',
    emp_code: 'VietA 049', // Nguyễn Thị Ngọc (May viền)
    serial_number: 'JK-WB3000-8841',
    purchase_date: '2024-04-20',
    purchase_price: 85000000,
    status: 'Đang sử dụng',
    specifications: 'May viền nệm dày 5cm - 30cm, tốc độ 2800 vòng/phút, mô tơ liền trục',
    next_maintenance_date: '2026-11-01',
    location: 'Chuyền may viền - Xưởng Nệm',
    notes: 'Tra dầu định kỳ mỗi 2 tuần'
  },
  {
    code: 'TS-MAY-02',
    name: 'Máy Dán Keo Xốp & Ép Nhiệt Nệm Foam',
    category: 'Máy móc sản xuất',
    dept_name: 'Xưởng sản xuất nệm',
    emp_code: 'VietA 055', // Phan Quốc Khôi (Dán tem/keo)
    serial_number: 'GLUE-HOT-5520',
    purchase_date: '2024-05-10',
    purchase_price: 68000000,
    status: 'Đang sử dụng',
    specifications: 'Băng tải nhiệt tự động, buồng sấy keo công nghệ không mùi',
    next_maintenance_date: '2026-10-20',
    location: 'Khu vực dán keo - Xưởng Nệm',
    notes: 'Vệ sinh đầu vòi phun keo cuối mỗi ca'
  },
  {
    code: 'TS-GOI-01',
    name: 'Máy Thổi Gòn Định Lượng Khí Nén Tự Động',
    category: 'Máy móc sản xuất',
    dept_name: 'Xưởng sản xuất gối',
    emp_code: 'VietA 056', // Trần Thị Bảo Châu (Quản lý xưởng gối)
    serial_number: 'FIBER-BLOW-3301',
    purchase_date: '2024-04-15',
    purchase_price: 55000000,
    status: 'Đang sử dụng',
    specifications: 'Cân định lượng điện tử sai số ±5g, công suất thổi 80 gối/giờ',
    next_maintenance_date: '2026-10-10',
    location: 'Chuyền thổi gòn - Xưởng Gối',
    notes: 'Kiểm tra đường ống hút gòn tránh nghẹt'
  },
  {
    code: 'TS-GOI-02',
    name: 'Máy Đóng Gói Ép Hút Chân Không Gối & Nệm Cuộn',
    category: 'Máy móc sản xuất',
    dept_name: 'Xưởng sản xuất gối',
    emp_code: 'VietA 060', // Trần Thị Kim Quyên
    serial_number: 'VACUUM-SEAL-1102',
    purchase_date: '2024-06-01',
    purchase_price: 42000000,
    status: 'Đang sử dụng',
    specifications: 'Buồng hút chân không kép, đường hàn miệng túi 800mm',
    next_maintenance_date: '2026-12-05',
    location: 'Khu vực đóng gói - Xưởng Gối',
    notes: 'Thay thế thanh nhiệt định kỳ'
  },
  {
    code: 'TS-KHO-01',
    name: 'Xe Nâng Tay Thủy Lực Niuli 2.5 Tấn',
    category: 'Thiết bị kho bãi',
    dept_name: 'Kho Cần Thơ',
    emp_code: 'VietA 003', // Nguyễn Thị Thu Tâm (Quản lý kho Cần Thơ)
    serial_number: 'NL-2500-CT',
    purchase_date: '2023-08-12',
    purchase_price: 5200000,
    status: 'Đang sử dụng',
    specifications: 'Tải trọng 2500kg, bánh xe PU chống mài mòn sàn epoxy',
    next_maintenance_date: '2026-11-15',
    location: 'Kho Cần Thơ',
    notes: 'Bơm mỡ trục nâng định kỳ'
  },
  {
    code: 'TS-KHO-02',
    name: 'Xe Nâng Tay Thủy Lực Meditek 3.0 Tấn',
    category: 'Thiết bị kho bãi',
    dept_name: 'Kho Mỹ Tho',
    emp_code: 'VietA 022', // Nguyễn Tuấn Kiệt (Quản lý kho Mỹ Tho)
    serial_number: 'MD-3000-MT',
    purchase_date: '2023-09-20',
    purchase_price: 6100000,
    status: 'Đang sử dụng',
    specifications: 'Tải trọng 3000kg, càng nâng dài 1220mm',
    next_maintenance_date: '2026-11-20',
    location: 'Kho Mỹ Tho',
    notes: 'Hoạt động tốt'
  },
  {
    code: 'TS-IT-01',
    name: 'Bộ Máy Tính Để Bàn Kế Toán & In Hóa Đơn Dell OptiPlex',
    category: 'Thiết bị IT & Văn phòng',
    dept_name: 'Khối văn phòng',
    emp_code: 'VietA 031', // Nguyễn Quốc Hùng (Trưởng phòng kế toán)
    serial_number: 'DELL-OPT-9020',
    purchase_date: '2025-08-01',
    purchase_price: 16500000,
    status: 'Đang sử dụng',
    specifications: 'Intel Core i5, RAM 16GB, SSD 512GB + Màn hình Dell 24 inch',
    next_maintenance_date: '2027-08-01',
    location: 'Phòng Kế Toán - Trụ Sở Chính',
    notes: 'Cài đặt phần mềm kế toán và chữ ký số'
  },
  {
    code: 'TS-IT-02',
    name: 'Máy In Đa Năng Canon MF244dw (In / Scan / Copy Công nợ)',
    category: 'Thiết bị IT & Văn phòng',
    dept_name: 'Khối văn phòng',
    emp_code: 'VietA 032', // Huỳnh Thị Trúc Xinh (Kế toán công nợ / HR)
    serial_number: 'CANON-MF244-88',
    purchase_date: '2025-08-10',
    purchase_price: 7800000,
    status: 'Đang sử dụng',
    specifications: 'In 2 mặt tự động qua Wifi, hộp mực Cartridge 337',
    next_maintenance_date: '2026-12-10',
    location: 'Phòng HCNS & Kế Toán',
    notes: 'Sử dụng chung cho văn phòng'
  },
  {
    code: 'TS-MKT-01',
    name: 'Bộ Máy Ảnh Sony Alpha A7 IV + Lens Chụp Studio Nệm Gối',
    category: 'Thiết bị IT & Văn phòng',
    dept_name: 'Phòng Marketing',
    emp_code: 'VietA 043', // Phan Tuấn Kiệt (Trưởng phòng Marketing)
    serial_number: 'SONY-A7M4-9912',
    purchase_date: '2026-03-10',
    purchase_price: 58000000,
    status: 'Đang sử dụng',
    specifications: 'Full-frame 33MP, 4K 60p, Lens Sony 24-70mm F2.8 GM II',
    next_maintenance_date: '2027-03-10',
    location: 'Phòng Marketing / Studio Trụ Sở',
    notes: 'Chụp hình catalogue sản phẩm nệm, gối và quay video sự kiện'
  }
];

// Hàm tự động nạp tài sản mẫu nếu chưa có
export const ensureSampleAssets = async () => {
  try {
    const count = await query.get('SELECT COUNT(*) as total FROM assets');
    if (count.total === 0) {
      console.log('Đang tự động khởi tạo danh mục tài sản mẫu cho Nệm Việt Á...');
      const now = new Date().toISOString();

      for (const item of SAMPLE_ASSETS) {
        // Tìm department_id
        let dept = await query.get('SELECT id FROM departments WHERE name LIKE ?', [`%${item.dept_name}%`]);
        let deptId = dept ? dept.id : null;

        // Tìm employee_id
        let emp = await query.get('SELECT id FROM employees WHERE code = ?', [item.emp_code]);
        let empId = emp ? emp.id : null;

        const res = await query.run(`
          INSERT INTO assets (
            code, name, category, department_id, assigned_to, serial_number,
            purchase_date, purchase_price, status, specifications, next_maintenance_date,
            location, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          item.code,
          item.name,
          item.category,
          deptId,
          empId,
          item.serial_number,
          item.purchase_date,
          item.purchase_price,
          item.status,
          item.specifications,
          item.next_maintenance_date,
          item.location,
          item.notes,
          now,
          now
        ]);

        if (empId && res.lastID) {
          await query.run(`
            INSERT INTO asset_allocations (
              asset_id, employee_id, allocated_date, condition_on_alloc, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [
            res.lastID,
            empId,
            item.purchase_date,
            'Hoạt động tốt 100%, mới nguyên đai nguyên kiện',
            'Bàn giao trách nhiệm quản lý và bảo quản tài sản',
            now
          ]);
        }
      }
      console.log('Đã tạo thành công danh mục tài sản ban đầu cho các phòng ban Nệm Việt Á.');
    }
  } catch (err) {
    console.error('Lỗi khởi tạo tài sản ban đầu:', err);
  }
};

// 1. Lấy danh sách tài sản (kèm phân quyền & bộ lọc)
export const getAssets = async (req, res) => {
  try {
    const { department_id, category, status, asset_type, assigned_to, search } = req.query;

    let sql = `
      SELECT a.*, 
             d.name as department_name, 
             e.fullname as assigned_to_name, 
             e.code as assigned_to_code,
             e.avatar as assigned_to_avatar,
             p.name as assigned_to_position
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN employees e ON a.assigned_to = e.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Phân quyền theo role
    if (req.user.roleName === 'EMPLOYEE') {
      // Nhân viên: xem tài sản được cấp cho mình HOẶC xem danh sách tài sản chung
      if (req.query.scope === 'my') {
        sql += ` AND a.assigned_to = ?`;
        params.push(req.user.employeeId);
      }
    } else if (req.user.roleName === 'MANAGER') {
      // Quản lý: xem tài sản thuộc phòng ban mình hoặc được cấp cho phòng mình
      if (req.user.departmentId && req.query.scope === 'dept') {
        sql += ` AND a.department_id = ?`;
        params.push(req.user.departmentId);
      }
    }

    if (department_id) {
      sql += ` AND a.department_id = ?`;
      params.push(department_id);
    }

    if (category) {
      sql += ` AND a.category = ?`;
      params.push(category);
    }

    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    if (asset_type) {
      sql += ` AND a.asset_type = ?`;
      params.push(asset_type);
    }

    if (assigned_to) {
      sql += ` AND a.assigned_to = ?`;
      params.push(assigned_to);
    }

    if (search) {
      sql += ` AND (a.name LIKE ? OR a.code LIKE ? OR a.serial_number LIKE ? OR a.location LIKE ? OR e.fullname LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY a.id ASC`;
    const records = await query.all(sql, params);

    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy danh sách tài sản:', error);
    return res.status(500).json({ message: 'Lỗi lấy danh sách tài sản.' });
  }
};

// 2. Lấy chi tiết tài sản kèm lịch sử cấp phát & bảo trì
export const getAssetById = async (req, res) => {
  const { id } = req.params;
  try {
    const asset = await query.get(`
      SELECT a.*, 
             d.name as department_name, 
             e.fullname as assigned_to_name, 
             e.code as assigned_to_code,
             e.avatar as assigned_to_avatar,
             p.name as assigned_to_position
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN employees e ON a.assigned_to = e.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE a.id = ?
    `, [id]);

    if (!asset) {
      return res.status(404).json({ message: 'Không tìm thấy tài sản.' });
    }

    // Lấy lịch sử cấp phát
    const allocations = await query.all(`
      SELECT al.*, e.fullname, e.code as employee_code, e.avatar, p.name as position_name
      FROM asset_allocations al
      JOIN employees e ON al.employee_id = e.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE al.asset_id = ?
      ORDER BY al.id DESC
    `, [id]);

    // Lấy lịch sử bảo trì / sửa chữa
    const tickets = await query.all(`
      SELECT t.*, e.fullname as reported_by_name, e.code as reported_by_code
      FROM asset_maintenance_tickets t
      JOIN employees e ON t.reported_by = e.id
      WHERE t.asset_id = ?
      ORDER BY t.id DESC
    `, [id]);

    return res.json({
      ...asset,
      allocations,
      maintenance_tickets: tickets
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết tài sản:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// 3. Thêm tài sản mới
export const createAsset = async (req, res) => {
  const {
    code,
    name,
    category,
    department_id,
    assigned_to,
    serial_number,
    purchase_date,
    purchase_price,
    status,
    specifications,
    next_maintenance_date,
    location,
    image_url,
    notes
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập tên tài sản / thiết bị.' });
  }

  try {
    const assetCode = code && code.trim() ? code.trim().toUpperCase() : `TS-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const result = await query.run(`
      INSERT INTO assets (
        code, name, category, department_id, assigned_to, serial_number,
        purchase_date, purchase_price, status, specifications, next_maintenance_date,
        location, image_url, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      assetCode,
      name.trim(),
      category || 'Máy móc sản xuất',
      department_id || null,
      assigned_to || null,
      serial_number ? serial_number.trim() : '',
      purchase_date || now.split('T')[0],
      Number(purchase_price) || 0,
      status || 'Đang sử dụng',
      specifications || '',
      next_maintenance_date || null,
      location || '',
      image_url || '',
      notes || '',
      now,
      now
    ]);

    // Nếu có gán người quản lý thì ghi nhận vào lịch sử cấp phát
    if (assigned_to && result.lastID) {
      await query.run(`
        INSERT INTO asset_allocations (
          asset_id, employee_id, allocated_date, condition_on_alloc, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        result.lastID,
        assigned_to,
        purchase_date || now.split('T')[0],
        'Hoạt động tốt khi bàn giao mới',
        'Bàn giao trực tiếp khi tạo mới tài sản',
        now
      ]);
    }

    return res.status(201).json({
      message: 'Thêm tài sản / thiết bị thành công!',
      id: result.lastID
    });
  } catch (error) {
    console.error('Lỗi tạo tài sản:', error);
    if (error.message?.includes('UNIQUE constraint failed: assets.code')) {
      return res.status(400).json({ message: 'Mã tài sản đã tồn tại trong hệ thống. Vui lòng chọn mã khác.' });
    }
    return res.status(500).json({ message: 'Lỗi thêm tài sản.' });
  }
};

// 4. Cập nhật thông tin tài sản
export const updateAsset = async (req, res) => {
  const { id } = req.params;
  const {
    code,
    name,
    category,
    department_id,
    assigned_to,
    serial_number,
    purchase_date,
    purchase_price,
    status,
    specifications,
    next_maintenance_date,
    location,
    image_url,
    notes
  } = req.body;

  try {
    const existing = await query.get('SELECT * FROM assets WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy tài sản.' });
    }

    const now = new Date().toISOString();

    // Kiểm tra nếu thay đổi người chịu trách nhiệm
    const oldAssignedTo = existing.assigned_to;
    const newAssignedTo = assigned_to !== undefined ? (assigned_to ? Number(assigned_to) : null) : oldAssignedTo;

    if (oldAssignedTo !== newAssignedTo) {
      // Đóng bàn giao cũ
      if (oldAssignedTo) {
        await query.run(`
          UPDATE asset_allocations 
          SET returned_date = ?, condition_on_return = ?
          WHERE asset_id = ? AND employee_id = ? AND returned_date IS NULL
        `, [now.split('T')[0], 'Bàn giao chuyển giao sang người khác', id, oldAssignedTo]);
      }
      // Tạo bàn giao mới
      if (newAssignedTo) {
        await query.run(`
          INSERT INTO asset_allocations (
            asset_id, employee_id, allocated_date, condition_on_alloc, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          id,
          newAssignedTo,
          now.split('T')[0],
          'Tiếp nhận bàn giao quản lý',
          notes || 'Điều chuyển quản lý tài sản',
          now
        ]);
      }
    }

    await query.run(`
      UPDATE assets 
      SET code = ?, name = ?, category = ?, department_id = ?, assigned_to = ?,
          serial_number = ?, purchase_date = ?, purchase_price = ?, status = ?,
          specifications = ?, next_maintenance_date = ?, location = ?,
          image_url = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      code || existing.code,
      name || existing.name,
      category || existing.category,
      department_id !== undefined ? (department_id ? Number(department_id) : null) : existing.department_id,
      newAssignedTo,
      serial_number !== undefined ? serial_number : existing.serial_number,
      purchase_date || existing.purchase_date,
      purchase_price !== undefined ? Number(purchase_price) : existing.purchase_price,
      status || existing.status,
      specifications !== undefined ? specifications : existing.specifications,
      next_maintenance_date !== undefined ? next_maintenance_date : existing.next_maintenance_date,
      location !== undefined ? location : existing.location,
      image_url !== undefined ? image_url : existing.image_url,
      notes !== undefined ? notes : existing.notes,
      now,
      id
    ]);

    return res.json({ message: 'Cập nhật tài sản thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật tài sản:', error);
    return res.status(500).json({ message: 'Lỗi cập nhật tài sản.' });
  }
};

// 5. Cấp phát / Thu hồi tài sản
export const allocateAsset = async (req, res) => {
  const { id } = req.params;
  const { employee_id, action, condition, notes } = req.body; // action: 'allocate' | 'revoke'

  try {
    const asset = await query.get('SELECT * FROM assets WHERE id = ?', [id]);
    if (!asset) return res.status(404).json({ message: 'Không tìm thấy tài sản.' });

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    if (action === 'revoke') {
      // Thu hồi tài sản về trạng thái sẵn sàng
      if (asset.assigned_to) {
        await query.run(`
          UPDATE asset_allocations 
          SET returned_date = ?, condition_on_return = ?, notes = ?
          WHERE asset_id = ? AND employee_id = ? AND returned_date IS NULL
        `, [today, condition || 'Đã thu hồi về kho', notes || '', id, asset.assigned_to]);
      }

      await query.run(`
        UPDATE assets 
        SET assigned_to = NULL, status = 'Sẵn sàng cấp phát', updated_at = ? 
        WHERE id = ?
      `, [now, id]);

      return res.json({ message: 'Đã thu hồi tài sản về kho thành công.' });
    } else {
      // Cấp phát tài sản cho nhân viên
      if (!employee_id) {
        return res.status(400).json({ message: 'Vui lòng chọn nhân viên tiếp nhận tài sản.' });
      }

      // Đóng bàn giao cũ nếu có
      if (asset.assigned_to) {
        await query.run(`
          UPDATE asset_allocations 
          SET returned_date = ?, condition_on_return = ?
          WHERE asset_id = ? AND employee_id = ? AND returned_date IS NULL
        `, [today, 'Thu hồi để cấp phát cho nhân viên mới', id, asset.assigned_to]);
      }

      // Tạo cấp phát mới
      await query.run(`
        INSERT INTO asset_allocations (
          asset_id, employee_id, allocated_date, condition_on_alloc, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        employee_id,
        today,
        condition || 'Hoạt động tốt khi bàn giao',
        notes || '',
        now
      ]);

      await query.run(`
        UPDATE assets 
        SET assigned_to = ?, status = 'Đang sử dụng', updated_at = ? 
        WHERE id = ?
      `, [employee_id, now, id]);

      return res.json({ message: 'Cấp phát tài sản cho nhân viên thành công.' });
    }
  } catch (error) {
    console.error('Lỗi cấp phát tài sản:', error);
    return res.status(500).json({ message: 'Lỗi cấp phát tài sản.' });
  }
};

// 6. Xóa tài sản (Chỉ Admin)
export const deleteAsset = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.roleName !== 'ADMIN') {
      return res.status(403).json({ message: 'Chỉ Ban Giám Đốc (Admin) mới có quyền xóa tài sản.' });
    }

    const asset = await query.get('SELECT * FROM assets WHERE id = ?', [id]);
    if (!asset) return res.status(404).json({ message: 'Không tìm thấy tài sản.' });

    await query.run('DELETE FROM asset_allocations WHERE asset_id = ?', [id]);
    await query.run('DELETE FROM asset_maintenance_tickets WHERE asset_id = ?', [id]);
    await query.run('DELETE FROM assets WHERE id = ?', [id]);

    return res.json({ message: 'Đã xóa tài sản thành công.' });
  } catch (error) {
    console.error('Lỗi xóa tài sản:', error);
    return res.status(500).json({ message: 'Lỗi xóa tài sản.' });
  }
};

// 7. Lấy danh sách phiếu báo hỏng & sửa chữa
export const getMaintenanceTickets = async (req, res) => {
  try {
    const { asset_id, status, priority } = req.query;

    let sql = `
      SELECT t.*, 
             a.name as asset_name, 
             a.code as asset_code, 
             a.category as asset_category, 
             a.location as asset_location,
             d.name as department_name,
             e.fullname as reported_by_name, 
             e.code as reported_by_code
      FROM asset_maintenance_tickets t
      JOIN assets a ON t.asset_id = a.id
      LEFT JOIN departments d ON a.department_id = d.id
      JOIN employees e ON t.reported_by = e.id
      WHERE 1=1
    `;
    const params = [];

    if (asset_id) {
      sql += ` AND t.asset_id = ?`;
      params.push(asset_id);
    }

    if (status) {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority) {
      sql += ` AND t.priority = ?`;
      params.push(priority);
    }

    // Role-based: Employee chỉ xem ticket do mình báo hỏng hoặc liên quan
    if (req.user.roleName === 'EMPLOYEE' && req.query.scope === 'my') {
      sql += ` AND t.reported_by = ?`;
      params.push(req.user.employeeId);
    }

    sql += ` ORDER BY t.id DESC`;
    const tickets = await query.all(sql, params);

    return res.json(tickets);
  } catch (error) {
    console.error('Lỗi lấy phiếu báo hỏng:', error);
    return res.status(500).json({ message: 'Lỗi lấy danh sách phiếu sửa chữa.' });
  }
};

// 8. Tạo phiếu báo hỏng mới
export const createMaintenanceTicket = async (req, res) => {
  const { asset_id, title, description, priority } = req.body;

  if (!asset_id) {
    return res.status(400).json({ message: 'Vui lòng chọn tài sản / thiết bị cần báo hỏng.' });
  }
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập tiêu đề sự cố hỏng hóc.' });
  }

  try {
    const reported_by = req.user.employeeId;
    if (!reported_by) {
      return res.status(400).json({ message: 'Tài khoản chưa liên kết hồ sơ nhân viên để báo hỏng.' });
    }

    const now = new Date().toISOString();
    const result = await query.run(`
      INSERT INTO asset_maintenance_tickets (
        asset_id, reported_by, title, description, priority, status,
        repair_cost, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'Chờ tiếp nhận', 0, ?, ?)
    `, [
      asset_id,
      reported_by,
      title.trim(),
      description ? description.trim() : '',
      priority || 'Trung bình',
      now,
      now
    ]);

    // Tự động chuyển trạng thái tài sản sang 'Đang bảo trì / Sửa chữa'
    await query.run(`
      UPDATE assets SET status = 'Đang bảo trì / Sửa chữa', updated_at = ? WHERE id = ?
    `, [now, asset_id]);

    return res.status(201).json({
      message: 'Gửi phiếu báo hỏng thiết bị thành công. Quản lý kỹ thuật sẽ sớm tiếp nhận xử lý!',
      id: result.lastID
    });
  } catch (error) {
    console.error('Lỗi gửi phiếu báo hỏng:', error);
    return res.status(500).json({ message: 'Lỗi gửi phiếu báo hỏng.' });
  }
};

// 9. Cập nhật xử lý phiếu bảo trì / sửa chữa
export const updateMaintenanceTicket = async (req, res) => {
  const { id } = req.params;
  const { status, repair_cost, repair_date, repaired_by, notes } = req.body;

  try {
    const ticket = await query.get('SELECT * FROM asset_maintenance_tickets WHERE id = ?', [id]);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy phiếu sửa chữa.' });

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    await query.run(`
      UPDATE asset_maintenance_tickets 
      SET status = ?, repair_cost = ?, repair_date = ?, repaired_by = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      status || ticket.status,
      repair_cost !== undefined ? Number(repair_cost) : ticket.repair_cost,
      repair_date || (status === 'Đã hoàn thành' ? today : ticket.repair_date),
      repaired_by || ticket.repaired_by,
      notes !== undefined ? notes : ticket.notes,
      now,
      id
    ]);

    // Nếu đã hoàn thành sửa chữa, đưa tài sản về trạng thái 'Đang sử dụng'
    if (status === 'Đã hoàn thành') {
      await query.run(`
        UPDATE assets SET status = 'Đang sử dụng', updated_at = ? WHERE id = ?
      `, [now, ticket.asset_id]);
    } else if (status === 'Không thể sửa') {
      await query.run(`
        UPDATE assets SET status = 'Hỏng / Chờ thanh lý', updated_at = ? WHERE id = ?
      `, [now, ticket.asset_id]);
    }

    return res.json({ message: 'Cập nhật tiến độ sửa chữa thành công.' });
  } catch (error) {
    console.error('Lỗi cập nhật phiếu sửa chữa:', error);
    return res.status(500).json({ message: 'Lỗi cập nhật phiếu sửa chữa.' });
  }
};

// 10. Thống kê Dashboard tài sản
export const getAssetStats = async (req, res) => {
  try {
    const totalAssets = await query.get(`
      SELECT 
        COUNT(*) as count, 
        SUM(purchase_price * COALESCE(quantity, 1)) as total_value,
        SUM(COALESCE(remaining_value, 0)) as total_remaining_value,
        SUM(CASE WHEN asset_type = 'TSCĐ' THEN 1 ELSE 0 END) as tscd_count,
        SUM(CASE WHEN asset_type = 'CCDC' THEN 1 ELSE 0 END) as ccdc_count
      FROM assets
    `);

    const inUse = await query.get(`SELECT COUNT(*) as count FROM assets WHERE status = 'Đang sử dụng'`);
    const available = await query.get(`SELECT COUNT(*) as count FROM assets WHERE status = 'Sẵn sàng cấp phát'`);
    const maintaining = await query.get(`SELECT COUNT(*) as count FROM assets WHERE status IN ('Đang bảo trì / Sửa chữa', 'Hỏng / Chờ thanh lý')`);

    // Danh sách thiết bị sắp đến hạn bảo trì/đăng kiểm trong 45 ngày tới
    const upcomingMaintenance = await query.all(`
      SELECT a.*, d.name as department_name, e.fullname as assigned_to_name
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN employees e ON a.assigned_to = e.id
      WHERE a.next_maintenance_date IS NOT NULL 
        AND a.next_maintenance_date != ''
      ORDER BY a.next_maintenance_date ASC
      LIMIT 6
    `);

    // Thống kê theo danh mục
    const byCategory = await query.all(`
      SELECT category, COUNT(*) as count, SUM(purchase_price * COALESCE(quantity, 1)) as value, SUM(COALESCE(remaining_value, 0)) as remaining_value
      FROM assets
      GROUP BY category
      ORDER BY count DESC
    `);

    // Thống kê theo phòng ban
    const byDepartment = await query.all(`
      SELECT COALESCE(d.name, 'Chưa phân bổ') as department_name, 
             COUNT(a.id) as count, 
             SUM(a.purchase_price * COALESCE(a.quantity, 1)) as value,
             SUM(COALESCE(a.remaining_value, 0)) as remaining_value
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      GROUP BY a.department_id
      ORDER BY value DESC
    `);

    return res.json({
      total_count: totalAssets?.count || 0,
      total_value: totalAssets?.total_value || 0,
      total_remaining_value: totalAssets?.total_remaining_value || 0,
      tscd_count: totalAssets?.tscd_count || 0,
      ccdc_count: totalAssets?.ccdc_count || 0,
      in_use_count: inUse?.count || 0,
      available_count: available?.count || 0,
      maintaining_count: maintaining?.count || 0,
      upcoming_maintenance: upcomingMaintenance,
      by_category: byCategory,
      by_department: byDepartment
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê tài sản:', error);
    return res.status(500).json({ message: 'Lỗi lấy dữ liệu thống kê.' });
  }
};

// 11. Xuất báo cáo tài sản sang Excel
export const exportAssets = async (req, res) => {
  try {
    const { department_id, category, status, asset_type, search } = req.query;

    let sql = `
      SELECT a.*, 
             d.name as department_name, 
             e.fullname as assigned_to_name, 
             e.code as assigned_to_code
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN employees e ON a.assigned_to = e.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      sql += ` AND a.department_id = ?`;
      params.push(department_id);
    }
    if (category) {
      sql += ` AND a.category = ?`;
      params.push(category);
    }
    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }
    if (asset_type) {
      sql += ` AND a.asset_type = ?`;
      params.push(asset_type);
    }
    if (search) {
      sql += ` AND (a.name LIKE ? OR a.code LIKE ? OR a.serial_number LIKE ? OR a.location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY a.department_id ASC, a.id ASC`;
    const assets = await query.all(sql, params);

    // Format data for Excel
    const dataRows = assets.map((item, idx) => {
      const qty = item.quantity || 1;
      const unitPrice = item.purchase_price || 0;
      const totalOriginal = unitPrice * qty;
      const remaining = item.remaining_value || 0;
      const rate = totalOriginal > 0 ? ((remaining / totalOriginal) * 100).toFixed(1) + '%' : '0%';

      return {
        'STT': idx + 1,
        'Mã Tài Sản': item.code,
        'Tên Tài Sản / Thiết Bị': item.name,
        'Phân Loại': item.asset_type || 'CCDC',
        'Danh Mục': item.category,
        'Phòng Ban / Kho / Xưởng': item.department_name || 'Chưa phân bổ',
        'Model / Quy Cách': item.serial_number || item.specifications || '',
        'Số Lượng': qty,
        'Đơn Giá Mua Mới (VNĐ)': unitPrice,
        'Thành Tiền Nguyên Giá (VNĐ)': totalOriginal,
        'Số Năm Sử Dụng': item.years_used || 0,
        'Vòng Đời Tối Thiểu (năm)': item.lifespan_years || 0,
        'Tỷ Lệ Còn Lại': rate,
        'Giá Trị Còn Lại (VNĐ)': remaining,
        'Người Quản Lý / Sử Dụng': item.assigned_to_name ? `${item.assigned_to_name} (${item.assigned_to_code})` : 'Chưa bàn giao',
        'Trạng Thái': item.status,
        'Ghi Chú': item.notes || ''
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataRows);

    // Column widths
    ws['!cols'] = [
      { wch: 6 },  // STT
      { wch: 14 }, // Mã
      { wch: 35 }, // Tên
      { wch: 12 }, // Phân loại
      { wch: 22 }, // Danh mục
      { wch: 22 }, // Phòng ban
      { wch: 25 }, // Model
      { wch: 10 }, // SL
      { wch: 20 }, // Đơn giá
      { wch: 24 }, // Thành tiền
      { wch: 15 }, // Năm SD
      { wch: 20 }, // Vòng đời
      { wch: 15 }, // Tỷ lệ
      { wch: 22 }, // Giá trị còn lại
      { wch: 25 }, // Người giữ
      { wch: 18 }, // Trạng thái
      { wch: 30 }  // Ghi chú
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Danh Mục Tài Sản');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Bao_Cao_Tai_San_Nem_Viet_A.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (error) {
    console.error('Lỗi xuất báo cáo tài sản:', error);
    return res.status(500).json({ message: 'Lỗi xuất file Excel.' });
  }
};
