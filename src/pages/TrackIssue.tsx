import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, AlertCircle, Building2, UserCheck, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { complaintService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Stepper from '../components/Stepper';
import { formatDateTime } from '../utils/formatters';

interface ComplaintHistoryItem {
  id: number;
  complaint_id: string;
  old_status: string | null;
  new_status: string;
  remark: string | null;
  updated_by: string | null;
  created_at: string;
}

interface TrackedComplaint {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  status: string;
  department_name?: string;
  assigned_to?: string;
  admin_remark?: string;
  created_at: string;
  updated_at: string;
  history: ComplaintHistoryItem[];
  photos: { id: number; image_url: string }[];
}

export const TrackIssue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [searchInput, setSearchInput] = useState(initialId);
  const [complaint, setComplaint] = useState<TrackedComplaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchComplaint = async (id: string) => {
    if (!id.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await complaintService.trackIssue(id.trim());
      if (res.success && res.data) {
        setComplaint(res.data);
      } else {
        setComplaint(null);
        setError(res.message || `No complaint found with ID '${id}'.`);
      }
    } catch (err: any) {
      setComplaint(null);
      setError(
        err.response?.data?.message || `Complaint '${id}' not found. Please verify the ID and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchComplaint(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchParams({ id: searchInput.trim().toUpperCase() });
    fetchComplaint(searchInput.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#1E66F5]">
          PUBLIC TRANSPARENCY
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            Track an issue
          </h1>
        </div>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ENTER COMPLAINT ID, E.G. FMC-2026-A1B2C3"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-mono tracking-wider placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent uppercase transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-sm rounded-2xl transition-all shadow-xs flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Search complaint'}</span>
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-[#1E66F5] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Retrieving complaint history from database...</p>
        </div>
      )}

      {/* Error / Not Found state */}
      {!loading && error && (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Complaint Not Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <div className="text-xs text-slate-400 pt-2">
            Try checking with an example ID: <span className="font-mono font-semibold text-[#1E66F5]">FMC-2026-0C2083</span> or <span className="font-mono font-semibold text-[#1E66F5]">FMC-2026-5FA9B7</span>
          </div>
        </div>
      )}

      {/* Complaint Details Card */}
      {!loading && complaint && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-base font-extrabold text-[#1E66F5]">
                  {complaint.complaint_id}
                </span>
                <StatusBadge status={complaint.status} size="sm" />
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  REPORTED
                </span>
                <span className="text-sm text-slate-600 font-medium">
                  {formatDateTime(complaint.created_at)}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {complaint.title}
              </h2>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 mt-2.5">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-700">{complaint.location}</span>
                </div>
                <span>•</span>
                <div className="font-medium text-slate-600">{complaint.category}</div>
                {complaint.department_name && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1 text-[#1E66F5] font-semibold">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{complaint.department_name}</span>
                    </div>
                  </>
                )}
                {complaint.assigned_to && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1 text-slate-700 font-medium">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{complaint.assigned_to}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              {complaint.description}
            </div>

            {/* Photo evidence if present */}
            {complaint.photos && complaint.photos.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>PHOTO EVIDENCE</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {complaint.photos.map((p) => (
                    <div key={p.id} className="rounded-2xl overflow-hidden border border-slate-200 w-44 h-32 bg-slate-100">
                      <img
                        src={p.image_url}
                        alt="Evidence"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Progress Stepper Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Status progress</h3>
            <Stepper currentStatus={complaint.status} />
          </div>

          {/* Complete Status Timeline Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Update history</h3>

            {complaint.history && complaint.history.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {complaint.history.map((upd, idx) => (
                  <div key={upd.id || idx} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-3 border-[#1E66F5] shadow-xs group-hover:scale-110 transition-transform" />

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {upd.new_status}
                        </span>
                        {upd.updated_by && (
                          <span className="text-xs text-slate-400">by {upd.updated_by}</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDateTime(upd.created_at)}
                      </span>
                    </div>

                    {upd.remark && (
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                        {upd.remark}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400">No updates logged yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackIssue;
