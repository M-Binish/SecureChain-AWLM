import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  AwsRecord,
  UserRole,
  CertificationStatus,
  OverallLifecycleStatus,
} from '../types';
import { DataService } from '../services/dataService';
import { canPerformLifecycleOperation, LifecycleOperation } from '../utils/permissions';
import {
  FileCheck2,
  ArrowRightLeft,
  ShieldCheck,
  Activity,
  ClipboardCheck,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  Clock,
  User,
  Hash,
  Info,
  Building2,
  Lock,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';

interface LifecycleOperationsPageProps {
  viewId: string;
  userRole: UserRole;
  awsRecords: AwsRecord[];
  onSelectAws: (record: AwsRecord) => void;
  onRecordUpdated: (updatedRecord: AwsRecord) => void;
  onNavigate: (viewId: string) => void;
}

interface StageMetadata {
  operationKey: LifecycleOperation;
  title: string;
  subtitle: string;
  stageName: string;
  icon: React.ComponentType<{ className?: string }>;
  authorizedRoles: UserRole[];
  stageType: 'Initial' | 'Recurrent' | 'Conditional' | 'Terminal' | 'Standard';
  color: string;
}

const STAGE_CONFIGS: Record<string, StageMetadata> = {
  'manufacturing-certification': {
    operationKey: 'manufacturing_certification',
    title: 'Manufacturing & Certification Stage',
    subtitle: 'Register genesis simulated autonomous weapon identities, root-of-trust provisioning, and initial safety certification baseline.',
    stageName: 'Manufacturing & Certification',
    icon: FileCheck2,
    authorizedRoles: ['Manufacturer', 'Administrator'],
    stageType: 'Initial',
    color: 'blue',
  },
  'ownership-transfer': {
    operationKey: 'ownership_transfer',
    title: 'Ownership Transfer & Chain of Custody',
    subtitle: 'Document physical transfer handoffs and custody transitions across verified supply chain depots.',
    stageName: 'Ownership Transfer',
    icon: ArrowRightLeft,
    authorizedRoles: ['Supply Chain Operator', 'Administrator'],
    stageType: 'Standard',
    color: 'emerald',
  },
  'deployment-authorization': {
    operationKey: 'deployment_authorization',
    title: 'Deployment Authorization Governance',
    subtitle: 'Sovereign statutory mandate clearance and operational perimeter boundary limits.',
    stageName: 'Deployment Authorization',
    icon: ShieldCheck,
    authorizedRoles: ['Government', 'Military / Defense', 'Administrator'],
    stageType: 'Standard',
    color: 'indigo',
  },
  'usage-tracking': {
    operationKey: 'usage_tracking',
    title: 'Operational Usage Tracking (Recurrent)',
    subtitle: 'Simulated operational rotation records and routine service logs. Strictly lifecycle telemetry accounting.',
    stageName: 'Usage Tracking',
    icon: Activity,
    authorizedRoles: ['Military / Defense', 'Administrator'],
    stageType: 'Recurrent',
    color: 'cyan',
  },
  'audit-compliance': {
    operationKey: 'audit_compliance',
    title: 'Audit & Compliance Oversight (Recurrent)',
    subtitle: 'Periodic independent regulatory inspections, algorithmic safety checks, and custody audits.',
    stageName: 'Audit & Compliance',
    icon: ClipboardCheck,
    authorizedRoles: ['Auditor / Inspector', 'Regulator', 'Administrator'],
    stageType: 'Recurrent',
    color: 'violet',
  },
  'incident-reporting': {
    operationKey: 'incident_reporting',
    title: 'Incident Reporting & Anomalies (Conditional)',
    subtitle: 'Exception reporting for telemetry latency breaches, sensor drift, and safety threshold alerts.',
    stageName: 'Incident Reporting',
    icon: AlertTriangle,
    authorizedRoles: ['Military / Defense', 'Auditor / Inspector', 'Regulator', 'Administrator'],
    stageType: 'Conditional',
    color: 'amber',
  },
  'disposal': {
    operationKey: 'disposal',
    title: 'Disposal (Terminal)',
    subtitle: 'Final lifecycle stage: permanent demilitarization, cryptographic key zeroization, and asset retirement.',
    stageName: 'Disposal',
    icon: Trash2,
    authorizedRoles: ['Military / Defense', 'Regulator', 'Administrator'],
    stageType: 'Terminal',
    color: 'rose',
  },
};

export const LifecycleOperationsPage: React.FC<LifecycleOperationsPageProps> = ({
  viewId,
  userRole,
  awsRecords,
  onSelectAws,
  onRecordUpdated,
  onNavigate,
}) => {
  const config = STAGE_CONFIGS[viewId] || STAGE_CONFIGS['manufacturing-certification'];
  const StageIcon = config.icon;
  const isAuthorized = canPerformLifecycleOperation(userRole, config.operationKey);

  // General state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // 1. Manufacturing Form State
  const [mfgId, setMfgId] = useState<string>(`AWS-00${awsRecords.length + 1}`);
  const [mfgClass, setMfgClass] = useState<string>('Simulated Autonomous System - Unit');
  const [mfgEntity, setMfgEntity] = useState<string>('Manufacturer');
  const [mfgDate, setMfgDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [mfgCertStatus, setMfgCertStatus] = useState<CertificationStatus>('Certified');
  const [mfgCertRef, setMfgCertRef] = useState<string>(`CERT-2026-00${awsRecords.length + 1}`);
  const [mfgNotes, setMfgNotes] = useState<string>('Initial manufacturing bench testing and cryptographic enrollment completed.');

  // 2. Ownership Transfer Form State
  const [trfAwsId, setTrfAwsId] = useState<string>(awsRecords[0]?.id || '');
  const [trfNewOwner, setTrfNewOwner] = useState<string>('Military / Defense');
  const [trfDate, setTrfDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [trfReason, setTrfReason] = useState<string>('Custody handoff to operational defense depot');
  const [trfApprovalStatus, setTrfApprovalStatus] = useState<'Approved' | 'In Transit' | 'Completed'>('Completed');
  const [trfNotes, setTrfNotes] = useState<string>('Tamper seals inspected; chain of custody transfer logged.');

  // 3. Deployment Authorization Form State
  const [authAwsId, setAuthAwsId] = useState<string>(awsRecords[0]?.id || '');
  const [authStatus, setAuthStatus] = useState<'Authorized' | 'Pending' | 'Expired' | 'Revoked'>('Authorized');
  const [authDate, setAuthDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [authBy, setAuthBy] = useState<string>('Government Authorization Authority');
  const [authValidUntil, setAuthValidUntil] = useState<string>('2027-12-31');
  const [authNotes, setAuthNotes] = useState<string>('Statutory deployment authorization approved within restricted defense boundary.');

  // 4. Usage Tracking Form State
  const [useAwsId, setUseAwsId] = useState<string>(awsRecords[0]?.id || '');
  const [useStatus, setUseStatus] = useState<'Active Service' | 'In Reserve' | 'Standby' | 'Routine Maintenance'>('Active Service');
  const [useDate, setUseDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [useRecordedBy, setUseRecordedBy] = useState<string>('Defense Liaison');
  const [useNotes, setUseNotes] = useState<string>('Routine simulated operational rotation completed. Telemetry integrity normal.');

  // 5. Audit & Compliance Form State
  const [audAwsId, setAudAwsId] = useState<string>(awsRecords[0]?.id || '');
  const [audStatus, setAudStatus] = useState<'Compliant' | 'Non-Compliant' | 'Requires Review' | 'Pending'>('Compliant');
  const [audType, setAudType] = useState<'Periodic Safety Inspection' | 'Algorithmic Boundary Review' | 'Post-Incident Review' | 'Chain-of-Custody Audit'>('Periodic Safety Inspection');
  const [audDate, setAudDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [audBy, setAudBy] = useState<string>('Auditor / Inspector');
  const [audFindings, setAudFindings] = useState<string>('All boundary safety parameters and operational records meet consortium standard specifications.');
  const [audNotes, setAudNotes] = useState<string>('');

  // 6. Incident Reporting Form State
  const [incAwsId, setIncAwsId] = useState<string>(awsRecords[0]?.id || '');
  const [incType, setIncType] = useState<string>('Telemetry Heartbeat Timeout');
  const [incSeverity, setIncSeverity] = useState<'Critical' | 'Major' | 'Minor'>('Major');
  const [incDate, setIncDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [incReportedBy, setIncReportedBy] = useState<string>('Defense Liaison');
  const [incDesc, setIncDesc] = useState<string>('Telemetry handshake delay exceeded nominal threshold during routine simulation check.');
  const [incStatus, setIncStatus] = useState<'Pending Audit' | 'Under Review' | 'Closed'>('Under Review');
  const [incNotes, setIncNotes] = useState<string>('Auto-failsafe standby engaged. Awaiting inspection review.');

  // 7. Disposal Form State
  const [dispAwsId, setDispAwsId] = useState<string>(awsRecords[0]?.id || '');
  const [dispStatus, setDispStatus] = useState<'Pending Disposal' | 'Decommissioned'>('Decommissioned');
  const [dispDate, setDispDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [dispBy, setDispBy] = useState<string>('Decommissioning Authority');
  const [dispRef, setDispRef] = useState<string>(`DISP-2026-${Date.now().toString().slice(-4)}`);
  const [dispNotes, setDispNotes] = useState<string>('Demilitarization protocol executed. Cryptographic enclave zeroized and frame retired.');

  // Current selected AWS for each stage form to check terminal state
  const getSelectedRecordForStage = (): AwsRecord | null => {
    let targetId = '';
    switch (config.operationKey) {
      case 'ownership_transfer':
        targetId = trfAwsId;
        break;
      case 'deployment_authorization':
        targetId = authAwsId;
        break;
      case 'usage_tracking':
        targetId = useAwsId;
        break;
      case 'audit_compliance':
        targetId = audAwsId;
        break;
      case 'incident_reporting':
        targetId = incAwsId;
        break;
      case 'disposal':
        targetId = dispAwsId;
        break;
      default:
        return null;
    }
    return awsRecords.find((r) => r.id === targetId) || null;
  };

  const selectedRecord = getSelectedRecordForStage();
  const isSelectedRecordDisposed =
    selectedRecord?.lifecycleStatus === 'Decommissioned' ||
    selectedRecord?.disposalStatus === 'Decommissioned';

  // Extract all historical events matching this stage across all monitored AWS records
  const stageEvents = useMemo(() => {
    const events: { awsId: string; record: AwsRecord; event: AwsRecord['lifecycleHistory'][0] }[] = [];
    awsRecords.forEach((record) => {
      record.lifecycleHistory.forEach((event) => {
        const isMatch =
          event.stage.toLowerCase() === config.stageName.toLowerCase() ||
          (config.stageName === 'Usage Tracking' && event.stage.toLowerCase() === 'usage') ||
          (config.stageName === 'Manufacturing & Certification' &&
            (event.stage.toLowerCase() === 'manufacturing' || event.stage.toLowerCase() === 'certification'));
        if (isMatch) {
          events.push({ awsId: record.id, record, event });
        }
      });
    });
    // Sort descending by timestamp
    return events.sort((a, b) => b.event.timestamp.localeCompare(a.event.timestamp));
  }, [awsRecords, config.stageName]);

  const filteredEvents = stageEvents.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.awsId.toLowerCase().includes(q) ||
      item.event.title.toLowerCase().includes(q) ||
      item.event.actor.toLowerCase().includes(q) ||
      item.event.recordIdentifier.toLowerCase().includes(q) ||
      item.event.details.toLowerCase().includes(q)
    );
  });

  // Handle Form Submissions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    let res: { success: boolean; record?: AwsRecord; error?: string };

    switch (config.operationKey) {
      case 'manufacturing_certification':
        res = DataService.registerAwsRecord(
          {
            id: mfgId,
            systemClassification: mfgClass,
            manufacturer: mfgEntity,
            manufactureDate: mfgDate,
            certificationStatus: mfgCertStatus,
            certificationReference: mfgCertRef,
            notes: mfgNotes,
          },
          userRole,
          `${userRole} Officer`
        );
        if (res.success && res.record) {
          onRecordUpdated(res.record);
          setFeedback({
            type: 'success',
            message: `AWS record ${res.record.id} successfully registered and persisted in the application data layer.`,
          });
          // prepare next ID
          setMfgId(`AWS-00${awsRecords.length + 2}`);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to register AWS.' });
        }
        break;

      case 'ownership_transfer':
        res = DataService.transferOwnership(
          trfAwsId,
          {
            newOwner: trfNewOwner,
            transferDate: trfDate,
            reason: trfReason,
            approvalStatus: trfApprovalStatus,
            notes: trfNotes,
          },
          userRole,
          `${userRole} Officer`
        );
        if (res.success && res.record) {
          onRecordUpdated(res.record);
          setFeedback({
            type: 'success',
            message: `Ownership transfer for ${trfAwsId} recorded. New owner: ${trfNewOwner}.`,
          });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Transfer failed.' });
        }
        break;

      case 'deployment_authorization':
        res = DataService.authorizeDeployment(
          authAwsId,
          {
            authorizationStatus: authStatus,
            authorizationDate: authDate,
            authorizedBy: authBy,
            validUntil: authValidUntil,
            notes: authNotes,
          },
          userRole,
          authBy
        );
        if (res.success && res.record) {
          onRecordUpdated(res.record);
          setFeedback({
            type: 'success',
            message: `Deployment authorization for ${authAwsId} updated to '${authStatus}'.`,
          });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Deployment authorization update failed.' });
        }
        break;

      case 'usage_tracking':
        res = DataService.recordUsageEvent(
          useAwsId,
          {
            usageDate: useDate,
            usageStatus: useStatus,
            recordedBy: useRecordedBy,
            notes: useNotes,
          },
          userRole,
          useRecordedBy
        );
        if (res.success && res.record) {
          onRecordUpdated(res.record);
          setFeedback({
            type: 'success',
            message: `Operational usage cycle recorded for ${useAwsId}. Status: ${useStatus}.`,
          });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to record usage event.' });
        }
        break;

      case 'audit_compliance':
        res = DataService.recordAuditEvent(
          audAwsId,
          {
            auditDate: audDate,
            auditStatus: audStatus,
            auditedBy: audBy,
            auditType: audType,
            findings: audFindings,
            notes: audNotes,
          },
          userRole,
          audBy
        );
        if (res.success && res.record) {
          onRecordUpdated(res.record);
          setFeedback({
            type: 'success',
            message: `Audit & compliance review recorded for ${audAwsId}. Status: ${audStatus}.`,
          });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to record audit event.' });
        }
        break;

      case 'incident_reporting':
        res = DataService.recordIncident(
          incAwsId,
          {
            incidentDate: incDate,
            incidentType: incType,
            severity: incSeverity,
            reportedBy: incReportedBy,
            description: incDesc,
            status: incStatus,
            resolutionNotes: incNotes,
          },
          userRole,
          incReportedBy
        );
        if (res.success && res.record) {
          onRecordUpdated(res.record);
          setFeedback({
            type: 'success',
            message: `Incident exception filed for ${incAwsId}. Severity: ${incSeverity}. Unit status updated.`,
          });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to file incident report.' });
        }
        break;

      case 'disposal':
        res = DataService.recordDisposal(
          dispAwsId,
          {
            disposalDate: dispDate,
            disposalStatus: dispStatus,
            authorizedBy: dispBy,
            disposalReference: dispRef,
            notes: dispNotes,
          },
          userRole,
          dispBy
        );
        if (res.success && res.record) {
          onRecordUpdated(res.record);
          setFeedback({
            type: 'success',
            message: `Disposal protocol recorded for ${dispAwsId}. Asset status set to '${dispStatus}'. Terminal state locked.`,
          });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Disposal protocol execution failed.' });
        }
        break;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        badge={`STAGE: ${config.stageName.toUpperCase()}`}
      />

      {/* Stage Governance Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
            <StageIcon className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{config.stageName}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {config.stageType} Stage
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Consortium lifecycle governance rules require role authorization and cryptographically indexed recordkeeping. Disposed assets cannot undergo further lifecycle state transitions.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Permission Status */}
          <div className="text-left sm:text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Your Permission ({userRole})
            </div>
            <div className="text-xs font-semibold mt-0.5 flex items-center gap-1.5 sm:justify-end">
              {isAuthorized ? (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Authorized to Record
                </span>
              ) : (
                <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Read-Only Oversight
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="font-medium leading-relaxed">{feedback.message}</div>
        </div>
      )}

      {/* Main Two-Column Layout: Operation Form (if authorized) & Historical Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Operation Form or Read-Only Banner */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Record Lifecycle Action
                </h4>
                <p className="text-xs text-slate-500">
                  {isAuthorized
                    ? `Execute verified ${config.stageName} transition for simulated AWS records.`
                    : `Only authorized roles (${config.authorizedRoles.join(', ')}) can submit this action.`}
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                AUTH: {config.authorizedRoles.join(' / ')}
              </span>
            </div>

            {/* Read-Only Notice if unauthorized */}
            {!isAuthorized ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Role-Based Access Control Notice</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  You are currently logged in with the <strong>{userRole}</strong> role. Under the consortium governance framework, this role has read and audit oversight for this stage, but cannot record or modify state transitions.
                </p>
                <div className="text-[11px] text-slate-500">
                  To test executing this operation, switch roles using the top-right switcher to one of:{' '}
                  <strong>{config.authorizedRoles.join(', ')}</strong>.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* 1. Manufacturing Form */}
                {config.operationKey === 'manufacturing_certification' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          AWS ID (Simulated Identifier)
                        </label>
                        <input
                          type="text"
                          value={mfgId}
                          onChange={(e) => setMfgId(e.target.value)}
                          placeholder="e.g. AWS-007"
                          className="w-full p-2 border border-slate-300 rounded font-mono font-medium focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Manufacturing Date
                        </label>
                        <input
                          type="date"
                          value={mfgDate}
                          onChange={(e) => setMfgDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        System Classification
                      </label>
                      <input
                        type="text"
                        value={mfgClass}
                        onChange={(e) => setMfgClass(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Manufacturer Entity
                        </label>
                        <input
                          type="text"
                          value={mfgEntity}
                          onChange={(e) => setMfgEntity(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Certification Status
                        </label>
                        <select
                          value={mfgCertStatus}
                          onChange={(e) => setMfgCertStatus(e.target.value as CertificationStatus)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 font-medium"
                        >
                          <option value="Certified">Certified</option>
                          <option value="Pending Review">Pending Review</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Certification Reference
                      </label>
                      <input
                        type="text"
                        value={mfgCertRef}
                        onChange={(e) => setMfgCertRef(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Engineering Notes
                      </label>
                      <textarea
                        rows={2}
                        value={mfgNotes}
                        onChange={(e) => setMfgNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}

                {/* 2. Ownership Transfer Form */}
                {config.operationKey === 'ownership_transfer' && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Select AWS Asset
                      </label>
                      <select
                        value={trfAwsId}
                        onChange={(e) => setTrfAwsId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono font-medium focus:ring-1 focus:ring-slate-900"
                        required
                      >
                        {awsRecords.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.id} — Current Owner: {r.currentOwner} ({r.lifecycleStatus})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Previous / Current Owner
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={selectedRecord?.currentOwner || '—'}
                          className="w-full p-2 border border-slate-200 rounded bg-slate-100 text-slate-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          New Owner / Custodian
                        </label>
                        <select
                          value={trfNewOwner}
                          onChange={(e) => setTrfNewOwner(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Military / Defense">Military / Defense</option>
                          <option value="Supply Chain Operator">Supply Chain Operator</option>
                          <option value="Manufacturer">Manufacturer</option>
                          <option value="Government">Government</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Transfer Date
                        </label>
                        <input
                          type="date"
                          value={trfDate}
                          onChange={(e) => setTrfDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Handoff Status
                        </label>
                        <select
                          value={trfApprovalStatus}
                          onChange={(e) => setTrfApprovalStatus(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Completed">Completed (Signed Over)</option>
                          <option value="In Transit">In Transit (Logistics Hub)</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Reason for Transfer
                      </label>
                      <input
                        type="text"
                        value={trfReason}
                        onChange={(e) => setTrfReason(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Custody Notes
                      </label>
                      <textarea
                        rows={2}
                        value={trfNotes}
                        onChange={(e) => setTrfNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}

                {/* 3. Deployment Authorization Form */}
                {config.operationKey === 'deployment_authorization' && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Select AWS Asset
                      </label>
                      <select
                        value={authAwsId}
                        onChange={(e) => setAuthAwsId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono font-medium focus:ring-1 focus:ring-slate-900"
                        required
                      >
                        {awsRecords.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.id} — Deployment: {r.deploymentAuthorizationStatus} ({r.lifecycleStatus})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Authorization Status
                        </label>
                        <select
                          value={authStatus}
                          onChange={(e) => setAuthStatus(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Authorized">Authorized</option>
                          <option value="Pending">Pending Review</option>
                          <option value="Expired">Expired</option>
                          <option value="Revoked">Revoked</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Authorization Date
                        </label>
                        <input
                          type="date"
                          value={authDate}
                          onChange={(e) => setAuthDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Authorized By
                        </label>
                        <input
                          type="text"
                          value={authBy}
                          onChange={(e) => setAuthBy(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Valid Until
                        </label>
                        <input
                          type="date"
                          value={authValidUntil}
                          onChange={(e) => setAuthValidUntil(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Statutory Mandate & Perimeter Bounds
                      </label>
                      <textarea
                        rows={2}
                        value={authNotes}
                        onChange={(e) => setAuthNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}

                {/* 4. Usage Tracking Form */}
                {config.operationKey === 'usage_tracking' && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Select AWS Asset
                      </label>
                      <select
                        value={useAwsId}
                        onChange={(e) => setUseAwsId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono font-medium focus:ring-1 focus:ring-slate-900"
                        required
                      >
                        {awsRecords.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.id} — Current Usage: {r.usageStatus}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Operational Service Status
                        </label>
                        <select
                          value={useStatus}
                          onChange={(e) => setUseStatus(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Active Service">Active Service</option>
                          <option value="In Reserve">In Reserve</option>
                          <option value="Standby">Standby</option>
                          <option value="Routine Maintenance">Routine Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Logged Date
                        </label>
                        <input
                          type="date"
                          value={useDate}
                          onChange={(e) => setUseDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Recorded By
                      </label>
                      <input
                        type="text"
                        value={useRecordedBy}
                        onChange={(e) => setUseRecordedBy(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Simulated Service Routine Notes
                      </label>
                      <textarea
                        rows={2}
                        value={useNotes}
                        onChange={(e) => setUseNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}

                {/* 5. Audit & Compliance Form */}
                {config.operationKey === 'audit_compliance' && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Select AWS Asset
                      </label>
                      <select
                        value={audAwsId}
                        onChange={(e) => setAudAwsId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono font-medium focus:ring-1 focus:ring-slate-900"
                        required
                      >
                        {awsRecords.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.id} — Audit Status: {r.auditStatus}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Inspection Type
                        </label>
                        <select
                          value={audType}
                          onChange={(e) => setAudType(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Periodic Safety Inspection">Periodic Safety Inspection</option>
                          <option value="Algorithmic Boundary Review">Algorithmic Boundary Review</option>
                          <option value="Chain-of-Custody Audit">Chain-of-Custody Audit</option>
                          <option value="Post-Incident Review">Post-Incident Review</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Audit Finding Status
                        </label>
                        <select
                          value={audStatus}
                          onChange={(e) => setAudStatus(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Compliant">Compliant</option>
                          <option value="Non-Compliant">Non-Compliant</option>
                          <option value="Requires Review">Requires Review</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Audited By
                        </label>
                        <input
                          type="text"
                          value={audBy}
                          onChange={(e) => setAudBy(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Audit Date
                        </label>
                        <input
                          type="date"
                          value={audDate}
                          onChange={(e) => setAudDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Findings Summary
                      </label>
                      <textarea
                        rows={2}
                        value={audFindings}
                        onChange={(e) => setAudFindings(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                        required
                      />
                    </div>
                  </>
                )}

                {/* 6. Incident Reporting Form */}
                {config.operationKey === 'incident_reporting' && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Select AWS Asset
                      </label>
                      <select
                        value={incAwsId}
                        onChange={(e) => setIncAwsId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono font-medium focus:ring-1 focus:ring-slate-900"
                        required
                      >
                        {awsRecords.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.id} — Current Incident: {r.incidentStatus} ({r.lifecycleStatus})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Incident Classification
                        </label>
                        <select
                          value={incType}
                          onChange={(e) => setIncType(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Telemetry Heartbeat Timeout">Telemetry Heartbeat Timeout</option>
                          <option value="Remote Override Latency Exceeded">Remote Override Latency Exceeded</option>
                          <option value="Sensor Calibration Variance">Sensor Calibration Variance</option>
                          <option value="Geofence Boundary Alert">Geofence Boundary Alert</option>
                          <option value="Hardware Health Degradation">Hardware Health Degradation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Severity Level
                        </label>
                        <select
                          value={incSeverity}
                          onChange={(e) => setIncSeverity(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Minor">Minor (Informational)</option>
                          <option value="Major">Major (Review Mandated)</option>
                          <option value="Critical">Critical (Immediate Standby)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Reported By
                        </label>
                        <input
                          type="text"
                          value={incReportedBy}
                          onChange={(e) => setIncReportedBy(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Incident Date
                        </label>
                        <input
                          type="date"
                          value={incDate}
                          onChange={(e) => setIncDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Incident Description (Simulated Governance Telemetry)
                      </label>
                      <textarea
                        rows={2}
                        value={incDesc}
                        onChange={(e) => setIncDesc(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Resolution & Failsafe Actions Taken
                      </label>
                      <input
                        type="text"
                        value={incNotes}
                        onChange={(e) => setIncNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}

                {/* 7. Disposal Form */}
                {config.operationKey === 'disposal' && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Select AWS Asset to Decommission
                      </label>
                      <select
                        value={dispAwsId}
                        onChange={(e) => setDispAwsId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded font-mono font-medium focus:ring-1 focus:ring-slate-900"
                        required
                      >
                        {awsRecords.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.id} — Status: {r.lifecycleStatus} ({r.disposalStatus})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Disposal Protocol Status
                        </label>
                        <select
                          value={dispStatus}
                          onChange={(e) => setDispStatus(e.target.value as any)}
                          className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="Decommissioned">Decommissioned (Permanent Zeroization)</option>
                          <option value="Pending Disposal">Pending Disposal (Scheduled)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Disposal Date
                        </label>
                        <input
                          type="date"
                          value={dispDate}
                          onChange={(e) => setDispDate(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Authorized By
                        </label>
                        <input
                          type="text"
                          value={dispBy}
                          onChange={(e) => setDispBy(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Disposal Reference ID
                        </label>
                        <input
                          type="text"
                          value={dispRef}
                          onChange={(e) => setDispRef(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Neutralization & Zeroization Confirmation Notes
                      </label>
                      <textarea
                        rows={2}
                        value={dispNotes}
                        onChange={(e) => setDispNotes(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}

                {/* Terminal State Warning Banner if the selected record is already disposed */}
                {isSelectedRecordDisposed && config.operationKey !== 'disposal' && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Terminal Lifecycle State Lock</strong>
                      <p className="mt-0.5 text-[11px]">
                        Asset <strong>{selectedRecord?.id}</strong> is Decommissioned / Disposed.
                        Further lifecycle operations are permanently blocked according to AWLM governance rules.
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSelectedRecordDisposed && config.operationKey !== 'disposal'}
                    className={`w-full py-2.5 px-4 rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      isSelectedRecordDisposed && config.operationKey !== 'disposal'
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <StageIcon className="w-4 h-4 text-blue-400" />
                    <span>
                      {isSelectedRecordDisposed && config.operationKey !== 'disposal'
                        ? 'Operation Blocked (Asset Disposed)'
                        : `Submit Verified ${config.stageName} Record`}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Historical Events for This Stage */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Recorded {config.stageName} Events</span>
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {stageEvents.length} Total
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  Chronological digital audit trail for this lifecycle stage.
                </p>
              </div>

              {/* Filter */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter events..."
                  className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recorded events found for this lifecycle stage matching your filter.
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredEvents.map((item, idx) => {
                  const { awsId, record, event } = item;

                  return (
                    <div
                      key={event.id || idx}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectAws(record)}
                            className="font-mono font-bold text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {awsId}
                          </button>
                          {event.iteration && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                              Cycle #{event.iteration}
                            </span>
                          )}
                          {event.isConditional && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              Conditional
                            </span>
                          )}
                        </div>
                        <StatusBadge status={event.status} size="sm" />
                      </div>

                      <div className="text-xs font-semibold text-slate-900">
                        {event.title}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {event.details}
                      </p>

                      {event.notes && (
                        <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">
                          <strong className="text-slate-700">Notes:</strong> {event.notes}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{event.actor} ({event.actorRole})</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span>{event.recordIdentifier}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{event.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
