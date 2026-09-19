import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import { query, initDatabase } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importAssets() {
  try {
    await initDatabase();
    console.log('=== BẮT ĐẦU IMPORT TOÀN BỘ TÀI SẢN NỆM VIỆT Á VÀO DATABASE ===');

    const excelPath = path.resolve(__dirname, '../../../ƯỚC TÍNH TÀI SẢN CÔNG TY.xlsx');
    const wb = xlsx.readFile(excelPath);

    // Map phòng ban
    const deptMap = {
      'XƯỞNG': { deptId: 10, prefix: 'TS-XN', deptName: 'Xưởng sản xuất nệm', defaultCat: 'Máy móc sản xuất' },
      'VĂN PHÒNG': { deptId: 9, prefix: 'TS-VP', deptName: 'Khối văn phòng', defaultCat: 'Thiết bị IT & Văn phòng' },
      'MARKETING': { deptId: 13, prefix: 'TS-MKT', deptName: 'Phòng Marketing', defaultCat: 'Thiết bị IT & Văn phòng' },
      'MỸ THO': { deptId: 11, prefix: 'TS-MT', deptName: 'Kho Mỹ Tho', defaultCat: 'Thiết bị kho bãi' },
      'CẦN THƠ': { deptId: 8, prefix: 'TS-CT', deptName: 'Kho Cần Thơ', defaultCat: 'Thiết bị kho bãi' }
    };

    // Lấy danh sách nhân viên để gán người phụ trách
    const employees = await query.all('SELECT id, code, fullname, department_id FROM employees');
    const empByCode = {};
    const empByName = {};
    employees.forEach(e => {
      empByCode[e.code] = e;
      empByName[e.fullname.toLowerCase()] = e;
    });

    // Helper gán người quản lý
    const getAssignee = (name, category, deptId, model) => {
      const upper = (name + ' ' + model).toUpperCase();
      // Xe tải Cần Thơ -> Trần Thanh Hoài (VietA 007)
      if (deptId === 8 && upper.includes('63C-18628')) return empByCode['VietA 007']?.id || null;
      // Xe tải Mỹ Tho -> Nguyễn Hoàng Quân (VietA 023)
      if (deptId === 11 && upper.includes('XE TẢI')) return empByCode['VietA 023']?.id || null;
      // Marketing -> Phan Tuấn Kiệt (VietA 043)
      if (deptId === 13 && (upper.includes('MÁY ẢNH') || upper.includes('GIMBAL') || upper.includes('POCKET') || upper.includes('PC'))) {
        return empByCode['VietA 043']?.id || null;
      }
      // Văn phòng kế toán -> Huỳnh Thị Trúc Xinh hoặc Nguyễn Quốc Hùng
      if (deptId === 9 && upper.includes('BÀN GỖ LÀM VIỆC (PGĐ)')) return empByCode['VietA 002']?.id || null; // Võ Minh Cường
      if (deptId === 9 && (upper.includes('MÁY IN') || upper.includes('MÁY CHẤM CÔNG'))) return empByCode['VietA 032']?.id || null; // Huỳnh Thị Trúc Xinh
      if (deptId === 9 && upper.includes('KẾ TOÁN')) return empByCode['VietA 031']?.id || null; // Nguyễn Quốc Hùng
      // Xưởng nệm -> Trần Minh Lý (VietA 048)
      if (deptId === 10 && (upper.includes('MÁY MAY') || upper.includes('MÁY ÉP') || upper.includes('XE TẢI'))) {
        return empByCode['VietA 048']?.id || null;
      }
      // Kho Cần Thơ Quản lý -> Nguyễn Thị Thu Tâm (VietA 003)
      if (deptId === 8 && (upper.includes('MÁY CHẤM CÔNG') || upper.includes('MÁY ĐẾM TIỀN') || upper.includes('MÁY LẠNH'))) {
        return empByCode['VietA 003']?.id || null;
      }
      // Kho Mỹ Tho Quản lý -> Dương Thị Tuyết Hường (VietA 015) hoặc Nguyễn Tuấn Kiệt (VietA 022)
      if (deptId === 11 && (upper.includes('MÁY ĐẾM TIỀN') || upper.includes('MÁY IN') || upper.includes('MÁY LẠNH'))) {
        return empByCode['VietA 015']?.id || null;
      }
      return null;
    };

    // Xóa tài sản cũ để làm sạch và nạp dữ liệu chuẩn xác
    await query.run('DELETE FROM asset_allocations');
    await query.run('DELETE FROM asset_maintenance_tickets');
    await query.run('DELETE FROM assets');

    const now = new Date().toISOString();
    let totalImported = 0;
    let totalOriginalValue = 0;
    let totalRemainingValue = 0;
    let totalTscd = 0;
    let totalCcdc = 0;

    for (const sheetName of wb.SheetNames) {
      const meta = deptMap[sheetName.trim()];
      if (!meta) continue;

      const sheet = wb.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      let currentSubCategory = '';
      let sheetCount = 0;

      for (const r of rows.slice(2)) {
        const stt = r[0];
        const name = String(r[1] || '').trim();
        const model = String(r[2] || '').trim();
        let qty = Number(r[3]) || 1;
        if (qty <= 0) qty = 1;
        let type = String(r[4] || '').trim().toUpperCase();

        let priceRaw = r[5];
        let price = 0;
        if (typeof priceRaw === 'number') price = priceRaw;
        else if (typeof priceRaw === 'string') {
          price = Number(priceRaw.replace(/[^0-9]/g, '')) || 0;
        }

        let yearsUsedRaw = r[6];
        let yearsUsed = 0;
        if (typeof yearsUsedRaw === 'number') yearsUsed = yearsUsedRaw;
        else if (typeof yearsUsedRaw === 'string') {
          const match = yearsUsedRaw.match(/(\d+(\.\d+)?)/);
          if (match) {
            if (yearsUsedRaw.toLowerCase().includes('tháng')) {
              yearsUsed = Number(match[1]) / 12;
            } else {
              yearsUsed = Number(match[1]);
            }
          }
        }

        let lifespanRaw = r[7];
        let lifespan = 0;
        if (typeof lifespanRaw === 'number') lifespan = lifespanRaw;
        else if (typeof lifespanRaw === 'string') {
          const match = lifespanRaw.match(/(\d+(\.\d+)?)/);
          if (match) lifespan = Number(match[1]);
        }

        let rate = 0;
        if (lifespan > 0) {
          rate = Math.max(0, 1 - (yearsUsed / lifespan));
        }

        let remainingValRaw = r[9];
        let remainingVal = 0;
        if (typeof remainingValRaw === 'number') remainingVal = remainingValRaw;
        else if (typeof remainingValRaw === 'string') {
          remainingVal = Number(remainingValRaw.replace(/[^0-9]/g, '')) || 0;
        }
        if (remainingVal === 0 && price > 0 && rate > 0) {
          remainingVal = Math.round(price * qty * rate);
        }

        // Dòng tiêu đề phân nhóm
        if (typeof stt === 'string' && stt.length > 1 && !name && !priceRaw) {
          currentSubCategory = stt.trim();
          continue;
        }
        if (String(stt).includes('TỔNG CỘNG') || String(stt).includes('Trong đó') || name.includes('TỔNG CỘNG')) {
          continue;
        }

        if (!name) continue;

        sheetCount++;
        totalImported++;

        // Phân loại danh mục
        let category = meta.defaultCat;
        const upperName = (name + ' ' + currentSubCategory + ' ' + model).toUpperCase();
        if (upperName.includes('XE TẢI') || upperName.includes('XE MÁY') || upperName.includes('PHƯƠNG TIỆN') || upperName.includes('GIAO HÀNG')) {
          category = 'Xe cộ & Vận tải';
        } else if (upperName.includes('MÁY MAY') || upperName.includes('MÁY ÉP') || upperName.includes('MÁY CẮT') || upperName.includes('MÁY BƠM') || upperName.includes('XƯỞNG') || upperName.includes('NHÀ XƯỞNG') || upperName.includes('GÁC')) {
          category = 'Máy móc sản xuất';
        } else if (upperName.includes('MÁY TÍNH') || upperName.includes('PC') || upperName.includes('MÁY IN') || upperName.includes('LAPTOP') || upperName.includes('CAMERA') || upperName.includes('MÁY ẢNH') || upperName.includes('GIMBAL') || upperName.includes('MÀN HÌNH')) {
          category = 'Thiết bị IT & Văn phòng';
        } else if (upperName.includes('XE NÂNG') || upperName.includes('KỆ') || upperName.includes('PALLET') || upperName.includes('BÌNH CHỮA CHÁY') || upperName.includes('CÂN')) {
          category = 'Thiết bị kho bãi';
        }

        if (!type) {
          type = (price >= 30000000 || category === 'Xe cộ & Vận tải' || upperName.includes('GÁC')) ? 'TSCĐ' : 'CCDC';
        }

        if (type === 'TSCĐ') totalTscd++;
        else totalCcdc++;

        const code = `${meta.prefix}-${String(sheetCount).padStart(3, '0')}`;
        const originalVal = price * qty;
        totalOriginalValue += originalVal;
        totalRemainingValue += remainingVal;

        const assignedEmpId = getAssignee(name, category, meta.deptId, model);

        // Ngày bảo trì tiếp theo cho xe cộ & máy móc lớn
        let nextMaintenance = null;
        if (category === 'Xe cộ & Vận tải') {
          nextMaintenance = '2026-10-30';
        } else if (category === 'Máy móc sản xuất' && price >= 10000000) {
          nextMaintenance = '2026-11-15';
        }

        const res = await query.run(`
          INSERT INTO assets (
            code, name, category, department_id, assigned_to, serial_number,
            purchase_date, purchase_price, status, specifications, next_maintenance_date,
            location, notes, quantity, asset_type, years_used, lifespan_years, remaining_value,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          code,
          name,
          category,
          meta.deptId,
          assignedEmpId,
          model || '',
          '2022-09-01', // Ngày đưa vào sử dụng ước tính
          price,
          'Đang sử dụng',
          [model ? `Model: ${model}` : '', currentSubCategory ? `Nhóm: ${currentSubCategory}` : ''].filter(Boolean).join(' | '),
          nextMaintenance,
          meta.deptName,
          typeof yearsUsedRaw === 'string' && isNaN(Number(yearsUsedRaw)) ? `Ghi chú thời gian: ${yearsUsedRaw}` : '',
          qty,
          type,
          Number(yearsUsed.toFixed(2)),
          Number(lifespan.toFixed(2)),
          remainingVal,
          now,
          now
        ]);

        // Ghi nhận cấp phát nếu có nhân viên quản lý
        if (assignedEmpId && res.lastID) {
          await query.run(`
            INSERT INTO asset_allocations (
              asset_id, employee_id, allocated_date, condition_on_alloc, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [
            res.lastID,
            assignedEmpId,
            '2022-09-01',
            'Hoạt động tốt, đang vận hành phục vụ công việc',
            'Bàn giao trách nhiệm quản lý tài sản đơn vị',
            now
          ]);
        }
      }
      console.log(`✓ Đã import Sheet [${sheetName}]: ${sheetCount} tài sản / thiết bị.`);
    }

    console.log('\n==================================================');
    console.log('🎉 TỔNG KẾT IMPORT TÀI SẢN NỆM VIỆT Á:');
    console.log(`- Tổng số danh mục tài sản đã nạp: ${totalImported} mục`);
    console.log(`- Phân loại TSCĐ: ${totalTscd} tài sản | CCDC: ${totalCcdc} công cụ`);
    console.log(`- Tổng Nguyên Giá (VNĐ): ${totalOriginalValue.toLocaleString('vi-VN')} đ`);
    console.log(`- Tổng Giá Trị Còn Lại (VNĐ): ${totalRemainingValue.toLocaleString('vi-VN')} đ`);
    console.log('==================================================\n');

  } catch (error) {
    console.error('Lỗi khi import tài sản:', error);
  }
}

importAssets();
