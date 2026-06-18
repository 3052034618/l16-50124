import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import SidebarLayout from './components/SidebarLayout';
import Login from './pages/Login';

import HrDashboard from './pages/hr/Dashboard';
import HrPackages from './pages/hr/Packages';
import HrInstitutions from './pages/hr/Institutions';
import HrAppointments from './pages/hr/Appointments';
import HrStatistics from './pages/hr/Statistics';

import EmployeeHome from './pages/employee/Home';
import EmployeeAppointment from './pages/employee/Appointment';
import EmployeeMyAppointments from './pages/employee/MyAppointments';
import EmployeeReports from './pages/employee/Reports';
import EmployeeHealthArchive from './pages/employee/HealthArchive';

import InstitutionHome from './pages/institution/Home';
import InstitutionAppointments from './pages/institution/Appointments';
import InstitutionReportUpload from './pages/institution/ReportUpload';

import type { UserRole } from '../shared/types';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    if (role === 'hr') return <Navigate to="/hr/dashboard" replace />;
    if (role === 'employee') return <Navigate to="/employee/home" replace />;
    if (role === 'institution') return <Navigate to="/institution/home" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['hr']}>
      <SidebarLayout>{children}</SidebarLayout>
    </ProtectedRoute>
  );
}

function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['employee']}>
      <SidebarLayout>{children}</SidebarLayout>
    </ProtectedRoute>
  );
}

function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['institution']}>
      <SidebarLayout>{children}</SidebarLayout>
    </ProtectedRoute>
  );
}

function HomeRedirect() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'hr') return <Navigate to="/hr/dashboard" replace />;
  if (role === 'employee') return <Navigate to="/employee/home" replace />;
  if (role === 'institution') return <Navigate to="/institution/home" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route path="/hr/dashboard" element={
          <HrLayout><HrDashboard /></HrLayout>
        } />
        <Route path="/hr/packages" element={
          <HrLayout><HrPackages /></HrLayout>
        } />
        <Route path="/hr/institutions" element={
          <HrLayout><HrInstitutions /></HrLayout>
        } />
        <Route path="/hr/appointments" element={
          <HrLayout><HrAppointments /></HrLayout>
        } />
        <Route path="/hr/statistics" element={
          <HrLayout><HrStatistics /></HrLayout>
        } />

        <Route path="/employee/home" element={
          <EmployeeLayout><EmployeeHome /></EmployeeLayout>
        } />
        <Route path="/employee/appointment" element={
          <EmployeeLayout><EmployeeAppointment /></EmployeeLayout>
        } />
        <Route path="/employee/my-appointments" element={
          <EmployeeLayout><EmployeeMyAppointments /></EmployeeLayout>
        } />
        <Route path="/employee/reports" element={
          <EmployeeLayout><EmployeeReports /></EmployeeLayout>
        } />
        <Route path="/employee/reports/:id" element={
          <EmployeeLayout><EmployeeReports /></EmployeeLayout>
        } />
        <Route path="/employee/health-archive" element={
          <EmployeeLayout><EmployeeHealthArchive /></EmployeeLayout>
        } />

        <Route path="/institution/home" element={
          <InstitutionLayout><InstitutionHome /></InstitutionLayout>
        } />
        <Route path="/institution/appointments" element={
          <InstitutionLayout><InstitutionAppointments /></InstitutionLayout>
        } />
        <Route path="/institution/report-upload" element={
          <InstitutionLayout><InstitutionReportUpload /></InstitutionLayout>
        } />

        <Route path="*" element={<div className="text-center py-20">404 页面不存在</div>} />
      </Routes>
    </Router>
  );
}
