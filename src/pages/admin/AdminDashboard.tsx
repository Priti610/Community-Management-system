import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ListFilter,
  BarChart2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

interface AdminStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  by_category: { name: string; count: number; percentage: number }[];
  by_status: { status: string; count: number }[];
  by_department: { name: string; count: number }[];
}

interface ComplaintRow {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  citizen_name?: string;
  department_name?: string;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<ComplaintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        adminService.getStatistics(),
        adminService.getAllComplaints(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (complaintsRes.success) {
        setRecentComplaints(complaintsRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E66F5]">
            MUNICIPAL DESK
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-sans">
            Operations Overview
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Real-time municipal triage, department dispatch, and resolution metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/queue"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E66F5] hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
          >
            <ListFilter className="w-4 h-4" />
            <span>Open Triage Queue</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Queued */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              TOTAL COMPLAINTS
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E66F5] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 font-sans">
            {stats ? stats.total : '...'}
          </div>
          <div className="text-xs text-slate-500 mt-1">All-time community reports</div>
        </div>

        {/* Pending Triage */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              PENDING TRIAGE
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 mt-2 font-sans">
            {stats ? stats.pending : '...'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting review or team dispatch</div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              IN PROGRESS
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-cyan-600 mt-2 font-sans">
            {stats ? stats.in_progress : '...'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Field personnel actively fixing</div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              RESOLVED ISSUES
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-2 font-sans">
            {stats ? stats.resolved : '...'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Successfully closed with remarks</div>
        </div>
      </div>

      {/* Recent Triage Queue & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Triage Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Latest incoming complaints
              </h2>
              <p className="text-xs text-slate-500">Fast-track routing and status inspection</p>
            </div>
            <Link
              to="/admin/queue"
              className="text-xs font-semibold text-[#1E66F5] hover:underline flex items-center space-x-1"
            >
              <span>View all ({stats?.total || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recentComplaints.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No complaints in queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentComplaints.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/admin/complaints/${item.id}`)}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-extrabold text-[#1E66F5]">
                        {item.complaint_id}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 font-medium truncate">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate group-hover:text-[#1E66F5] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.citizen_name || 'Citizen'} · {formatDateTime(item.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-xs font-semibold text-[#1E66F5] group-hover:underline hidden sm:inline">
                      Manage &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Breakdown Quick Panel (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Category Breakdown</h2>
              <Link
                to="/admin/statistics"
                className="text-xs font-semibold text-[#1E66F5] hover:underline"
              >
                Full Analytics &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Top reported civic challenges</p>

            <div className="mt-5 space-y-3.5">
              {stats?.by_category && stats.by_category.length > 0 ? (
                stats.by_category.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                      <span className="font-bold text-slate-900">{cat.count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E66F5] rounded-full"
                        style={{ width: `${Math.min(100, Math.max(8, cat.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No category data yet.</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/admin/statistics"
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors border border-slate-200"
            >
              <BarChart2 className="w-4 h-4 text-slate-500" />
              <span>Open Detailed Statistical Charts</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
