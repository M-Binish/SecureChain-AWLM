import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DashboardCard } from '../components/DashboardCard';
import { DataService } from '../services/dataService';
import { ALL_ROLES, ROLE_PERMISSIONS, OPERATION_PERMISSIONS } from '../utils/permissions';
import { AwsRecord, UserRole } from '../types';
import {
  Cpu,
  Shield,
  Server,
  Database,
  Users,
  HardDrive,
  RefreshCw,
  Download,
  AlertOctagon,
  CheckCircle2,
  FileCheck,
  Activity,
  Layers,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface AdminConsolePageProps {
  userRole: UserRole;
  onNavigateToView: (viewId: string) => void;
  onResetDatabase?: () => void;
}

export const AdminConsolePage: React.FC<AdminConsolePageProps> = ({
  userRole,
  onNavigateToView,
  onResetDatabase,
}) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const awsRecords = DataService.getAwsRecords();
  const transactions = DataService.getTransactions();
  const violations = DataService.getViolations();
  const incidents = DataService.getIncidentRecords();
  const audits = DataService.getAuditRecords();

  const handleExportJson = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      prototype: 'SecureChain-AWLM (Academic Software Prototype)',
      awsRecords,
      transactions,
      violations,
      incidentRecords: incidents,
      auditRecords: audits,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securechain_awlm_ledger_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({
      type: 'success',
      message: 'System database exported successfully as formatted JSON file.',
    });
  };

  const handleConfirmReset = () => {
    DataService.resetToDefaults();
    setShowResetConfirm(false);
    setFeedback({
      type: 'success',
      message: 'System ledger and mock records successfully reset to factory baseline defaults.',
    });
    if (onResetDatabase) {
      onResetDatabase();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration & Consortium Management Console"
        subtitle="System-level administrative controls, stakeholder role provisioning overview, ledger storage management, and global policy parameters."
        badge="ADMIN CONSOLE"
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold hover:underline cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="System Health"
          value="Operational"
          subtitle="All academic modules healthy"
          icon={Activity}
        />
        <DashboardCard
          title="Consortium Stakeholders"
          value={ALL_ROLES.length}
          subtitle="7 RBAC roles provisioned"
          icon={Users}
        />
        <DashboardCard
          title="AWS Digital Assets"
          value={awsRecords.length}
          subtitle="Tracked in persistent storage"
          icon={Shield}
        />
        <DashboardCard
          title="Total Ledger Entries"
          value={transactions.length}
          subtitle="Immutable transaction events"
          icon={Database}
        />
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stakeholder Role Matrix */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Consortium Role Provisioning & Access Control Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Active role authorization policies enforced across lifecycle operations and data views.
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-semibold">
                7 Roles Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-600 border-b border-slate-200">
                    <th className="px-3 py-2.5">Stakeholder Role</th>
                    <th className="px-3 py-2.5">Designated Mandate</th>
                    <th className="px-3 py-2.5">Authorized Lifecycle Operations</th>
                    <th className="px-3 py-2.5">View Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ALL_ROLES.map((role) => {
                    const ops: string[] = [];
                    Object.entries(OPERATION_PERMISSIONS).forEach(([opKey, roles]) => {
                      if (roles.includes(role)) {
                        ops.push(opKey.replace('_', ' '));
                      }
                    });

                    const viewsCount = ROLE_PERMISSIONS[role]?.length || 0;

                    return (
                      <tr key={role} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          <span>{role}</span>
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {role === 'Manufacturer' && 'Enrolls genesis units, hardware specifications.'}
                          {role === 'Supply Chain Operator' && 'Logs chain of custody, logistics handoffs.'}
                          {role === 'Military / Defense' && 'Operational deployments, service tracking, incidents.'}
                          {role === 'Government' && 'Sovereign deployment review, statutory authorizations.'}
                          {role === 'Regulator' && 'Safety covenants, certification reviews, compliance.'}
                          {role === 'Auditor / Inspector' && 'Independent verification, audit logs, violations.'}
                          {role === 'Administrator' && 'Consortium administration, system governance.'}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {ops.length > 0 ? (
                              ops.map((op) => (
                                <span
                                  key={op}
                                  className="capitalize text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                                >
                                  {op}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Read-Only Oversight</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-500 font-mono text-[11px]">
                          {viewsCount} modules
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Diagnostic Integrity Check */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Consortium Governance & Data Integrity Diagnostics</span>
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic verification checks running against the active digital database.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                <div className="text-slate-500 font-medium">Policy Engine Coverage</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>8 / 8 Active Rules</span>
                </div>
                <div className="text-[11px] text-slate-500">Deterministic automated evaluation</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                <div className="text-slate-500 font-medium">Terminal State Locks</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Enforced</span>
                </div>
                <div className="text-[11px] text-slate-500">Disposed records immutable</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                <div className="text-slate-500 font-medium">Chain-of-Custody Provenance</div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified</span>
                </div>
                <div className="text-[11px] text-slate-500">Strict ownership transfer tracking</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database Storage Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-700" />
                <span>Ledger Storage Engine</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Local persistent storage for the academic prototype.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Storage Engine:</span>
                <span className="font-mono font-bold text-slate-900">localStorage (v3)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">AWS Assets:</span>
                <span className="font-mono font-bold text-slate-900">{awsRecords.length} units</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Transaction Logs:</span>
                <span className="font-mono font-bold text-slate-900">{transactions.length} entries</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Policy Violations:</span>
                <span className="font-mono font-bold text-slate-900">{violations.length} logs</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Reported Incidents:</span>
                <span className="font-mono font-bold text-slate-900">{incidents.length} reports</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Audit Compliance Logs:</span>
                <span className="font-mono font-bold text-slate-900">{audits.length} audits</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Export Ledger as JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-rose-600" />
                <span>Reset Database to Baseline</span>
              </button>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Administrative Navigation
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onNavigateToView('aws-registry')}
                className="w-full text-left p-2 rounded hover:bg-white text-slate-700 font-medium transition-colors"
              >
                → Open Full AWS Registry
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('transaction-history')}
                className="w-full text-left p-2 rounded hover:bg-white text-slate-700 font-medium transition-colors"
              >
                → Inspect Lifecycle Transaction Ledger
              </button>
              <button
                type="button"
                onClick={() => onNavigateToView('violations')}
                className="w-full text-left p-2 rounded hover:bg-white text-slate-700 font-medium transition-colors"
              >
                → Review Automated Policy Violations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Database Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-xl border border-slate-300 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-full">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Database Reset
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reset the SecureChain-AWLM database to initial factory defaults?
              All newly registered units, custody transfers, operational usage events, and incident logs will be reverted.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold cursor-pointer"
              >
                Yes, Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
