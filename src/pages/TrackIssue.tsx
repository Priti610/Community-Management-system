import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Building2,
  UserCheck,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Layers,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { complaintService, adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
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

interface MiniComplaint {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  created_at: string;
  department_name?: string;
}

export const TrackIssue: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [searchInput, setSearchInput] = useState(initialId);
  const [complaint, setComplaint] = useState<TrackedComplaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'track' | 'my' | 'all'>('track');
  
  // Lists for exploring every issue
  const [myComplaints, setMyComplaints] = useState<MiniComplaint[]>([]);
  const [allComplaints, setAllComplaints] = useState<MiniComplaint[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Load lists for tabs
  const loadLists = async () => {
    setLoadingLists(true);
    try {
      const [myRes, allRes] = await Promise.all([
        complaintService.getMyComplaints().catch(() => ({ success: false, data: [] })),
        complaintService.getRecentComplaints().catch(() => ({ success: false, data: [] })),
      ]);

      if (myRes.success && myRes.data) {
        setMyComplaints(myRes.data);
      }
      if (allRes.success && allRes.data) {
        setAllComplaints(allRes.data);
      }
    } catch (err) {
      console.warn('Error loading complaints lists:', err);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, [user]);

  const fetchComplaint = async (id: string) => {
    if (!id.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await complaintService.trackIssue(id.trim());
      if (res.success && res.data) {
        setComplaint(res.data);
        setActiveTab('track');
      } else {
        setComplaint(null);
        setError(res.message || `No complaint found with ID '${id}'.`);
      }
    } catch (err: any) {
      setComplaint(null);
      setError(
        err.response?.data?.message || `Complaint '${id}' not found. Please check the ID or pick from the list below.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setSearchInput(initialId);
      fetchComplaint(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchParams({ id: searchInput.trim().toUpperCase() });
    fetchComplaint(searchInput.trim());
  };

  const handleSelectComplaint = (cid: string) => {
    setSearchInput(cid);
    setSearchParams({ id: cid });
    fetchComplaint(cid);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E66F5]">
            CITIZEN SERVICES & PUBLIC TRANSPARENCY
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
              Track civic issues
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl">
            Check the live resolution progress, department dispatch, and field updates for any reported issue.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E66F5] hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all self-start sm:self-auto"
        >
          <span>Report new issue</span>
        </Link>
      </div>

      {/* Mode Navigation Tabs (Search ID | Track All My Issues | All City Reports) */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('track')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'track'
              ? 'bg-[#1E66F5] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Track by ID</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('my');
            setComplaint(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'my'
              ? 'bg-[#1E66F5] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My reported issues ({myComplaints.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setComplaint(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'all'
              ? 'bg-[#1E66F5] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Browse all community issues</span>
        </button>
      </div>

      {/* Search Input Card (visible in 'track' tab) */}
      {activeTab === 'track' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ENTER COMPLAINT ID, SUFFIX (E.G. 0C2083), OR KEYWORD"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-mono tracking-wider placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent uppercase transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-sm rounded-2xl transition-all shadow-xs flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Track complaint'}</span>
            </button>
          </form>

          {/* Reference ID Format Helper */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-medium">Format:</span>
            <span className="font-mono text-slate-500">FMC-YYYY-XXXXXX (e.g. FMC-2026-XXXXXX)</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-[#1E66F5] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Retrieving live progress and timeline from database...</p>
        </div>
      )}

      {/* Error / Not Found state */}
      {!loading && error && activeTab === 'track' && (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Complaint Not Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">{error}</p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('all')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Browse Public Complaints
            </button>
            <button
              onClick={() => navigate('/report')}
              className="px-4 py-2 rounded-xl bg-[#1E66F5] hover:bg-blue-600 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Report a New Issue
            </button>
          </div>
        </div>
      )}

      {/* Single Complaint Details View (active when an ID is fetched) */}
      {!loading && complaint && activeTab === 'track' && (
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
                  REPORTED ON
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Status progress</h3>
              <span className="text-xs font-semibold text-slate-500">
                Phase {['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].indexOf(complaint.status) + 1} of 5
              </span>
            </div>
            <Stepper currentStatus={complaint.status} />
          </div>

          {/* Complete Status Timeline Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Update audit timeline</h3>

            {complaint.history && complaint.history.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {complaint.history.map((upd, idx) => (
                  <div key={upd.id || idx} className="relative group">
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

      {/* Tab: "My Reported Issues" (Direct list of every issue reported by the citizen) */}
      {activeTab === 'my' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Every issue submitted under your account
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Click any card to track live
            </span>
          </div>

          {loadingLists ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-[#1E66F5] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading your issues...</p>
            </div>
          ) : myComplaints.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No issues submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't reported any neighborhood problems yet.
              </p>
              <Link
                to="/report"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1E66F5] text-white text-xs font-semibold"
              >
                <span>Report an issue now</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myComplaints.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectComplaint(item.complaint_id)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E66F5] flex items-center justify-center shrink-0 group-hover:bg-[#1E66F5] group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#1E66F5]">
                          {item.complaint_id}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-medium truncate">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-[#1E66F5] transition-colors">
                        {item.title}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{item.location}</span>
                        <span>·</span>
                        <span>{formatDateTime(item.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <StatusBadge status={item.status} size="sm" />
                    <button className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold text-[#1E66F5] group-hover:underline">
                      <span>Track</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: "Browse All Community Issues" */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Recent community issues across the city
            </h2>
            <Link
              to="/admin/queue"
              className="text-xs font-semibold text-[#1E66F5] hover:underline"
            >
              Open Municipal Queue &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {allComplaints.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectComplaint(item.complaint_id)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#1E66F5]">
                      {item.complaint_id}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-medium truncate">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-[#1E66F5] transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{item.location}</span>
                    <span>·</span>
                    <span>{formatDateTime(item.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <StatusBadge status={item.status} size="sm" />
                  <span className="hidden sm:inline text-xs font-semibold text-[#1E66F5] group-hover:underline">
                    View &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Guide Card: "How to track every issue" */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-3xl p-6 sm:p-7 space-y-3">
        <div className="flex items-center space-x-2 text-[#1E66F5]">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            How tracking works in FixMyCity
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-600">
          <div className="space-y-1 bg-white p-3.5 rounded-2xl border border-blue-100/80">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider text-[#1E66F5]">
              1. Get your Tracking ID
            </span>
            <p>Every submitted issue is assigned a unique ID formatted as <span className="font-mono font-semibold">FMC-2026-XXXXXX</span>.</p>
          </div>
          <div className="space-y-1 bg-white p-3.5 rounded-2xl border border-blue-100/80">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider text-[#1E66F5]">
              2. Track All in "My History"
            </span>
            <p>Visit the <Link to="/history" className="text-[#1E66F5] font-semibold underline">My History</Link> tab to see a live list of all issues you have submitted.</p>
          </div>
          <div className="space-y-1 bg-white p-3.5 rounded-2xl border border-blue-100/80">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider text-[#1E66F5]">
              3. Real-Time Field Updates
            </span>
            <p>As municipal crews review, dispatch, and resolve problems, the 5-step stepper and remarks update automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackIssue;
