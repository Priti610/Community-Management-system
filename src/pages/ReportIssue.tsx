import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  ImagePlus,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
} from 'lucide-react';
import { complaintService } from '../services/api';

const CATEGORIES = [
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

export const ReportIssue: React.FC = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdComplaintId, setCreatedComplaintId] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Please enter an issue title.');
      return;
    }
    if (!location.trim()) {
      setError('Please provide a specific street, landmark, or location.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe what is happening.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await complaintService.reportIssue({
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        photoBase64: photoPreview,
      });

      if (res.success && res.complaint_id) {
        setCreatedComplaintId(res.complaint_id);
      } else {
        setError(res.message || 'Failed to submit report. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit report. Ensure your session is valid.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setCategory(CATEGORIES[0]);
    setLocation('');
    setDescription('');
    setPhotoPreview(null);
    setCreatedComplaintId(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#1E66F5]">
          CITIZEN SERVICES
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-sans">
          Report a community issue
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl">
          Share a problem in your neighborhood and we’ll route it to the team best equipped to help.
        </p>
      </div>

      {/* Success Dialog if Submitted */}
      {createdComplaintId ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Your complaint has been submitted successfully.
            </h2>
            <p className="text-sm text-slate-500">
              Municipal teams have received your report and placed it in the triage queue.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto">
            <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              COMPLAINT TRACKING ID
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#1E66F5] mt-1 select-all">
              {createdComplaintId}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Save this ID to monitor real-time updates and field resolution.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={`/track?id=${encodeURIComponent(createdComplaintId)}`}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#1E66F5] hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20"
            >
              <span>Track this issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/history"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all"
            >
              <span>View my history</span>
            </Link>

            <button
              onClick={handleResetForm}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all"
            >
              <span>Report another issue</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          {/* Card Title Box */}
          <div className="flex items-start space-x-4 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E66F5] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Tell us what needs fixing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Every report helps make our shared spaces better.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field: Issue Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  ISSUE TITLE
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {title.length}/120
                </span>
              </div>
              <input
                type="text"
                maxLength={120}
                required
                placeholder="e.g. Overflowing bins near the library"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent transition-all"
              />
            </div>

            {/* Field: Category and Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  LOCATION
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Street, landmark, or neighborhood"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Field: What is happening (Description) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  WHAT IS HAPPENING?
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {description.length}/1200
                </span>
              </div>
              <textarea
                rows={5}
                maxLength={1200}
                required
                placeholder="Add useful details so the right team can respond quickly..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E66F5] focus:border-transparent transition-all resize-y"
              />
            </div>

            {/* Field: Photo Evidence */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                PHOTO EVIDENCE <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>

              {photoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-sm group">
                  <img
                    src={photoPreview}
                    alt="Evidence Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="p-2.5 bg-white text-xs text-slate-500 font-medium">
                    Photo attached ready for upload
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 text-sm text-[#1E66F5] font-semibold">
                    <ImagePlus className="w-5 h-5" />
                    <span>Choose a photo from your device</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, or WebP up to 5MB</p>
                </label>
              )}
            </div>

            {/* Privacy / Transparency Note */}
            <div className="flex items-start space-x-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Your report is visible to municipal teams and helps us keep response times transparent.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 bg-[#1E66F5] hover:bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'Submitting report...' : 'Submit issue report'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReportIssue;
