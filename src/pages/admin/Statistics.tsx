import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart2, TrendingUp, CheckCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/api';

interface StatsData {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  by_category: { name: string; count: number; percentage: number }[];
  by_status: { status: string; count: number; percentage: number }[];
  by_department: { name: string; count: number }[];
  monthly_trends: { month: string; complaints: number; resolved: number }[];
}

const COLORS = ['#1E66F5', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6', '#EC4899', '#64748B'];

export const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStatistics();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError('Failed to load statistical metrics.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-[#1E66F5] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Calculating municipal analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E66F5]">
            MUNICIPAL DESK
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-sans">
            Civic Operations & Analytics
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Data insights, resolution rates, and departmental workload distribution.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh metrics</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            TOTAL REPORTS
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 font-sans">
            {stats?.total || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Overall signals received</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            PENDING TRIAGE
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 mt-1 font-sans">
            {stats?.pending || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting review or assignment</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            IN PROGRESS
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1E66F5] mt-1 font-sans">
            {stats?.in_progress || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Under active repair</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            RESOLVED RATE
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-1 font-sans">
            {stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">{stats?.resolved || 0} issues resolved</div>
        </div>
      </div>

      {/* Row 1 Charts: Category Breakdown (Bar) & Status Distribution (Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Complaints by Category
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.by_category || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  width={110}
                  tickFormatter={(val) => (val.length > 16 ? `${val.slice(0, 16)}...` : val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#1E66F5" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Status Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Status Distribution
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.by_status || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ name, value }: any) => `${name || ''}: ${value || 0}`}
                  fontSize={11}
                >
                  {(stats?.by_status || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Monthly Trend Area & Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Monthly Influx & Resolution Trend
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.monthly_trends || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E66F5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1E66F5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="#1E66F5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComplaints)"
                  name="Reports Received"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Issues Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Department Allocation
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.by_department || []}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Assigned Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
