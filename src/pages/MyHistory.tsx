import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ChevronRight, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { complaintService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../utils/formatters';

interface MyComplaint {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
  department_name?: string;
}

export const MyHistory: React.FC = () => {
  const [complaints, setComplaints] = useState<MyComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMyComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintService.getMyComplaints();
      if (res.success && res.data) {
        setComplaints(res.data);
      } else {
        setError(res.message || 'Failed to load your complaints.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load complaint history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E66F5]">
            CITIZEN SERVICES
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-sans">
            My complaint history
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            A clear record of reports and every update made by city teams.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E66F5] hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New report</span>
        </Link>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">{error}</h3>
          <button
            onClick={fetchMyComplaints}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1E66F5] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No complaints reported yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              You haven't submitted any civic issue reports under this account.
            </p>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1E66F5] hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Report your first issue</span>
          </Link>
        </div>
      ) : (
        /* Complaints List matching Screenshot 8 */
        <div className="space-y-3">
          {complaints.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/track?id=${encodeURIComponent(item.complaint_id)}`)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1E66F5] flex items-center justify-center shrink-0 group-hover:bg-[#1E66F5] group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5 stroke-[2]" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <span className="font-mono text-xs font-bold text-[#1E66F5]">
                    {item.complaint_id}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-[#1E66F5] transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs text-slate-500 truncate flex items-center space-x-1.5">
                    <span>{item.category}</span>
                    <span>·</span>
                    <span>{formatDateTime(item.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <StatusBadge status={item.status} size="sm" />
                <span className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold text-[#1E66F5] bg-blue-50 px-2.5 py-1 rounded-lg group-hover:bg-[#1E66F5] group-hover:text-white transition-all">
                  <span>Track issue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <ChevronRight className="sm:hidden w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyHistory;
