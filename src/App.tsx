import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

export function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
          {/* Universal Header Navigation */}
          <Navbar onOpenAuthModal={() => setAuthModalOpen(true)} />

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
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
