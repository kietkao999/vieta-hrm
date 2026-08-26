import express from 'express';
import cors from 'cors';
import { auditMiddleware } from './middleware/audit.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import kpiRoutes from './routes/kpiRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import disciplineRoutes from './routes/disciplineRoutes.js';
import innovationRoutes from './routes/innovationRoutes.js';
import seniorityRoutes from './routes/seniorityRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

// Cấu hình CORS để frontend truy cập được
app.use(cors({
  origin: '*', // Trong môi trường dev có thể để open, hoặc cụ thể cổng 5173
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tự động ghi nhật ký hệ thống đối với thao tác thay đổi dữ liệu
app.use(auditMiddleware);

// Các endpoint API của hệ thống
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave-requests', leaveRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/discipline', disciplineRoutes);
app.use('/api/innovations', innovationRoutes);
app.use('/api/seniority', seniorityRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('Lỗi ứng dụng:', err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống cục bộ.' });
});

export default app;
