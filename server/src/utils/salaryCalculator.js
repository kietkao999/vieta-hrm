/**
 * Helper tính toán Lương Tầng - Bậc theo Thông báo số 18/2026/TB-VA
 * và Thâm niên công tác thực tế của Công ty TNHH TM SX Việt Á.
 */

/**
 * Tính toán thâm niên làm việc tính đến kỳ lương (tháng/năm)
 * @param {string|Date} startDate Ngày vào làm (VD: '2023-05-15')
 * @param {number|string} targetMonth Tháng tính lương (1-12)
 * @param {number|string} targetYear Năm tính lương (VD: 2026)
 * @returns {{ months: number, years: number, seniorityText: string }}
 */
export function calculateSeniority(startDate, targetMonth = 8, targetYear = 2026) {
  if (!startDate) {
    return { months: 0, years: 0, seniorityText: 'Dưới 1 năm' };
  }

  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    return { months: 0, years: 0, seniorityText: 'Dưới 1 năm' };
  }

  const tYear = parseInt(targetYear, 10);
  const tMonth = parseInt(targetMonth, 10);

  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1; // 1-12
  const startDay = start.getDate();

  let diffMonths = (tYear - startYear) * 12 + (tMonth - startMonth);
  // Nếu ngày vào làm sau ngày 15 của tháng thì tháng đầu tiên chưa tính đủ 1 tháng
  if (startDay > 15) {
    diffMonths = Math.max(0, diffMonths - 0.5);
  }

  const totalYears = Math.floor(diffMonths / 12);
  const remainMonths = Math.floor(diffMonths % 12);

  let seniorityText = '';
  if (totalYears > 0 && remainMonths > 0) {
    seniorityText = `${totalYears} năm ${remainMonths} tháng`;
  } else if (totalYears > 0) {
    seniorityText = `${totalYears} năm`;
  } else if (remainMonths > 0) {
    seniorityText = `${remainMonths} tháng`;
  } else {
    seniorityText = 'Mới vào làm';
  }

  return {
    months: diffMonths,
    years: diffMonths / 12,
    seniorityText
  };
}

/**
 * Tính toán Tầng Lương và Thưởng Trách Nhiệm định mức theo Chức danh & Thâm niên
 * Theo Thông báo số 18/2026/TB-VA:
 * - Tầng 1: Nhân viên mới (< 1 năm) -> 4.500.000 đ | KPI TN: 1.000.000 đ
 * - Tầng 2: Chuyên viên (1 năm <= thâm niên < 3 năm) -> 5.000.000 đ | KPI TN: 1.000.000 đ
 * - Tầng 3: Chuyên viên cao cấp (thâm niên >= 3 năm) -> 5.500.000 đ | KPI TN: 1.000.000 đ
 * - Tầng 4: Phó phòng / Phó quản lý -> 6.000.000 đ | KPI TN: 1.500.000 đ
 * - Tầng 5: Trưởng phòng / Quản lý -> 6.500.000 đ | KPI TN: 2.000.000 đ
 * - Tầng 6: Phó Giám đốc -> 8.000.000 đ | KPI TN: 2.500.000 đ
 * - Tầng 7: Giám đốc -> 9.500.000 đ
 */
export function calculateTierAndResponsibility(positionName = '', startDate = null, targetMonth = 8, targetYear = 2026, customTierName = null) {
  const posLower = (positionName || '').toLowerCase().trim();

  // 1. Nếu có tùy chỉnh Tầng thủ công hợp lệ
  if (customTierName) {
    const tStr = customTierName.toString().trim();
    if (tStr.includes('7') || tStr === 'Tầng 7' || tStr === 'Tầng 9') {
      return { tierNumber: 7, tierName: 'Tầng 7', tierSalary: 9500000, respQuota: 0, title: 'Giám đốc' };
    }
    if (tStr.includes('6') || tStr === 'Tầng 6') {
      return { tierNumber: 6, tierName: 'Tầng 6', tierSalary: 8000000, respQuota: 2500000, title: 'Phó Giám đốc' };
    }
    if (tStr.includes('5') || tStr === 'Tầng 5') {
      return { tierNumber: 5, tierName: 'Tầng 5', tierSalary: 6500000, respQuota: 2000000, title: 'Trưởng phòng / Quản lý' };
    }
    if (tStr.includes('4') || tStr === 'Tầng 4') {
      return { tierNumber: 4, tierName: 'Tầng 4', tierSalary: 6000000, respQuota: 1500000, title: 'Phó quản lý / Phó phòng' };
    }
    if (tStr.includes('3') || tStr === 'Tầng 3') {
      return { tierNumber: 3, tierName: 'Tầng 3', tierSalary: 5500000, respQuota: 1000000, title: 'Chuyên viên cao cấp (≥ 3 năm)' };
    }
    if (tStr.includes('2') || tStr === 'Tầng 2') {
      return { tierNumber: 2, tierName: 'Tầng 2', tierSalary: 5000000, respQuota: 1000000, title: 'Chuyên viên (1-3 năm)' };
    }
    if (tStr.includes('1') || tStr === 'Tầng 1') {
      return { tierNumber: 1, tierName: 'Tầng 1', tierSalary: 4500000, respQuota: 1000000, title: 'Nhân viên (< 1 năm)' };
    }
  }

  // 2. Xét theo chức vụ lãnh đạo / quản lý
  if (posLower.includes('tổng giám đốc') || (posLower.includes('giám đốc') && !posLower.includes('phó'))) {
    return { tierNumber: 7, tierName: 'Tầng 7', tierSalary: 9500000, respQuota: 0, title: 'Giám đốc' };
  }

  if (posLower.includes('phó giám đốc')) {
    return { tierNumber: 6, tierName: 'Tầng 6', tierSalary: 8000000, respQuota: 2500000, title: 'Phó Giám đốc' };
  }

  if (posLower.includes('trưởng phòng') || (posLower.includes('quản lý') && !posLower.includes('phó') && !posLower.includes('nv') && !posLower.includes('nhân viên'))) {
    return { tierNumber: 5, tierName: 'Tầng 5', tierSalary: 6500000, respQuota: 2000000, title: 'Trưởng phòng / Quản lý' };
  }

  if (posLower.includes('phó phòng') || posLower.includes('phó quản lý') || posLower.includes('phó ql')) {
    return { tierNumber: 4, tierName: 'Tầng 4', tierSalary: 6000000, respQuota: 1500000, title: 'Phó quản lý / Phó phòng' };
  }

  // 3. Nhân sự chuyên môn & sản xuất (nhảy tầng tự động theo thâm niên làm việc)
  const seniority = calculateSeniority(startDate, targetMonth, targetYear);
  const years = seniority.years;

  if (years >= 3.0) {
    // Làm từ đủ 3 năm trở lên -> Tầng 3 (Chuyên viên cao cấp: 5.500.000 đ)
    return {
      tierNumber: 3,
      tierName: 'Tầng 3',
      tierSalary: 5500000,
      respQuota: 1000000,
      title: 'Chuyên viên cao cấp (≥ 3 năm)',
      seniorityText: seniority.seniorityText
    };
  } else if (years >= 1.0) {
    // Làm từ đủ 1 năm đến dưới 3 năm -> Tầng 2 (Chuyên viên: 5.000.000 đ)
    return {
      tierNumber: 2,
      tierName: 'Tầng 2',
      tierSalary: 5000000,
      respQuota: 1000000,
      title: 'Chuyên viên (1 - 3 năm)',
      seniorityText: seniority.seniorityText
    };
  } else {
    // Làm dưới 1 năm -> Tầng 1 (Nhân viên mới: 4.500.000 đ)
    return {
      tierNumber: 1,
      tierName: 'Tầng 1',
      tierSalary: 4500000,
      respQuota: 1000000,
      title: 'Nhân viên (< 1 năm)',
      seniorityText: seniority.seniorityText
    };
  }
}

/**
 * Tính toán tiền Lương theo Bậc nhân sự
 * Quy tắc: Mỗi bậc tương ứng 400.000 VNĐ / bậc
 * @param {number|string} grade Bậc nhân sự (VD: 0, 1, 2, 3, 4, 5, 'Bậc 2')
 * @returns {{ gradeLevel: number, gradeSalary: number, gradeText: string }}
 */
export function calculateGradeSalary(grade = 0) {
  let gNum = 0;
  if (typeof grade === 'string') {
    const match = grade.match(/\d+/);
    gNum = match ? parseInt(match[0], 10) : 0;
  } else if (typeof grade === 'number') {
    gNum = Math.max(0, Math.floor(grade));
  }

  const gradeSalary = gNum * 400000;
  const gradeText = gNum > 0 ? `Bậc ${gNum}` : 'Bậc 0';

  return {
    gradeLevel: gNum,
    gradeSalary,
    gradeText
  };
}

/**
 * Tính toàn diện Bảng Lương tháng cho 1 nhân sự theo chuẩn quy chế
 */
export function calculateFullPayroll({
  tierSalary = 4500000,
  gradeSalary = 0,
  workDays = 26,
  standardDays = 26,
  otHours = 0,
  respQuota = 1000000,
  respRate = 1.0,
  respPenalty = 0,
  perfBonus = 0,
  perfDeduct = 0,
  otherBonus = 0,
  mealPhoneAllowance = 0,
  driverAllowance = 0,
  otherAllowance = 0,
  socialInsurance = 0,
  unionFee = 0,
  incomeTax = 0,
  advancePayment = 0,
  hourDeduction = 0,
  otherDeduction = 0,
  uniformRefund = 0
}) {
  const baseSalary = tierSalary + gradeSalary;
  const baseWorkSalary = standardDays > 0 ? Math.round((baseSalary / standardDays) * workDays) : 0;
  const otSalary = (standardDays > 0) ? Math.round(((baseSalary / standardDays) / 8) * 1.5 * otHours) : 0;

  const respNet = Math.max(0, Math.round(respQuota * respRate) - respPenalty);
  const perfNet = Math.max(0, perfBonus - perfDeduct);

  const totalBonus = respNet + perfNet + otherBonus + mealPhoneAllowance + driverAllowance + otherAllowance;
  const totalIncome = baseWorkSalary + otSalary + totalBonus;

  const totalDeductions = socialInsurance + unionFee + incomeTax + advancePayment + hourDeduction + otherDeduction;
  const netSalary = Math.max(0, totalIncome - totalDeductions + uniformRefund);

  return {
    baseSalary,
    baseWorkSalary,
    otSalary,
    respNet,
    perfNet,
    totalBonus,
    totalIncome,
    totalDeductions,
    netSalary
  };
}
