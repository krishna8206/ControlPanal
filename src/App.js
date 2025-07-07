import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import LiveTracking from './pages/LiveTracking';
import ComplaintManagement from './pages/ComplaintManagement';
import RidesManagement from './pages/RidesManagement';
import UserManagement from './pages/UserManagement';
import PaymentsManagement from './pages/PaymentsManagement';
import ReportsManagement from './pages/ReportsManagement';
import SupportManagement from './pages/SupportManagement';
import SettingsManagement from './pages/SettingsManagement';
import Login from './pages/Login';

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading IdharUdhar Control Panel...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen w-screen overflow-hidden bg-black">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} className="h-[100vh]" />
      <div className="flex flex-col h-[100vh] flex-1 overflow-hidden">
        <main className="flex-1 h-[100vh] overflow-y-scroll p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fleet" element={<FleetManagement />} />
            <Route path="/tracking" element={<LiveTracking />} />
            <Route path="/complaints" element={<ComplaintManagement />} />
            <Route path="/rides" element={<RidesManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/payments" element={<PaymentsManagement />} />
            <Route path="/reports" element={<ReportsManagement />} />
            <Route path="/support" element={<SupportManagement />} />
            <Route path="/settings" element={<SettingsManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;