import React from 'react';

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'Submitted':
        return 'bg-blue-50 text-[#1E66F5] border-blue-200';
      case 'Under Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Assigned':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sizeStyle =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${getBadgeStyle(
        status
      )} ${sizeStyle} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
