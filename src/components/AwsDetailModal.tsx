import React from 'react';
import { AwsRecord } from '../types';
import { StatusBadge } from './StatusBadge';
import { LifecycleTimeline } from './LifecycleTimeline';
import { PolicyEngine } from '../services/policyEngine';
import {
  X,
  Shield,
  Building2,
  User,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Info,
  ArrowDown,
  ArrowRightLeft,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
} from 'lucide-react';

interface AwsDetailModalProps {
  record: AwsRecord | null;
  onClose: () => void;
}

export const AwsDetailModal: React.FC<AwsDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  // Run policy engine evaluation on this record
  const evaluationReport = PolicyEngine.evaluateAwsRecord(record);

  // Compute distinct ownership chain nodes
  const ownershipChain: string[] = [record.manufacturer || 'Manufacturer'];
  if (record.ownershipHistory && record.ownershipHistory.length > 0) {
    record.ownershipHistory.forEach((transfer) => {
      if (transfer.transferStatus === 'Completed' || transfer.transferStatus === 'In Progress') {
        if (!ownershipChain.includes(transfer.previousOwner)) {
          ownershipChain.push(transfer.previousOwner);
        }
        if (!ownershipChain.includes(transfer.newOwner)) {
          ownershipChain.push(transfer.newOwner);
        }
      }
    });
  }
  if (!ownershipChain.includes(record.currentOwner)) {
    ownershipChain.push(record.currentOwner);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-xl border border-slate-300 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400">{record.id}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300">{record.systemType}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{record.systemName}</h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={record.lifecycleStatus} />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs">
            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <span className="font-mono text-slate-400">ID:</span>
                <span>AWS ID</span>
              </div>
              <div className="text-slate-900 font-mono font-bold">{record.id}</div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Manufacturer</span>
              </div>
              <div className="text-slate-900 font-semibold">{record.manufacturer}</div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Manufacturing Date</span>
              </div>
              <div className="text-slate-900 font-semibold">{record.manufactureDate}</div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-bold text-blue-900">Current Owner</span>
              </div>
              <div className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                {record.currentOwner}
              </div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Certification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-slate-700">{record.certificationId}</span>
                <StatusBadge status={record.certificationStatus} size="sm" />
              </div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Deployment Authorization</span>
              </div>
              <div className="text-slate-900 font-semibold">{record.deploymentAuthorizationStatus}</div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Usage Status</span>
              </div>
              <div className="text-slate-900 font-semibold">{record.usageStatus}</div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Audit Status</span>
              </div>
              <div className="text-slate-900 font-semibold">{record.auditStatus}</div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                <span>Incident Status</span>
              </div>
              <div className="text-slate-900 font-semibold">{record.incidentStatus}</div>
            </div>

            <div>
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Disposal Status</span>
              </div>
              <div className="text-slate-900 font-semibold">{record.disposalStatus}</div>
            </div>

            <div className="col-span-2">
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Derived Compliance Status (Policy Engine)</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                    evaluationReport.derivedStatus === 'Compliant'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : evaluationReport.derivedStatus === 'Non-Compliant'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : evaluationReport.derivedStatus === 'Requires Review'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {evaluationReport.derivedStatus}
                </span>
                <span className="text-slate-500 text-[11px]">
                  • {evaluationReport.passedCount} Passed, {evaluationReport.reviewCount} Review, {evaluationReport.failedCount} Failed
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1: OWNERSHIP TRANSFER TRACEABILITY */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Ownership & Custody Traceability
                </h4>
              </div>
              <div className="text-xs font-medium text-slate-600">
                Current Owner: <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{record.currentOwner}</span>
              </div>
            </div>

            {/* Visual Ownership Chain: Previous Owner ↓ New Owner */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Custody Transition Sequence
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                {ownershipChain.map((owner, idx) => {
                  const isCurrent = owner === record.currentOwner;
                  return (
                    <React.Fragment key={idx}>
                      <div
                        className={`px-3 py-1.5 rounded-md font-semibold text-xs border ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-300'
                        }`}
                      >
                        {owner}
                        {isCurrent && <span className="ml-1.5 text-[10px] uppercase opacity-85 font-mono">(Current)</span>}
                      </div>
                      {idx < ownershipChain.length - 1 && (
                        <div className="text-slate-400 font-bold flex items-center px-1">
                          <span>↓</span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Ownership History Entries */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ownership History Records
              </div>
              {record.ownershipHistory && record.ownershipHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {record.ownershipHistory.map((transfer, idx) => (
                    <div
                      key={transfer.id || idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900 font-bold">Transfer {idx + 1}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            transfer.transferStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : transfer.transferStatus === 'In Progress'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          Status: {transfer.transferStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                        <div>
                          <strong className="text-slate-800">From:</strong> {transfer.previousOwner}
                        </div>
                        <div>
                          <strong className="text-slate-800">To:</strong> {transfer.newOwner}
                        </div>
                        <div>
                          <strong className="text-slate-800">Date:</strong> {transfer.transferDate}
                        </div>
                        <div>
                          <strong className="text-slate-800">Recorded By:</strong> {transfer.recordedBy} ({transfer.recordedByRole})
                        </div>
                      </div>
                      {transfer.reason && (
                        <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                          <strong className="text-slate-700">Reason:</strong> {transfer.reason}
                        </div>
                      )}
                      {transfer.notes && (
                        <div className="text-[11px] text-slate-500 italic">
                          <strong>Notes:</strong> {transfer.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 italic text-center">
                  Genesis unit in manufacturer assembly. No custody transfers recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: POLICY-BASED COMPLIANCE EVALUATION */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Automated Policy Engine Evaluation
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {evaluationReport.evaluations.length} Machine-Readable Rules Checked
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded text-xs text-slate-700">
              <strong>Evaluation Summary:</strong> {evaluationReport.summaryMessage}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {evaluationReport.evaluations.map((evalItem) => (
                <div
                  key={evalItem.policyId}
                  className="p-2.5 rounded border border-slate-200 bg-white space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {evalItem.policyId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        evalItem.result === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : evalItem.result === 'REVIEW'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {evalItem.result}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900">{evalItem.policyName}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{evalItem.details}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Verifiable Lifecycle Timeline */}
          <div>
            <div className="border-b border-slate-200 pb-2 mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Verifiable Lifecycle Event Trail
              </h4>
              <p className="text-xs text-slate-500">
                Sequential progression across stages. Incident Reporting is conditional upon telemetry anomalies; Usage and Audit support recurrent operational intervals; Disposal is the terminal lifecycle stage.
              </p>
            </div>
            <LifecycleTimeline events={record.lifecycleHistory} currentStatus={record.lifecycleStatus} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            Digital Asset Identifier: {record.id} • Lifecycle Events: {record.lifecycleHistory.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 cursor-pointer font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
