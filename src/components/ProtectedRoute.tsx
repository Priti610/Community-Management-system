import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-[#1E66F5] rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Admin access required
  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-2xl text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Municipal Admin Access Required</h2>
        <p className="text-sm text-slate-600 mb-6">
          Your current account does not have municipal administrative privileges. Please switch to the Municipal Admin role in the top-right header to view this section.
        </p>
        <Navigate to="/admin" replace={false} />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
