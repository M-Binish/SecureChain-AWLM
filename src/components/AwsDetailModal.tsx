import React from 'react';
import { AwsRecord } from '../types';
import { StatusBadge } from './StatusBadge';
import { LifecycleTimeline } from './LifecycleTimeline';
import { X, Shield, Building2, User, Calendar, Award, CheckCircle, Clock, AlertTriangle, Trash2, Info } from 'lucide-react';

interface AwsDetailModalProps {
  record: AwsRecord | null;
  onClose: () => void;
}

export const AwsDetailModal: React.FC<AwsDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

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
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Current Owner</span>
              </div>
              <div className="text-slate-900 font-semibold">{record.currentOwner}</div>
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
                <span>Compliance Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {record.complianceStatus}
                </span>
                <span className="text-slate-500 text-[11px]">• Updated: {record.lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* Academic Prototype Notice */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Academic Simulation Record:</strong> This digital identity tracks an autonomous weapon system throughout its authorized lifecycle. Compliance evaluation will be computed in a future phase via the formal policy engine.
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
