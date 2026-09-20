import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { PolicyEngine } from '../services/policyEngine';
import { PolicyRule, UserRole, AwsRecord } from '../types';
import {
  ScrollText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface PoliciesPageProps {
  awsRecords: AwsRecord[];
  userRole: UserRole;
  onSelectAws: (record: AwsRecord) => void;
  onNavigateToViolations: () => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({
  awsRecords,
  userRole,
  onSelectAws,
  onNavigateToViolations,
}) => {
  const policies = PolicyEngine.getPolicies();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredPolicies = policies.filter((p: PolicyRule) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  // Calculate compliance statistics for each policy across active fleet
  const policyStats = policies.map((policy: PolicyRule) => {
    let pass = 0;
    let review = 0;
    let fail = 0;

    awsRecords.forEach((aws) => {
      const report = PolicyEngine.evaluateAwsRecord(aws);
      const evalItem = report.evaluations.find((e) => e.policyId === policy.policyId);
      if (evalItem) {
        if (evalItem.result === 'PASS') pass++;
        else if (evalItem.result === 'REVIEW') review++;
        else if (evalItem.result === 'FAIL') fail++;
      }
    });

    return { policy, pass, review, fail, total: awsRecords.length };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consortium Governance & Compliance Policies"
        subtitle="Predefined, deterministic policy engine rules enforcing international covenants, statutory lifecycle requirements, and chain-of-custody controls."
        badge="POLICY ENGINE"
        actions={
          <button
            type="button"
            onClick={onNavigateToViolations}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>View Active Violations Log</span>
          </button>
        }
      />

      {/* Conceptual Overview Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-md shrink-0 border border-blue-500/30">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Modular Policy-Based Compliance Architecture
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-3xl">
              The compliance engine operates deterministically without subjective scoring or AI approximations. Each rule evaluates unambiguous state invariants, statutory authorizations, and lifecycle timelines against verifiable asset logs.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-emerald-400 rounded border border-slate-700">
            {policies.length} Active Governance Rules
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-700">Filter Policies:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Certification">Certification</option>
            <option value="Ownership">Ownership</option>
            <option value="Deployment">Deployment</option>
            <option value="Usage">Usage</option>
            <option value="Audit">Audit</option>
            <option value="Incident">Incident</option>
            <option value="Disposal">Disposal</option>
            <option value="Identity">Identity</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Deprecated">Deprecated</option>
          </select>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing {filteredPolicies.length} of {policies.length} policies
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.map((policy: PolicyRule) => {
          const stats = policyStats.find((s) => s.policy.policyId === policy.policyId);
          return (
            <div
              key={policy.policyId}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {policy.policyId}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {policy.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {policy.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{policy.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Category: <strong className="text-slate-700">{policy.category}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                  {policy.description}
                </p>

                <div className="text-xs text-slate-700 space-y-1 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Rule Logic Invariant:
                  </div>
                  <div className="font-mono text-[11px] bg-slate-900 text-slate-200 p-2 rounded overflow-x-auto">
                    {policy.condition}
                  </div>
                </div>
              </div>

              {/* Fleet Evaluation Status */}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Fleet Evaluation:</span>
                <div className="flex items-center gap-3 font-semibold">
                  <span className="text-emerald-700">{stats?.pass ?? 0} Pass</span>
                  <span className="text-amber-700">{stats?.review ?? 0} Review</span>
                  <span className="text-rose-700">{stats?.fail ?? 0} Non-Compliant</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
