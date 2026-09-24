import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  MapPin,
  User,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

interface ComplaintItem {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  status: string;
  citizen_name?: string;
  citizen_email?: string;
  department_name?: string;
  assigned_to?: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  'All statuses',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

const CATEGORY_OPTIONS = [
  'All categories',
  'Garbage Accumulation',
  'Damaged Roads',
  'Streetlight Problems',
  'Water Leakage',
  'Drainage Problems',
  'Public Toilet Issues',
  'Traffic/Safety Issues',
  'Park & Public Space',
  'Other Civic Problems',
];

export const AdminQueue: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  const navigate = useNavigate();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllComplaints({
        search: search.trim() || undefined,
        status: statusFilter !== 'All statuses' ? statusFilter : undefined,
        category: categoryFilter !== 'All categories' ? categoryFilter : undefined,
      });

      if (res.success && res.data) {
        setComplaints(res.data);
      }

      // Also refresh KPI counts
      const statsRes = await adminService.getStatistics().catch(() => null);
      if (statsRes && statsRes.success && statsRes.data) {
        setStats({
          total: statsRes.data.total,
          pending: statsRes.data.pending,
          resolved: statsRes.data.resolved,
        });
      }
    } catch (err) {
      console.error('Error fetching admin queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header matching Screenshot 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E66F5]">
            MUNICIPAL DESK
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-sans">
            Admin complaint queue
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl">
            Triage incoming reports, assign teams, and post status updates that sync to citizens.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh queue</span>
        </button>
      </div>

      {/* 3 Metric Cards Row (Screenshot 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            TOTAL QUEUED
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1 font-sans">
            {stats.total}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">All-time records in system</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            PENDING TRIAGE
          </div>
          <div className="text-3xl font-extrabold text-[#1E66F5] mt-1 font-sans">
            {stats.pending}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Submitted, under review, assigned</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            RESOLVED
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1 font-sans">
            {stats.resolved}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Issues resolved</div>
        </div>
      </div>

      {/* Filter and Search Bar (Screenshot 9) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, title, or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent cursor-pointer"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Complaints Table (Screenshot 9) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-[#1E66F5] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Querying complaints database...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No matching complaints found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or resetting filters to view all civic reports.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All statuses');
                setCategoryFilter('All categories');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Complaint</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Citizen</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {complaints.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/complaints/${item.id}`)}
                  >
                    {/* Complaint Column */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-[#1E66F5]">
                          {item.complaint_id}
                        </span>
                        <div className="font-bold text-slate-900 group-hover:text-[#1E66F5] transition-colors line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formatDateTime(item.created_at)}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-700 text-xs">
                        {item.category}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-600 max-w-xs truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </td>

                    {/* Citizen */}
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        <div className="font-semibold text-slate-800">
                          {item.citizen_name || 'Citizen'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.citizen_email || ''}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/complaints/${item.id}`);
                        }}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-[#1E66F5] hover:text-blue-700 py-1.5 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQueue;
