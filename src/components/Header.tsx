import React from 'react';
import { UserRole } from '../types';
import { Menu, LogOut, ShieldAlert, User, Shield } from 'lucide-react';

interface HeaderProps {
  currentViewTitle: string;
  activeRole: UserRole;
  username: string;
  organization: string;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentViewTitle,
  activeRole,
  username,
  organization,
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

        {/* Right Side: Read-Only Stakeholder Identity Display & Logout */}
        <div className="flex items-center gap-3">
          {/* Read-Only Authenticated Session Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-left select-none">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xs leading-tight min-w-0">
              <div className="text-[11px] text-slate-500 truncate">
                Signed in as: <span className="font-semibold text-slate-900">{username}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                Role: <span className="font-bold text-slate-900">{activeRole}</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Log out of current stakeholder session"
            aria-label="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
