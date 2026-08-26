import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import BackupPage from './pages/admin/BackupPage';

// Giai đoạn 2
import BranchPage from './pages/organization/BranchPage';
import DepartmentPage from './pages/organization/DepartmentPage';
import PositionPage from './pages/organization/PositionPage';
import EmployeePage from './pages/employees/EmployeePage';

// Giai đoạn 3
import AttendancePage from './pages/attendance/AttendancePage';
import LeavePage from './pages/attendance/LeavePage';
import ContractPage from './pages/contracts/ContractPage';

// Giai đoạn 4
import PayrollPage from './pages/payroll/PayrollPage';
import KpiPage from './pages/development/KpiPage';
import TrainingPage from './pages/development/TrainingPage';
import CareerPage from './pages/development/CareerPage';

// Giai đoạn 5
import SeniorityPage from './pages/seniority/SeniorityPage';
import RewardPage from './pages/rewards/RewardPage';
import DisciplinePage from './pages/discipline/DisciplinePage';
import InnovationPage from './pages/innovations/InnovationPage';

// Giai đoạn 6
import ReportPage from './pages/reports/ReportPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Main Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<DashboardPage />} />

            {/* TỔ CHỨC Module */}
            <Route path="branches" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR']}><BranchPage /></ProtectedRoute>} />
            <Route path="departments" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR']}><DepartmentPage /></ProtectedRoute>} />
            <Route path="positions" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR']}><PositionPage /></ProtectedRoute>} />

            {/* NHÂN SỰ Module */}
            <Route
              path="employees"
              element={<EmployeePage />}
            />
            <Route
              path="attendance"
              element={<AttendancePage />}
            />
            <Route
              path="leave"
              element={<LeavePage />}
            />
            <Route
              path="contracts"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                  <ContractPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="payroll"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'EMPLOYEE']}>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="seniority"
              element={<SeniorityPage />}
            />

            {/* PHÁT TRIỂN Module */}
            <Route
              path="kpi"
              element={<KpiPage />}
            />
            <Route
              path="training"
              element={<TrainingPage />}
            />
            <Route
              path="career"
              element={<CareerPage />}
            />

            {/* GHI NHẬN Module */}
            <Route
              path="rewards"
              element={<RewardPage />}
            />
            <Route
              path="discipline"
              element={<DisciplinePage />}
            />
            <Route
              path="innovations"
              element={<InnovationPage />}
            />

            {/* BÁO CÁO Module */}
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                  <ReportPage />
                </ProtectedRoute>
              }
            />

            {/* HỆ THỐNG Module (ADMIN Only) */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="backup"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <BackupPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
