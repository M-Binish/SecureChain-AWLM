/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * Field-Level Role-Based Data Visibility Matrix & Access Filtering
 * 
 * IMPORTANT:
 * Centralized authorization rules defining field-level access, section visibility,
 * and lifecycle event trail filtering for all 7 consortium stakeholder roles:
 * 1. Manufacturer
 * 2. Supply Chain Operator
 * 3. Military / Defense
 * 4. Government
 * 5. Regulator
 * 6. Auditor / Inspector
 * 7. Administrator
 */

import { UserRole, LifecycleEvent, AwsRecord } from '../types';

export interface ModalSectionVisibility {
  basicInfo: boolean;
  manufacturing: boolean;
  certification: boolean;
  ownership: boolean;
  deployment: boolean;
  usage: boolean;
  audit: boolean;
  incidents: boolean;
  disposal: boolean;
  policyCompliance: boolean;
  lifecycleHistory: boolean;
}

/**
 * Returns the exact registry column keys visible to the given role
 */
export function getAuthorizedRegistryColumnKeys(role: UserRole): string[] {
  switch (role) {
    case 'Manufacturer':
      return [
        'id',
        'systemName',
        'manufacturer',
        'manufactureDate',
        'currentOwner',
        'certificationStatus',
        'lifecycleStatus',
        'lastUpdated',
        'action',
      ];

    case 'Supply Chain Operator':
      return [
        'id',
        'systemName',
        'currentOwner',
        'lifecycleStatus',
        'lastUpdated',
        'action',
      ];

    case 'Military / Defense':
      return [
        'id',
        'systemName',
        'currentOwner',
        'deploymentAuthorizationStatus',
        'usageStatus',
        'incidentStatus',
        'disposalStatus',
        'lifecycleStatus',
        'lastUpdated',
        'action',
      ];

    case 'Government':
      return [
        'id',
        'systemName',
        'currentOwner',
        'deploymentAuthorizationStatus',
        'certificationStatus',
        'disposalStatus',
        'lifecycleStatus',
        'lastUpdated',
        'action',
      ];

    case 'Regulator':
      return [
        'id',
        'systemName',
        'manufacturer',
        'certificationStatus',
        'deploymentAuthorizationStatus',
        'auditStatus',
        'incidentStatus',
        'complianceStatus',
        'lifecycleStatus',
        'lastUpdated',
        'action',
      ];

    case 'Auditor / Inspector':
    case 'Administrator':
    default:
      return [
        'id',
        'systemName',
        'manufacturer',
        'currentOwner',
        'certificationStatus',
        'deploymentAuthorizationStatus',
        'auditStatus',
        'incidentStatus',
        'complianceStatus',
        'lifecycleStatus',
        'lastUpdated',
        'action',
      ];
  }
}

/**
 * Returns section authorization map for the AWS View Details Modal
 */
export function getAuthorizedModalSections(role: UserRole): ModalSectionVisibility {
  switch (role) {
    case 'Manufacturer':
      return {
        basicInfo: true,
        manufacturing: true,
        certification: true,
        ownership: true, // Authorized custody & provenance
        deployment: false, // Unrelated government decisions
        usage: false, // Full operational usage details
        audit: false, // Complete audit records
        incidents: false, // All incidents
        disposal: false,
        policyCompliance: false, // Internal policy-engine info
        lifecycleHistory: true, // Filtered
      };

    case 'Supply Chain Operator':
      return {
        basicInfo: true,
        manufacturing: false, // Manufacturer engineering internals
        certification: false, // Regulatory safety covenants
        ownership: true, // Chain of custody & transit handoffs
        deployment: false,
        usage: false,
        audit: false,
        incidents: false,
        disposal: false,
        policyCompliance: false,
        lifecycleHistory: true, // Filtered
      };

    case 'Military / Defense':
      return {
        basicInfo: true,
        manufacturing: false,
        certification: true, // Baseline clearance verification
        ownership: true, // Defense asset custody
        deployment: true, // Deployment authorization & bounds
        usage: true, // Operational telemetry & service tracking
        audit: false, // Independent audit internals
        incidents: true, // Incident reporting & safety alerts
        disposal: true, // Disposal request initiation
        policyCompliance: false, // Private policy-engine internals
        lifecycleHistory: true, // Filtered
      };

    case 'Government':
      return {
        basicInfo: true,
        manufacturing: false,
        certification: true, // High-level certification overview
        ownership: true, // Sovereign ownership oversight
        deployment: true, // Statutory deployment authorization review
        usage: false,
        audit: true, // High-level statutory compliance review
        incidents: false, // Detailed incident investigations
        disposal: true, // Sovereign decommissioning signoff
        policyCompliance: true, // Governance policy overview
        lifecycleHistory: true, // Filtered
      };

    case 'Regulator':
      return {
        basicInfo: true,
        manufacturing: true, // Baseline safety attestations
        certification: true, // Formal safety certification reviews & approvals
        ownership: false,
        deployment: true, // Deployment compliance verification
        usage: false,
        audit: true, // Independent regulatory inspections
        incidents: true, // Critical safety alerts & anomalies
        disposal: true, // Demilitarization & environmental verification
        policyCompliance: true, // Regulatory policy evaluation
        lifecycleHistory: true, // Filtered
      };

    case 'Auditor / Inspector':
      return {
        basicInfo: true,
        manufacturing: true,
        certification: true,
        ownership: true,
        deployment: true,
        usage: true,
        audit: true,
        incidents: true,
        disposal: true,
        policyCompliance: true,
        lifecycleHistory: true,
      };

    case 'Administrator':
    default:
      return {
        basicInfo: true,
        manufacturing: true,
        certification: true,
        ownership: true,
        deployment: true,
        usage: true,
        audit: true,
        incidents: true,
        disposal: true,
        policyCompliance: true,
        lifecycleHistory: true,
      };
  }
}

/**
 * Filter verifiable lifecycle event trail based on stakeholder authorization (Section 10)
 */
export function filterLifecycleEventsForRole(
  events: LifecycleEvent[],
  role: UserRole
): LifecycleEvent[] {
  if (!events || events.length === 0) return [];

  switch (role) {
    case 'Manufacturer':
      // Authorized manufacturing/certification and initial dispatch custody events
      return events.filter(
        (e) =>
          e.stage === 'Manufacturing & Certification' ||
          (e.stage === 'Ownership Transfer' &&
            (e.actorRole === 'Manufacturer' || e.details.toLowerCase().includes('manufacturer')))
      );

    case 'Supply Chain Operator':
      // Authorized ownership and custody transit events
      return events.filter((e) => e.stage === 'Ownership Transfer');

    case 'Military / Defense':
      // Authorized deployment, usage, incident, disposal, and defense custody events
      return events.filter(
        (e) =>
          e.stage === 'Deployment Authorization' ||
          e.stage === 'Usage Tracking' ||
          e.stage === 'Incident Reporting' ||
          e.stage === 'Disposal' ||
          (e.stage === 'Ownership Transfer' &&
            (e.actorRole === 'Military / Defense' || e.details.toLowerCase().includes('military') || e.details.toLowerCase().includes('defense')))
      );

    case 'Government':
      // Authorized governance, deployment authorization, disposal review, and certification overview
      return events.filter(
        (e) =>
          e.stage === 'Deployment Authorization' ||
          e.stage === 'Disposal' ||
          e.stage === 'Manufacturing & Certification' ||
          (e.stage === 'Audit & Compliance' && e.status === 'Completed')
      );

    case 'Regulator':
      // Authorized certification, audit, incidents, deployment authorization review, and disposal
      return events.filter(
        (e) =>
          e.stage === 'Manufacturing & Certification' ||
          e.stage === 'Audit & Compliance' ||
          e.stage === 'Incident Reporting' ||
          e.stage === 'Deployment Authorization' ||
          e.stage === 'Disposal'
      );

    case 'Auditor / Inspector':
    case 'Administrator':
    default:
      // Comprehensive lifecycle history
      return events;
  }
}
