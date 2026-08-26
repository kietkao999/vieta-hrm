import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'viet_a_hrm_jwt_secret_key_2026';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' });
  }
};

export const requireRoles = (allowedRoleNames) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleName) {
      return res.status(403).json({ message: 'Quyền truy cập không hợp lệ.' });
    }

    if (allowedRoleNames.includes(req.user.roleName)) {
      next();
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    }
  };
};
