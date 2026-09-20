/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * Centralized Role-Based Access Control (RBAC) & Permissions Configuration
 * 
 * IMPORTANT:
 * This frontend permission configuration provides an academic demonstration
 * of role-based visibility and route protection. Production systems require
 * cryptographic multi-signature authentication and backend ledger authorization.
 */

import { UserRole } from '../types';

export const ALL_ROLES: UserRole[] = [
  'Manufacturer',
  'Supply Chain Operator',
  'Military / Defense',
  'Government',
  'Regulator',
  'Auditor / Inspector',
  'Administrator',
];

export type LifecycleOperation =
  | 'manufacturing_certification'
  | 'ownership_transfer'
  | 'deployment_authorization'
  | 'usage_tracking'
  | 'audit_compliance'
  | 'incident_reporting'
  | 'disposal';

/**
 * Centralized role permissions table mapping specific lifecycle operations
 * to authorized stakeholder roles (Phase 3 requirements).
 */
export const OPERATION_PERMISSIONS: Record<LifecycleOperation, UserRole[]> = {
  manufacturing_certification: ['Manufacturer', 'Administrator'],
  ownership_transfer: ['Supply Chain Operator', 'Administrator'],
  deployment_authorization: ['Government', 'Military / Defense', 'Administrator'],
  usage_tracking: ['Military / Defense', 'Administrator'],
  audit_compliance: ['Auditor / Inspector', 'Regulator', 'Administrator'],
  incident_reporting: ['Military / Defense', 'Auditor / Inspector', 'Regulator', 'Administrator'],
  disposal: ['Military / Defense', 'Regulator', 'Administrator'],
};

export function canPerformLifecycleOperation(role: UserRole, operation: LifecycleOperation): boolean {
  return OPERATION_PERMISSIONS[operation]?.includes(role) ?? false;
}

/**
 * Centralized role permissions table mapping views to authorized stakeholder roles.
 * Modifiable in one place without scattering role strings across components.
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Manufacturer': [
    'dashboard',
    'aws-registry',
    'traceability',
    'architecture',
    'consortium-stakeholders',
    'manufacturing-certification',
  ],
  'Supply Chain Operator': [
    'dashboard',
    'aws-registry',
    'traceability',
    'architecture',
    'consortium-stakeholders',
    'ownership-transfer',
  ],
  'Military / Defense': [
    'dashboard',
    'aws-registry',
    'traceability',
    'architecture',
    'consortium-stakeholders',
    'deployment-authorization',
    'usage-tracking',
    'incident-reporting',
    'disposal',
  ],
  'Government': [
    'dashboard',
    'aws-registry',
    'traceability',
    'architecture',
    'consortium-stakeholders',
    'deployment-authorization',
    'audit-compliance',
    'policies',
    'transaction-history',
    'lifecycle-analytics',
  ],
  'Regulator': [
    'dashboard',
    'aws-registry',
    'traceability',
    'architecture',
    'consortium-stakeholders',
    'manufacturing-certification',
    'audit-compliance',
    'policies',
    'violations',
    'incident-reporting',
    'lifecycle-analytics',
  ],
  'Auditor / Inspector': [
    'dashboard',
    'aws-registry',
    'traceability',
    'architecture',
    'system-architecture',
    'consortium-stakeholders',
    'auditor-dashboard', // ONLY Auditor / Inspector and Administrator
    'manufacturing-certification',
    'ownership-transfer',
    'deployment-authorization',
    'usage-tracking',
    'audit-compliance',
    'incident-reporting',
    'disposal',
    'violations',
    'lifecycle-analytics',
    'transaction-history',
  ],
  'Administrator': [
    'dashboard',
    'aws-registry',
    'traceability',
    'architecture',
    'consortium-stakeholders',
    'auditor-dashboard', // ONLY Auditor / Inspector and Administrator
    'manufacturing-certification',
    'ownership-transfer',
    'deployment-authorization',
    'usage-tracking',
    'audit-compliance',
    'incident-reporting',
    'disposal',
    'policies',
    'violations',
    'lifecycle-analytics',
    'transaction-history',
    'users-roles',
    'system-monitoring',
  ],
};

/**
 * Check whether a given user role is permitted to navigate to or view a specific module.
 */
export function canAccessView(role: UserRole, viewId: string): boolean {
  // Normalize alias views
  let normalized = viewId;
  if (viewId === 'registry') normalized = 'aws-registry';
  if (viewId === 'roles') normalized = 'consortium-stakeholders';
  if (viewId === 'lifecycle-traceability') normalized = 'traceability';
  if (viewId === 'system-architecture') normalized = 'architecture';

  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(normalized);
}

/**
 * Human-readable friendly titles for all navigable application views
 */
export const VIEW_TITLES: Record<string, string> = {
  'dashboard': 'Consortium Dashboard',
  'aws-registry': 'AWS Registry',
  'registry': 'AWS Registry',
  'traceability': 'Lifecycle Traceability',
  'lifecycle-traceability': 'Lifecycle Traceability',
  'consortium-stakeholders': 'Consortium Stakeholders',
  'roles': 'Consortium Stakeholders',
  'auditor-dashboard': 'Auditor / Inspector Dashboard',
  'architecture': 'System Architecture',
  'system-architecture': 'System Architecture',
  'manufacturing-certification': 'Manufacturing & Certification',
  'ownership-transfer': 'Ownership Transfer',
  'deployment-authorization': 'Deployment Authorization',
  'usage-tracking': 'Usage Tracking',
  'audit-compliance': 'Audit & Compliance',
  'incident-reporting': 'Incident Reporting',
  'disposal': 'Disposal',
  'policies': 'Governance Policies',
  'violations': 'Policy Violations Log',
  'lifecycle-analytics': 'Lifecycle Analytics',
  'transaction-history': 'Lifecycle Transaction History',
  'users-roles': 'Stakeholder Role Management',
  'system-monitoring': 'System Health & Monitoring',
};
