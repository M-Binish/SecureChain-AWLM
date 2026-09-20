/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * Type Definitions for Autonomous Weapon Lifecycle Management
 */

export type UserRole =
  | 'Manufacturer'
  | 'Supply Chain Operator'
  | 'Military / Defense'
  | 'Government'
  | 'Regulator'
  | 'Auditor / Inspector'
  | 'Administrator';

export type LifecycleStage =
  | 'Manufacturing & Certification'
  | 'Ownership Transfer'
  | 'Deployment Authorization'
  | 'Usage Tracking'
  | 'Audit & Compliance'
  | 'Incident Reporting'
  | 'Disposal';

export type StageStatus = 'Completed' | 'In Progress' | 'Pending' | 'Flagged' | 'Not Applicable';

export interface LifecycleEvent {
  id: string;
  stage: LifecycleStage;
  iteration?: number; // e.g. Usage Tracking Event #1, #2; Audit #1, #2
  title: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  status: StageStatus;
  details: string;
  recordIdentifier: string; // Simulated digital record ID
  notes?: string;
  isConditional?: boolean; // For incident reporting
}

export type CertificationStatus = 'Certified' | 'Pending Review' | 'Expired' | 'Revoked' | 'Rejected';

export type OverallLifecycleStatus =
  | 'Manufacturing & Certification'
  | 'Certified'
  | 'In Transit'
  | 'Deployed'
  | 'Active Service'
  | 'Under Audit'
  | 'Incident Flagged'
  | 'Pending Disposal'
  | 'Decommissioned';

export type AuditLifecycleStatus =
  | 'Compliant'
  | 'Non-Compliant'
  | 'Requires Review'
  | 'Pending'
  | 'Passed'
  | 'Under Audit'
  | 'Audit Required'
  | 'Not Evaluated';

export interface DemoUser {
  id: string;
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
  organization: string;
}

export interface OwnershipTransferRecord {
  id: string;
  awsId: string;
  previousOwner: string;
  newOwner: string;
  transferDate: string;
  transferStatus: 'Completed' | 'In Progress' | 'Flagged' | 'Rejected';
  recordedBy: string;
  recordedByRole: UserRole;
  reason: string;
  notes?: string;
}

export interface AwsRecord {
  id: string;
  systemName: string;
  manufacturer: string;
  manufactureDate: string;
  certificationId: string;
  certificationStatus: CertificationStatus;
  currentOwner: string;
  lifecycleStatus: OverallLifecycleStatus;
  deploymentAuthorizationStatus: 'Authorized' | 'Pending' | 'Expired' | 'Revoked' | 'Not Applicable';
  usageStatus: 'Active Service' | 'In Reserve' | 'Standby' | 'Decommissioned';
  auditStatus: AuditLifecycleStatus;
  incidentStatus: 'No Incidents' | 'Under Review' | 'Flagged';
  disposalStatus: 'Not Scheduled' | 'Pending Disposal' | 'Decommissioned';
  createdTimestamp: string;
  lastUpdated: string;
  systemType: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Pending' | 'Requires Review' | string;
  violationCount?: number;
  notes?: string;
  lifecycleHistory: LifecycleEvent[];
  ownershipHistory: OwnershipTransferRecord[];
}

export interface ViolationRecord {
  id: string;
  awsId: string;
  policyId: string;
  violationType: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  detectedDate: string;
  detectedBy: string;
  triggeredBy: string;
  role: UserRole;
  status: 'Open' | 'Under Review' | 'Resolved';
  resolutionNotes?: string;
  relatedIncidentId?: string;
}

export type PolicyEvaluationResultStatus = 'PASS' | 'FAIL' | 'REVIEW';

export interface PolicyRule {
  policyId: string;
  name: string;
  category: 'Certification' | 'Ownership' | 'Deployment' | 'Usage' | 'Disposal' | 'Audit' | 'Incident' | 'Identity';
  description: string;
  condition: string;
  status: 'Active' | 'Under Review' | 'Deprecated';
}

export interface PolicyEvaluation {
  policyId: string;
  policyName: string;
  category: string;
  result: PolicyEvaluationResultStatus;
  details: string;
  evaluatedAt: string;
}

export interface IncidentRecord {
  id: string;
  awsId: string;
  title: string;
  severity: 'Critical' | 'Major' | 'Minor';
  reportedBy: UserRole;
  reportDate: string;
  status: 'Pending Audit' | 'Under Review' | 'Closed';
  summary: string;
  resolutionNotes?: string;
}

export interface AuditRecord {
  id: string;
  awsId: string;
  auditType: 'Periodic Safety Inspection' | 'Algorithmic Boundary Review' | 'Post-Incident Review' | 'Chain-of-Custody Audit';
  inspector: string;
  inspectorRole: UserRole;
  date: string;
  complianceStatus: string;
  findings: string;
  result: 'Passed' | 'Flagged for Review' | 'Action Required' | 'Compliant' | 'Non-Compliant';
}

export interface LifecycleTransaction {
  id: string;
  awsId: string;
  operation: string;
  stakeholder: string;
  stakeholderRole: UserRole;
  status: 'Completed' | 'Pending Review' | 'Under Inspection' | 'Flagged';
  timestamp: string;
  transactionRef: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  iconName: string;
  group: 'main' | 'lifecycle' | 'governance' | 'analytics' | 'blockchain' | 'audit' | 'administration';
  allowedRoles: UserRole[];
  description?: string;
}

export interface UserSession {
  username: string;
  role: UserRole;
  organization: string;
  isAuthenticated: boolean;
}
