import React from 'react';
import { UserRole } from '../types';
import { canAccessView, getRoleDashboardTitle } from '../utils/permissions';
import {
  LayoutDashboard,
  Shield,
  FileCheck2,
  ArrowRightLeft,
  ShieldCheck,
  Activity,
  ClipboardCheck,
  AlertTriangle,
  Trash2,
  ScrollText,
  AlertOctagon,
  BarChart3,
  History,
  Scale,
  Users,
  Layers,
  ChevronRight,
  Eye,
  Cpu,
  GitFork,
  HardDrive,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  userRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'main' | 'lifecycle' | 'governance';
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  // Main
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    group: 'main',
  },
  {
    id: 'aws-registry',
    title: 'AWS Registry',
    icon: Shield,
    group: 'main',
  },

  // Lifecycle Management (7 Stages strictly matched)
  {
    id: 'manufacturing-certification',
    title: 'Manufacturing & Certification',
    icon: FileCheck2,
    group: 'lifecycle',
  },
  {
    id: 'ownership-transfer',
    title: 'Ownership Transfer',
    icon: ArrowRightLeft,
    group: 'lifecycle',
  },
  {
    id: 'deployment-authorization',
    title: 'Deployment Authorization',
    icon: ShieldCheck,
    group: 'lifecycle',
  },
  {
    id: 'usage-tracking',
    title: 'Usage Tracking',
    icon: Activity,
    group: 'lifecycle',
  },
  {
    id: 'audit-compliance',
    title: 'Audit & Compliance',
    icon: ClipboardCheck,
    group: 'lifecycle',
  },
  {
    id: 'incident-reporting',
    title: 'Incident Reporting',
    icon: AlertTriangle,
    group: 'lifecycle',
  },
  {
    id: 'disposal',
    title: 'Disposal',
    icon: Trash2,
    group: 'lifecycle',
  },

  // Governance & System
  {
    id: 'system-architecture',
    title: 'System Architecture',
    icon: Cpu,
    group: 'governance',
  },
  {
    id: 'auditor-dashboard',
    title: 'Auditor / Inspector Dashboard',
    icon: Scale,
    group: 'governance',
    badge: 'AUDIT',
  },
  {
    id: 'admin-console',
    title: 'System Administration Console',
    icon: HardDrive,
    group: 'governance',
    badge: 'ADMIN',
  },
  {
    id: 'policies',
    title: 'Governance Policies',
    icon: ScrollText,
    group: 'governance',
  },
  {
    id: 'violations',
    title: 'Policy Violations',
    icon: AlertOctagon,
    group: 'governance',
    badge: 'ENGINE',
  },
  {
    id: 'lifecycle-analytics',
    title: 'Compliance Analytics',
    icon: BarChart3,
    group: 'governance',
  },
  {
    id: 'transaction-history',
    title: 'Lifecycle Transaction History',
    icon: History,
    group: 'governance',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  userRole,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Check permission for each item
  const permittedItems = NAV_ITEMS.filter((item) => canAccessView(userRole, item.id));

  const mainItems = permittedItems.filter((i) => i.group === 'main');
  const lifecycleItems = permittedItems.filter((i) => i.group === 'lifecycle');
  const governanceItems = permittedItems.filter((i) => i.group === 'governance');

  const totalHiddenItems = NAV_ITEMS.length - permittedItems.length;

  const renderNavGroup = (title: string, items: NavItemConfig[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </div>
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (item.id === 'system-architecture' && currentView === 'architecture') ||
              (item.id === 'aws-registry' && currentView === 'registry');

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">
                    {item.id === 'dashboard' ? getRoleDashboardTitle(userRole) : item.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-white tracking-tight leading-tight truncate">
              SecureChain-AWLM
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              Autonomous Weapon Lifecycle
            </div>
          </div>
        </div>

        {/* Navigation List strictly organized */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {renderNavGroup('Main', mainItems)}
          {renderNavGroup('Lifecycle Management', lifecycleItems)}
          {renderNavGroup('Governance & System', governanceItems)}
        </div>

        {/* Role Access Indicator Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Active Role Filter</span>
            <Eye className="w-3 h-3 text-slate-500" />
          </div>
          <div className="bg-slate-800/80 rounded px-2.5 py-1.5 border border-slate-700">
            <div className="font-semibold text-blue-300 truncate">{userRole}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {totalHiddenItems > 0 ? (
                <span>{totalHiddenItems} module(s) restricted by role policy</span>
              ) : (
                <span>Full access across all modules</span>
              )}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            Role-based access control & digital lifecycle records
          </div>
        </div>
      </aside>
    </>
  );
};
