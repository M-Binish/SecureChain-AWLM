import React, { useState } from 'react';
import { UserRole, UserSession } from '../types';
import { DEMO_ROLES } from '../data/mockData';
import { verifyDemoCredentials } from '../utils/auth';
import {
  Shield,
  Layers,
  Info,
  LogIn,
  Building2,
  Truck,
  FileCheck,
  UserCheck,
  Scale,
  Settings,
  AlertCircle,
  KeyRound,
  User as UserIcon,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (session: UserSession) => void;
}

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  'Manufacturer': Building2,
  'Supply Chain Operator': Truck,
  'Military / Defense': Shield,
  'Government': UserCheck,
  'Regulator': FileCheck,
  'Auditor / Inspector': Scale,
  'Administrator': Settings,
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedRole) {
      setErrorMessage('Please select a stakeholder role.');
      return;
    }

    const result = verifyDemoCredentials(username, password, selectedRole as UserRole);
    if (!result.success || !result.session) {
      setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      return;
    }

    onLogin(result.session);
  };

  const currentRoleInfo = DEMO_ROLES.find((r) => r.role === selectedRole);
  const SelectedIcon = selectedRole ? (ROLE_ICONS[selectedRole as UserRole] || Shield) : Shield;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Academic Title */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md border border-slate-700">
            <Layers className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          SecureChain-AWLM
        </h1>
        <p className="mt-1 text-center text-sm font-medium text-slate-600">
          Autonomous Weapon Lifecycle Management
        </p>
        <p className="mt-0.5 text-center text-xs text-slate-500">
          Software-Only Academic Research Prototype • B.Tech Major Project
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Authentication Card */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-slate-300 sm:px-8 space-y-6">
          {/* Stakeholder Authentication Notice */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-slate-900">
                Authorized Stakeholder Authentication
              </strong>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Please enter your assigned username, password, and stakeholder role to access the lifecycle management system.
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Role Dropdown Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Stakeholder Role
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
                  required
                >
                  <option value="">Select Role</option>
                  {DEMO_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.role}
                    </option>
                  ))}
                </select>
              </div>
              {currentRoleInfo && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <SelectedIcon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-semibold text-slate-800">{currentRoleInfo.title}: </span>
                    <span>{currentRoleInfo.description}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Login Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
                <span>Verify Credentials & Sign In</span>
              </button>
            </div>
          </form>
        </div>

        {/* Academic Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>B.Tech Major Project • Department of Computer Science & Engineering</p>
          <p className="text-[11px] text-slate-400">
            Simulated lifecycle governance based on IEEE consensus models for autonomous weapon systems.
          </p>
        </div>
      </div>
    </div>
  );
};
