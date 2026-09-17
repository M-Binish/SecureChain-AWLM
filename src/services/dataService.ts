/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * APPLICATION DATA LAYER & PERSISTENT STORAGE
 * 
 * Architecture:
 * UI Components -> Application / API Data Layer (this service) -> Persistent Storage
 * 
 * Enforces business rules:
 * - Role-based authorization for each of the 7 lifecycle operations
 * - Terminal state lock: Disposed AWS records cannot undergo further state transitions
 * - Cryptographic/audit transaction log creation for every state mutation
 * - Durable persistence across page reloads via local storage abstraction
 */

import {
  AwsRecord,
  LifecycleEvent,
  LifecycleTransaction,
  AuditRecord,
  IncidentRecord,
  ViolationRecord,
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
import { canPerformLifecycleOperation, LifecycleOperation } from '../utils/permissions';

const STORAGE_KEY = 'securechain_awlm_db_v2';

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

// Generate unique timestamp string
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
    if (!canPerformLifecycleOperation(actorRole, 'manufacturing_certification')) {
      return {
        success: false,
        error: `Unauthorized: Role '${actorRole}' is not permitted to register manufacturing and certification records.`,
      };
    }

    const trimmedId = payload.id.trim().toUpperCase();
    if (!trimmedId) {
      return { success: false, error: 'AWS ID is required (e.g. AWS-007).' };
    }

    const db = loadDatabase();
    if (db.awsRecords.some((r) => r.id.toUpperCase() === trimmedId)) {
      return { success: false, error: `AWS record with ID '${trimmedId}' already exists in registry.` };
    }

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
        details: `Hardware identity enrolled by ${payload.manufacturer || 'Manufacturer'}. Classification: ${payload.systemClassification}. Certification standard ref: ${payload.certificationReference || 'STD-ISO-AUTONOMOUS'}.`,
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
      complianceStatus: isCertified ? 'Compliant' : 'Pending / Not Evaluated',
      notes: payload.notes,
      lifecycleHistory: events,
    };

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

  // =========================================================================
  // 2. OWNERSHIP TRANSFER
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
    if (!canPerformLifecycleOperation(actorRole, 'ownership_transfer')) {
      return {
        success: false,
        error: `Unauthorized: Role '${actorRole}' is not permitted to record ownership transfers.`,
      };
    }

    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    if (index === -1) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const record = db.awsRecords[index];

    // Terminal state check
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return {
        success: false,
        error: `Operation Rejected: AWS record '${awsId}' is Decommissioned / Disposed (terminal lifecycle state). No further transitions are permitted.`,
      };
    }

    const prevOwner = record.currentOwner;
    const timestamp = getTimestamp();

    const newEvent: LifecycleEvent = {
      id: generateId('EVT-TRF'),
      stage: 'Ownership Transfer',
      title: `Ownership Transfer: ${prevOwner} → ${payload.newOwner}`,
      timestamp,
      actor: actorName,
      actorRole,
      status: payload.approvalStatus === 'In Transit' ? 'In Progress' : 'Completed',
      details: `Custody transition authorized. Reason: ${payload.reason || 'Operational logistics transfer'}. Previous: ${prevOwner}, New: ${payload.newOwner}.`,
      recordIdentifier: `REC-TRF-${Date.now().toString().slice(-6)}`,
      notes: payload.notes,
    };

    const updatedRecord: AwsRecord = {
      ...record,
      currentOwner: payload.approvalStatus === 'In Transit' ? 'Supply Chain Operator' : payload.newOwner,
      lifecycleStatus: payload.approvalStatus === 'In Transit' ? 'In Transit' : record.lifecycleStatus === 'In Transit' ? 'Active Service' : record.lifecycleStatus,
      lastUpdated: timestamp,
      lifecycleHistory: [...record.lifecycleHistory, newEvent],
    };

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
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    if (!canPerformLifecycleOperation(actorRole, 'deployment_authorization')) {
      return {
        success: false,
        error: `Unauthorized: Role '${actorRole}' is not permitted to record deployment authorization.`,
      };
    }

    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    if (index === -1) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const record = db.awsRecords[index];

    // Terminal state check
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return {
        success: false,
        error: `Operation Rejected: AWS record '${awsId}' is Decommissioned / Disposed. Deployment cannot be authorized.`,
      };
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
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    if (!canPerformLifecycleOperation(actorRole, 'usage_tracking')) {
      return {
        success: false,
        error: `Unauthorized: Role '${actorRole}' is not permitted to record operational usage lifecycle events.`,
      };
    }

    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    if (index === -1) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const record = db.awsRecords[index];

    // Terminal state check
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return {
        success: false,
        error: `Operation Rejected: AWS record '${awsId}' is Decommissioned / Disposed. Usage cannot be logged for retired assets.`,
      };
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
    if (!canPerformLifecycleOperation(actorRole, 'audit_compliance')) {
      return {
        success: false,
        error: `Unauthorized: Role '${actorRole}' is not permitted to record audit & compliance events.`,
      };
    }

    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    if (index === -1) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const record = db.awsRecords[index];

    // Terminal state check
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return {
        success: false,
        error: `Operation Rejected: AWS record '${awsId}' is Decommissioned / Disposed. Asset lifecycle is terminated.`,
      };
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
      complianceStatus: payload.auditStatus,
      lifecycleStatus: isNonCompliant ? 'Under Audit' : record.lifecycleStatus,
      lastUpdated: timestamp,
      lifecycleHistory: [...record.lifecycleHistory, newEvent],
    };

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
    if (!canPerformLifecycleOperation(actorRole, 'incident_reporting')) {
      return {
        success: false,
        error: `Unauthorized: Role '${actorRole}' is not permitted to file incident reports.`,
      };
    }

    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    if (index === -1) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const record = db.awsRecords[index];

    // Terminal state check
    if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
      return {
        success: false,
        error: `Operation Rejected: AWS record '${awsId}' is Decommissioned / Disposed. Cannot log incidents for decommissioned hardware.`,
      };
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
      notes?: string;
    },
    actorRole: UserRole,
    actorName: string
  ): { success: boolean; record?: AwsRecord; error?: string } {
    if (!canPerformLifecycleOperation(actorRole, 'disposal')) {
      return {
        success: false,
        error: `Unauthorized: Role '${actorRole}' is not permitted to execute disposal / decommissioning protocols.`,
      };
    }

    const db = loadDatabase();
    const index = db.awsRecords.findIndex((r) => r.id === awsId);
    if (index === -1) {
      return { success: false, error: `AWS record '${awsId}' not found.` };
    }

    const record = db.awsRecords[index];

    if (record.lifecycleStatus === 'Decommissioned' && record.disposalStatus === 'Decommissioned') {
      return {
        success: false,
        error: `AWS record '${awsId}' is already completely Decommissioned. No further disposal actions are required.`,
      };
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
