import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Home,
  Plus,
  Search,
  FileText,
  BarChart2,
  ListFilter,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const { user, logout, switchRoleDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminView = location.pathname.startsWith('/admin') || user?.role === 'admin';

  const handleRoleSwitch = async (targetRole: 'citizen' | 'admin') => {
    setRoleDropdownOpen(false);
    await switchRoleDemo(targetRole);
    if (targetRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-[#1E66F5] flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <MapPin className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              FixMy<span className="text-[#1E66F5]">City</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!isAdminView ? (
              // Citizen Navigation
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                      isActive
                        ? 'border-[#1E66F5] text-[#1E66F5] font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </NavLink>

                <NavLink
                  to="/report"
                  className={({ isActive }) =>
                    `flex items-center space-x-1.5 px-3.5 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                      isActive
                        ? 'border-[#1E66F5] text-[#1E66F5] font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <Plus className="w-4 h-4" />
                  <span>Report an issue</span>
                </NavLink>

                <NavLink
                  to="/track"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                      isActive
                        ? 'border-[#1E66F5] text-[#1E66F5] font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <Search className="w-4 h-4" />
                  <span>Track issue</span>
                </NavLink>

                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                      isActive
                        ? 'border-[#1E66F5] text-[#1E66F5] font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <FileText className="w-4 h-4" />
                  <span>My history</span>
                </NavLink>
              </>
            ) : (
              // Admin Navigation
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                      isActive
                        ? 'border-[#1E66F5] text-[#1E66F5] font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </NavLink>

                <NavLink
                  to="/admin/queue"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                      isActive
                        ? 'border-[#1E66F5] text-[#1E66F5] font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <ListFilter className="w-4 h-4" />
                  <span>Admin queue</span>
                </NavLink>

                <NavLink
                  to="/admin/statistics"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                      isActive
                        ? 'border-[#1E66F5] text-[#1E66F5] font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Statistics</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Right Action / Role Pill */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user?.role === 'admin' ? 'bg-amber-500 ring-2 ring-amber-100' : 'bg-emerald-500 ring-2 ring-emerald-100'
                  }`}
                />
                <span>{user?.role === 'admin' ? 'Municipal Admin' : 'Citizen demo'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="font-semibold text-slate-900 truncate">{user?.name || 'Guest User'}</div>
                    <div className="text-xs text-slate-500 truncate">{user?.email || 'Not signed in'}</div>
                  </div>

                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Active Role
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('citizen')}
                    className={`w-full flex items-center space-x-2 px-3.5 py-2 text-left hover:bg-slate-50 ${
                      user?.role === 'citizen' ? 'text-[#1E66F5] font-semibold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Citizen demo</span>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full flex items-center space-x-2 px-3.5 py-2 text-left hover:bg-slate-50 ${
                      user?.role === 'admin' ? 'text-[#1E66F5] font-semibold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Municipal Admin</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  {onOpenAuthModal && (
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full flex items-center space-x-2 px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Custom Sign In / Register</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Link to Other Interface */}
            {user?.role !== 'admin' ? (
              <Link
                to="/admin"
                className="text-xs font-semibold text-slate-600 hover:text-[#1E66F5] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
              >
                Admin portal &rarr;
              </Link>
            ) : (
              <Link
                to="/"
                className="text-xs font-semibold text-slate-600 hover:text-[#1E66F5] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
              >
                &larr; Citizen portal
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {!isAdminView ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Home</span>
              </Link>
              <Link
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Report an issue</span>
              </Link>
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Track issue</span>
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>My history</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Overview</span>
              </Link>
              <Link
                to="/admin/queue"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <ListFilter className="w-4 h-4 text-slate-500" />
                <span>Admin queue</span>
              </Link>
              <Link
                to="/admin/statistics"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                <BarChart2 className="w-4 h-4 text-slate-500" />
                <span>Statistics</span>
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-200 mt-2 space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-400 px-3">Switch Mode</div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleRoleSwitch('citizen');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 text-slate-800 text-sm font-medium"
            >
              <span>Citizen View</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleRoleSwitch('admin');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 text-slate-800 text-sm font-medium"
            >
              <span>Municipal Admin Portal</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
