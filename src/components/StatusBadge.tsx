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
      case 'Passed':
      case 'Authorized':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Active Service':
      case 'Deployed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
      case 'Pending Review':
      case 'Pending':
      case 'Under Inspection':
      case 'In Transit':
      case 'Manufacturing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Needs Revision':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
      case 'Incident Flagged':
      case 'Flagged':
      case 'Revoked':
      case 'Rejected':
      case 'Non-Compliant':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'Pending Disposal':
      case 'Disposal Requested':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Government Approved':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Audit Compliant':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Manufacturer Finalized':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Decommissioned':
      case 'Expired':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
      case 'Not Scheduled':
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
