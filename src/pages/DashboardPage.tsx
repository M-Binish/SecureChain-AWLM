import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DashboardCard } from '../components/DashboardCard';
import { StatusBadge } from '../components/StatusBadge';
import { AwsRecord, LifecycleTransaction, UserRole } from '../types';
import {
  DEMO_VIOLATIONS,
  DEMO_INCIDENTS,
  DEMO_AUDIT_RECORDS,
} from '../data/mockData';
import {
  Shield,
  Layers,
  FileCheck,
  AlertOctagon,
  AlertTriangle,
  Trash2,
  Clock,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Building2,
  Truck,
  FileText,
  UserCheck,
  Scale,
  Settings,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface DashboardPageProps {
  stats: {
    totalAwsRecords: number;
    lifecycleTransactions: number;
    complianceChecks: number;
    detectedViolations: number;
    openIncidents: number;
    pendingDisposal: number;
  };
  awsRecords: AwsRecord[];
  transactions: LifecycleTransaction[];
  userRole: UserRole;
  onSelectAws: (record: AwsRecord) => void;
  onNavigateToView: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  awsRecords,
  transactions,
  userRole,
  onSelectAws,
  onNavigateToView,
}) => {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Helper to determine stage status for overview matrix
  const getStageIndicator = (record: AwsRecord, stageName: string) => {
    const stageEvents = record.lifecycleHistory.filter((e) => {
      const stage = e.stage as string;
      if (stageName === 'Manufacturing & Certification') {
        return (
          stage === 'Manufacturing & Certification' ||
          stage === 'Manufacturing' ||
          stage === 'Certification'
        );
      }
      if (stageName === 'Usage Tracking') {
        return stage === 'Usage Tracking' || stage === 'Usage';
      }
      return stage === stageName;
    });
    if (stageEvents.length === 0) {
      return { status: 'none', label: '—', color: 'text-slate-300' };
    }

    if (stageName === 'Incident Reporting') {
      const hasFlagged = stageEvents.some((e) => e.status === 'Flagged');
      if (hasFlagged) {
        return { status: 'flagged', label: '1 Flagged', color: 'text-rose-600 font-bold' };
      }
      return { status: 'none', label: '—', color: 'text-slate-300' };
    }

    if (stageName === 'Disposal') {
      const isCompleted = stageEvents.some((e) => e.status === 'Completed');
      const isPending = stageEvents.some((e) => e.status === 'Pending');
      if (isCompleted) return { status: 'completed', label: 'Disposed', color: 'text-slate-500 font-medium' };
      if (isPending) return { status: 'pending', label: 'Pending', color: 'text-purple-600 font-semibold' };
    }

    const isCompleted = stageEvents.some((e) => e.status === 'Completed');
    if (isCompleted) {
      const count = stageEvents.length;
      return {
        status: 'completed',
        label: count > 1 ? `✓ (${count})` : '✓',
        color: 'text-emerald-600 font-bold',
      };
    }

    return { status: 'in-progress', label: 'In Progress', color: 'text-amber-600 font-medium' };
  };

  // Computations for role-specific dashboard metrics
  const pendingCertCount = awsRecords.filter(
    (r) => r.certificationStatus === 'Pending Review' || r.lifecycleStatus === 'Manufacturing & Certification'
  ).length;

  const totalTransfersCount = transactions.filter(
    (t) => t.operation.toLowerCase().includes('custody') || t.operation.toLowerCase().includes('transfer')
  ).length;

  const pendingCustodyCount = awsRecords.filter(
    (r) => r.lifecycleStatus === 'In Transit' || r.currentOwner === 'Supply Chain Operator'
  ).length;

  const activeAwsUnitsCount = awsRecords.filter(
    (r) => r.lifecycleStatus === 'Active Service' || r.usageStatus === 'Active Service'
  ).length;

  const pendingDeploymentsCount = awsRecords.filter(
    (r) => r.deploymentAuthorizationStatus === 'Pending' || r.lifecycleStatus === 'Certified'
  ).length;

  const incidentsReportedCount = DEMO_INCIDENTS.length;

  const totalAuthorizedAwsCount = awsRecords.filter(
    (r) => r.deploymentAuthorizationStatus === 'Authorized'
  ).length;

  const safetyCovenantsFiledCount = transactions.filter(
    (t) => t.stakeholderRole === 'Regulator' || t.operation.toLowerCase().includes('covenant')
  ).length;

  const auditedAwsTotal = DEMO_AUDIT_RECORDS.length;
  const activeViolationsCount = DEMO_VIOLATIONS.filter((v) => v.status !== 'Resolved').length;
  const openIncidentsCount = DEMO_INCIDENTS.filter((i) => i.status !== 'Closed').length;

  // Render role-specific summary cards and quick action
  const renderRoleCardsAndAction = () => {
    switch (userRole) {
      case 'Manufacturer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DashboardCard
                title="AWS Registered"
                value={stats.totalAwsRecords}
                subtitle="Total manufacturer registered assets"
                icon={Building2}
              />
              <DashboardCard
                title="Pending Certification"
                value={pendingCertCount}
                subtitle="Awaiting regulator sign-off"
                icon={Clock}
                alert={pendingCertCount > 0}
              />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Primary Manufacturer Action
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    Genesis Asset Enrollment
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Register a new autonomous weapon system identity for consortium verification.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('manufacturing-certification')}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Register / Enroll Asset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Supply Chain Operator':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DashboardCard
                title="Total Transfers"
                value={totalTransfersCount}
                subtitle="Documented transit handshakes"
                icon={Truck}
              />
              <DashboardCard
                title="Pending Custody Updates"
                value={pendingCustodyCount}
                subtitle="Awaiting recipient verification"
                icon={Clock}
              />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Primary Logistics Action
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    Custody Handoff Logging
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Execute a verified custody transfer log across authorized transit depots.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('ownership-transfer')}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Record Ownership / Custody Transfer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Military / Defense':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Active AWS Units"
                value={activeAwsUnitsCount}
                subtitle="Currently in active service"
                icon={Shield}
              />
              <DashboardCard
                title="Pending Deployments"
                value={pendingDeploymentsCount}
                subtitle="Awaiting government clearance"
                icon={Clock}
              />
              <DashboardCard
                title="Incidents Reported"
                value={incidentsReportedCount}
                subtitle="Operational safety alerts"
                icon={AlertTriangle}
                alert={incidentsReportedCount > 0}
              />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Primary Defense Action
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    Deployment Request
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    File operational clearance request with geographical boundary constraints.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('deployment-authorization')}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Submit Deployment Request</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Government':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DashboardCard
                title="Deployment Authorizations Pending"
                value={pendingDeploymentsCount}
                subtitle="Pending sovereign review"
                icon={Clock}
                alert={pendingDeploymentsCount > 0}
              />
              <DashboardCard
                title="Total Authorized AWS"
                value={totalAuthorizedAwsCount}
                subtitle="Active sovereign clearances"
                icon={UserCheck}
              />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Primary Authority Action
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    Sovereign Oversight
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Review and sign off on mission authorization parameters and compliance limits.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('deployment-authorization')}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Review Deployment Requests</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Regulator':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DashboardCard
                title="Pending Certifications"
                value={pendingCertCount}
                subtitle="Safety files under review"
                icon={Clock}
                alert={pendingCertCount > 0}
              />
              <DashboardCard
                title="Safety Covenants Filed"
                value={safetyCovenantsFiledCount}
                subtitle="Verified algorithmic limits"
                icon={FileCheck}
              />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Primary Regulatory Action
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    Compliance Certification
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Audit algorithmic bounds and issue immutable certification approval.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('audit-compliance')}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Review Certification & Audit Requests</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Auditor / Inspector':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <DashboardCard
                title="Audited AWS Records"
                value={auditedAwsTotal}
                subtitle="Independent review files"
                icon={Scale}
              />
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                <div className="text-xs font-medium text-slate-500">Compliance Status</div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  Pending / Not Evaluated
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Policy engine evaluation in Phase 3
                </div>
              </div>
              <DashboardCard
                title="Active Violations"
                value={activeViolationsCount}
                subtitle="Rule infractions open"
                icon={AlertOctagon}
                alert={activeViolationsCount > 0}
              />
              <DashboardCard
                title="Open Incidents"
                value={openIncidentsCount}
                subtitle="Awaiting safety audit"
                icon={AlertTriangle}
                alert={openIncidentsCount > 0}
              />
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Primary Audit Action
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    Lifecycle Audit View
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('auditor-dashboard')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Open Comprehensive Audit View</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Administrator':
      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <DashboardCard
                title="User Roles Provisioned"
                value="7 Roles"
                subtitle="Consortium access configured"
                icon={UserCheck}
              />
              <DashboardCard
                title="System Status"
                value="Operational"
                subtitle="Academic prototype running"
                icon={Settings}
              />
              <DashboardCard
                title="Total AWS Records"
                value={stats.totalAwsRecords}
                subtitle="Simulated registered assets"
                icon={Shield}
              />
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Primary Admin Action
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    Stakeholder Provisioning
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Review and configure active consortium participant roles and credentials.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('aws-registry')}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>AWS Registry & Governance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${userRole} Dashboard`}
        subtitle="Role-tailored overview of autonomous weapon lifecycle states, pending actions, and governance records."
        badge={`ACTIVE ROLE: ${userRole.toUpperCase()}`}
      />

      {/* Academic Prototype Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-md shrink-0 border border-blue-500/30">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Phase 2 Role-Based Access Control Prototype
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
              This academic software prototype tracks digital lifecycle records for simulated Autonomous Weapon Systems. Demo authentication is active with session persistence. Real weapons and live blockchain networks are strictly out-of-scope.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
            DEMO SESSION ACTIVE
          </span>
        </div>
      </div>

      {/* Role-Specific Summary Cards & Quick Action */}
      {renderRoleCardsAndAction()}

      {/* Action feedback modal/toast if triggered */}
      {actionFeedback && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-md text-xs flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-blue-700 font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: AWS Lifecycle Overview Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              AWS Lifecycle State Matrix (Sample Records)
            </h3>
            <p className="text-xs text-slate-500">
              Visualizes cross-stage progression across the 7 lifecycle governance stages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToView('registry')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full AWS Registry</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-[11px] uppercase tracking-wider font-semibold text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">AWS Identifier</th>
                <th className="px-4 py-3">System Name</th>
                <th className="px-2 py-3 text-center">Mfg & Cert</th>
                <th className="px-2 py-3 text-center">Ownership</th>
                <th className="px-2 py-3 text-center">Deployment</th>
                <th className="px-2 py-3 text-center">Usage Tracking</th>
                <th className="px-2 py-3 text-center">Audit</th>
                <th className="px-2 py-3 text-center">Incident</th>
                <th className="px-2 py-3 text-center">Disposal</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {awsRecords.slice(0, 5).map((record) => {
                const mfgCert = getStageIndicator(record, 'Manufacturing & Certification');
                const trf = getStageIndicator(record, 'Ownership Transfer');
                const dep = getStageIndicator(record, 'Deployment Authorization');
                const use = getStageIndicator(record, 'Usage Tracking');
                const aud = getStageIndicator(record, 'Audit & Compliance');
                const inc = getStageIndicator(record, 'Incident Reporting');
                const disp = getStageIndicator(record, 'Disposal');

                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {record.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div>{record.systemName}</div>
                      <div className="text-[11px] text-slate-400">{record.systemType}</div>
                    </td>
                    <td className={`px-2 py-3 text-center text-xs ${mfgCert.color}`}>{mfgCert.label}</td>
                    <td className={`px-2 py-3 text-center text-xs ${trf.color}`}>{trf.label}</td>
                    <td className={`px-2 py-3 text-center text-xs ${dep.color}`}>{dep.label}</td>
                    <td className={`px-2 py-3 text-center text-xs ${use.color}`}>{use.label}</td>
                    <td className={`px-2 py-3 text-center text-xs ${aud.color}`}>{aud.label}</td>
                    <td className={`px-2 py-3 text-center text-xs ${inc.color}`}>{inc.label}</td>
                    <td className={`px-2 py-3 text-center text-xs ${disp.color}`}>{disp.label}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectAws(record)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            Legend: <span className="font-bold text-emerald-600">✓ Completed</span> • <span className="font-semibold text-amber-600">In Progress</span> • <span className="font-bold text-rose-600">Flagged Incident</span> • <span className="text-slate-400">— Not Applicable</span>
          </div>
          <span className="font-mono text-slate-400">FICTIONAL DATA ONLY</span>
        </div>
      </div>

      {/* Section 2: Recent Lifecycle Transactions Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Recent Lifecycle Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of state modifications and verification sign-offs across consortium participants.
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 font-mono">
            {transactions.length} Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-[11px] uppercase tracking-wider font-semibold text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">Transaction / Event</th>
                <th className="px-4 py-3">AWS ID</th>
                <th className="px-4 py-3">Stakeholder Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{tx.operation}</div>
                    <div className="text-[11px] font-mono text-slate-400">{tx.transactionRef}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                    {tx.awsId}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <div className="font-medium text-slate-900">{tx.stakeholder}</div>
                    <div className="text-[11px] text-slate-400">{tx.stakeholderRole}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={tx.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                    {tx.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Demo data only. Smart contract execution will be implemented in subsequent phases.</span>
          <span className="font-mono text-[11px]">IMMUTABILITY SIMULATION</span>
        </div>
      </div>
    </div>
  );
};
