import React from 'react';
import { CertificationStatus, OverallLifecycleStatus, StageStatus } from '../types';

interface StatusBadgeProps {
  status: CertificationStatus | OverallLifecycleStatus | StageStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Certified':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Active Service':
      case 'Deployed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
      case 'Pending Review':
      case 'Under Inspection':
      case 'In Transit':
      case 'Manufacturing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Incident Flagged':
      case 'Flagged':
      case 'Revoked':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'Pending Disposal':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Decommissioned':
      case 'Expired':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'Not Applicable':
        return 'bg-slate-50 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-md border ${getStyles()} ${sizeClasses} whitespace-nowrap`}
    >
      {status}
    </span>
  );
};
