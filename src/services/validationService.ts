/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * Centralized Validation Layer & Lifecycle Transition Validator
 * 
 * IMPORTANT:
 * This is an application-level governance validation engine that enforces
 * operational rules, input integrity, role authorization, and state transition
 * constraints prior to any state mutation.
 */

import { AwsRecord, UserRole } from '../types';
import { canPerformLifecycleOperation, LifecycleOperation } from '../utils/permissions';

export interface ValidationViolationContext {
  policyId: string;
  violationType: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  violation?: ValidationViolationContext;
}

export class ValidationService {
  /**
   * Helper to format an invalid result with or without a violation trigger
   */
  private static fail(errors: string[], violation?: ValidationViolationContext): ValidationResult {
    return {
      isValid: false,
      errors,
      violation,
    };
  }

  /**
   * Helper to format a passing validation result
   */
  private static pass(): ValidationResult {
    return {
      isValid: true,
      errors: [],
    };
  }

  /**
   * Validate Registration of a New AWS Unit
   */
  public static validateRegistration(
    payload: {
      id?: string;
      systemName?: string;
      manufacturer?: string;
      manufactureDate?: string;
      certificationId?: string;
      certificationStatus?: string;
      systemType?: string;
    },
    existingRecords: AwsRecord[],
    actorRole: UserRole
  ): ValidationResult {
    const errors: string[] = [];

    // Role check
    if (!canPerformLifecycleOperation(actorRole, 'manufacturing_certification')) {
      return this.fail(
        [`Unauthorized Actor: Role '${actorRole}' is not permitted to register new AWS records.`],
        {
          policyId: 'POLICY-IDENTITY-001',
          violationType: 'Unauthorized Registration Attempt',
          description: `Role '${actorRole}' attempted to enroll an AWS record without authorization credentials.`,
          severity: 'High',
        }
      );
    }

    if (!payload.id || !payload.id.trim()) {
      errors.push('AWS ID is required.');
    } else {
      const idPattern = /^AWS-[A-Za-z0-9-]+$/;
      if (!idPattern.test(payload.id.trim())) {
        errors.push("AWS ID must follow the canonical format (e.g. 'AWS-007' or 'AWS-UNIT-12').");
      }
      const isDuplicate = existingRecords.some(
        (r) => r.id.toLowerCase() === payload.id!.trim().toLowerCase()
      );
      if (isDuplicate) {
        errors.push(`Duplicate Identifier: An AWS record with ID '${payload.id.trim()}' already exists in the registry.`);
      }
    }

    if (!payload.systemName || !payload.systemName.trim()) {
      errors.push('System Name / Designation is required.');
    }

    if (!payload.manufacturer || !payload.manufacturer.trim()) {
      errors.push('Manufacturer designation is required.');
    }

    if (!payload.manufactureDate || !payload.manufactureDate.trim()) {
      errors.push('Manufacturing Date is required.');
    }

    if (!payload.certificationId || !payload.certificationId.trim()) {
      errors.push('Initial Certification Reference is required.');
    }

    // Phase 5 Section 13: Initial registration must be Pending Review, not directly Certified
    if (payload.certificationStatus && payload.certificationStatus === 'Certified' && actorRole === 'Manufacturer') {
      return this.fail(
        ["Unauthorized Status: Manufacturers cannot self-certify assets directly as 'Certified'. New AWS registrations must be submitted with 'Pending Review' status for independent Regulatory covenant evaluation."],
        {
          policyId: 'POLICY-CERT-001',
          violationType: 'Manufacturer Self-Certification Attempt',
          description: `Manufacturer attempted to enroll ${payload.id || 'new unit'} directly as Certified without Regulatory review.`,
          severity: 'High',
        }
      );
    }

    if (errors.length > 0) {
      return this.fail(errors);
    }

    return this.pass();
  }

  /**
   * Validate Certification Review & Regulatory Signoff (Phase 5 Section 13 Requirements)
   */
  public static validateCertificationReview(
    record: AwsRecord | null | undefined,
    payload: {
      decision: 'Approve' | 'Reject' | 'Revoke' | 'Resubmit';
      certificationId?: string;
      notes?: string;
    },
    actorRole: UserRole
  ): ValidationResult {
    const errors: string[] = [];

    if (!record) {
      return this.fail(['Asset Not Found: The specified AWS record does not exist.']);
    }

    // Terminal state check
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return this.fail(
        [`Terminal State Constraint: Decommissioned asset '${record.id}' cannot undergo certification review.`],
        {
          policyId: 'POLICY-DISPOSAL-001',
          violationType: 'Action on Disposed Asset',
          description: `Certification review attempted on decommissioned unit ${record.id}.`,
          severity: 'High',
        }
      );
    }

    // Resubmission workflow: Manufacturer or Administrator resubmits from Revoked/Rejected to Pending Review
    if (payload.decision === 'Resubmit') {
      if (actorRole !== 'Manufacturer' && actorRole !== 'Administrator') {
        return this.fail(
          [`Unauthorized Submitter: Only 'Manufacturer' (or Administrator) can submit a re-certification request.`],
          {
            policyId: 'POLICY-CERT-001',
            violationType: 'Unauthorized Certification Resubmission',
            description: `Role '${actorRole}' attempted to resubmit certification for ${record.id}.`,
            severity: 'Medium',
          }
        );
      }
      if (record.certificationStatus !== 'Revoked' && record.certificationStatus !== 'Rejected') {
        errors.push(`Invalid State: Only assets with 'Revoked' or 'Rejected' certification status can be resubmitted for review (current status is '${record.certificationStatus}').`);
      }
      if (!payload.notes || !payload.notes.trim()) {
        errors.push('Re-certification submission requires technical justification or corrective action notes.');
      }
      if (errors.length > 0) return this.fail(errors);
      return this.pass();
    }

    // Regulatory review actions: Approve, Reject, Revoke
    // Only Regulator or Administrator can approve, reject, or revoke certification
    if (actorRole !== 'Regulator' && actorRole !== 'Administrator') {
      return this.fail(
        [`Unauthorized Authority: Role '${actorRole}' cannot approve, reject, or revoke certification. Only 'Regulator' (or Administrator) holds statutory regulatory certification authority.`],
        {
          policyId: 'POLICY-CERT-001',
          violationType: 'Unauthorized Regulatory Certification Action',
          description: `Role '${actorRole}' attempted regulatory action '${payload.decision}' on ${record.id}.`,
          severity: 'High',
        }
      );
    }

    if (payload.decision === 'Approve') {
      // Cannot approve directly from Revoked without resubmission to Pending Review
      if (record.certificationStatus === 'Revoked') {
        return this.fail(
          [`Invalid Certification Transition: Asset '${record.id}' has Revoked certification. Under consortium safety rules, revoked assets must be formally resubmitted by the Manufacturer to 'Pending Review' before they can be certified. Direct transition from Revoked to Certified is prohibited.`],
          {
            policyId: 'POLICY-CERT-001',
            violationType: 'Illegal Revoked to Certified Transition',
            description: `Attempted direct approval of Revoked certification on ${record.id} without required re-certification review process.`,
            severity: 'High',
          }
        );
      }

      if (!payload.certificationId || !payload.certificationId.trim()) {
        errors.push('Regulatory Certification ID / Covenant Reference is required for approval.');
      }
    }

    if (payload.decision === 'Revoke') {
      if (record.certificationStatus !== 'Certified') {
        errors.push(`Invalid State: Only 'Certified' assets can have their certification revoked (current status is '${record.certificationStatus}').`);
      }
      if (!payload.notes || !payload.notes.trim()) {
        errors.push('Regulatory revocation requires documented safety covenant violation or revocation grounds.');
      }
    }

    if (payload.decision === 'Reject') {
      if (record.certificationStatus !== 'Pending Review') {
        errors.push(`Invalid State: Only assets in 'Pending Review' can be rejected.`);
      }
      if (!payload.notes || !payload.notes.trim()) {
        errors.push('Regulatory rejection requires non-compliance findings and technical reasons.');
      }
    }

    if (errors.length > 0) return this.fail(errors);
    return this.pass();
  }

  /**
   * Validate Ownership & Custody Transfer (Phase 4 Section 1 Requirements)
   */
  public static validateOwnershipTransfer(
    record: AwsRecord | null | undefined,
    payload: {
      newOwner?: string;
      transferDate?: string;
      approvalStatus?: string;
      reason?: string;
      notes?: string;
    },
    actorRole: UserRole
  ): ValidationResult {
    const errors: string[] = [];

    // Check record existence
    if (!record) {
      return this.fail(['Asset Not Found: The specified AWS record does not exist.']);
    }

    // Role check
    if (!canPerformLifecycleOperation(actorRole, 'ownership_transfer')) {
      return this.fail(
        [`Unauthorized Custody Officer: Role '${actorRole}' cannot execute ownership handoffs.`],
        {
          policyId: 'POLICY-OWNER-001',
          violationType: 'Unauthorized Ownership Transfer',
          description: `Role '${actorRole}' attempted to execute custody transfer for ${record.id}.`,
          severity: 'High',
        }
      );
    }

    // Terminal state constraint: Disposed assets cannot be transferred
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return this.fail(
        [`Terminal State Constraint: Disposed AWS '${record.id}' is permanently decommissioned and cannot undergo ownership transfer.`],
        {
          policyId: 'POLICY-DISPOSAL-001',
          violationType: 'Action on Disposed Asset',
          description: `Ownership transfer was attempted on permanently decommissioned asset ${record.id}.`,
          severity: 'High',
        }
      );
    }

    // Required fields check
    if (!payload.newOwner || !payload.newOwner.trim()) {
      errors.push('New Owner designation is required.');
    }

    if (!payload.transferDate || !payload.transferDate.trim()) {
      errors.push('Transfer Date is required.');
    }

    if (!payload.reason || !payload.reason.trim()) {
      errors.push('Reason for Custody Transfer is mandatory for chain-of-custody provenance.');
    }

    // Identity validation: Previous Owner and New Owner cannot be identical
    if (payload.newOwner && record.currentOwner && payload.newOwner.trim().toLowerCase() === record.currentOwner.trim().toLowerCase()) {
      return this.fail(
        [`Invalid Custody Handoff: The recipient owner ('${payload.newOwner.trim()}') is identical to the current owner ('${record.currentOwner}'). Custody handoffs must transition between distinct consortium entities.`],
        {
          policyId: 'POLICY-OWNER-001',
          violationType: 'Identical Owner Custody Handoff',
          description: `Ownership transfer on ${record.id} specified new owner identical to current owner (${record.currentOwner}).`,
          severity: 'Medium',
        }
      );
    }

    if (errors.length > 0) {
      return this.fail(errors);
    }

    return this.pass();
  }

  /**
   * Validate Deployment Authorization
   */
  public static validateDeploymentAuthorization(
    record: AwsRecord | null | undefined,
    payload: {
      authorizationStatus?: string;
      authorizationReference?: string;
      authorizedDate?: string;
      expiryDate?: string;
      operationalDomain?: string;
      notes?: string;
    },
    actorRole: UserRole
  ): ValidationResult {
    const errors: string[] = [];

    if (!record) {
      return this.fail(['Asset Not Found: The specified AWS record does not exist.']);
    }

    if (!canPerformLifecycleOperation(actorRole, 'deployment_authorization')) {
      return this.fail(
        [`Unauthorized Authority: Role '${actorRole}' is not permitted to grant or modify deployment authorizations.`],
        {
          policyId: 'POLICY-DEPLOY-001',
          violationType: 'Unauthorized Deployment Clearance',
          description: `Role '${actorRole}' attempted to issue deployment clearance on ${record.id}.`,
          severity: 'High',
        }
      );
    }

    // Terminal state check
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return this.fail(
        [`Terminal State Constraint: Decommissioned asset '${record.id}' cannot be granted deployment authorization.`],
        {
          policyId: 'POLICY-DISPOSAL-001',
          violationType: 'Action on Disposed Asset',
          description: `Deployment authorization attempted on decommissioned unit ${record.id}.`,
          severity: 'High',
        }
      );
    }

    // Policy Rule: Valid Certification required prior to Deployment Authorization
    if (payload.authorizationStatus === 'Authorized' && record.certificationStatus !== 'Certified') {
      return this.fail(
        [`Prerequisite Certification Violation: AWS '${record.id}' cannot be granted 'Authorized' status because its certification status is '${record.certificationStatus}'. Valid safety covenant certification ('Certified') is required prior to deployment.`],
        {
          policyId: 'POLICY-CERT-001',
          violationType: 'Deployment Without Valid Certification',
          description: `Attempted deployment authorization on ${record.id} while certification status is ${record.certificationStatus}.`,
          severity: 'High',
        }
      );
    }

    if (!payload.authorizationStatus) {
      errors.push('Authorization Status is required.');
    }

    if (!payload.authorizationReference || !payload.authorizationReference.trim()) {
      errors.push('Authorization Reference / Directive ID is required.');
    }

    if (!payload.authorizedDate) {
      errors.push('Effective Authorization Date is required.');
    }

    if (!payload.operationalDomain || !payload.operationalDomain.trim()) {
      errors.push('Operational Domain designation is required.');
    }

    if (errors.length > 0) {
      return this.fail(errors);
    }

    return this.pass();
  }

  /**
   * Validate Operational Usage Tracking
   */
  public static validateUsageTracking(
    record: AwsRecord | null | undefined,
    payload: {
      eventType?: string;
      operationalLocation?: string;
      timestamp?: string;
      missionReadinessStatus?: string;
      notes?: string;
    },
    actorRole: UserRole
  ): ValidationResult {
    const errors: string[] = [];

    if (!record) {
      return this.fail(['Asset Not Found: The specified AWS record does not exist.']);
    }

    if (!canPerformLifecycleOperation(actorRole, 'usage_tracking')) {
      return this.fail(
        [`Unauthorized Operator: Role '${actorRole}' is not permitted to log operational service events.`],
        {
          policyId: 'POLICY-USAGE-001',
          violationType: 'Unauthorized Usage Logging',
          description: `Role '${actorRole}' attempted to log operational service cycle for ${record.id}.`,
          severity: 'High',
        }
      );
    }

    // Terminal state check
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return this.fail(
        [`Terminal State Constraint: Decommissioned asset '${record.id}' cannot log operational usage events.`],
        {
          policyId: 'POLICY-DISPOSAL-001',
          violationType: 'Action on Disposed Asset',
          description: `Operational usage logging attempted on decommissioned unit ${record.id}.`,
          severity: 'High',
        }
      );
    }

    // Policy Rule: Usage tracking requires active deployment authorization
    if (record.deploymentAuthorizationStatus !== 'Authorized') {
      return this.fail(
        [`Unauthorized Usage Violation: Cannot record operational service events for AWS '${record.id}' because its deployment authorization is '${record.deploymentAuthorizationStatus}'. Active authorization is required.`],
        {
          policyId: 'POLICY-USAGE-001',
          violationType: 'Usage Without Valid Authorization',
          description: `Operational usage logged on ${record.id} while deployment authorization is ${record.deploymentAuthorizationStatus}.`,
          severity: 'High',
        }
      );
    }

    if (!payload.eventType || !payload.eventType.trim()) {
      errors.push('Usage Event Type is required.');
    }

    if (!payload.operationalLocation || !payload.operationalLocation.trim()) {
      errors.push('Operational Location / Depot is required.');
    }

    if (!payload.timestamp || !payload.timestamp.trim()) {
      errors.push('Event Timestamp is required.');
    }

    if (errors.length > 0) {
      return this.fail(errors);
    }

    return this.pass();
  }

  /**
   * Validate Audit & Compliance Event
   */
  public static validateAuditEvent(
    record: AwsRecord | null | undefined,
    payload: {
      auditType?: string;
      inspector?: string;
      auditDate?: string;
      result?: string;
      findings?: string;
    },
    actorRole: UserRole
  ): ValidationResult {
    const errors: string[] = [];

    if (!record) {
      return this.fail(['Asset Not Found: The specified AWS record does not exist.']);
    }

    if (!canPerformLifecycleOperation(actorRole, 'audit_compliance')) {
      return this.fail(
        [`Unauthorized Inspector: Role '${actorRole}' is not permitted to file regulatory audit findings.`],
        {
          policyId: 'POLICY-AUDIT-001',
          violationType: 'Unauthorized Audit Submission',
          description: `Role '${actorRole}' attempted to submit inspection findings for ${record.id}.`,
          severity: 'High',
        }
      );
    }

    if (!payload.auditType || !payload.auditType.trim()) {
      errors.push('Audit / Inspection Type is required.');
    }

    if (!payload.inspector || !payload.inspector.trim()) {
      errors.push('Inspector Identity is required.');
    }

    if (!payload.auditDate) {
      errors.push('Audit Date is required.');
    }

    if (!payload.result) {
      errors.push('Audit Compliance Result is required.');
    }

    if (!payload.findings || !payload.findings.trim()) {
      errors.push('Audit Findings and observations are required.');
    }

    if (errors.length > 0) {
      return this.fail(errors);
    }

    return this.pass();
  }

  /**
   * Validate Incident Report
   */
  public static validateIncidentReport(
    record: AwsRecord | null | undefined,
    payload: {
      title?: string;
      severity?: string;
      summary?: string;
      reportDate?: string;
    },
    actorRole: UserRole
  ): ValidationResult {
    const errors: string[] = [];

    if (!record) {
      return this.fail(['Asset Not Found: The specified AWS record does not exist.']);
    }

    if (!canPerformLifecycleOperation(actorRole, 'incident_reporting')) {
      return this.fail(
        [`Unauthorized Reporter: Role '${actorRole}' cannot file official incident records.`],
        {
          policyId: 'POLICY-INCIDENT-001',
          violationType: 'Unauthorized Incident Submission',
          description: `Role '${actorRole}' attempted to log safety incident on ${record.id}.`,
          severity: 'Medium',
        }
      );
    }

    if (!payload.title || !payload.title.trim()) {
      errors.push('Incident Title is required.');
    }

    if (!payload.severity) {
      errors.push('Incident Severity classification is required.');
    }

    if (!payload.summary || !payload.summary.trim()) {
      errors.push('Incident Summary and technical observation details are required.');
    }

    if (errors.length > 0) {
      return this.fail(errors);
    }

    return this.pass();
  }

  /**
   * Validate Terminal Disposal / Decommissioning
   */
  public static validateDisposal(
    record: AwsRecord | null | undefined,
    payload: {
      disposalReference?: string;
      disposalDate?: string;
      facility?: string;
      reason?: string;
    },
    actorRole: UserRole
  ): ValidationResult {
    const errors: string[] = [];

    if (!record) {
      return this.fail(['Asset Not Found: The specified AWS record does not exist.']);
    }

    if (!canPerformLifecycleOperation(actorRole, 'disposal')) {
      return this.fail(
        [`Unauthorized Officer: Role '${actorRole}' is not authorized to sign off on terminal decommissioning.`],
        {
          policyId: 'POLICY-DISPOSAL-001',
          violationType: 'Unauthorized Disposal Signoff',
          description: `Role '${actorRole}' attempted terminal disposal signoff on ${record.id}.`,
          severity: 'High',
        }
      );
    }

    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return this.fail(
        [`Asset Already Decommissioned: AWS '${record.id}' has already completed its terminal lifecycle decommissioning.`],
        {
          policyId: 'POLICY-DISPOSAL-001',
          violationType: 'Redundant Disposal Attempt',
          description: `Disposal signoff re-attempted on already decommissioned unit ${record.id}.`,
          severity: 'Low',
        }
      );
    }

    if (!payload.disposalReference || !payload.disposalReference.trim()) {
      errors.push('Disposal Order / Decommissioning Authorization Reference is required.');
    }

    if (!payload.disposalDate) {
      errors.push('Decommissioning Date is required.');
    }

    if (!payload.facility || !payload.facility.trim()) {
      errors.push('Designated Destruction / Disposal Facility is required.');
    }

    if (!payload.reason || !payload.reason.trim()) {
      errors.push('Decommissioning Justification is required.');
    }

    if (errors.length > 0) {
      return this.fail(errors);
    }

    return this.pass();
  }
}
