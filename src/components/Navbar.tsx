import React, { useState, useRef, useEffect } from 'react';
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
  LogOut,
  User,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminView = location.pathname.startsWith('/admin');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/');
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

          {/* Right Action / Profile Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isAdminView ? (
              <Link
                to="/"
                className="text-xs font-semibold text-slate-600 hover:text-[#1E66F5] px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
              >
                &larr; Citizen portal
              </Link>
            ) : (
              <Link
                to="/admin"
                className="text-xs font-semibold text-slate-600 hover:text-[#1E66F5] px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
              >
                Staff portal &rarr;
              </Link>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#1E66F5] text-white flex items-center justify-center font-bold text-[10px]">
                    {getInitials(user.name)}
                  </div>
                  <span className="font-semibold text-slate-800 max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1E66F5] flex items-center justify-center font-bold text-xs">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate leading-snug">{user.name}</div>
                          <div className="text-xs text-slate-500 truncate">{user.email}</div>
                        </div>
                      </div>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#1E66F5] border border-blue-100">
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="w-2.5 h-2.5" />
                            <span>Municipal Officer</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                            <span>Registered Citizen</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === 'admin' ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            <span>Operations Overview</span>
                          </Link>
                          <Link
                            to="/admin/queue"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <ListFilter className="w-4 h-4 text-slate-400" />
                            <span>Admin Complaint Queue</span>
                          </Link>
                          <Link
                            to="/admin/statistics"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <BarChart2 className="w-4 h-4 text-slate-400" />
                            <span>Citywide Analytics</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/history"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>My Reported Complaints</span>
                          </Link>
                          <Link
                            to="/report"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <Plus className="w-4 h-4 text-slate-400" />
                            <span>Report an Issue</span>
                          </Link>
                          <Link
                            to="/track"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <Search className="w-4 h-4 text-slate-400" />
                            <span>Track Any Issue</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-left text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E66F5] text-white hover:bg-blue-600 transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In / Register</span>
                </button>
              </div>
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
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-xl flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1E66F5] text-white flex items-center justify-center font-bold text-xs">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 text-xs truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                </div>

                {!isAdminView ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    <span>Staff Portal</span>
                    <span>&rarr;</span>
                  </Link>
                ) : (
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    <span>&larr; Citizen Portal</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-600 text-xs font-semibold hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal?.();
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-[#1E66F5] text-white text-sm font-semibold"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
