import React from 'react';
import { UserRole } from '../types';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { VIEW_TITLES } from '../utils/permissions';

interface AccessRestrictedPageProps {
  currentRole: UserRole;
  attemptedView: string;
  onReturnToDashboard: () => void;
}

export const AccessRestrictedPage: React.FC<AccessRestrictedPageProps> = ({
  currentRole,
  attemptedView,
  onReturnToDashboard,
}) => {
  const attemptedTitle = VIEW_TITLES[attemptedView] || attemptedView;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-300 shadow-sm p-8 text-center space-y-6">
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading & Notice */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Access Restricted
          </h2>
          <p className="text-sm font-semibold text-rose-700 bg-rose-50/70 border border-rose-200/80 rounded-md p-2.5">
            You do not have permission to access this section with your current role.
          </p>
        </div>

        {/* Context Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Attempted Section:</span>
            <span className="font-semibold text-slate-800">{attemptedTitle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Active Stakeholder Role:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800">
              {currentRole}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Enforcement Model:</span>
            <span className="font-mono text-slate-600 text-[11px]">Role-Based Access Control (RBAC)</span>
          </div>
        </div>

        {/* Academic Prototype Notice */}
        <p className="text-xs text-slate-500 leading-relaxed">
          In this academic prototype, lifecycle governance mandates that each consortium stakeholder is strictly confined to authorized modules and digital state transitions.
        </p>

        {/* Return Button */}
        <div>
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
