import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  badgeText?: string;
  alert?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText = 'DEMO DATA',
  alert = false,
}) => {
  return (
    <div
      className={`bg-white rounded-lg border p-5 transition-shadow hover:shadow-sm ${
        alert ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`p-2 rounded-md ${
            alert ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
        {badgeText && (
          <span className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-2 text-xs text-slate-500">{subtitle}</div>
    </div>
  );
};
