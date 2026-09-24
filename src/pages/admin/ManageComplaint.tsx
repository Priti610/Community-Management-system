import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Mail,
  Phone,
  Image as ImageIcon,
} from 'lucide-react';
import { adminService, departmentService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Stepper from '../../components/Stepper';
import { formatDateTime } from '../../utils/formatters';

interface Department {
  id: number;
  name: string;
  description: string;
}

interface ComplaintDetails {
  id: number;
  complaint_id: string;
  user_id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  status: string;
  department_id: number | null;
  assigned_to: string | null;
  admin_remark: string | null;
  citizen_name?: string;
  citizen_email?: string;
  citizen_phone?: string;
  department_name?: string;
  created_at: string;
  updated_at: string;
  history: Array<{
    id: number;
    complaint_id: string;
    old_status: string | null;
    new_status: string;
    remark: string | null;
    updated_by: string | null;
    created_at: string;
  }>;
  photos: Array<{
    id: number;
    image_url: string;
    uploaded_at: string;
  }>;
}

const STATUSES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

export const ManageComplaint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<ComplaintDetails | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState<string>('Submitted');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [assignedOfficer, setAssignedOfficer] = useState<string>('');
  const [adminRemark, setAdminRemark] = useState<string>('');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [compRes, deptRes] = await Promise.all([
        adminService.getComplaintById(id),
        departmentService.getAll(),
      ]);

      if (compRes.success && compRes.data) {
        const c = compRes.data;
        setComplaint(c);
        setSelectedStatus(c.status);
        setSelectedDeptId(c.department_id ? String(c.department_id) : '');
        setAssignedOfficer(c.assigned_to || '');
        setAdminRemark(c.admin_remark || '');
      } else {
        setError('Complaint not found.');
      }

      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await adminService.updateFull(id, {
        status: selectedStatus,
        department_id: selectedDeptId ? Number(selectedDeptId) : null,
        assigned_to: assignedOfficer.trim() || null,
        admin_remark: adminRemark.trim() || null,
      });

      if (res.success) {
        setSuccessMessage('Complaint record and status history updated successfully.');
        // Reload fresh data to update timeline
        await loadData();
      } else {
        setError(res.message || 'Failed to update complaint.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-[#1E66F5] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading complaint details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Unable to locate this complaint record.'}</p>
        <Link
          to="/admin/queue"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-[#1E66F5]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to admin queue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/queue')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-extrabold text-[#1E66F5]">
                {complaint.complaint_id}
              </span>
              <StatusBadge status={complaint.status} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5 font-sans">
              {complaint.title}
            </h1>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Reported on {formatDateTime(complaint.created_at)}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center space-x-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint Details, Timeline, Photos (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Issue Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs">
              Issue Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">CATEGORY</span>
                <span className="text-slate-800 font-medium text-sm mt-0.5 block">
                  {complaint.category}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">LOCATION</span>
                <div className="flex items-center space-x-1.5 text-slate-800 font-medium text-sm mt-0.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{complaint.location}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-xs mb-1">
                DESCRIPTION
              </span>
              <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {complaint.description}
              </div>
            </div>

            {/* Photos */}
            {complaint.photos && complaint.photos.length > 0 && (
              <div>
                <span className="text-slate-400 block font-semibold text-xs mb-2 flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>ATTACHED PHOTO EVIDENCE</span>
                </span>
                <div className="flex flex-wrap gap-3">
                  {complaint.photos.map((p) => (
                    <div key={p.id} className="rounded-xl overflow-hidden border border-slate-200 w-44 h-32 bg-slate-100">
                      <img
                        src={p.image_url}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citizen Contact Card */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-slate-400 block font-semibold text-xs mb-2">
                REPORTING CITIZEN
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100/60">
                <div className="font-semibold text-slate-900">{complaint.citizen_name || 'Citizen User'}</div>
                {complaint.citizen_email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{complaint.citizen_email}</span>
                  </div>
                )}
                {complaint.citizen_phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{complaint.citizen_phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Status Progress</h2>
            <Stepper currentStatus={complaint.status} />
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Audit & Timeline History
            </h2>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.history.map((upd, idx) => (
                <div key={upd.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-3 border-[#1E66F5]" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{upd.new_status}</span>
                      {upd.updated_by && (
                        <span className="text-xs text-slate-400">by {upd.updated_by}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatDateTime(upd.created_at)}
                    </span>
                  </div>
                  {upd.remark && (
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {upd.remark}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Administrative Actions Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Update Complaint
              </h2>
              <span className="text-xs text-[#1E66F5] font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Admin Control
              </span>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  COMPLAINT STATUS
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:bg-white cursor-pointer"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Assignment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  ASSIGN DEPARTMENT
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:bg-white cursor-pointer"
                >
                  <option value="">-- No Department Assigned --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Officer / Crew */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  ASSIGNED OFFICER / CREW
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    placeholder="e.g. Officer Dave Miller, Team #4"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:bg-white"
                  />
                </div>
              </div>

              {/* Admin Remark */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  ADMIN REMARKS / DISPATCH NOTE
                </label>
                <textarea
                  rows={4}
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                  placeholder="Explain actions taken, work crew ETA, or resolution details for the citizen..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:bg-white resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-[#1E66F5] hover:bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Updating complaint...' : 'Save & Publish Update'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageComplaint;
