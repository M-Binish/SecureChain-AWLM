import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { AwsRecord, ViolationRecord, UserRole, PolicyRule } from '../types';
import { PolicyEngine } from '../services/policyEngine';
import { StatusBadge } from '../components/StatusBadge';
import {
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
  Info,
} from 'lucide-react';

interface LifecycleAnalyticsPageProps {
  awsRecords: AwsRecord[];
  violations: ViolationRecord[];
  userRole: UserRole;
  onSelectAws: (record: AwsRecord) => void;
  onNavigateToViolations: () => void;
  onNavigateToPolicies: () => void;
}

export const LifecycleAnalyticsPage: React.FC<LifecycleAnalyticsPageProps> = ({
  awsRecords,
  violations,
  userRole,
  onSelectAws,
  onNavigateToViolations,
  onNavigateToPolicies,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const policies = PolicyEngine.getPolicies();

  // Evaluate all AWS records deterministically using PolicyEngine
  const evaluations = useMemo(() => {
    return awsRecords.map((record) => {
      const report = PolicyEngine.evaluateAwsRecord(record);
      return {
        record,
        report,
      };
    });
  }, [awsRecords]);

  // Aggregate Fleet Compliance Breakdown
  const statusCounts = useMemo(() => {
    let compliant = 0;
    let review = 0;
    let nonCompliant = 0;
    let pending = 0;

    evaluations.forEach(({ report }) => {
      if (report.overallCompliance === 'Compliant') compliant++;
      else if (report.overallCompliance === 'Requires Review') review++;
      else if (report.overallCompliance === 'Non-Compliant') nonCompliant++;
      else pending++;
    });

    return { compliant, review, nonCompliant, pending, total: evaluations.length };
  }, [evaluations]);

  // Policy breakdown across fleet
  const policyAggregates = useMemo(() => {
    return policies.map((policy: PolicyRule) => {
      let pass = 0;
      let review = 0;
      let fail = 0;

      evaluations.forEach(({ report }) => {
        const item = report.evaluations.find((e) => e.policyId === policy.policyId);
        if (item) {
          if (item.result === 'PASS') pass++;
          else if (item.result === 'REVIEW') review++;
          else if (item.result === 'FAIL') fail++;
        }
      });

      return {
        policy,
        pass,
        review,
        fail,
        totalEvaluated: evaluations.length,
      };
    });
  }, [policies, evaluations]);

  // Violations Breakdown
  const violationStats = useMemo(() => {
    const high = violations.filter((v) => v.severity === 'High').length;
    const medium = violations.filter((v) => v.severity === 'Medium').length;
    const low = violations.filter((v) => v.severity === 'Low').length;

    const open = violations.filter((v) => v.status === 'Open').length;
    const underReview = violations.filter((v) => v.status === 'Under Review').length;
    const resolved = violations.filter((v) => v.status === 'Resolved').length;

    return { high, medium, low, open, underReview, resolved, total: violations.length };
  }, [violations]);

  const filteredEvaluations = evaluations.filter(({ report }) => {
    if (selectedStatusFilter === 'All') return true;
    return report.overallCompliance === selectedStatusFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lifecycle Compliance & Risk Analytics"
        subtitle="Consortium-wide empirical compliance accounting derived deterministically from active governance policies and verifiable state transitions."
        badge="RISK & COMPLIANCE ANALYTICS"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToPolicies}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold cursor-pointer"
            >
              Policies
            </button>
            <button
              type="button"
              onClick={onNavigateToViolations}
              className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Violations ({violations.length})</span>
            </button>
          </div>
        }
      />

      {/* Methodology Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-md shrink-0 border border-blue-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Deterministic Compliance Accounting
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-3xl">
              In accordance with academic prototype rigor, compliance is measured strictly by rule satisfaction (PASS, REVIEW, FAIL) across 8 predefined governance policies. No arbitrary numerical scores or fictitious percentages are utilized.
            </p>
          </div>
        </div>
        <div className="shrink-0 font-mono text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
          Evaluated Assets: <strong className="text-white">{awsRecords.length}</strong>
        </div>
      </div>

      {/* Fleet Compliance Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>Fully Compliant</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {statusCounts.compliant} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">All policies satisfied</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 flex items-center justify-between">
            <span>Requires Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {statusCounts.review} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Audit or permit approaching</p>
        </div>

        <div className="bg-white border border-rose-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-rose-800 flex items-center justify-between">
            <span>Non-Compliant</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {statusCounts.nonCompliant} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-1">Hard policy breach detected</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
            <span>Pending Baseline</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {statusCounts.pending} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting initial certification</p>
        </div>
      </div>

      {/* Two Column Section: Policy Evaluation Breakdown & Violations Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Policy Pass/Review/Fail Table */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Governance Policy Compliance Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Fleet evaluation across all 8 predefined policy rules.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {policies.length} Policies
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-[11px] uppercase tracking-wider font-semibold text-slate-600 border-b border-slate-200">
                  <th className="px-3.5 py-2.5">Policy ID & Name</th>
                  <th className="px-3 py-2.5">Target Stage</th>
                  <th className="px-3 py-2.5 text-center">Pass</th>
                  <th className="px-3 py-2.5 text-center">Review</th>
                  <th className="px-3 py-2.5 text-center">Fail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {policyAggregates.map(({ policy, pass, review, fail }: { policy: PolicyRule; pass: number; review: number; fail: number }) => (
                  <tr key={policy.policyId} className="hover:bg-slate-50">
                    <td className="px-3.5 py-2.5">
                      <div className="font-mono font-bold text-blue-700 text-[11px]">
                        {policy.policyId}
                      </div>
                      <div className="font-semibold text-slate-900 text-xs mt-0.5">
                        {policy.name}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 text-xs">
                      {policy.category}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-emerald-700">
                      {pass}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-amber-700">
                      {review}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-rose-700">
                      {fail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 5 Cols: Violations Severity & Resolution Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Violation Severity Accounting</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="text-lg font-bold text-rose-700">{violationStats.high}</div>
                <div className="text-[11px] font-semibold text-rose-900">High Severity</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-lg font-bold text-amber-700">{violationStats.medium}</div>
                <div className="text-[11px] font-semibold text-amber-900">Medium Severity</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-lg font-bold text-slate-700">{violationStats.low}</div>
                <div className="text-[11px] font-semibold text-slate-700">Low Severity</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resolution & Remediations</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Open Infractions:</span>
                <span className="font-bold text-rose-700">{violationStats.open}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Under Inquiry / Review:</span>
                <span className="font-bold text-amber-700">{violationStats.underReview}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Remediated & Closed:</span>
                <span className="font-bold text-emerald-700">{violationStats.resolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset-by-Asset Compliance Status Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fleet Asset Compliance Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic evaluation results for each registered simulated autonomous weapon asset.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium"
            >
              <option value="All">All Compliance Statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="Requires Review">Requires Review</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Pending Baseline">Pending Baseline</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-[11px] uppercase tracking-wider font-semibold text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3">AWS Identifier</th>
                <th className="px-3 py-3">System Name</th>
                <th className="px-3 py-3">Current Owner</th>
                <th className="px-3 py-3">Lifecycle Stage</th>
                <th className="px-3 py-3">Compliance Status</th>
                <th className="px-3 py-3 text-center">Rule Breakdown</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEvaluations.map(({ record, report }) => {
                const passCount = report.evaluations.filter((e) => e.result === 'PASS').length;
                const reviewCount = report.evaluations.filter((e) => e.result === 'REVIEW').length;
                const failCount = report.evaluations.filter((e) => e.result === 'FAIL').length;

                return (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {record.id}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      {record.systemName}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {record.currentOwner}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={record.lifecycleStatus} size="sm" />
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${
                          report.overallCompliance === 'Compliant'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : report.overallCompliance === 'Requires Review'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : report.overallCompliance === 'Non-Compliant'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {report.overallCompliance}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-[11px]">
                      <span className="text-emerald-700 font-bold">{passCount} Pass</span> •{' '}
                      <span className="text-amber-700 font-semibold">{reviewCount} Review</span> •{' '}
                      <span className="text-rose-700 font-bold">{failCount} Fail</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectAws(record)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Audit Record</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
