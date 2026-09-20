/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * Modular Policy-Based Compliance Engine
 * 
 * IMPORTANT:
 * This engine provides deterministic, rule-based evaluation of simulated AWS records.
 * It strictly derives compliance statuses (Compliant, Non-Compliant, Requires Review, Pending)
 * based on machine-readable application governance rules without any AI/ML, LLM, or fake scores.
 */

import { AwsRecord, PolicyRule, PolicyEvaluation, PolicyEvaluationResultStatus } from '../types';

export const APPLICATION_POLICIES: PolicyRule[] = [
  {
    policyId: 'POLICY-CERT-001',
    name: 'Mandatory Safety & Compliance Certification',
    category: 'Certification',
    description: 'Autonomous systems must hold verified, active safety certification before operational progression or deployment authorization.',
    condition: 'record.certificationStatus === "Certified"',
    status: 'Active',
  },
  {
    policyId: 'POLICY-OWNER-001',
    name: 'Chain-of-Custody Provenance & Distinct Ownership',
    category: 'Ownership',
    description: 'Every ownership transfer must reference a distinct new owner differing from the previous owner and maintain a complete audit trail.',
    condition: 'transfer.previousOwner !== transfer.newOwner && record.currentOwner is verified',
    status: 'Active',
  },
  {
    policyId: 'POLICY-DEPLOY-001',
    name: 'Prerequisite Certification for Deployment Clearance',
    category: 'Deployment',
    description: 'Deployment authorization cannot be granted or maintained if safety certification is revoked, expired, or pending review.',
    condition: 'record.deploymentAuthorizationStatus !== "Authorized" || record.certificationStatus === "Certified"',
    status: 'Active',
  },
  {
    policyId: 'POLICY-USAGE-001',
    name: 'Authorized Operational Service Logging',
    category: 'Usage',
    description: 'Operational service cycles may only be logged for assets holding active deployment authorization and non-decommissioned status.',
    condition: 'usage logged only when record.deploymentAuthorizationStatus === "Authorized" and not decommissioned',
    status: 'Active',
  },
  {
    policyId: 'POLICY-DISPOSAL-001',
    name: 'Terminal Asset Decommissioning Finality',
    category: 'Disposal',
    description: 'Permanently decommissioned units cannot undergo subsequent custody transfers, deployment authorizations, or operational service cycles.',
    condition: 'if record.lifecycleStatus === "Decommissioned", no operational mutations permitted',
    status: 'Active',
  },
  {
    policyId: 'POLICY-AUDIT-001',
    name: 'Independent Regulatory Audit Verification',
    category: 'Audit',
    description: 'Active units must maintain satisfactory regulatory audit status and promptly resolve non-compliant audit findings.',
    condition: 'record.auditStatus !== "Non-Compliant"',
    status: 'Active',
  },
  {
    policyId: 'POLICY-INCIDENT-001',
    name: 'Failsafe Containment on Critical Incidents',
    category: 'Incident',
    description: 'Assets with flagged or unresolved safety incidents must enter containment review and cannot maintain unmonitored operational deployment.',
    condition: 'if record.incidentStatus === "Flagged", record must not be in unmonitored active service',
    status: 'Active',
  },
  {
    policyId: 'POLICY-IDENTITY-001',
    name: 'Canonical Identity & Genesis Enrollment',
    category: 'Identity',
    description: 'Assets must possess a canonical identifier format, registered manufacturer root identity, and valid creation timestamp.',
    condition: 'record.id matches canonical pattern && record.manufacturer is non-empty',
    status: 'Active',
  },
];

export interface AwsComplianceEvaluationReport {
  awsId: string;
  derivedStatus: 'Compliant' | 'Non-Compliant' | 'Requires Review' | 'Pending';
  overallCompliance: 'Compliant' | 'Non-Compliant' | 'Requires Review' | 'Pending';
  evaluations: PolicyEvaluation[];
  summaryMessage: string;
  passedCount: number;
  reviewCount: number;
  failedCount: number;
}

export class PolicyEngine {
  /**
   * Retrieve all configured application governance policies
   */
  public static getPolicies(): PolicyRule[] {
    return APPLICATION_POLICIES;
  }

  /**
   * Alias for getPolicies
   */
  public static getDefinedPolicies(): PolicyRule[] {
    return APPLICATION_POLICIES;
  }

  /**
   * Deterministically evaluate an individual simulated AWS record against all policies
   */
  public static evaluateAwsRecord(record: AwsRecord): AwsComplianceEvaluationReport {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    const evaluations: PolicyEvaluation[] = [];

    // 1. POLICY-IDENTITY-001: Canonical Identity
    const idPattern = /^AWS-[A-Za-z0-9-]+$/;
    if (idPattern.test(record.id) && record.manufacturer && record.manufactureDate) {
      evaluations.push({
        policyId: 'POLICY-IDENTITY-001',
        policyName: 'Canonical Identity & Genesis Enrollment',
        category: 'Identity',
        result: 'PASS',
        details: `Valid asset identifier '${record.id}' and manufacturer root identity '${record.manufacturer}' confirmed.`,
        evaluatedAt: timestamp,
      });
    } else {
      evaluations.push({
        policyId: 'POLICY-IDENTITY-001',
        policyName: 'Canonical Identity & Genesis Enrollment',
        category: 'Identity',
        result: 'FAIL',
        details: `Asset identifier format or genesis manufacturer enrollment does not meet canonical standards.`,
        evaluatedAt: timestamp,
      });
    }

    // 2. POLICY-CERT-001: Mandatory Safety Certification
    if (record.certificationStatus === 'Certified') {
      evaluations.push({
        policyId: 'POLICY-CERT-001',
        policyName: 'Mandatory Safety & Compliance Certification',
        category: 'Certification',
        result: 'PASS',
        details: `Active certification covenant '${record.certificationId}' verified.`,
        evaluatedAt: timestamp,
      });
    } else if (record.certificationStatus === 'Pending Review') {
      evaluations.push({
        policyId: 'POLICY-CERT-001',
        policyName: 'Mandatory Safety & Compliance Certification',
        category: 'Certification',
        result: 'REVIEW',
        details: `Safety covenant assessment '${record.certificationId}' is currently pending regulatory review.`,
        evaluatedAt: timestamp,
      });
    } else {
      evaluations.push({
        policyId: 'POLICY-CERT-001',
        policyName: 'Mandatory Safety & Compliance Certification',
        category: 'Certification',
        result: 'FAIL',
        details: `Safety covenant certification is revoked or invalid. Progression restricted.`,
        evaluatedAt: timestamp,
      });
    }

    // 3. POLICY-OWNER-001: Chain-of-Custody Provenance
    let ownerResult: PolicyEvaluationResultStatus = 'PASS';
    let ownerDetails = `Current owner '${record.currentOwner}' verified in chain-of-custody.`;
    if (record.ownershipHistory && record.ownershipHistory.length > 0) {
      const invalidTransfer = record.ownershipHistory.find(
        (t) => t.previousOwner.trim().toLowerCase() === t.newOwner.trim().toLowerCase()
      );
      if (invalidTransfer) {
        ownerResult = 'FAIL';
        ownerDetails = `Historical transfer '${invalidTransfer.id}' violates distinct custody rule.`;
      }
    }
    evaluations.push({
      policyId: 'POLICY-OWNER-001',
      policyName: 'Chain-of-Custody Provenance & Distinct Ownership',
      category: 'Ownership',
      result: ownerResult,
      details: ownerDetails,
      evaluatedAt: timestamp,
    });

    // 4. POLICY-DEPLOY-001: Prerequisite Certification for Deployment
    if (record.deploymentAuthorizationStatus === 'Authorized') {
      if (record.certificationStatus === 'Certified') {
        evaluations.push({
          policyId: 'POLICY-DEPLOY-001',
          policyName: 'Prerequisite Certification for Deployment Clearance',
          category: 'Deployment',
          result: 'PASS',
          details: 'Deployment authorization supported by verified active safety certification.',
          evaluatedAt: timestamp,
        });
      } else {
        evaluations.push({
          policyId: 'POLICY-DEPLOY-001',
          policyName: 'Prerequisite Certification for Deployment Clearance',
          category: 'Deployment',
          result: 'FAIL',
          details: `Violation: Asset is authorized for deployment but lacks valid certification (${record.certificationStatus}).`,
          evaluatedAt: timestamp,
        });
      }
    } else if (record.deploymentAuthorizationStatus === 'Pending') {
      evaluations.push({
        policyId: 'POLICY-DEPLOY-001',
        policyName: 'Prerequisite Certification for Deployment Clearance',
        category: 'Deployment',
        result: 'REVIEW',
        details: 'Deployment clearance application is awaiting formal consortium authorization.',
        evaluatedAt: timestamp,
      });
    } else {
      evaluations.push({
        policyId: 'POLICY-DEPLOY-001',
        policyName: 'Prerequisite Certification for Deployment Clearance',
        category: 'Deployment',
        result: 'PASS',
        details: `Deployment clearance is inactive (${record.deploymentAuthorizationStatus}); no unauthorized deployment detected.`,
        evaluatedAt: timestamp,
      });
    }

    // 5. POLICY-USAGE-001: Operational Service Logging
    if (record.usageStatus === 'Active Service') {
      if (record.deploymentAuthorizationStatus === 'Authorized' && record.lifecycleStatus !== 'Decommissioned') {
        evaluations.push({
          policyId: 'POLICY-USAGE-001',
          policyName: 'Authorized Operational Service Logging',
          category: 'Usage',
          result: 'PASS',
          details: 'Active operational service is backed by valid deployment clearance.',
          evaluatedAt: timestamp,
        });
      } else {
        evaluations.push({
          policyId: 'POLICY-USAGE-001',
          policyName: 'Authorized Operational Service Logging',
          category: 'Usage',
          result: 'FAIL',
          details: 'Active service reported without active deployment authorization.',
          evaluatedAt: timestamp,
        });
      }
    } else {
      evaluations.push({
        policyId: 'POLICY-USAGE-001',
        policyName: 'Authorized Operational Service Logging',
        category: 'Usage',
        result: 'PASS',
        details: `Asset is in reserve/standby (${record.usageStatus}); non-deployed state verified.`,
        evaluatedAt: timestamp,
      });
    }

    // 6. POLICY-DISPOSAL-001: Terminal Decommissioning Finality
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      if (record.deploymentAuthorizationStatus !== 'Authorized' && record.usageStatus === 'Decommissioned') {
        evaluations.push({
          policyId: 'POLICY-DISPOSAL-001',
          policyName: 'Terminal Asset Decommissioning Finality',
          category: 'Disposal',
          result: 'PASS',
          details: 'Decommissioned asset verified in terminal quiescent state. Operational authorizations zeroized.',
          evaluatedAt: timestamp,
        });
      } else {
        evaluations.push({
          policyId: 'POLICY-DISPOSAL-001',
          policyName: 'Terminal Asset Decommissioning Finality',
          category: 'Disposal',
          result: 'FAIL',
          details: 'Inconsistent terminal state: asset is marked decommissioned but retains active operational flags.',
          evaluatedAt: timestamp,
        });
      }
    } else {
      evaluations.push({
        policyId: 'POLICY-DISPOSAL-001',
        policyName: 'Terminal Asset Decommissioning Finality',
        category: 'Disposal',
        result: 'PASS',
        details: 'Active lifecycle asset; terminal decommissioning constraints not applicable.',
        evaluatedAt: timestamp,
      });
    }

    // 7. POLICY-AUDIT-001: Independent Regulatory Audit Verification
    if (record.auditStatus === 'Compliant') {
      evaluations.push({
        policyId: 'POLICY-AUDIT-001',
        policyName: 'Independent Regulatory Audit Verification',
        category: 'Audit',
        result: 'PASS',
        details: 'Regulatory and safety audits passed without outstanding findings.',
        evaluatedAt: timestamp,
      });
    } else if (record.auditStatus === 'Pending' || record.auditStatus === 'Under Audit') {
      evaluations.push({
        policyId: 'POLICY-AUDIT-001',
        policyName: 'Independent Regulatory Audit Verification',
        category: 'Audit',
        result: 'REVIEW',
        details: `Asset is currently under inspection (${record.auditStatus}). Final sign-off pending.`,
        evaluatedAt: timestamp,
      });
    } else {
      evaluations.push({
        policyId: 'POLICY-AUDIT-001',
        policyName: 'Independent Regulatory Audit Verification',
        category: 'Audit',
        result: 'FAIL',
        details: 'Audit report flagged unaddressed non-compliance or safety violation.',
        evaluatedAt: timestamp,
      });
    }

    // 8. POLICY-INCIDENT-001: Failsafe Containment on Critical Incidents
    if (record.incidentStatus === 'Flagged') {
      evaluations.push({
        policyId: 'POLICY-INCIDENT-001',
        policyName: 'Failsafe Containment on Critical Incidents',
        category: 'Incident',
        result: 'REVIEW',
        details: 'Active safety incident flagged on asset. Requires containment audit and inspectorate review.',
        evaluatedAt: timestamp,
      });
    } else if (record.incidentStatus === 'Under Review') {
      evaluations.push({
        policyId: 'POLICY-INCIDENT-001',
        policyName: 'Failsafe Containment on Critical Incidents',
        category: 'Incident',
        result: 'REVIEW',
        details: 'Incident investigation in progress. Asset telemetry under containment inspection.',
        evaluatedAt: timestamp,
      });
    } else {
      evaluations.push({
        policyId: 'POLICY-INCIDENT-001',
        policyName: 'Failsafe Containment on Critical Incidents',
        category: 'Incident',
        result: 'PASS',
        details: 'No open safety incidents or containment triggers active.',
        evaluatedAt: timestamp,
      });
    }

    // Compute Derived Compliance Status (Compliant, Non-Compliant, Requires Review, Pending)
    const passedCount = evaluations.filter((e) => e.result === 'PASS').length;
    const failedCount = evaluations.filter((e) => e.result === 'FAIL').length;
    const reviewCount = evaluations.filter((e) => e.result === 'REVIEW').length;

    let derivedStatus: 'Compliant' | 'Non-Compliant' | 'Requires Review' | 'Pending' = 'Compliant';
    let summaryMessage = 'All applicable governance policies passed.';

    if (record.lifecycleStatus === 'Manufacturing & Certification' && record.certificationStatus === 'Pending Review') {
      derivedStatus = 'Pending';
      summaryMessage = 'Initial enrollment in progress. Regulatory safety evaluation pending.';
    } else if (failedCount > 0) {
      derivedStatus = 'Non-Compliant';
      summaryMessage = `${failedCount} policy condition(s) failed evaluation. Remediation required.`;
    } else if (reviewCount > 0) {
      derivedStatus = 'Requires Review';
      summaryMessage = `${reviewCount} policy condition(s) require inspectorate or regulatory review.`;
    } else {
      derivedStatus = 'Compliant';
      summaryMessage = 'Asset complies with all evaluated application governance policies.';
    }

    return {
      awsId: record.id,
      derivedStatus,
      overallCompliance: derivedStatus,
      evaluations,
      summaryMessage,
      passedCount,
      reviewCount,
      failedCount,
    };
  }

  /**
   * Evaluate all records in the registry fleet
   */
  public static evaluateFleet(records: AwsRecord[]) {
    const reports = records.map((r) => this.evaluateAwsRecord(r));

    const compliantCount = reports.filter((r) => r.derivedStatus === 'Compliant').length;
    const nonCompliantCount = reports.filter((r) => r.derivedStatus === 'Non-Compliant').length;
    const reviewCount = reports.filter((r) => r.derivedStatus === 'Requires Review').length;
    const pendingCount = reports.filter((r) => r.derivedStatus === 'Pending').length;

    return {
      total: records.length,
      compliantCount,
      nonCompliantCount,
      reviewCount,
      pendingCount,
      reports,
    };
  }
}
