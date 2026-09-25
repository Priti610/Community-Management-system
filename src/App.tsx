import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import TrackIssue from './pages/TrackIssue';
import MyHistory from './pages/MyHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQueue from './pages/admin/AdminQueue';
import ManageComplaint from './pages/admin/ManageComplaint';
import Statistics from './pages/admin/Statistics';

export function AppContent() {
  const { isAuthModalOpen, closeAuthModal, openAuthModal, authModalMode, user, loading } = useAuth();
  const [hasPromptedInitial, setHasPromptedInitial] = useState(false);

  // Automatically start with sign in modal when visiting the site unauthenticated
  React.useEffect(() => {
    if (!loading && !user && !hasPromptedInitial) {
      setHasPromptedInitial(true);
      openAuthModal('login');
    }
  }, [loading, user, hasPromptedInitial, openAuthModal]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* Universal Header Navigation */}
        <Navbar onOpenAuthModal={() => openAuthModal('login')} />

        {/* Main App Content Viewport */}
        <main className="flex-1">
          <Routes>
            {/* Citizen & Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/track" element={<TrackIssue />} />
            <Route path="/history" element={<MyHistory />} />

            {/* Municipal Administration Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/queue"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints/:id"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <ManageComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/statistics"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Statistics />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer matching prototype */}
        <Footer />

        {/* Custom Auth Modal (Login / Register) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={closeAuthModal}
        />
      </div>
    </Router>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
