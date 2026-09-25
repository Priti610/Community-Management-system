import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const [switching, setSwitching] = useState(false);

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

  // Not logged in and admin required
  if (!user && requireAdmin) {
    const handleStaffSignIn = async () => {
      setSwitching(true);
      await login('admin@fixmycity.org', 'password123');
      setSwitching(false);
    };

    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-sans tracking-tight">
          Municipal Operations Portal
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          This portal is restricted to authorized municipal officers and department personnel.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleStaffSignIn}
            disabled={switching}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E66F5] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{switching ? 'Signing in...' : 'Sign In with Staff Account'}</span>
          </button>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Site</span>
          </Link>
        </div>
      </div>
    );
  }

  // Admin access required but user is a citizen
  if (requireAdmin && user && user.role !== 'admin') {
    const handleSwitchToStaff = async () => {
      setSwitching(true);
      await login('admin@fixmycity.org', 'password123');
      setSwitching(false);
    };

    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-sans tracking-tight">
          Municipal Staff Access
        </h2>
        <p className="text-sm text-slate-500 mb-2 leading-relaxed">
          Signed in as <span className="font-semibold text-slate-800">{user.name}</span> (Resident Account).
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Accessing city operations requires municipal staff credentials.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleSwitchToStaff}
            disabled={switching}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E66F5] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{switching ? 'Authenticating...' : 'Sign In as Municipal Staff'}</span>
          </button>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Citizen Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
