import React from 'react';
import { UserRole } from '../types';
import { DEMO_ROLES } from '../data/mockData';
import { Menu, LogOut, ShieldAlert, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentViewTitle: string;
  activeRole: UserRole;
  username: string;
  organization: string;
  onRoleChange: (newRole: UserRole) => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentViewTitle,
  activeRole,
  username,
  organization,
  onRoleChange,
  onLogout,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hidden sm:inline">SecureChain-AWLM</span>
              <span className="hidden sm:inline">/</span>
              <span className="font-semibold text-slate-900 truncate">{currentViewTitle}</span>
            </div>
          </div>
        </div>

        {/* Center: Academic Notice Badge (hidden on small screens) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          <span>Academic Prototype • Software Simulation Only</span>
        </div>

        {/* Right Side: Role Switcher & User Session */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden xl:inline">Switch Role:</span>
            <div className="relative inline-block">
              <select
                value={activeRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-md py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 cursor-pointer shadow-xs"
                title="Change active demo role to inspect role-specific navigation"
              >
                {DEMO_ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    Role: {r.role}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* User Profile Info */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                {username}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                {organization}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-rose-200"
            title="Log out of session"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
