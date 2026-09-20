import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { UserRole } from '../types';
import {
  FileCheck2,
  ArrowRightLeft,
  ShieldCheck,
  Activity,
  ClipboardCheck,
  AlertTriangle,
  Trash2,
  ScrollText,
  AlertOctagon,
  BarChart3,
  History,
  Scale,
  Users,
  Info,
  Layers,
  Code2,
  CheckCircle,
  Clock,
  Shield,
  FileCode,
} from 'lucide-react';

interface ModuleConfig {
  title: string;
  category: string;
  phase: string;
  icon: React.ComponentType<{ className?: string }>;
  objective: string;
  futureContract: string;
  allowedRoles: UserRole[];
  keyInputs: string[];
  validationRules: string[];
  mockDataPreview: React.ReactNode;
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  'manufacturing-certification': {
    title: 'Manufacturing & Certification',
    category: 'AWS Lifecycle',
    phase: 'Phase 2: Blockchain Smart Contracts',
    icon: FileCheck2,
    objective:
      'Immutably record factory assembly specifications, cryptographic root-of-trust keys, and independent regulator safety certificates onto the consortium ledger.',
    futureContract: 'contracts/ManufacturingRegistry.sol (or Hyperledger Chaincode)',
    allowedRoles: ['Manufacturer', 'Regulator', 'Administrator'],
    keyInputs: [
      'Chassis Serial Number & HW Enclave Public Key',
      'Safety Covenant Hash (IEEE Autonomous Bounds)',
      'Regulator Certificate Digital Signature',
      'Firmware Cryptographic Digest (SHA-256)',
    ],
    validationRules: [
      'Firmware hash must match certified benchmark image',
      'Regulator signature must be verified by multi-sig threshold',
      'Chassis hardware ID must not have prior registered instances',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Pending Certification Queue (Wireframe Preview)</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">PHASE 2 MOCKUP</span>
        </div>
        <div className="border border-slate-200 rounded divide-y divide-slate-200 bg-white">
          <div className="p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Batch-2026-APEX-09 (4 Units)</div>
              <div className="text-slate-500 text-[11px]">Submitted by: Apex Defense Dynamics Ltd.</div>
            </div>
            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200 text-[11px] font-medium">
              Awaiting Regulator Multi-Sig
            </span>
          </div>
          <div className="p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Batch-2026-VANGUARD-02 (2 Units)</div>
              <div className="text-slate-500 text-[11px]">Submitted by: Vanguard Autonomous Aerospace</div>
            </div>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[11px] font-medium">
              Cert Validated: IEEE-2800
            </span>
          </div>
        </div>
      </div>
    ),
  },

  'ownership-transfer': {
    title: 'Ownership & Custody Transfer',
    category: 'AWS Lifecycle',
    phase: 'Phase 2: Blockchain Smart Contracts',
    icon: ArrowRightLeft,
    objective:
      'Ensure tamper-proof custody handoffs between manufacturers, logistics operators, military depots, and disposal facilities using two-phase cryptographic handshakes.',
    futureContract: 'contracts/CustodyHandshake.sol',
    allowedRoles: ['Supply Chain Operator', 'Military / Defense', 'Administrator'],
    keyInputs: [
      'Transferor Stakeholder Cryptographic Address',
      'Transferee Stakeholder Cryptographic Address',
      'Physical Tamper-Evident Seal Hash',
      'GPS Depot Waypoint Checkpoint ID',
    ],
    validationRules: [
      'Transferor must currently hold confirmed on-chain custody',
      'Transferee must sign acceptance transaction within 72 hours',
      'Tamper seal hash must match shipment manifest',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Active Chain-of-Custody Manifests (Wireframe Preview)</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">PHASE 2 MOCKUP</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 space-y-2">
          <div className="flex justify-between items-center font-mono text-[11px] text-slate-500">
            <span>MANIFEST #TRF-9021</span>
            <span className="text-blue-600 font-semibold">In Transit</span>
          </div>
          <div className="text-slate-900 font-semibold">Transfer from Apex Facility to Forward Depot 4</div>
          <div className="text-slate-500 text-[11px]">Checkpoint 2 of 4 cleared • Biometric seal untampered</div>
        </div>
      </div>
    ),
  },

  'deployment-authorization': {
    title: 'Deployment Authorization',
    category: 'AWS Lifecycle',
    phase: 'Phase 2 & Phase 3: Sovereign Clearances',
    icon: ShieldCheck,
    objective:
      'Manage multi-jurisdictional deployment mandates, rules of engagement (RoE) parameters, and geofenced operational zones.',
    futureContract: 'contracts/DeploymentClearance.sol',
    allowedRoles: ['Military / Defense', 'Government', 'Administrator'],
    keyInputs: [
      'Authorized Geographic Coordinates & Polygons',
      'Maximum Autonomous Mission Duration',
      'Mandatory Human-in-the-Loop Override Key ID',
      'Sovereign Authority Warrant Number',
    ],
    validationRules: [
      'Asset must possess valid, non-expired certification',
      'Asset must not have unresolved safety incident flags',
      'Government ministry multi-sig approval required',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Deployment Clearance Warrants</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">PHASE 2 MOCKUP</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 space-y-1.5">
          <div className="font-semibold text-slate-900">Warrant #AUTH-DEF-2026-08 (Sector 7 Surveillance)</div>
          <div className="text-slate-500 text-[11px]">Approved: 2026-04-10 • Expiration: 2028-04-10 • Geofence: Zone 7 Alpha</div>
          <div className="text-emerald-700 font-medium text-[11px]">✓ Multi-sig status: 3/3 Ministry Signatures Collected</div>
        </div>
      </div>
    ),
  },

  'usage-tracking': {
    title: 'Usage & Operational Tracking',
    category: 'AWS Lifecycle',
    phase: 'Phase 2: Recurrent Event Logs',
    icon: Activity,
    objective:
      'Track recurrent operational service rotations, mission hours, periodic heartbeats, and autonomous decision logs without exposing sensitive tactical details.',
    futureContract: 'contracts/OperationalLedger.sol',
    allowedRoles: ['Military / Defense', 'Auditor / Inspector', 'Administrator'],
    keyInputs: [
      'Mission Cycle Sequence Number',
      'Cumulative Operating Engine/Sensor Hours',
      'Zeroized Telemetry Merkle Root Hash',
      'Authorized Unit Commander Identifier',
    ],
    validationRules: [
      'Sequence number must be strictly monotonic (n+1)',
      'Operating hours cannot decrease or skip counter intervals',
      'Submission allowed only while deployment warrant is active',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Operational Service Cycles (Recurrent Pattern)</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">PHASE 2 MOCKUP</span>
        </div>
        <div className="space-y-2">
          <div className="p-2.5 bg-white border border-slate-200 rounded flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-900">AWS-001 • Operational Cycle #2</div>
              <div className="text-slate-500 text-[11px]">Logged by: Cmdr. H. Sterling (4,200 total hours)</div>
            </div>
            <span className="text-emerald-700 font-medium text-[11px]">Verified</span>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-900">AWS-002 • Operational Cycle #2</div>
              <div className="text-slate-500 text-[11px]">Logged by: Capt. R. Larson (Active Marine Patrol)</div>
            </div>
            <span className="text-blue-700 font-medium text-[11px]">Active</span>
          </div>
        </div>
      </div>
    ),
  },

  'audit-compliance': {
    title: 'Audit & Compliance Verification',
    category: 'AWS Lifecycle',
    phase: 'Phase 2 & Phase 3: Compliance Engine',
    icon: ClipboardCheck,
    objective:
      'Enable regular and ad-hoc independent regulatory inspections of firmware integrity, physical custody, and autonomous constraint compliance.',
    futureContract: 'contracts/AuditComplianceLog.sol',
    allowedRoles: ['Government', 'Regulator', 'Auditor / Inspector', 'Administrator'],
    keyInputs: [
      'Inspectorate Credentials & Certificate',
      'Firmware Remote Attestation Digest',
      'Physical Tamper Seal Inspection Finding',
      'Algorithm Bounds Re-verification Score',
    ],
    validationRules: [
      'Inspector must belong to approved consortium regulator registry',
      'Failing audit triggers automated suspension of deployment',
      'Periodic audits mandatory every 180 operational days',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Scheduled Regulatory Inspections</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">PHASE 3 MOCKUP</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 space-y-1.5">
          <div className="font-semibold text-slate-900">Semi-Annual Inspection Schedule 2026-Q2</div>
          <div className="text-slate-500 text-[11px]">18 Assets Scheduled • 14 Cleared • 1 Caution Flag</div>
        </div>
      </div>
    ),
  },

  'incident-reporting': {
    title: 'Incident Reporting & Investigation',
    category: 'AWS Lifecycle',
    phase: 'Phase 2: Conditional Exception Handling',
    icon: AlertTriangle,
    objective:
      'Provide an immutable reporting channel for unexpected autonomous behaviors, telemetry dropouts, communications timeouts, or constraint infractions.',
    futureContract: 'contracts/IncidentLedger.sol',
    allowedRoles: ['Auditor / Inspector', 'Military / Defense', 'Regulator', 'Administrator'],
    keyInputs: [
      'Incident Severity Level (Minor / Critical / Breaching)',
      'Blackbox Telemetry Snapshot Digest',
      'Human Override Latency in Milliseconds',
      'Corrective Failsafe Action Taken',
    ],
    validationRules: [
      'Critical incident automatically updates asset state to "Incident Flagged"',
      'Asset cannot undergo ownership transfer or deployment while flagged',
      'Requires joint regulator and defense sign-off to resolve',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Active Flagged Incidents</span>
          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono">CRITICAL REVIEW</span>
        </div>
        <div className="p-3 bg-white rounded border border-rose-200 space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-rose-700">AWS-003: Telemetry Heartbeat Dropout</span>
            <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-medium">Under Investigation</span>
          </div>
          <div className="text-slate-600 text-[11px]">Override latency: 4.2s (Threshold: 1.0s) • Failsafe Park Engaged</div>
        </div>
      </div>
    ),
  },

  disposal: {
    title: 'Disposal & Decommissioning',
    category: 'AWS Lifecycle',
    phase: 'Phase 2: Terminal Lifecycle State',
    icon: Trash2,
    objective:
      'Permanently verify the end-of-life destruction, demilitarization, and cryptographic key zeroization of autonomous systems to prevent weapon resurrection.',
    futureContract: 'contracts/DecommissioningRegistry.sol',
    allowedRoles: ['Military / Defense', 'Auditor / Inspector', 'Administrator'],
    keyInputs: [
      'Certified Destruction Witness Signatures (Dual-Party)',
      'Cryptographic Enclave Zeroization Proof',
      'Environmental Smelting & Recycling Certificate',
    ],
    validationRules: [
      'Asset state permanently transitions to "Decommissioned"',
      'No further transactions or usage events can ever be registered',
      'Cryptographic identities removed from active authorization ACL',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Decommissioning Queue (Terminal Registry)</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">PHASE 2 MOCKUP</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
          <div className="font-semibold text-slate-900">AWS-001 • SentriGuard Perimeter System Alpha</div>
          <div className="text-slate-500 text-[11px]">Decommission Warrant Approved • Awaiting Physical Smelting Verification</div>
        </div>
      </div>
    ),
  },

  policies: {
    title: 'Governance & Compliance Policies',
    category: 'Governance',
    phase: 'Phase 3: Modular Policy Engine',
    icon: ScrollText,
    objective:
      'Define and update modular smart contract rules reflecting international treaties, sovereign regulations, and maximum autonomous mission limits.',
    futureContract: 'contracts/PolicyComplianceEngine.sol',
    allowedRoles: ['Government', 'Regulator', 'Administrator'],
    keyInputs: [
      'Policy Identifier & Treaty Reference',
      'Algorithmic Constraint Rule Expression',
      'Penalty / Invalidation Action Trigger',
      'Consortium Voting Threshold Confirmation',
    ],
    validationRules: [
      'Policies require supermajority approval from Sovereign Members',
      'Rules cannot retroactively invalidate completed audits',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Active Governance Policies (Sample Schemas)</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">PHASE 3 PREVIEW</span>
        </div>
        <div className="space-y-2">
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <div className="font-semibold text-slate-900">POL-001: Maximum Human Override Timeout Limit</div>
            <div className="text-slate-500 text-[11px]">Autonomous targeting must fail-safe if override communication exceeds 1,000ms.</div>
          </div>
          <div className="p-2.5 bg-white border border-slate-200 rounded">
            <div className="font-semibold text-slate-900">POL-002: Mandatory Semi-Annual Attestation</div>
            <div className="text-slate-500 text-[11px]">Units without completed audit within 180 days automatically forfeit deployment clearance.</div>
          </div>
        </div>
      </div>
    ),
  },

  violations: {
    title: 'Automated Lifecycle Violations',
    category: 'Governance',
    phase: 'Phase 3: Automated Detection Engine',
    icon: AlertOctagon,
    objective:
      'Automatically flag inconsistencies, out-of-order lifecycle events, expired certifications, or missing telemetry heartbeats.',
    futureContract: 'backend/services/ViolationDetector.ts',
    allowedRoles: ['Regulator', 'Auditor / Inspector', 'Administrator'],
    keyInputs: [
      'Violation Rule Trigger Code',
      'Offending Transaction Hash',
      'Severity & Automatic Penalty Imposed',
    ],
    validationRules: [
      'State transition skipping validation triggers instant alert to auditors',
      'Unauthorized actor signature attempts logged to immutable blacklist',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Automated Violation Triggers</span>
          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono">RULE ENGINE</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
          <div className="text-slate-900 font-semibold">VIO-2026-03: Delayed Audit Schedule on AWS-003</div>
          <div className="text-slate-500 text-[11px]">Routine inspection overdue by 14 days • Flag automatically submitted</div>
        </div>
      </div>
    ),
  },

  'lifecycle-analytics': {
    title: 'Lifecycle Risk & Compliance Analytics',
    category: 'Analytics',
    phase: 'Phase 3: Analytics Engine',
    icon: BarChart3,
    objective:
      'Provide consortium stakeholders with quantitative risk assessments, asset lifespan distributions, and fleet-wide compliance metrics.',
    futureContract: 'backend/analytics/RiskAggregator.ts',
    allowedRoles: ['Government', 'Regulator', 'Auditor / Inspector', 'Administrator'],
    keyInputs: ['Fleet Operational Hours Aggregation', 'Component MTBF Statistics', 'Audit Passage Ratios'],
    validationRules: ['Zero personal / classified identifiers included in analytical aggregations'],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Consortium Health Metrics (Preview)</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">ANALYTICS PREVIEW</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-3 rounded border border-slate-200">
            <div className="text-lg font-bold text-slate-900">98.2%</div>
            <div className="text-slate-500 text-[10px]">Fleet Compliance</div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <div className="text-lg font-bold text-slate-900">14.8 mo</div>
            <div className="text-slate-500 text-[10px]">Avg Operational Life</div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <div className="text-lg font-bold text-slate-900">0.02%</div>
            <div className="text-slate-500 text-[10px]">Incident Ratio</div>
          </div>
        </div>
      </div>
    ),
  },

  'transaction-history': {
    title: 'Lifecycle Transaction History',
    category: 'Transaction Records',
    phase: 'Phase 3: Digital Lifecycle Records',
    icon: History,
    objective:
      'Inspect chronological records of lifecycle state changes, verified stakeholder operational transactions, and audit trails recorded across simulated autonomous systems.',
    futureContract: 'Lifecycle State Audit Trail & Transaction Log',
    allowedRoles: ['Auditor / Inspector', 'Administrator', 'Government'],
    keyInputs: ['Record Identifier Verification', 'Lifecycle Event Logs', 'Stakeholder Sign-Offs'],
    validationRules: ['All transactions must correlate to verified simulated autonomous weapon system records'],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Lifecycle Transaction History Blueprint</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">PHASE 3 RECORDS</span>
        </div>
        <p className="text-slate-600 leading-relaxed bg-white p-3 rounded border border-slate-200">
          This view provides the chronological transaction ledger documenting all state operations, maintenance rotations, custody transfers, and safety inspections.
        </p>
      </div>
    ),
  },

  'auditor-dashboard': {
    title: 'Auditor & Inspectorate Dashboard',
    category: 'Audit',
    phase: 'Phase 2 & Phase 3: Comprehensive Oversight',
    icon: Scale,
    objective:
      'Empower certified inspectors with unified cross-cutting visibility across manufacturing batches, active deployments, usage logs, and incident files.',
    futureContract: 'contracts/AuditorRoleAccess.sol',
    allowedRoles: ['Auditor / Inspector', 'Government', 'Administrator'],
    keyInputs: ['Attestation Key Validation', 'Cross-Domain Audit Scope', 'Inspection Report Submission'],
    validationRules: ['Auditors possess full read privilege but cannot unilaterally mutate operational states'],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Comprehensive Oversight Portal</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">AUDITOR ACCESS</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
          <div className="font-semibold text-slate-900">Auditor Status: Credentials Verified (Active Scope)</div>
          <div className="text-slate-500 text-[11px]">Authorized for comprehensive lifecycle inspection across all 7 participant roles.</div>
        </div>
      </div>
    ),
  },

  'users-roles': {
    title: 'Users & Role Administration',
    category: 'Administration',
    phase: 'Phase 2: Selective Access Control (RBAC)',
    icon: Users,
    objective:
      'Manage consortium participant identities, public key certificates, and selective role permissions across manufacturers, defense entities, and regulators.',
    futureContract: 'contracts/RoleAccessManager.sol',
    allowedRoles: ['Administrator'],
    keyInputs: ['User Identity / X.509 Certificate', 'Consortium Organization Affiliation', 'Role Privilege Matrix'],
    validationRules: ['Only designated consortium administrators may enroll or revoke stakeholder addresses'],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Consortium Role Matrix</span>
          <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono">RBAC PREVIEW</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
          <div className="font-semibold text-slate-900">7 Pre-defined Consortium Roles Configured</div>
          <div className="text-slate-500 text-[11px]">Manufacturer, Supply Chain, Military, Government, Regulator, Auditor, Administrator.</div>
        </div>
      </div>
    ),
  },

  'traceability': {
    title: 'End-to-End Lifecycle Traceability',
    category: 'Core Navigation',
    phase: 'Phase 2: Immutable Provenance',
    icon: Layers,
    objective:
      'Provide comprehensive chronological verification of autonomous weapon system state transitions from genesis manufacturing to decommissioned disposal.',
    futureContract: 'contracts/LifecycleProvenance.sol',
    allowedRoles: [
      'Manufacturer',
      'Supply Chain Operator',
      'Military / Defense',
      'Government',
      'Regulator',
      'Auditor / Inspector',
      'Administrator',
    ],
    keyInputs: ['AWS Identification Hash', 'State Transition Nonce', 'Consortium Multi-Sig Sign-Off'],
    validationRules: [
      'State transitions must strictly respect directed acyclic lifecycle order',
      'Every state transition must carry timestamp and cryptographic signature',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Traceability Pipeline (7 Lifecycle Stages)</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">ALL ROLES ACCESSIBLE</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 text-slate-600 space-y-1">
          <div>1. Manufacturing & Certification → 2. Ownership Transfer → 3. Deployment Authorization</div>
          <div>4. Usage Tracking → 5. Audit & Compliance → 6. Incident Reporting (Conditional) → 7. Disposal (Terminal)</div>
        </div>
      </div>
    ),
  },

  'consortium-stakeholders': {
    title: 'Consortium Stakeholders & Roles',
    category: 'Core Navigation',
    phase: 'Phase 2: Consortium Governance',
    icon: Users,
    objective:
      'Inspect the seven authorized stakeholder role tiers and active participant node credentials across the consortium network.',
    futureContract: 'contracts/ConsortiumRegistry.sol',
    allowedRoles: [
      'Manufacturer',
      'Supply Chain Operator',
      'Military / Defense',
      'Government',
      'Regulator',
      'Auditor / Inspector',
      'Administrator',
    ],
    keyInputs: ['Consortium Node Identifier', 'Role Privilege Tier', 'Public Verification Key'],
    validationRules: [
      'Only authorized entities assigned one of the 7 designated consortium roles',
      'Revocation of a role immediately invalidates pending operational endorsements',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>7 Consortium Participant Tiers</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">FEDERATED</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-semibold text-slate-900">Tier 1: Industrial</span>
            <div className="text-[11px] text-slate-500">Manufacturer • Supply Chain Operator</div>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-semibold text-slate-900">Tier 2: Sovereign & Defense</span>
            <div className="text-[11px] text-slate-500">Military / Defense • Government</div>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-semibold text-slate-900">Tier 3: Oversight & Audit</span>
            <div className="text-[11px] text-slate-500">Regulator • Auditor / Inspector</div>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-semibold text-slate-900">Tier 4: System</span>
            <div className="text-[11px] text-slate-500">Administrator</div>
          </div>
        </div>
      </div>
    ),
  },

  'architecture': {
    title: 'System Architecture & IEEE Foundation',
    category: 'Core Navigation',
    phase: 'Phase 1 & Phase 2: Software Foundation',
    icon: Layers,
    objective:
      'Review the academic software architecture decoupling frontend governance simulation from future consortium blockchain smart contracts.',
    futureContract: 'Architecture Blueprint • IEEE Autonomous Weapon Governance',
    allowedRoles: [
      'Manufacturer',
      'Supply Chain Operator',
      'Military / Defense',
      'Government',
      'Regulator',
      'Auditor / Inspector',
      'Administrator',
    ],
    keyInputs: ['Academic Specifications', 'Lifecycle Boundary Definitions', 'Consensus Model'],
    validationRules: [
      'Zero AI/ML or autonomous targeting modules (software governance only)',
      'Strict separation of consortium roles and smart contract state machines',
    ],
    mockDataPreview: (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span>Three-Tier Academic Prototype Architecture</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">B.TECH PROJECT</span>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 text-slate-600 space-y-2">
          <div><strong className="text-slate-800">Layer 1:</strong> Frontend UI & RBAC (Current Implementation)</div>
          <div><strong className="text-slate-800">Layer 2:</strong> Smart Contracts & Consensus Ledger (Planned Next Phase)</div>
          <div><strong className="text-slate-800">Layer 3:</strong> Automated Compliance & Policy Engine (Subsequent Phase)</div>
        </div>
      </div>
    ),
  },
};

interface PlaceholderPageProps {
  viewId: string;
  userRole: UserRole;
  onNavigateBack: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  viewId,
  userRole,
  onNavigateBack,
}) => {
  const config = MODULE_CONFIGS[viewId] || {
    title: viewId.replace('-', ' ').toUpperCase(),
    category: 'Module',
    phase: 'Future Phase',
    icon: Layers,
    objective: 'This module is scheduled for implementation in upcoming project phases.',
    futureContract: 'Planned Consortium Smart Contract',
    allowedRoles: ['Administrator'],
    keyInputs: ['Simulated Record Data'],
    validationRules: ['Standard Consortium Validation'],
    mockDataPreview: null,
  };

  const Icon = config.icon;
  const hasAccess = config.allowedRoles.includes(userRole);

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        subtitle={`${config.category} Module • ${config.phase}`}
        badge={config.phase}
      />

      {/* Role Access Validation Notice */}
      {!hasAccess && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Role-Based Selective Access Notice:</strong> Your current active role (
            <strong>{userRole}</strong>) does not normally access this module under standard consortium operational rules.
            <div className="text-amber-800 mt-1">
              Permitted Roles: {config.allowedRoles.join(', ')}. To access with an authorized role, log out and sign in with appropriate credentials.
            </div>
          </div>
        </div>
      )}

      {/* Academic Roadmap Demarcation Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-800 shrink-0 border border-slate-200">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {config.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">{config.phase}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{config.title}</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              {config.objective}
            </p>
          </div>
        </div>

        {/* Technical Architecture Blueprint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-slate-700" />
              <span>Target Smart Contract / Component</span>
            </div>
            <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 text-[11px]">
              {config.futureContract}
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Intentionally omitted in Phase 1 to ensure a clean software separation before deploying solidity/chaincode contracts.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-700" />
              <span>Authorized Stakeholder Roles</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {config.allowedRoles.map((role) => (
                <span
                  key={role}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                    role === userRole
                      ? 'bg-blue-100 text-blue-900 border-blue-300 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {role} {role === userRole ? '(Active)' : ''}
                </span>
              ))}
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Enforced on the frontend in Phase 1; backed by smart contract modifier permissions in Phase 2.
            </p>
          </div>
        </div>

        {/* Inputs and Planned Validation Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="font-bold text-slate-900 mb-2">Planned Transaction Inputs (Phase 2)</div>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              {config.keyInputs.map((input, idx) => (
                <li key={idx} className="leading-snug">
                  {input}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="font-bold text-slate-900 mb-2">Planned Validation Rules (Phase 3)</div>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              {config.validationRules.map((rule, idx) => (
                <li key={idx} className="leading-snug">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Wireframe Mockup Preview */}
        {config.mockDataPreview && (
          <div className="pt-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Wireframe Preview (Scheduled for Next Phases)
            </div>
            {config.mockDataPreview}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            SecureChain-AWLM Phase 1 Foundation • Module Ready for Phase 2 Integration
          </span>
          <button
            type="button"
            onClick={onNavigateBack}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
