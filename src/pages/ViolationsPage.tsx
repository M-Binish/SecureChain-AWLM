import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ViolationRecord, UserRole, AwsRecord } from '../types';
import { DataService } from '../services/dataService';
import {
  AlertOctagon,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Filter,
  ArrowRight,
  Info,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';

interface ViolationsPageProps {
  violations: ViolationRecord[];
  awsRecords: AwsRecord[];
  userRole: UserRole;
  onSelectAws: (record: AwsRecord) => void;
  onViolationUpdated?: () => void;
  onNavigateToIncidents: () => void;
}

export const ViolationsPage: React.FC<ViolationsPageProps> = ({
  violations,
  awsRecords,
  userRole,
  onSelectAws,
  onViolationUpdated,
  onNavigateToIncidents,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Resolution modal state
  const [resolvingViolation, setResolvingViolation] = useState<ViolationRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredViolations = violations.filter((v) => {
    const matchesSeverity = filterSeverity === 'All' || v.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.id.toLowerCase().includes(q) ||
      v.awsId.toLowerCase().includes(q) ||
      v.policyId.toLowerCase().includes(q) ||
      v.violationType.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q);
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const openCount = violations.filter((v) => v.status === 'Open').length;
  const reviewCount = violations.filter((v) => v.status === 'Under Review').length;
  const resolvedCount = violations.filter((v) => v.status === 'Resolved').length;

  const handleEscalateToIncident = (violation: ViolationRecord) => {
    const res = DataService.createIncidentFromViolation(
      violation.id,
      userRole,
      `${userRole} Officer`
    );
    if (res.success) {
      setActionFeedback(
        `Violation ${violation.id} escalated to official incident ${res.incident?.id}. Anomaly logged to incident registry.`
      );
      if (onViolationUpdated) onViolationUpdated();
    } else {
      setActionFeedback(res.error || 'Failed to escalate violation.');
    }
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingViolation) return;

    const res = DataService.updateViolationStatus(
      resolvingViolation.id,
      'Resolved',
      resolutionNotes || 'Remediation verified by compliance audit.'
    );

    if (res.success) {
      setActionFeedback(`Violation ${resolvingViolation.id} marked as Resolved.`);
      setResolvingViolation(null);
      setResolutionNotes('');
      if (onViolationUpdated) onViolationUpdated();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automated Policy Violations Log"
        subtitle="Automated, rule-based detection of predefined lifecycle rule infractions, expired authorizations, and custody chain variances."
        badge="AUTOMATED VIOLATION DETECTION"
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Violations</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{violations.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Automated Policy Engine</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Open Infractions</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{openCount}</div>
          <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Requiring Investigation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Under Review</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{reviewCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Inquiry in Progress</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Resolved</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Remediated & Closed</div>
        </div>
      </div>

      {/* Distinction Between Incident Reporting and Policy Violations */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-lg p-5 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
          <h3 className="text-sm font-bold tracking-wide">
            Architectural Clarification: Operational Incidents vs. Policy Violations
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Operational Incident Reporting (Stage 6)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Operational anomalies filed by military operators or field inspectors during service missions (e.g. telemetry heartbeat packet loss, temporary override latency, sensor drift).
            </p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 space-y-1.5">
            <div className="font-bold text-rose-300 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>Automated Policy Violation Detection</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Algorithmic rule breaches detected automatically by the validation layer and policy engine when state transitions fail statutory covenants (e.g. expired deployment permits, custody gaps).
            </p>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-medium">{actionFeedback}</div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="All">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, AWS ID, policy..."
              className="pl-8 pr-3 py-1 border border-slate-300 rounded text-xs w-56 focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing {filteredViolations.length} of {violations.length} violations
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-3">
        {filteredViolations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
            No policy violations match the selected filters.
          </div>
        ) : (
          filteredViolations.map((v) => {
            const targetAws = awsRecords.find((r) => r.id === v.awsId);
            return (
              <div
                key={v.id}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900">{v.id}</span>
                    <button
                      type="button"
                      onClick={() => targetAws && onSelectAws(targetAws)}
                      className="font-mono text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{v.awsId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        v.severity === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : v.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {v.severity} Severity
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {v.policyId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                        v.status === 'Open'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : v.status === 'Under Review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{v.violationType}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{v.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div>
                    <strong>Detected:</strong> {v.detectedDate} by {v.detectedBy}
                  </div>
                  <div>
                    <strong>Triggered Context:</strong> {v.triggeredBy} ({v.role})
                  </div>
                  <div>
                    {v.relatedIncidentId ? (
                      <span className="text-amber-800 font-semibold">
                        Linked Incident: {v.relatedIncidentId}
                      </span>
                    ) : (
                      <span className="text-slate-400">No linked incident record</span>
                    )}
                  </div>
                </div>

                {v.resolutionNotes && (
                  <div className="p-2.5 bg-slate-50 rounded text-xs text-slate-700 border border-slate-200/80">
                    <strong className="text-slate-900">Resolution Record:</strong> {v.resolutionNotes}
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Deterministic Policy Audit Check
                  </div>

                  <div className="flex items-center gap-2">
                    {targetAws && (
                      <button
                        type="button"
                        onClick={() => onSelectAws(targetAws)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium cursor-pointer"
                      >
                        Inspect AWS Details
                      </button>
                    )}

                    {!v.relatedIncidentId && v.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => handleEscalateToIncident(v)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium cursor-pointer"
                      >
                        Escalate to Incident
                      </button>
                    )}

                    {v.status !== 'Resolved' && (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingViolation(v);
                          setResolutionNotes('');
                        }}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium cursor-pointer"
                      >
                        Resolve Infraction
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Modal */}
      {resolvingViolation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-xl border border-slate-300 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Resolve Violation {resolvingViolation.id}
              </h3>
              <button
                type="button"
                onClick={() => setResolvingViolation(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <strong>Asset:</strong> {resolvingViolation.awsId}
              </div>
              <div>
                <strong>Rule:</strong> {resolvingViolation.violationType}
              </div>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Remediation / Corrective Action Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document corrective actions taken, re-audit verification, or regulatory dispensation..."
                  className="w-full p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingViolation(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
