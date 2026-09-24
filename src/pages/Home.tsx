import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Trash2,
  Wrench,
  Lightbulb,
  Droplets,
  Waves,
  FileText,
  MapPin,
  Sparkles,
  AlertTriangle,
  Trees,
} from 'lucide-react';
import { complaintService, adminService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../utils/formatters';

interface RecentComplaint {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  created_at: string;
  department_name?: string;
}

interface QuickStats {
  total: number;
  inProgress: number;
  resolved: number;
}

export const Home: React.FC = () => {
  const [complaintIdInput, setComplaintIdInput] = useState('');
  const [recentReports, setRecentReports] = useState<RecentComplaint[]>([]);
  const [stats, setStats] = useState<QuickStats>({ total: 6, inProgress: 1, resolved: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, statsRes] = await Promise.all([
          complaintService.getRecentComplaints(),
          adminService.getStatistics().catch(() => ({ success: false, data: null })),
        ]);

        if (recentRes.success && recentRes.data) {
          setRecentReports(recentRes.data);
        }

        if (statsRes.success && statsRes.data) {
          setStats({
            total: statsRes.data.total,
            inProgress: statsRes.data.in_progress,
            resolved: statsRes.data.resolved,
          });
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (complaintIdInput.trim()) {
      navigate(`/track?id=${encodeURIComponent(complaintIdInput.trim())}`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Garbage Accumulation':
        return <Trash2 className="w-4 h-4 text-slate-500" />;
      case 'Damaged Roads':
        return <Wrench className="w-4 h-4 text-slate-500" />;
      case 'Streetlight Problems':
        return <Lightbulb className="w-4 h-4 text-slate-500" />;
      case 'Water Leakage':
        return <Droplets className="w-4 h-4 text-slate-500" />;
      case 'Drainage Problems':
        return <Waves className="w-4 h-4 text-slate-500" />;
      case 'Park & Public Space':
        return <Trees className="w-4 h-4 text-slate-500" />;
      case 'Traffic/Safety Issues':
        return <AlertTriangle className="w-4 h-4 text-slate-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl min-h-[460px] flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        {/* Background Image with dark gradient overlay matching Screenshot 1 */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-35 mix-blend-luminosity filter contrast-125"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1800&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/60 z-0" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 z-0" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl">
          {/* Tag pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs text-slate-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">A more responsive city starts here</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
            Notice it. <br />
            <span className="text-[#1E66F5]">Report it.</span> <br />
            Improve it.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-lg leading-relaxed font-normal">
            FixMyCity connects neighbors with the people who keep our streets, parks, and public spaces running.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/report"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#1E66F5] hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-600/50"
            >
              <span>Report an issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin"
              className="inline-flex items-center px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold text-sm border border-slate-700/80 backdrop-blur-md transition-all"
            >
              Open admin dashboard
            </Link>
          </div>
        </div>

        {/* Search complaint tracking card inside hero bottom */}
        <div className="relative z-10 mt-8 max-w-lg">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
            <label
              htmlFor="complaint-search"
              className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2"
            >
              ALREADY REPORTED SOMETHING?
            </label>
            <form onSubmit={handleTrackSubmit} className="flex items-center gap-2">
              <input
                id="complaint-search"
                type="text"
                value={complaintIdInput}
                onChange={(e) => setComplaintIdInput(e.target.value)}
                placeholder="Enter your complaint ID"
                className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:bg-slate-800"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0 shadow-sm"
                title="Search complaint"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Dynamic Key Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">REPORTS RECEIVED</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 font-sans">
            {stats.total}
          </div>
          <div className="text-xs text-slate-500 mt-1">Community signals this month</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">IN PROGRESS</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#1E66F5] mt-2 font-sans">
            {stats.inProgress}
          </div>
          <div className="text-xs text-slate-500 mt-1">Teams currently on the ground</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">RESOLVED</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-2 font-sans">
            {stats.resolved}
          </div>
          <div className="text-xs text-slate-500 mt-1">Issues closed with an update</div>
        </div>
      </section>

      {/* Community Pulse / Recent Reports */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#1E66F5]">COMMUNITY PULSE</div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5 font-sans">
              Recent reports
            </h2>
          </div>
          <Link
            to="/admin/queue"
            className="text-xs sm:text-sm font-semibold text-[#1E66F5] hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Browse live queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-slate-500">
            No complaints reported yet. Be the first to report an issue!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentReports.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/track?id=${encodeURIComponent(item.complaint_id)}`)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium truncate">
                      {getCategoryIcon(item.category)}
                      <span className="truncate">{item.category}</span>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 group-hover:text-[#1E66F5] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-[#1E66F5] hover:underline">
                    {item.complaint_id}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(item.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
