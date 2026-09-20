import React from 'react';
import { PageHeader } from '../components/PageHeader';
import {
  Shield,
  Layers,
  FileCheck2,
  ArrowRightLeft,
  ShieldCheck,
  Activity,
  ClipboardCheck,
  AlertTriangle,
  Trash2,
  Database,
  History,
  Lock,
  Cpu,
  GitFork,
  CheckCircle2,
  Info,
  Server,
  ArrowDown,
} from 'lucide-react';

export const SystemArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="System Architecture & Technical Design"
        subtitle="Architectural decomposition of the SecureChain-AWLM lifecycle governance platform."
        badge="SYSTEM ARCHITECTURE"
      />

      {/* Architecture Status Declaration */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg shrink-0 border border-blue-400/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Current Implementation Architecture
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              The running prototype operates as an application-level lifecycle governance platform with client-side credential verification, centralized Role-Based Access Control (RBAC), and persistent local data storage. Blockchain integration is not currently active in the running prototype and is documented strictly under Target Architecture.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-800 text-blue-300 rounded-md text-xs font-mono border border-slate-700 font-semibold">
            APPLICATION RUNTIME
          </span>
        </div>
      </div>

      {/* Section 1: Current System Architecture */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700" />
            <span>Current System Architecture</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational software stack delivering end-to-end lifecycle tracking across all 7 governance stages.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Vertical Architectural Flow Diagram */}
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Layer 1: Authorized Stakeholders */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stakeholder Layer</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Authorized Stakeholders</div>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">Manufacturer</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">Supply Chain Operator</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">Military / Defense</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">Government</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">Regulator</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">Auditor / Inspector</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">Administrator</span>
              </div>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Layer 2: Authentication + RBAC */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Access Control Layer</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Authentication + Role-Based Access Control (RBAC)</div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
                Validates stakeholder credentials at login, locks session role, enforces route guards, and restricts operations by authorized stakeholder identity.
              </p>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Layer 3: Application UI */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Presentation Layer</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Application UI (React + Tailwind CSS)</div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
                Role-tailored dashboards, digital registry data tables, chronological timeline visualizers, and state transition operation forms.
              </p>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Layer 4: Application / API Layer */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service & Business Logic Layer</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Application / API Layer (DataService)</div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
                Coordinates state transitions, validates input parameters against allowable status flows, and logs event modifications.
              </p>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Layer 5: Lifecycle Management Modules (7 Stages) */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-5 text-center">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Lifecycle Governance Layer</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Lifecycle Management Modules</div>
              <p className="text-xs text-slate-600 mt-1 mb-3">
                Seven discrete functional modules strictly governing autonomous system lifecycle states:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-left text-xs">
                <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">1. Manufacturing & Cert.</span>
                    <div className="text-[11px] text-slate-500">Genesis enrollment & certificates</div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">2. Ownership Transfer</span>
                    <div className="text-[11px] text-slate-500">Custody transition logs</div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">3. Deployment Authorization</span>
                    <div className="text-[11px] text-slate-500">Sovereign mandate approval</div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">4. Usage Tracking</span>
                    <div className="text-[11px] text-slate-500">Operational service rotations</div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-violet-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">5. Audit & Compliance</span>
                    <div className="text-[11px] text-slate-500">Independent inspections</div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">6. Incident Reporting</span>
                    <div className="text-[11px] text-slate-500">Telemetry latency & safety alerts</div>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-emerald-200 flex items-center gap-2 sm:col-span-2 lg:col-span-3">
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">7. Disposal</span>
                    <div className="text-[11px] text-slate-500">Demilitarization protocols, cryptographic zeroization, and final decommissioning</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Layer 6: Application Data / Persistence */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-4 text-center">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Persistence Layer</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Application Data / Persistence</div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
                Maintains state durability across page reloads via local storage persistence. Seeds default records if storage is uninitialized.
              </p>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-5 h-5" />
            </div>

            {/* Layer 7: Lifecycle Records + Event History */}
            <div className="bg-slate-900 text-white rounded-lg p-4 text-center">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Audit Artifacts Layer</div>
              <div className="text-sm font-bold text-white mt-1">Lifecycle Records + Event History</div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto">
                Chronological, append-only transaction log storing event identifiers, actor roles, previous-to-new state modifications, timestamps, and verifiable audit records.
              </p>
            </div>
          </div>

          {/* Three Core Governance Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Role-Based Access Control</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized authorization matrix (<code className="font-mono text-slate-800">ROLE_PERMISSIONS</code>) mapping each of the 7 consortium roles to authorized views and operational actions. Unauthorized route visits are intercepted by the route guard.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <GitFork className="w-4 h-4 text-emerald-600" />
                <span>Lifecycle Traceability</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maintains a chronological lifecycle stream for every registered AWS record. Visualizes cross-stage progression from genesis manufacturing certification to terminal disposal without data gaps.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Audit & Event History</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Append-only log recording every lifecycle state modification, certifying actor, and timestamp. Provides independent auditors with comprehensive oversight across all historical events and safety exceptions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Target Architecture (Future Blockchain Integration) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Server className="w-5 h-5 text-slate-700" />
                <span>Target Architecture</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target architecture model for eventual distributed ledger integration.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-semibold">
              TARGET ARCHITECTURE
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
            In the target architecture design, the current application-level data persistence layer is succeeded by smart contracts executing across a permissioned consortium blockchain. Multi-party cryptographic thresholds enforce statutory compliance and immutable multi-organization consensus.
          </p>

          {/* Target Architecture Vertical Flow */}
          <div className="max-w-xl mx-auto space-y-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center text-xs font-semibold text-slate-800">
              Authorized Stakeholders
            </div>
            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center text-xs font-semibold text-slate-800">
              Authentication + RBAC
            </div>
            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center text-xs font-semibold text-slate-800">
              Application / API Layer
            </div>
            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center text-xs font-semibold text-slate-800">
              Validation + Policy Layer
            </div>
            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center text-xs font-bold text-indigo-900">
              Smart Contracts
            </div>
            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center text-xs font-bold text-indigo-900">
              Consortium / Permissioned Blockchain
            </div>
            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center text-xs font-bold text-indigo-900">
              Distributed Ledger
            </div>
            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            <div className="bg-slate-900 text-white rounded-lg p-3 text-center text-xs font-bold">
              Traceable Lifecycle Records
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Target Architecture Boundary:</strong> This diagram reflects the target distributed design. The running application does not invoke blockchain transactions, does not generate cryptographic proof hashes, and does not require active Web3 wallets.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
