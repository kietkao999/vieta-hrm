import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load các trang để giảm kích thước bundle ban đầu và tăng tốc chuyển trang
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const BackupPage = lazy(() => import('./pages/admin/BackupPage'));

// Giai đoạn 2
const BranchPage = lazy(() => import('./pages/organization/BranchPage'));
const DepartmentPage = lazy(() => import('./pages/organization/DepartmentPage'));
const PositionPage = lazy(() => import('./pages/organization/PositionPage'));
const DeptPosSettingsPage = lazy(() => import('./pages/organization/DeptPosSettingsPage'));
const EmployeePage = lazy(() => import('./pages/employees/EmployeePage'));

// Giai đoạn 3
const AttendancePage = lazy(() => import('./pages/attendance/AttendancePage'));
const ContractPage = lazy(() => import('./pages/contracts/ContractPage'));

// Giai đoạn 4
const PayrollPage = lazy(() => import('./pages/payroll/PayrollPage'));
const KpiPage = lazy(() => import('./pages/development/KpiPage'));
const TrainingPage = lazy(() => import('./pages/development/TrainingPage'));
const CareerPage = lazy(() => import('./pages/development/CareerPage'));

// Giai đoạn 5
const SeniorityPage = lazy(() => import('./pages/seniority/SeniorityPage'));
const RewardPage = lazy(() => import('./pages/rewards/RewardPage'));
const InnovationPage = lazy(() => import('./pages/innovations/InnovationPage'));

// Giai đoạn 6
const ReportPage = lazy(() => import('./pages/reports/ReportPage'));
const DocumentPage = lazy(() => import('./pages/documents/DocumentPage'));
const AssetManagementPage = lazy(() => import('./pages/assets/AssetManagementPage'));

// Component Loading mượt mà siêu nhẹ
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] w-full">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-9 h-9 border-3 border-brand-200 border-t-brand-700 rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-500 tracking-wider">Đang tải dữ liệu...</span>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
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
                <Route path="settings/departments-positions" element={<DeptPosSettingsPage />} />
                <Route path="assets" element={<AssetManagementPage />} />
                <Route path="documents" element={<DocumentPage />} />
                <Route path="policies" element={<Navigate to="/documents" replace />} />

                {/* NHÂN SỰ Module */}
                <Route
                  path="employees"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                      <EmployeePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="leave" element={<Navigate to="/attendance?tab=leaves" replace />} />
                <Route path="leave-requests" element={<Navigate to="/attendance?tab=leaves" replace />} />
                <Route
                  path="contracts"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                      <ContractPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="payroll" element={<PayrollPage />} />
                <Route path="seniority" element={<SeniorityPage />} />

                {/* PHÁT TRIỂN Module */}
                <Route
                  path="kpi"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                      <KpiPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="training" element={<TrainingPage />} />
                <Route path="career" element={<CareerPage />} />

                {/* GHI NHẬN Module */}
                <Route path="rewards" element={<RewardPage />} />
                <Route path="discipline" element={<Navigate to="/rewards?tab=discipline" replace />} />
                <Route path="innovations" element={<InnovationPage />} />

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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
