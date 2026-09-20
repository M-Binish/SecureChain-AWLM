/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * APPLICATION DATA LAYER & PERSISTENT STORAGE
 * 
 * Architecture:
 * UI Components -> Application / API Layer (DataService) -> Validation Layer (ValidationService)
 * -> Policy / Compliance Engine (PolicyEngine) -> Local Persistent Storage
 * 
 * Enforces business rules:
 * - Role-based authorization for each of the 7 lifecycle operations
 * - Reusable, centralized data validation and lifecycle transition constraints
 * - Automated detection of predefined policy violations into the persistent Violation Log
 * - Chain-of-custody ownership history with strict validation
 * - Terminal state lock: Disposed AWS records cannot undergo further state transitions
 * - Durable persistence across page reloads via localStorage abstraction
 */

import {
  AwsRecord,
  LifecycleEvent,
  LifecycleTransaction,
  AuditRecord,
  IncidentRecord,
  ViolationRecord,
  OwnershipTransferRecord,
  UserRole,
  CertificationStatus,
  OverallLifecycleStatus,
  AuditLifecycleStatus,
} from '../types';
import {
  DEMO_AWS_RECORDS,
  DEMO_TRANSACTIONS,
  DEMO_AUDIT_RECORDS,
  DEMO_INCIDENTS,
  DEMO_VIOLATIONS,
} from '../data/mockData';
import { canPerformLifecycleOperation } from '../utils/permissions';
import { ValidationService } from './validationService';
import { PolicyEngine } from './policyEngine';

const STORAGE_KEY = 'securechain_awlm_db_v3';

interface StoredDatabase {
  awsRecords: AwsRecord[];
  transactions: LifecycleTransaction[];
  auditRecords: AuditRecord[];
  incidentRecords: IncidentRecord[];
  violations: ViolationRecord[];
}

function loadDatabase(): StoredDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredDatabase;
      if (parsed && Array.isArray(parsed.awsRecords) && parsed.awsRecords.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load persisted database, falling back to defaults:', err);
  }

  // Initialize with clean mock datasets
  const initial: StoredDatabase = {
    awsRecords: DEMO_AWS_RECORDS,
    transactions: DEMO_TRANSACTIONS,
    auditRecords: DEMO_AUDIT_RECORDS,
    incidentRecords: DEMO_INCIDENTS,
    violations: DEMO_VIOLATIONS,
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: StoredDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
}

function generateId(prefix: string): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomSuffix}`;
}

export const DataService = {
  getAwsRecords(): AwsRecord[] {
    const db = loadDatabase();
    return db.awsRecords;
  },

  getAwsRecordById(id: string): AwsRecord | null {
    const db = loadDatabase();
    return db.awsRecords.find((r) => r.id === id) || null;
  },

  getTransactions(): LifecycleTransaction[] {
    const db = loadDatabase();
    return db.transactions;
  },

  getAuditRecords(): AuditRecord[] {
    const db = loadDatabase();
    return db.auditRecords;
  },

  getIncidentRecords(): IncidentRecord[] {
    const db = loadDatabase();
    return db.incidentRecords;
  },

  getViolations(): ViolationRecord[] {
    const db = loadDatabase();
    return db.violations;
  },

  resetToDefaults(): void {
    const initial: StoredDatabase = {
      awsRecords: DEMO_AWS_RECORDS,
      transactions: DEMO_TRANSACTIONS,
      auditRecords: DEMO_AUDIT_RECORDS,
      incidentRecords: DEMO_INCIDENTS,
      violations: DEMO_VIOLATIONS,
    };
    saveDatabase(initial);
  },

  /**
   * Helper to log an automated violation into persistent storage
   */
  logAutomatedViolation(
    awsId: string,
    policyId: string,
    violationType: string,
    severity: 'High' | 'Medium' | 'Low',
    description: string,
    triggeredBy: string,
    role: UserRole
  ): ViolationRecord {
    const db = loadDatabase();
    const violation: ViolationRecord = {
      id: generateId('VIO'),
      awsId,
      policyId,
      violationType,
      severity,
      description,
      detectedDate: getTimestamp(),
      detectedBy: 'Automated Policy Engine',
      triggeredBy,
      role,
      status: 'Open',
    };

    db.violations.unshift(violation);
    saveDatabase(db);
    return violation;
  },

  /**
   * Update status of an automated violation (Under Review, Resolved)
   */
  updateViolationStatus(
    violationId: string,
    status: 'Open' | 'Under Review' | 'Resolved',
    resolutionNotes?: string
  ): { success: boolean; violation?: ViolationRecord; error?: string } {
    const db = loadDatabase();
    const index = db.violations.findIndex((v) => v.id === violationId);
    if (index === -1) {
      return { success: false, error: `Violation '${violationId}' not found.` };
    }

    db.violations[index] = {
      ...db.violations[index],
      status,
      resolutionNotes: resolutionNotes || db.violations[index].resolutionNotes,
    };
    saveDatabase(db);
    return { success: true, violation: db.violations[index] };
  },

  /**
   * Create an official incident report from an automated policy violation
   * (Keep distinction clear between automated violations and operational incidents)
   */
  createIncidentFromViolation(
    violationId: string,
    actorRole: UserRole,
    actorName: string,
    customTitle?: string
  ): { success: boolean; incident?: IncidentRecord; error?: string } {
    const db = loadDatabase();
    const violation = db.violations.find((v) => v.id === violationId);
    if (!violation) {
      return { success: false, error: `Violation '${violationId}' not found.` };
    }

    const incId = generateId('INC');
    const timestamp = getTimestamp();

    const incident: IncidentRecord = {
      id: incId,
      awsId: violation.awsId,
      title: customTitle || `Escalated Incident: ${violation.violationType}`,
      severity: violation.severity === 'High' ? 'Critical' : violation.severity === 'Medium' ? 'Major' : 'Minor',
      reportedBy: actorRole,
      reportDate: timestamp.substring(0, 10),
      status: 'Under Review',
      summary: `Automated violation (${violation.id}) escalated to formal incident investigation. Description: ${violation.description}`,
      resolutionNotes: `Initiated by ${actorName} (${actorRole}). Linked to Policy: ${violation.policyId}.`,
    };

    // Update violation with relatedIncidentId
    violation.relatedIncidentId = incId;
    violation.status = 'Under Review';

    // Update target AWS record incident status if asset found
    const awsIndex = db.awsRecords.findIndex((r) => r.id === violation.awsId);
    if (awsIndex !== -1) {
      const aws = db.awsRecords[awsIndex];
      const newEvent: LifecycleEvent = {
        id: generateId('EVT-INC'),
        stage: 'Incident Reporting',
        isConditional: true,
        title: `INCIDENT ESCALATION: ${violation.violationType}`,
        timestamp,
        actor: actorName,
        actorRole,
        status: 'Flagged',
        details: `Automated policy violation '${violation.id}' escalated to formal incident '${incId}'.`,
        recordIdentifier: incId,
        notes: `Policy Reference: ${violation.policyId}`,
      };

      db.awsRecords[awsIndex] = {
        ...aws,
        incidentStatus: 'Flagged',
        lifecycleStatus: 'Incident Flagged',
        auditStatus: 'Requires Review',
        lastUpdated: timestamp,
        lifecycleHistory: [...aws.lifecycleHistory, newEvent],
      };
    }

    db.incidentRecords.unshift(incident);
    saveDatabase(db);

    return { success: true, incident };
  },

  // =========================================================================
  // 1. MANUFACTURING & CERTIFICATION
  // =========================================================================
  registerAwsRecord(
    payload: {
      id: string;
      systemClassification: string;
      manufacturer: string;
      manufactureDate: string;
      certificationStatus: CertificationStatus;
      certificationReference: string;
      notes?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    const db = loadDatabase();

    // Centralized validation layer
    const validation = ValidationService.validateRegistration(
      {
        id: payload.id,
        systemName: payload.id,
        manufacturer: payload.manufacturer,
        manufactureDate: payload.manufactureDate,
        certificationId: payload.certificationReference,
        certificationStatus: payload.certificationStatus,
        systemType: payload.systemClassification,
      },
      db.awsRecords,
      actorRole
    );

    if (!validation.isValid) {
      if (validation.violation) {
        this.logAutomatedViolation(
          payload.id || 'UNASSIGNED',
          validation.violation.policyId,
          validation.violation.violationType,
          validation.violation.severity,
          validation.violation.description,
          actorName,
          actorRole
        );
      }
      return { success: false, error: validation.errors.join(' ') };
    }

    const trimmedId = payload.id.trim().toUpperCase();
    const timestamp = getTimestamp();
    const isCertified = payload.certificationStatus === 'Certified';

    const events: LifecycleEvent[] = [
      {
        id: generateId('EVT-MFG-CERT'),
        stage: 'Manufacturing & Certification',
        title: isCertified
          ? 'Manufacturing Enrollment & Safety Certification'
          : 'Manufacturing Enrollment & Certification Submitted',
        timestamp,
        actor: actorName,
        actorRole,
        status: isCertified ? 'Completed' : 'Pending',
        details: `Hardware identity enrolled by ${payload.manufacturer || 'Manufacturer'}. Classification: ${payload.systemClassification}. Certification ref: ${payload.certificationReference}.`,
        recordIdentifier: `REC-MFG-CERT-${trimmedId.replace('AWS-', '')}`,
        notes: payload.notes,
      },
    ];

    const newRecord: AwsRecord = {
      id: trimmedId,
      systemName: `${trimmedId} (Simulated Unit)`,
      manufacturer: payload.manufacturer || 'Manufacturer',
      manufactureDate: payload.manufactureDate || timestamp.substring(0, 10),
      certificationId: payload.certificationReference || `CERT-${trimmedId.replace('AWS-', '')}`,
      certificationStatus: payload.certificationStatus,
      currentOwner: payload.manufacturer || 'Manufacturer',
      lifecycleStatus: isCertified ? 'Certified' : 'Manufacturing & Certification',
      deploymentAuthorizationStatus: 'Pending',
      usageStatus: 'In Reserve',
      auditStatus: isCertified ? 'Compliant' : 'Pending',
      incidentStatus: 'No Incidents',
      disposalStatus: 'Not Scheduled',
      createdTimestamp: timestamp,
      lastUpdated: timestamp,
      systemType: payload.systemClassification || 'Simulated Autonomous System',
      complianceStatus: isCertified ? 'Compliant' : 'Pending',
      notes: payload.notes,
      lifecycleHistory: events,
      ownershipHistory: [],
    };

    // Re-evaluate compliance status with PolicyEngine
    const report = PolicyEngine.evaluateAwsRecord(newRecord);
    newRecord.complianceStatus = report.derivedStatus;

    const newTx: LifecycleTransaction = {
      id: generateId('TX-MFG'),
      awsId: trimmedId,
      operation: 'Genesis Asset Enrollment & Certification Logged',
      stakeholder: actorName,
      stakeholderRole: actorRole,
      status: 'Completed',
      timestamp,
      transactionRef: `LOG-TX-${Date.now().toString().slice(-6)}`,
    };

    db.awsRecords.unshift(newRecord);
    db.transactions.unshift(newTx);
    saveDatabase(db);

    return { success: true, record: newRecord };
  },

  /**
   * Review Certification & Safety Covenant Decision (Phase 5 Section 13 Requirements)
   */
  reviewCertification(
    awsId: string,
    payload: {
      decision: 'Approve' | 'Reject' | 'Revoke' | 'Resubmit';
      certificationId?: string;
      notes?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    if (index === -1) {
      return { success: false, error: `AWS Asset '${awsId}' not found in registry.` };
    }

    const currentRecord = db.awsRecords[index];

    // Centralized validation
    const validation = ValidationService.validateCertificationReview(currentRecord, payload, actorRole);
    if (!validation.isValid) {
      if (validation.violation) {
        this.logAutomatedViolation(
          awsId,
          validation.violation.policyId,
          validation.violation.violationType,
          validation.violation.severity,
          validation.violation.description,
          actorName,
          actorRole
        );
      }
      return { success: false, error: validation.errors.join(' ') };
    }

    const timestamp = getTimestamp();
    let newCertStatus: CertificationStatus;
    let newLifecycleStatus = currentRecord.lifecycleStatus;
    let eventTitle: string;
    let eventDetails: string;
    const certId = payload.certificationId || currentRecord.certificationId;

    if (payload.decision === 'Approve') {
      newCertStatus = 'Certified';
      newLifecycleStatus = currentRecord.lifecycleStatus === 'Manufacturing & Certification' ? 'Certified' : currentRecord.lifecycleStatus;
      eventTitle = 'Regulatory Safety Covenant: Approved & Certified';
      eventDetails = `Statutory safety certification granted by ${actorName} (${actorRole}). Certification ID: ${certId}. Covenant attested.`;
    } else if (payload.decision === 'Reject') {
      newCertStatus = 'Rejected';
      eventTitle = 'Regulatory Safety Covenant: Rejected';
      eventDetails = `Certification submission rejected by ${actorName} (${actorRole}). Findings: ${payload.notes || 'Non-compliant with safety baseline standards.'}`;
    } else if (payload.decision === 'Revoke') {
      newCertStatus = 'Revoked';
      eventTitle = 'Regulatory Safety Covenant: Revoked';
      eventDetails = `Safety certification revoked by ${actorName} (${actorRole}). Grounds: ${payload.notes || 'Safety covenant non-compliance.'}`;
    } else {
      // Resubmit
      newCertStatus = 'Pending Review';
      eventTitle = 'Safety Certification: Formal Re-Submission';
      eventDetails = `Manufacturer (${actorName}) resubmitted certification request for regulatory covenant review. Notes: ${payload.notes || 'Corrective measures applied.'}`;
    }

    const newEvent: LifecycleEvent = {
      id: generateId('EVT-CERT-REV'),
      stage: 'Manufacturing & Certification',
      title: eventTitle,
      timestamp,
      actor: actorName,
      actorRole,
      status: payload.decision === 'Approve' ? 'Completed' : payload.decision === 'Reject' || payload.decision === 'Revoke' ? 'Flagged' : 'Pending',
      details: eventDetails,
      recordIdentifier: `REC-CERT-${payload.decision.toUpperCase()}-${awsId.replace('AWS-', '')}`,
      notes: payload.notes,
    };

    const updatedRecord: AwsRecord = {
      ...currentRecord,
      certificationId: certId,
      certificationStatus: newCertStatus,
      lifecycleStatus: newLifecycleStatus,
      lastUpdated: timestamp,
      lifecycleHistory: [...currentRecord.lifecycleHistory, newEvent],
    };

    // Re-evaluate compliance with PolicyEngine
    const report = PolicyEngine.evaluateAwsRecord(updatedRecord);
    updatedRecord.complianceStatus = report.derivedStatus;
    updatedRecord.violationCount = report.failedCount;

    const newTx: LifecycleTransaction = {
      id: generateId('TX-CERT-REV'),
      awsId,
      operation: `Safety Certification Decision: ${payload.decision}`,
      stakeholder: actorName,
      stakeholderRole: actorRole,
      status: payload.decision === 'Approve' ? 'Completed' : payload.decision === 'Resubmit' ? 'Pending Review' : 'Flagged',
      timestamp,
      transactionRef: `LOG-CERT-${Date.now().toString().slice(-6)}`,
    };

    db.awsRecords[index] = updatedRecord;
    db.transactions.unshift(newTx);
    saveDatabase(db);

    return { success: true, record: updatedRecord };
  },

  // =========================================================================
  // 2. OWNERSHIP TRANSFER (PHASE 4 SECTION 1 REQUIREMENTS)
  // =========================================================================
  transferOwnership(
    awsId: string,
    payload: {
      newOwner: string;
      transferDate: string;
      reason: string;
      approvalStatus: 'Approved' | 'In Transit' | 'Completed';
      notes?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    const record = index !== -1 ? db.awsRecords[index] : null;

    // Centralized validation layer
    const validation = ValidationService.validateOwnershipTransfer(record, payload, actorRole);
    if (!validation.isValid) {
      if (validation.violation) {
        this.logAutomatedViolation(
          awsId,
          validation.violation.policyId,
          validation.violation.violationType,
          validation.violation.severity,
          validation.violation.description,
          actorName,
          actorRole
        );
      }
      return { success: false, error: validation.errors.join(' ') };
    }

    if (!record) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const prevOwner = record.currentOwner;
    const timestamp = getTimestamp();
    const isCompleted = payload.approvalStatus !== 'In Transit';

    // Model dedicated OwnershipTransferRecord
    const transferRecord: OwnershipTransferRecord = {
      id: generateId('TRF'),
      awsId,
      previousOwner: prevOwner,
      newOwner: payload.newOwner,
      transferDate: payload.transferDate,
      transferStatus: isCompleted ? 'Completed' : 'In Progress',
      recordedBy: actorName,
      recordedByRole: actorRole,
      reason: payload.reason,
      notes: payload.notes,
    };

    const newEvent: LifecycleEvent = {
      id: generateId('EVT-TRF'),
      stage: 'Ownership Transfer',
      title: `Ownership Transfer: ${prevOwner} → ${payload.newOwner}`,
      timestamp,
      actor: actorName,
      actorRole,
      status: isCompleted ? 'Completed' : 'In Progress',
      details: `Custody transition authorized. Reason: ${payload.reason}. Previous: ${prevOwner}, New: ${payload.newOwner}.`,
      recordIdentifier: transferRecord.id,
      notes: payload.notes,
    };

    // The AWS current owner must always equal the New Owner of the latest valid completed transfer
    const updatedOwner = isCompleted ? payload.newOwner : record.currentOwner;
    const nextLifecycleStatus = isCompleted
      ? record.lifecycleStatus === 'In Transit'
        ? 'Active Service'
        : record.lifecycleStatus
      : 'In Transit';

    const existingHistory = record.ownershipHistory || [];

    const updatedRecord: AwsRecord = {
      ...record,
      currentOwner: updatedOwner,
      lifecycleStatus: nextLifecycleStatus,
      lastUpdated: timestamp,
      lifecycleHistory: [...record.lifecycleHistory, newEvent],
      ownershipHistory: [...existingHistory, transferRecord],
    };

    // Recalculate compliance status with PolicyEngine
    const report = PolicyEngine.evaluateAwsRecord(updatedRecord);
    updatedRecord.complianceStatus = report.derivedStatus;

    const newTx: LifecycleTransaction = {
      id: generateId('TX-TRF'),
      awsId,
      operation: `Custody Transfer Logged (${prevOwner} → ${payload.newOwner})`,
      stakeholder: actorName,
      stakeholderRole: actorRole,
      status: 'Completed',
      timestamp,
      transactionRef: `LOG-TX-${Date.now().toString().slice(-6)}`,
    };

    db.awsRecords[index] = updatedRecord;
    db.transactions.unshift(newTx);
    saveDatabase(db);

    return { success: true, record: updatedRecord };
  },

  // =========================================================================
  // 3. DEPLOYMENT AUTHORIZATION
  // =========================================================================
  authorizeDeployment(
    awsId: string,
    payload: {
      authorizationStatus: 'Authorized' | 'Pending' | 'Expired' | 'Revoked';
      authorizationDate: string;
      authorizedBy: string;
      validUntil?: string;
      notes?: string;
      operationalDomain?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    const record = index !== -1 ? db.awsRecords[index] : null;

    const validation = ValidationService.validateDeploymentAuthorization(
      record,
      {
        authorizationStatus: payload.authorizationStatus,
        authorizationReference: `AUTH-${awsId.replace('AWS-', '')}-${Date.now().toString().slice(-4)}`,
        authorizedDate: payload.authorizationDate,
        expiryDate: payload.validUntil,
        operationalDomain: payload.operationalDomain || 'Designated Corridors',
        notes: payload.notes,
      },
      actorRole
    );

    if (!validation.isValid) {
      if (validation.violation) {
        this.logAutomatedViolation(
          awsId,
          validation.violation.policyId,
          validation.violation.violationType,
          validation.violation.severity,
          validation.violation.description,
          actorName,
          actorRole
        );
      }
      return { success: false, error: validation.errors.join(' ') };
    }

    if (!record) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const timestamp = getTimestamp();
    const isAuthorized = payload.authorizationStatus === 'Authorized';

    const newEvent: LifecycleEvent = {
      id: generateId('EVT-AUTH'),
      stage: 'Deployment Authorization',
      title: `Deployment Status Updated: ${payload.authorizationStatus}`,
      timestamp,
      actor: payload.authorizedBy || actorName,
      actorRole,
      status: isAuthorized ? 'Completed' : 'Pending',
      details: `Sovereign deployment statutory status recorded as '${payload.authorizationStatus}'. Valid until: ${payload.validUntil || 'Indefinite'}.`,
      recordIdentifier: `REC-AUTH-${Date.now().toString().slice(-6)}`,
      notes: payload.notes,
    };

    const nextLifecycleStatus: OverallLifecycleStatus = isAuthorized
      ? 'Deployed'
      : payload.authorizationStatus === 'Pending'
      ? record.lifecycleStatus
      : 'Under Audit';

    const updatedRecord: AwsRecord = {
      ...record,
      deploymentAuthorizationStatus: payload.authorizationStatus,
      lifecycleStatus: nextLifecycleStatus,
      lastUpdated: timestamp,
      lifecycleHistory: [...record.lifecycleHistory, newEvent],
    };

    // Re-evaluate compliance
    const report = PolicyEngine.evaluateAwsRecord(updatedRecord);
    updatedRecord.complianceStatus = report.derivedStatus;

    const newTx: LifecycleTransaction = {
      id: generateId('TX-AUTH'),
      awsId,
      operation: `Deployment Authorization Updated (${payload.authorizationStatus})`,
      stakeholder: payload.authorizedBy || actorName,
      stakeholderRole: actorRole,
      status: isAuthorized ? 'Completed' : 'Pending Review',
      timestamp,
      transactionRef: `LOG-TX-${Date.now().toString().slice(-6)}`,
    };

    db.awsRecords[index] = updatedRecord;
    db.transactions.unshift(newTx);
    saveDatabase(db);

    return { success: true, record: updatedRecord };
  },

  // =========================================================================
  // 4. USAGE TRACKING (RECURRENT)
  // =========================================================================
  recordUsageEvent(
    awsId: string,
    payload: {
      usageEventId?: string;
      usageDate: string;
      usageStatus: 'Active Service' | 'In Reserve' | 'Standby' | 'Routine Maintenance';
      recordedBy: string;
      notes?: string;
      operationalLocation?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    const record = index !== -1 ? db.awsRecords[index] : null;

    const validation = ValidationService.validateUsageTracking(
      record,
      {
        eventType: payload.usageStatus,
        operationalLocation: payload.operationalLocation || 'Operational Facility Alpha',
        timestamp: payload.usageDate || getTimestamp(),
        missionReadinessStatus: 'Nominal',
        notes: payload.notes,
      },
      actorRole
    );

    if (!validation.isValid) {
      if (validation.violation) {
        this.logAutomatedViolation(
          awsId,
          validation.violation.policyId,
          validation.violation.violationType,
          validation.violation.severity,
          validation.violation.description,
          actorName,
          actorRole
        );
      }
      return { success: false, error: validation.errors.join(' ') };
    }

    if (!record) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const timestamp = getTimestamp();
    const prevUsageEvents = record.lifecycleHistory.filter(
      (e) => e.stage === 'Usage Tracking' || (e.stage as string) === 'Usage'
    );
    const nextIteration = prevUsageEvents.length + 1;
    const usageEvtId = payload.usageEventId || generateId('USE');

    const newEvent: LifecycleEvent = {
      id: generateId('EVT-USE'),
      stage: 'Usage Tracking',
      iteration: nextIteration,
      title: `Operational Service Cycle #${nextIteration}`,
      timestamp,
      actor: payload.recordedBy || actorName,
      actorRole,
      status: 'Completed',
      details: `Simulated operational cycle recorded (${payload.usageStatus}). Usage event ref: ${usageEvtId}. Operational integrity verified.`,
      recordIdentifier: `REC-USE-${nextIteration}-${Date.now().toString().slice(-4)}`,
      notes: payload.notes,
    };

    const updatedRecord: AwsRecord = {
      ...record,
      usageStatus: payload.usageStatus === 'Routine Maintenance' ? 'Standby' : payload.usageStatus,
      lifecycleStatus: payload.usageStatus === 'Active Service' ? 'Active Service' : record.lifecycleStatus,
      lastUpdated: timestamp,
      lifecycleHistory: [...record.lifecycleHistory, newEvent],
    };

    const report = PolicyEngine.evaluateAwsRecord(updatedRecord);
    updatedRecord.complianceStatus = report.derivedStatus;

    const newTx: LifecycleTransaction = {
      id: generateId('TX-USE'),
      awsId,
      operation: `Operational Service Cycle #${nextIteration} Recorded`,
      stakeholder: payload.recordedBy || actorName,
      stakeholderRole: actorRole,
      status: 'Completed',
      timestamp,
      transactionRef: `LOG-TX-${Date.now().toString().slice(-6)}`,
    };

    db.awsRecords[index] = updatedRecord;
    db.transactions.unshift(newTx);
    saveDatabase(db);

    return { success: true, record: updatedRecord };
  },

  // =========================================================================
  // 5. AUDIT & COMPLIANCE (RECURRENT)
  // =========================================================================
  recordAuditEvent(
    awsId: string,
    payload: {
      auditDate: string;
      auditStatus: 'Compliant' | 'Non-Compliant' | 'Requires Review' | 'Pending';
      auditedBy: string;
      auditType: 'Periodic Safety Inspection' | 'Algorithmic Boundary Review' | 'Post-Incident Review' | 'Chain-of-Custody Audit';
      findings: string;
      notes?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    const record = index !== -1 ? db.awsRecords[index] : null;

    const validation = ValidationService.validateAuditEvent(
      record,
      {
        auditType: payload.auditType,
        inspector: payload.auditedBy || actorName,
        auditDate: payload.auditDate,
        result: payload.auditStatus,
        findings: payload.findings,
      },
      actorRole
    );

    if (!validation.isValid) {
      if (validation.violation) {
        this.logAutomatedViolation(
          awsId,
          validation.violation.policyId,
          validation.violation.violationType,
          validation.violation.severity,
          validation.violation.description,
          actorName,
          actorRole
        );
      }
      return { success: false, error: validation.errors.join(' ') };
    }

    if (!record) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const timestamp = getTimestamp();
    const prevAuditEvents = record.lifecycleHistory.filter((e) => e.stage === 'Audit & Compliance');
    const nextIteration = prevAuditEvents.length + 1;

    const isCompliant = payload.auditStatus === 'Compliant';
    const isNonCompliant = payload.auditStatus === 'Non-Compliant';

    const newEvent: LifecycleEvent = {
      id: generateId('EVT-AUD'),
      stage: 'Audit & Compliance',
      iteration: nextIteration,
      title: `${payload.auditType} #${nextIteration}`,
      timestamp,
      actor: payload.auditedBy || actorName,
      actorRole,
      status: isCompliant ? 'Completed' : isNonCompliant ? 'Flagged' : 'Pending',
      details: `Compliance review completed. Status: ${payload.auditStatus}. Findings: ${payload.findings}`,
      recordIdentifier: `REC-AUD-${nextIteration}-${Date.now().toString().slice(-4)}`,
      notes: payload.notes,
    };

    const newAuditRecord: AuditRecord = {
      id: generateId('AUD'),
      awsId,
      auditType: payload.auditType,
      inspector: payload.auditedBy || actorName,
      inspectorRole: actorRole,
      date: payload.auditDate || timestamp.substring(0, 10),
      complianceStatus: payload.auditStatus,
      findings: payload.findings,
      result: isCompliant ? 'Passed' : isNonCompliant ? 'Action Required' : 'Flagged for Review',
    };

    const updatedRecord: AwsRecord = {
      ...record,
      auditStatus: payload.auditStatus as AuditLifecycleStatus,
      lifecycleStatus: isNonCompliant ? 'Under Audit' : record.lifecycleStatus,
      lastUpdated: timestamp,
      lifecycleHistory: [...record.lifecycleHistory, newEvent],
    };

    // Re-evaluate compliance
    const report = PolicyEngine.evaluateAwsRecord(updatedRecord);
    updatedRecord.complianceStatus = report.derivedStatus;

    const newTx: LifecycleTransaction = {
      id: generateId('TX-AUD'),
      awsId,
      operation: `Independent Audit Completed (${payload.auditStatus})`,
      stakeholder: payload.auditedBy || actorName,
      stakeholderRole: actorRole,
      status: isCompliant ? 'Completed' : 'Flagged',
      timestamp,
      transactionRef: `LOG-TX-${Date.now().toString().slice(-6)}`,
    };

    db.awsRecords[index] = updatedRecord;
    db.transactions.unshift(newTx);
    db.auditRecords.unshift(newAuditRecord);
    saveDatabase(db);

    return { success: true, record: updatedRecord };
  },

  // =========================================================================
  // 6. INCIDENT REPORTING (CONDITIONAL)
  // =========================================================================
  recordIncident(
    awsId: string,
    payload: {
      incidentId?: string;
      incidentDate: string;
      incidentType: string;
      severity: 'Critical' | 'Major' | 'Minor';
      reportedBy: string;
      description: string;
      status: 'Pending Audit' | 'Under Review' | 'Closed';
      resolutionNotes?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    const record = index !== -1 ? db.awsRecords[index] : null;

    const validation = ValidationService.validateIncidentReport(
      record,
      {
        title: payload.incidentType,
        severity: payload.severity,
        summary: payload.description,
        reportDate: payload.incidentDate,
      },
      actorRole
    );

    if (!validation.isValid) {
      if (validation.violation) {
        this.logAutomatedViolation(
          awsId,
          validation.violation.policyId,
          validation.violation.violationType,
          validation.violation.severity,
          validation.violation.description,
          actorName,
          actorRole
        );
      }
      return { success: false, error: validation.errors.join(' ') };
    }

    if (!record) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const timestamp = getTimestamp();
    const incId = payload.incidentId || generateId('INC');

    const newEvent: LifecycleEvent = {
      id: generateId('EVT-INC'),
      stage: 'Incident Reporting',
      isConditional: true,
      title: `INCIDENT: ${payload.incidentType} (${payload.severity})`,
      timestamp,
      actor: payload.reportedBy || actorName,
      actorRole,
      status: 'Flagged',
      details: payload.description,
      recordIdentifier: incId,
      notes: payload.resolutionNotes || 'Failsafe review protocol initiated.',
    };

    const newIncident: IncidentRecord = {
      id: incId,
      awsId,
      title: `${payload.incidentType} (${payload.severity})`,
      severity: payload.severity,
      reportedBy: actorRole,
      reportDate: payload.incidentDate || timestamp.substring(0, 10),
      status: payload.status,
      summary: payload.description,
      resolutionNotes: payload.resolutionNotes,
    };

    const updatedRecord: AwsRecord = {
      ...record,
      incidentStatus: 'Flagged',
      lifecycleStatus: payload.severity === 'Critical' || payload.severity === 'Major' ? 'Incident Flagged' : record.lifecycleStatus,
      auditStatus: 'Requires Review',
      lastUpdated: timestamp,
      lifecycleHistory: [...record.lifecycleHistory, newEvent],
    };

    const report = PolicyEngine.evaluateAwsRecord(updatedRecord);
    updatedRecord.complianceStatus = report.derivedStatus;

    const newTx: LifecycleTransaction = {
      id: generateId('TX-INC'),
      awsId,
      operation: `Incident Exception Logged (${payload.severity})`,
      stakeholder: payload.reportedBy || actorName,
      stakeholderRole: actorRole,
      status: 'Flagged',
      timestamp,
      transactionRef: `LOG-TX-${Date.now().toString().slice(-6)}`,
    };

    db.awsRecords[index] = updatedRecord;
    db.transactions.unshift(newTx);
    db.incidentRecords.unshift(newIncident);
    saveDatabase(db);

    return { success: true, record: updatedRecord };
  },

  // =========================================================================
  // 7. DISPOSAL (TERMINAL)
  // =========================================================================
  recordDisposal(
    awsId: string,
    payload: {
      disposalDate: string;
      disposalStatus: 'Pending Disposal' | 'Decommissioned';
      authorizedBy: string;
      disposalReference: string;
      facility?: string;
      reason?: string;
      notes?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    const record = index !== -1 ? db.awsRecords[index] : null;

    const validation = ValidationService.validateDisposal(
      record,
      {
        disposalReference: payload.disposalReference,
        disposalDate: payload.disposalDate,
        facility: payload.facility || 'Demilitarization Facility Omega',
        reason: payload.reason || payload.notes || 'End-of-life retirement',
      },
      actorRole
    );

    if (!validation.isValid) {
      if (validation.violation) {
        this.logAutomatedViolation(
          awsId,
          validation.violation.policyId,
          validation.violation.violationType,
          validation.violation.severity,
          validation.violation.description,
          actorName,
          actorRole
        );
      }
      return { success: false, error: validation.errors.join(' ') };
    }

    if (!record) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const timestamp = getTimestamp();
    const isFinalDecommission = payload.disposalStatus === 'Decommissioned';

    const newEvent: LifecycleEvent = {
      id: generateId('EVT-DISP'),
      stage: 'Disposal',
      title: isFinalDecommission
        ? 'Permanent Demilitarization & Zeroization'
        : 'Decommissioning Order & Neutralization Notice',
      timestamp,
      actor: payload.authorizedBy || actorName,
      actorRole,
      status: isFinalDecommission ? 'Completed' : 'Pending',
      details: isFinalDecommission
        ? `Demilitarization complete. Cryptographic root-of-trust zeroized. Ref: ${payload.disposalReference}. Digital record closed.`
        : `Disposal order approved. Awaiting final demilitarization bench sign-off. Ref: ${payload.disposalReference}.`,
      recordIdentifier: payload.disposalReference || `REC-DISP-${Date.now().toString().slice(-4)}`,
      notes: payload.notes,
    };

    const updatedRecord: AwsRecord = {
      ...record,
      disposalStatus: payload.disposalStatus,
      lifecycleStatus: isFinalDecommission ? 'Decommissioned' : 'Pending Disposal',
      usageStatus: isFinalDecommission ? 'Decommissioned' : 'Standby',
      deploymentAuthorizationStatus: isFinalDecommission ? 'Not Applicable' : record.deploymentAuthorizationStatus,
      lastUpdated: timestamp,
      lifecycleHistory: [...record.lifecycleHistory, newEvent],
    };

    const report = PolicyEngine.evaluateAwsRecord(updatedRecord);
    updatedRecord.complianceStatus = isFinalDecommission ? 'Decommissioned' : report.derivedStatus;

    const newTx: LifecycleTransaction = {
      id: generateId('TX-DISP'),
      awsId,
      operation: isFinalDecommission ? 'Asset Decommissioned & Zeroized' : 'Disposal Protocol Initiated',
      stakeholder: payload.authorizedBy || actorName,
      stakeholderRole: actorRole,
      status: isFinalDecommission ? 'Completed' : 'Pending Review',
      timestamp,
      transactionRef: `LOG-TX-${Date.now().toString().slice(-6)}`,
    };

    db.awsRecords[index] = updatedRecord;
    db.transactions.unshift(newTx);
    saveDatabase(db);

    return { success: true, record: updatedRecord };
  },
};
