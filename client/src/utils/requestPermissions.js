/**
 * Hàm kiểm tra xem một User có thuộc quyền quản lý / phụ trách của một phòng ban hay không.
 * Xử lý thông minh các trường hợp Trưởng phòng thuộc Khối văn phòng nhưng phụ trách bộ phận chuyên môn
 * (Ví dụ: Nguyễn Quốc Hùng - Trưởng phòng Kế toán, Huỳnh Thị Trúc Xinh - Trưởng phòng HCNS, Lê Huy Hoàng - R&D).
 */
export const isUserMatchingDepartment = (user, deptName) => {
  if (!user || !deptName) return false;
  if (user.roleName === 'ADMIN') return true;

  const userDept = (user.departmentName || user.department_name || '').toLowerCase().trim();
  const userPos = (user.positionName || user.position_name || '').toLowerCase().trim();
  const userName = (user.fullname || '').toLowerCase().trim();
  const target = deptName.toLowerCase().trim();

  // 1. Trùng khớp trực tiếp
  if (userDept && (userDept === target || target.includes(userDept) || userDept.includes(target))) {
    return true;
  }

  // 2. Mapping theo vị trí chuyên môn / danh tính quản lý thực tế
  // Phòng Kế toán / Kế toán - Tài chính
  if (target.includes('kế toán') || target.includes('tài chính')) {
    if (userPos.includes('kế toán') || userName.includes('hùng') || userDept === 'khối văn phòng') {
      return true;
    }
  }

  // Phòng Hành chính Nhân sự
  if (target.includes('hành chính') || target.includes('nhân sự') || target.includes('hcns')) {
    if (userPos.includes('hcns') || userPos.includes('nhân sự') || userName.includes('xinh') || userDept === 'khối văn phòng') {
      return true;
    }
  }

  // Phòng R&D
  if (target.includes('r&d') || target.includes('nghiên cứu')) {
    if (userPos.includes('r&d') || userName.includes('hoàng') || userDept === 'khối văn phòng') {
      return true;
    }
  }

  // Phòng Marketing
  if (target.includes('marketing')) {
    if (userPos.includes('marketing') || userName.includes('kiệt') || userDept === 'khối văn phòng') {
      return true;
    }
  }

  // Phòng Kinh doanh
  if (target.includes('kinh doanh')) {
    if (userPos.includes('kinh doanh') || userDept.includes('kinh doanh') || userName.includes('hưng')) {
      return true;
    }
  }

  // Xưởng sản xuất nệm
  if (target.includes('nệm')) {
    if (userDept.includes('nệm') || userName.includes('lý')) {
      return true;
    }
  }

  // Xưởng sản xuất gối
  if (target.includes('gối')) {
    if (userDept.includes('gối') || userName.includes('cần')) {
      return true;
    }
  }

  // Kho Cần Thơ
  if (target.includes('cần thơ')) {
    if (userDept.includes('cần thơ') || userName.includes('tâm')) {
      return true;
    }
  }

  // Kho Mỹ Tho
  if (target.includes('mỹ tho')) {
    if (userDept.includes('mỹ tho') || userName.includes('hường')) {
      return true;
    }
  }

  // Khối văn phòng chung
  if (target.includes('văn phòng')) {
    if (userDept.includes('văn phòng')) {
      return true;
    }
  }

  return false;
};

/**
 * Kiểm tra quyền duyệt cấp 1 (Trưởng phòng duyệt / Phê duyệt chủ trương Mua dịch vụ hoặc Đề nghị thanh toán)
 */
export const canUserApproveHOD = (user, request) => {
  if (!user || !request) return false;
  if (request.status !== 'PENDING_HOD') return false;
  if (user.roleName === 'ADMIN') return true;
  if (user.roleName !== 'MANAGER' && user.roleName !== 'HR') return false;

  // Nếu chỉ định đích danh user duyệt
  if (request.target_approver_id && Number(request.target_approver_id) === Number(user.userId || user.id)) {
    return true;
  }

  // Nếu gửi đến phòng ban tiếp nhận duyệt
  if (request.approver_department && isUserMatchingDepartment(user, request.approver_department)) {
    return true;
  }

  // Nếu xuất phát từ phòng ban của Manager
  if (request.department && isUserMatchingDepartment(user, request.department)) {
    return true;
  }

  return false;
};

/**
 * Kiểm tra quyền thẩm định tài chính (Kế toán trưởng / Kế toán duyệt cấp 2 cho Đề nghị thanh toán)
 */
export const canUserApproveAccountant = (user, request) => {
  if (!user || !request) return false;
  if (request.status !== 'PENDING_ACC') return false;
  if (user.roleName === 'ADMIN' || user.roleName === 'HR') return true;

  const userDept = (user.departmentName || user.department_name || '').toLowerCase();
  const userPos = (user.positionName || user.position_name || '').toLowerCase();
  const userName = (user.fullname || '').toLowerCase();

  return (
    userDept === 'khối văn phòng' ||
    userDept.includes('kế toán') ||
    userPos.includes('kế toán') ||
    userName.includes('hùng')
  );
};

/**
 * Kiểm tra quyền Ban Giám Đốc duyệt chi cấp 3
 */
export const canUserApproveDirector = (user, request) => {
  if (!user || !request) return false;
  if (request.status !== 'PENDING_BOD' && request.status !== 'PENDING_DIRECTOR') return false;
  return user.roleName === 'ADMIN';
};

/**
 * Kiểm tra quyền từ chối đề xuất
 */
export const canUserRejectRequest = (user, request) => {
  if (!user || !request) return false;
  const pendingStatuses = ['PENDING_HOD', 'PENDING_ACC', 'PENDING_BOD', 'PENDING_ACCOUNTANT', 'PENDING_DIRECTOR'];
  if (!pendingStatuses.includes(request.status)) return false;

  if (user.roleName === 'ADMIN') return true;
  if (user.roleName === 'MANAGER' || user.roleName === 'HR') {
    // Trưởng phòng chỉ từ chối phiếu gửi đến phòng ban của mình hoặc phiếu cấp phòng
    return canUserApproveHOD(user, request) || canUserApproveAccountant(user, request);
  }

  return false;
};
