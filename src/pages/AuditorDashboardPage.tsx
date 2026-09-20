import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DashboardCard } from '../components/DashboardCard';
import { StatusBadge } from '../components/StatusBadge';
import { LifecycleTimeline } from '../components/LifecycleTimeline';
import { AwsRecord, LifecycleTransaction, UserRole } from '../types';
import { DataService } from '../services/dataService';
import { PolicyEngine } from '../services/policyEngine';
import {
  DEMO_AUDIT_RECORDS,
} from '../data/mockData';
import {
  Scale,
  Shield,
  ClipboardCheck,
  AlertOctagon,
  AlertTriangle,
  History,
  Info,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  FileText,
  Search,
  Check,
  Minus,
} from 'lucide-react';

interface AuditorDashboardPageProps {
  awsRecords: AwsRecord[];
  transactions: LifecycleTransaction[];
  userRole: UserRole;
  onSelectAws: (record: AwsRecord) => void;
}

export const AuditorDashboardPage: React.FC<AuditorDashboardPageProps> = ({
  awsRecords,
  transactions,
  userRole,
  onSelectAws,
}) => {
  // Selected AWS for deep-dive lifecycle timeline inspection
  const [selectedAwsId, setSelectedAwsId] = useState<string>(
    awsRecords.length > 0 ? awsRecords[0].id : 'AWS-001'
  );

  const activeAwsRecord =
    awsRecords.find((r) => r.id === selectedAwsId) || awsRecords[0];

  const violations = useMemo(() => DataService.getViolations(), [awsRecords]);
  const incidents = useMemo(() => DataService.getIncidentRecords(), [awsRecords]);

  const activePolicyReport = useMemo(() => {
    if (!activeAwsRecord) return null;
    return PolicyEngine.evaluateAwsRecord(activeAwsRecord);
  }, [activeAwsRecord]);

  // Helper to determine stage indicator for matrix
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
      return { status: 'none', label: '—', color: 'text-slate-400 font-medium' };
    }

    if (stageName === 'Incident Reporting') {
      const hasFlagged = stageEvents.some((e) => e.status === 'Flagged');
      if (hasFlagged) {
        return {
          status: 'flagged',
          label: 'Flagged (1)',
          color: 'text-rose-600 font-bold',
        };
      }
      return { status: 'none', label: '—', color: 'text-slate-400 font-medium' };
    }

    if (stageName === 'Disposal') {
      const isCompleted = stageEvents.some((e) => e.status === 'Completed');
      const isPending = stageEvents.some((e) => e.status === 'Pending');
      if (isCompleted)
        return {
          status: 'completed',
          label: 'Disposed ✓',
          color: 'text-slate-600 font-medium',
        };
      if (isPending)
        return {
          status: 'pending',
          label: 'Pending',
          color: 'text-purple-600 font-semibold',
        };
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

    return {
      status: 'in-progress',
      label: 'In Progress',
      color: 'text-amber-600 font-medium',
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditor / Inspector Comprehensive Audit View"
        subtitle="Authorized read-only cross-cutting oversight of autonomous weapon system lifecycle states, historical events, compliance checks, and exceptions."
        badge="AUTHORIZED AUDITOR ACCESS"
      />

      {/* Academic Prototype Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-md shrink-0 border border-blue-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Authorized Read-Only Inspection Console
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
              The Auditor / Inspector role possesses comprehensive read visibility into all 7 lifecycle governance stages. All records below are simulated demo data. Compliance calculation is maintained as a neutral status pending formal regulatory policy rules.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
            DEMO DATASET ONLY
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Monitored Assets"
          value={awsRecords.length}
          subtitle="Registered autonomous systems"
          icon={Shield}
        />
        <DashboardCard
          title="Audit Records"
          value={DEMO_AUDIT_RECORDS.length}
          subtitle="Independent review files"
          icon={ClipboardCheck}
        />
        <DashboardCard
          title="Open Incidents"
          value={incidents.filter((i) => i.status !== 'Closed').length}
          subtitle="Safety anomaly reports"
          icon={AlertTriangle}
          alert={incidents.some((i) => i.status !== 'Closed')}
        />
        <DashboardCard
          title="Detected Violations"
          value={violations.filter((v) => v.status !== 'Resolved').length}
          subtitle="Policy infractions open"
          icon={AlertOctagon}
          alert={violations.some((v) => v.status !== 'Resolved')}
        />
        <DashboardCard
          title="Lifecycle Transactions"
          value={transactions.length}
          subtitle="Recorded state events"
          icon={History}
        />
      </div>

      {/* SECTION 1: AWS Lifecycle Overview Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-700" />
              <span>1. AWS Lifecycle Overview Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Cross-stage tracking across the 7 lifecycle stages. Select any record to display its verifiable timeline below.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {awsRecords.length} Total Systems Monitored
          </span>
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
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {awsRecords.map((record) => {
                const isSelected = record.id === selectedAwsId;
                const mfgCert = getStageIndicator(record, 'Manufacturing & Certification');
                const trf = getStageIndicator(record, 'Ownership Transfer');
                const dep = getStageIndicator(record, 'Deployment Authorization');
                const use = getStageIndicator(record, 'Usage Tracking');
                const aud = getStageIndicator(record, 'Audit & Compliance');
                const inc = getStageIndicator(record, 'Incident Reporting');
                const disp = getStageIndicator(record, 'Disposal');

                return (
                  <tr
                    key={record.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/50 font-medium' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedAwsId(record.id)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 flex items-center gap-2">
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                      <span>{record.id}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <div>{record.systemName}</div>
                      <div className="text-[11px] text-slate-400">
                        Owner: {record.currentOwner}
                      </div>
                    </td>
                    <td className={`px-2 py-3 text-center text-xs ${mfgCert.color}`}>
                      {mfgCert.label}
                    </td>
                    <td className={`px-2 py-3 text-center text-xs ${trf.color}`}>
                      {trf.label}
                    </td>
                    <td className={`px-2 py-3 text-center text-xs ${dep.color}`}>
                      {dep.label}
                    </td>
                    <td className={`px-2 py-3 text-center text-xs ${use.color}`}>
                      {use.label}
                    </td>
                    <td className={`px-2 py-3 text-center text-xs ${aud.color}`}>
                      {aud.label}
                    </td>
                    <td className={`px-2 py-3 text-center text-xs ${inc.color}`}>
                      {inc.label}
                    </td>
                    <td className={`px-2 py-3 text-center text-xs ${disp.color}`}>
                      {disp.label}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAwsId(record.id);
                          }}
                          className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {isSelected ? 'Inspecting' : 'Select'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAws(record);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors cursor-pointer"
                        >
                          Inspect Full
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            Matrix Legend: <span className="font-bold text-emerald-600">✓ Completed Stage</span> • <span className="font-semibold text-amber-600">In Progress</span> • <span className="font-bold text-rose-600">Flagged Incident</span> • <span className="text-slate-400">— Not Applicable</span>
          </div>
          <span className="font-mono text-slate-400">DEMO AUDIT EVALUATION</span>
        </div>
      </div>

      {/* SECTION 2: Verifiable Lifecycle Timeline for Selected Asset */}
      {activeAwsRecord && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {activeAwsRecord.id}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-sm font-bold text-slate-900">
                  {activeAwsRecord.systemName}
                </span>
                <StatusBadge status={activeAwsRecord.lifecycleStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                2. Verifiable Lifecycle Event Timeline (Chronological Audit Trail)
              </p>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-4">
              <span>Owner: <strong>{activeAwsRecord.currentOwner}</strong></span>
              <span>Cert: <strong className="font-mono">{activeAwsRecord.certificationId}</strong></span>
            </div>
          </div>

          <LifecycleTimeline
            events={activeAwsRecord.lifecycleHistory}
            currentStatus={activeAwsRecord.lifecycleStatus}
          />
        </div>
      )}

      {/* SECTION 3 & 4: Audit Records & Compliance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Records Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-slate-700" />
              <span>3. Independent Audit Records</span>
            </h3>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
              {DEMO_AUDIT_RECORDS.length} Inspections Filed
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-[11px] uppercase tracking-wider font-semibold text-slate-600 border-b border-slate-200">
                  <th className="px-4 py-2.5">Audit ID</th>
                  <th className="px-3 py-2.5">AWS ID</th>
                  <th className="px-3 py-2.5">Audit Type</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Inspector</th>
                  <th className="px-3 py-2.5">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DEMO_AUDIT_RECORDS.map((aud) => (
                  <tr key={aud.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {aud.id}
                    </td>
                    <td className="px-3 py-3 font-mono text-blue-700 font-bold">
                      {aud.awsId}
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-800">
                      {aud.auditType}
                    </td>
                    <td className="px-3 py-3 text-slate-500 font-mono text-[11px]">
                      {aud.date}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {aud.inspector}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          aud.result === 'Passed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {aud.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Compliance Status Panel */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700" />
                <span>4. Compliance Status ({activeAwsRecord.id})</span>
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  activePolicyReport?.derivedStatus === 'Compliant'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : activePolicyReport?.derivedStatus === 'Requires Review'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : activePolicyReport?.derivedStatus === 'Non-Compliant'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {activePolicyReport?.derivedStatus || 'PENDING'}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs text-slate-500 font-medium">
                  Deterministic Policy Evaluation:
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {activePolicyReport?.derivedStatus || 'Pending Evaluation'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Evaluated across {activePolicyReport?.evaluations.length || 0} predefined governance policy rules. No arbitrary scoring.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 max-h-48 overflow-y-auto pr-1">
                {activePolicyReport?.evaluations.slice(0, 5).map((ev) => (
                  <div key={ev.policyId} className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 truncate max-w-[200px]" title={ev.policyName}>
                      {ev.policyId}: {ev.policyName}
                    </span>
                    <span
                      className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                        ev.result === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.result === 'REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ev.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-900 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <span>
              Auditors review verifiable state transitions and rule proofs directly to confirm statutory compliance.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 5 & 6: Violations & Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Violations Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>5. Policy Violations Log</span>
              </h3>
              <p className="text-xs text-slate-500">
                Statutory and procedural rule infractions flagged during auditing.
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold">
              {violations.length} Logged
            </span>
          </div>

          <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
            {violations.map((vio) => (
              <div key={vio.id} className="p-4 hover:bg-slate-50 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{vio.id}</span>
                    <span className="font-mono text-blue-700 font-semibold">{vio.awsId}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        vio.severity === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : vio.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {vio.severity}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-700">{vio.status}</span>
                </div>
                <div className="font-semibold text-slate-800">{vio.violationType}</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {vio.description}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Detected: {vio.detectedDate}</span>
                  <span>Trigger: {vio.triggeredBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Incidents Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>6. Anomalous Incidents Log</span>
              </h3>
              <p className="text-xs text-slate-500">
                Operational anomalies, override drops, and telemetry exceptions.
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold">
              {incidents.length} Logged
            </span>
          </div>

          <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-4 hover:bg-slate-50 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{inc.id}</span>
                    <span className="font-mono text-blue-700 font-semibold">{inc.awsId}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inc.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : inc.severity === 'Major'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-700">{inc.status}</span>
                </div>
                <div className="font-semibold text-slate-800">{inc.title}</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {inc.summary}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Reported: {inc.reportDate}</span>
                  <span>Reported By: {inc.reportedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 7: Lifecycle Transaction History Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              <span>7. Lifecycle Transaction Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete chronological ledger of state modifications and verification sign-offs across consortium participants.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded border border-slate-200 font-mono">
            {transactions.length} Events Logged
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
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
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

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Application-level lifecycle audit records stored in local application state.</span>
          <span className="font-mono text-slate-400">READ-ONLY AUDIT CONSOLE</span>
        </div>
      </div>
    </div>
  );
};
