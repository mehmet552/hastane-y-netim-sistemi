import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPortal from './components/LoginPortal';
import KioskScanner from './components/KioskScanner';
import PersonnelPage from './components/PersonnelPage';
import { AppShell } from './components/layout/AppShell';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { StaffDashboard } from './components/dashboard/StaffDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-radsafe-bg flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-radsafe-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  const canViewLogs = user?.role?.permissions?.some(
    (p: { name: string }) => p.name === 'view_logs'
  );
  return canViewLogs ? <AdminDashboard /> : <StaffDashboard />;
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isKiosk = location.pathname === '/kiosk';

  if (isKiosk) {
    return (
      <Routes>
        <Route path="/kiosk" element={<KioskScanner />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPortal />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardRouter />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/personnel"
        element={
          <ProtectedRoute>
            <AppShell>
              <PersonnelPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  </AuthProvider>
);

export default App;
