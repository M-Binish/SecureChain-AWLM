import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import {
  AwsRecord,
  UserRole,
  CertificationStatus,
  OverallLifecycleStatus,
} from '../types';
import { DataService } from '../services/dataService';
import { PolicyEngine } from '../services/policyEngine';
import { canPerformLifecycleOperation } from '../utils/permissions';
import {
  Plus,
  Filter,
  Info,
  Layers,
  Activity,
  AlertTriangle,
  Trash2,
  X,
  FileCheck2,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface RegistryPageProps {
  records: AwsRecord[];
  userRole: UserRole;
  onSelectAws: (record: AwsRecord) => void;
  onRecordUpdated?: (record: AwsRecord) => void;
}

export const RegistryPage: React.FC<RegistryPageProps> = ({
  records,
  userRole,
  onSelectAws,
  onRecordUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('All');
  const [manufacturerFilter, setManufacturerFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');
  const [deploymentFilter, setDeploymentFilter] = useState('All');
  const [complianceFilter, setComplianceFilter] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // New simulated registration form state
  const [newAwsId, setNewAwsId] = useState(`AWS-00${records.length + 1}`);
  const [newClassification, setNewClassification] = useState('Simulated Autonomous System - Unit');
  const [newManufacturer, setNewManufacturer] = useState('Manufacturer');
  const [newMfgDate, setNewMfgDate] = useState(new Date().toISOString().substring(0, 10));
  const [newCertStatus, setNewCertStatus] = useState<CertificationStatus>('Certified');
  const [newCertRef, setNewCertRef] = useState(`CERT-2026-00${records.length + 1}`);
  const [newNotes, setNewNotes] = useState('Enrolled in digital lifecycle registry with baseline hardware verification.');

  // Extract unique options for dropdowns
  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.manufacturer && set.add(r.manufacturer));
    return Array.from(set);
  }, [records]);

  const owners = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.currentOwner && set.add(r.currentOwner));
    return Array.from(set);
  }, [records]);

  // Pre-calculate compliance map
  const complianceMap = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => {
      const evaluation = PolicyEngine.evaluateAwsRecord(r);
      map.set(r.id, evaluation.overallCompliance);
    });
    return map;
  }, [records]);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        r.id.toLowerCase().includes(q) ||
        r.systemName.toLowerCase().includes(q) ||
        r.manufacturer.toLowerCase().includes(q) ||
        r.currentOwner.toLowerCase().includes(q) ||
        (r.systemType && r.systemType.toLowerCase().includes(q));

      const matchesLifecycle =
        lifecycleFilter === 'All' || r.lifecycleStatus === lifecycleFilter;

      const matchesManufacturer =
        manufacturerFilter === 'All' || r.manufacturer === manufacturerFilter;

      const matchesOwner =
        ownerFilter === 'All' || r.currentOwner === ownerFilter;

      const matchesCert =
        certFilter === 'All' || r.certificationStatus === certFilter;

      const matchesDeployment =
        deploymentFilter === 'All' ||
        r.deploymentAuthorizationStatus === deploymentFilter;

      const recordCompliance = r.complianceStatus || complianceMap.get(r.id) || 'Compliant';
      const matchesCompliance =
        complianceFilter === 'All' || recordCompliance === complianceFilter;

      return (
        matchesSearch &&
        matchesLifecycle &&
        matchesManufacturer &&
        matchesOwner &&
        matchesCert &&
        matchesDeployment &&
        matchesCompliance
      );
    });
  }, [
    records,
    searchQuery,
    lifecycleFilter,
    manufacturerFilter,
    ownerFilter,
    certFilter,
    deploymentFilter,
    complianceFilter,
    complianceMap,
  ]);

  // Summary Metrics calculations
  const totalCount = records.length;
  const activeCount = records.filter(
    (r) => r.lifecycleStatus === 'Active Service' || r.lifecycleStatus === 'Deployed'
  ).length;
  const underAuditCount = records.filter(
    (r) =>
      r.lifecycleStatus === 'Under Audit' ||
      r.lifecycleStatus === 'Incident Flagged' ||
      r.auditStatus === 'Requires Review' ||
      r.incidentStatus === 'Flagged'
  ).length;
  const pendingDisposalCount = records.filter(
    (r) =>
      r.lifecycleStatus === 'Pending Disposal' ||
      r.lifecycleStatus === 'Decommissioned' ||
      r.disposalStatus === 'Pending Disposal' ||
      r.disposalStatus === 'Decommissioned'
  ).length;

  const canRegister = canPerformLifecycleOperation(userRole, 'manufacturing_certification');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    const res = DataService.registerAwsRecord(
      {
        id: newAwsId,
        systemClassification: newClassification,
        manufacturer: newManufacturer,
        manufactureDate: newMfgDate,
        certificationStatus: newCertStatus,
        certificationReference: newCertRef,
        notes: newNotes,
      },
      userRole,
      `${userRole} Officer`
    );

    if (res.success && res.record) {
      if (onRecordUpdated) {
        onRecordUpdated(res.record);
      }
      setRegisterSuccess(`Asset ${res.record.id} successfully registered in registry.`);
      setIsRegisterModalOpen(false);
      setNewAwsId(`AWS-00${records.length + 2}`);
    } else {
      setRegisterError(res.error || 'Failed to register AWS record.');
    }
  };

  const columns: Column<AwsRecord>[] = [
    {
      key: 'id',
      header: 'AWS ID',
      className: 'font-mono font-bold text-slate-900',
      render: (r) => <span>{r.id}</span>,
    },
    {
      key: 'systemName',
      header: 'System / Classification',
      className: 'min-w-[180px]',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-900">{r.systemName}</div>
          <div className="text-[11px] text-slate-500">{r.systemType}</div>
        </div>
      ),
    },
    {
      key: 'manufacturer',
      header: 'Manufacturer',
      render: (r) => <span className="text-slate-700 text-xs">{r.manufacturer}</span>,
    },
    {
      key: 'currentOwner',
      header: 'Current Owner',
      render: (r) => <span className="text-slate-700 text-xs font-medium">{r.currentOwner}</span>,
    },
    {
      key: 'lifecycleStatus',
      header: 'Lifecycle Status',
      render: (r) => <StatusBadge status={r.lifecycleStatus} size="sm" />,
    },
    {
      key: 'deploymentAuthorizationStatus',
      header: 'Deployment Status',
      render: (r) => <StatusBadge status={r.deploymentAuthorizationStatus} size="sm" />,
    },
    {
      key: 'certificationStatus',
      header: 'Certification',
      render: (r) => <StatusBadge status={r.certificationStatus} size="sm" />,
    },
    {
      key: 'auditStatus',
      header: 'Audit Status',
      render: (r) => <StatusBadge status={r.auditStatus} size="sm" />,
    },
    {
      key: 'incidentStatus',
      header: 'Incidents',
      render: (r) => <StatusBadge status={r.incidentStatus} size="sm" />,
    },
    {
      key: 'complianceStatus',
      header: 'Policy Compliance',
      render: (r) => {
        const compliance = r.complianceStatus || complianceMap.get(r.id) || 'Compliant';
        const hasOpenViolations = Boolean(r.violationCount && r.violationCount > 0);
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                compliance === 'Compliant'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : compliance === 'Requires Review'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : compliance === 'Non-Compliant'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {compliance}
            </span>
            {hasOpenViolations && (
              <span
                className="text-[10px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold"
                title={`${r.violationCount} open violation(s)`}
              >
                !
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'lastUpdated',
      header: 'Last Updated',
      className: 'text-slate-500 font-mono text-xs',
      render: (r) => <span>{r.lastUpdated}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectAws(r);
          }}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Autonomous Weapon Systems (AWS) Digital Registry"
        subtitle="Simulated academic repository managing traceable digital identity records and lifecycle transition proofs."
        badge="DIGITAL REGISTRY"
        actions={
          canRegister ? (
            <button
              type="button"
              onClick={() => {
                setRegisterError(null);
                setIsRegisterModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Register New AWS</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
              Registration permitted to: Manufacturer, Administrator
            </span>
          )
        }
      />

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Registered Units</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Persisted in local registry layer</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active / Deployed</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{activeCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Under operational service</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Audit / Review Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{underAuditCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Investigation in progress</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Disposal / Retired</span>
            <Trash2 className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{pendingDisposalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Terminal lifecycle pipeline</div>
        </div>
      </div>

      {registerSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{registerSuccess}</div>
        </div>
      )}

      {/* Academic Prototype Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Software-Only Academic Model:</strong> Digital lifecycle records tracking simulated Autonomous Weapon Systems. Click <strong>View Details</strong> on any unit to inspect its multi-stage lifecycle history, including recurrent usage cycles, regulatory audits, conditional incidents, and terminal decommissioning.
        </div>
      </div>

      {/* Main Table with Comprehensive Filters */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        searchPlaceholder="Search by AWS ID, system classification, manufacturer, or owner..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => onSelectAws(r)}
        filterControls={
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </div>

            {/* Lifecycle Filter */}
            <select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-medium"
            >
              <option value="All">All Lifecycles</option>
              <option value="Manufacturing & Certification">Manufacturing & Certification</option>
              <option value="Certified">Certified</option>
              <option value="In Transit">In Transit</option>
              <option value="Deployed">Deployed</option>
              <option value="Active Service">Active Service</option>
              <option value="Under Audit">Under Audit</option>
              <option value="Incident Flagged">Incident Flagged</option>
              <option value="Pending Disposal">Pending Disposal</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>

            {/* Certification Filter */}
            <select
              value={certFilter}
              onChange={(e) => setCertFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="All">All Certifications</option>
              <option value="Certified">Certified</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Revoked">Revoked</option>
            </select>

            {/* Deployment Filter */}
            <select
              value={deploymentFilter}
              onChange={(e) => setDeploymentFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="All">All Deployments</option>
              <option value="Authorized">Authorized</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
              <option value="Revoked">Revoked</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>

            {/* Compliance Filter */}
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-medium"
            >
              <option value="All">All Compliance</option>
              <option value="Compliant">Compliant</option>
              <option value="Requires Review">Requires Review</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Pending Baseline">Pending Baseline</option>
            </select>

            {/* Manufacturer Filter */}
            {manufacturers.length > 0 && (
              <select
                value={manufacturerFilter}
                onChange={(e) => setManufacturerFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="All">All Manufacturers</option>
                {manufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {/* Current Owner Filter */}
            {owners.length > 0 && (
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="All">All Owners</option>
                {owners.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          </div>
        }
      />

      {/* Register New AWS Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl border border-slate-300 shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Register New Autonomous Weapon System</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 leading-relaxed text-[11px]">
                <strong>Consortium Enrollment Policy:</strong> Enrolls a simulated autonomous weapon asset into the durable application data layer with cryptographic root-of-trust identity and initial certification status.
              </div>

              {registerError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded text-rose-900 flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="font-medium">{registerError}</div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    AWS ID (e.g. AWS-007)
                  </label>
                  <input
                    type="text"
                    value={newAwsId}
                    onChange={(e) => setNewAwsId(e.target.value)}
                    placeholder="AWS-007"
                    className="w-full p-2 border border-slate-300 rounded font-mono font-medium focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    value={newMfgDate}
                    onChange={(e) => setNewMfgDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  System Classification
                </label>
                <input
                  type="text"
                  value={newClassification}
                  onChange={(e) => setNewClassification(e.target.value)}
                  placeholder="e.g. Simulated Autonomous System - Type G"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-slate-50 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Certification Status
                  </label>
                  <select
                    value={newCertStatus}
                    onChange={(e) => setNewCertStatus(e.target.value as CertificationStatus)}
                    className="w-full p-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Certified">Certified</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Certification Reference
                </label>
                <input
                  type="text"
                  value={newCertRef}
                  onChange={(e) => setNewCertRef(e.target.value)}
                  placeholder="CERT-2026-007"
                  className="w-full p-2 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
