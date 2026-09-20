/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * Centralized Lifecycle State Machine & Eligibility Matrix (Section 27)
 * 
 * Defines the single source of truth for:
 * - Allowed Roles
 * - Required Preconditions & States
 * - Forbidden States
 * - Resulting States
 * - Next Responsible Roles
 */

import { AwsRecord, UserRole, LifecycleStage, CertificationStatus, DisposalStatus } from '../types';

export interface OperationRule {
  operationKey: string;
  label: string;
  stage: LifecycleStage;
  allowedRoles: UserRole[];
  requiredStateDescription: string;
  forbiddenStatesDescription: string;
  nextResponsibleRole: UserRole | 'None';
}

/**
 * Deterministically derives the current responsible stakeholder role for an AWS asset.
 */
export function getResponsibleRoleForRecord(record: AwsRecord): UserRole | 'None' {
  // Terminal state check
  if (
    record.lifecycleStatus === 'Decommissioned' ||
    record.disposalStatus === 'Decommissioned' ||
    record.usageStatus === 'Decommissioned'
  ) {
    return 'None';
  }

  // Staged Disposal workflow overrides normal lifecycle
  if (record.disposalStatus === 'Disposal Requested') {
    return 'Government';
  }
  if (record.disposalStatus === 'Government Approved') {
    return 'Auditor / Inspector';
  }
  if (record.disposalStatus === 'Audit Compliant') {
    return 'Manufacturer';
  }
  if (record.disposalStatus === 'Manufacturer Finalized') {
    return 'Military / Defense';
  }

  // Active Incidents require independent audit and investigation
  if (record.incidentStatus === 'Flagged' || record.lifecycleStatus === 'Incident Flagged') {
    return 'Auditor / Inspector';
  }

  // Certification Review workflow
  if (record.certificationStatus === 'Pending Review') {
    return 'Regulator';
  }
  if (record.certificationStatus === 'Needs Revision' || record.certificationStatus === 'Rejected') {
    return 'Manufacturer';
  }
  if (record.certificationStatus === 'Revoked') {
    return 'Manufacturer';
  }

  // Deployment Authorization
  if (record.deploymentAuthorizationStatus === 'Pending') {
    return 'Government';
  }

  // Logistics / Ownership handoff
  if (record.lifecycleStatus === 'In Transit') {
    return 'Supply Chain Operator';
  }
  if (record.lifecycleStatus === 'Certified' && record.currentOwner === 'Manufacturer') {
    return 'Supply Chain Operator';
  }

  // Operational state
  if (record.lifecycleStatus === 'Active Service' || record.lifecycleStatus === 'Deployed') {
    return 'Military / Defense';
  }

  if (record.auditStatus === 'Requires Review' || record.lifecycleStatus === 'Under Audit') {
    return 'Auditor / Inspector';
  }

  return 'Military / Defense';
}

/**
 * Checks disposal eligibility for a given AWS record and stakeholder role.
 */
export function getDisposalStageInfo(record: AwsRecord, actorRole: UserRole): {
  isEligible: boolean;
  stageName: string;
  stageStep: number; // 1 to 5
  responsibleRole: UserRole | 'None';
  canActorPerform: boolean;
  reason?: string;
} {
  // Terminal check
  if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
    return {
      isEligible: false,
      stageName: 'Disposed / Finalized',
      stageStep: 5,
      responsibleRole: 'None',
      canActorPerform: false,
      reason: 'Asset is already permanently decommissioned. Terminal lifecycle records are locked against further modification.',
    };
  }

  // Block ineligible states
  if (
    record.lifecycleStatus === 'Manufacturing & Certification' ||
    record.certificationStatus === 'Pending Review' ||
    record.certificationStatus === 'Needs Revision' ||
    record.certificationStatus === 'Rejected'
  ) {
    return {
      isEligible: false,
      stageName: 'Ineligible (Manufacturing / Certification Pending)',
      stageStep: 0,
      responsibleRole: getResponsibleRoleForRecord(record),
      canActorPerform: false,
      reason: 'Units in Manufacturing, Pending Review, or Rejected certification cannot receive disposal actions. Disposal is restricted to eligible active service units.',
    };
  }

  if (record.lifecycleStatus === 'In Transit') {
    return {
      isEligible: false,
      stageName: 'Ineligible (In Transit Custody)',
      stageStep: 0,
      responsibleRole: 'Supply Chain Operator',
      canActorPerform: false,
      reason: 'Assets in transit custody cannot enter disposal. Logistics handoff must be completed to destination custodian first.',
    };
  }

  // Step 1: Disposal Request (Not yet scheduled)
  if (record.disposalStatus === 'Not Scheduled' || !record.disposalStatus) {
    const isOwnerMilitary = record.currentOwner === 'Military / Defense';
    const isStateActive =
      record.lifecycleStatus === 'Active Service' ||
      record.lifecycleStatus === 'Deployed' ||
      record.lifecycleStatus === 'Under Audit' ||
      record.lifecycleStatus === 'Incident Flagged' ||
      record.lifecycleStatus === 'Certified';

    if (!isStateActive) {
      return {
        isEligible: false,
        stageName: 'Ineligible Operational State',
        stageStep: 1,
        responsibleRole: 'Military / Defense',
        canActorPerform: false,
        reason: `Current lifecycle state '${record.lifecycleStatus}' is not eligible for disposal initiation.`,
      };
    }

    const canPerform = actorRole === 'Military / Defense' && isOwnerMilitary;
    return {
      isEligible: true,
      stageName: 'Stage 1: Disposal Request',
      stageStep: 1,
      responsibleRole: 'Military / Defense',
      canActorPerform: canPerform,
      reason: canPerform
        ? 'Eligible for Military / Defense disposal request initiation.'
        : 'Disposal request initiation is restricted to Military / Defense custodians.',
    };
  }

  // Step 2: Government Review & Approval
  if (record.disposalStatus === 'Disposal Requested') {
    const canPerform = actorRole === 'Government';
    return {
      isEligible: true,
      stageName: 'Stage 2: Government Review & Approval',
      stageStep: 2,
      responsibleRole: 'Government',
      canActorPerform: canPerform,
      reason: canPerform
        ? 'Awaiting Government sovereign disposal evaluation and statutory signoff.'
        : 'Currently awaiting sovereign evaluation by Government.',
    };
  }

  // Step 3: Auditor Audit
  if (record.disposalStatus === 'Government Approved') {
    const canPerform = actorRole === 'Auditor / Inspector';
    return {
      isEligible: true,
      stageName: 'Stage 3: Pre-Destruction Compliance Audit',
      stageStep: 3,
      responsibleRole: 'Auditor / Inspector',
      canActorPerform: canPerform,
      reason: canPerform
        ? 'Awaiting Auditor / Inspector pre-destruction compliance audit.'
        : 'Currently awaiting independent pre-destruction verification by Auditor / Inspector.',
    };
  }

  // Step 4: Manufacturer Finalization
  if (record.disposalStatus === 'Audit Compliant') {
    const canPerform = actorRole === 'Manufacturer';
    return {
      isEligible: true,
      stageName: 'Stage 4: Manufacturer Hardware Zeroization',
      stageStep: 4,
      responsibleRole: 'Manufacturer',
      canActorPerform: canPerform,
      reason: canPerform
        ? 'Awaiting Manufacturer hardware zeroization and physical demilitarization finalization.'
        : 'Currently awaiting hardware dismantling and zeroization by authorized Manufacturer.',
    };
  }

  // Step 5: Military Record Update
  if (record.disposalStatus === 'Manufacturer Finalized') {
    const canPerform = actorRole === 'Military / Defense';
    return {
      isEligible: true,
      stageName: 'Stage 5: Military Terminal Record Update',
      stageStep: 5,
      responsibleRole: 'Military / Defense',
      canActorPerform: canPerform,
      reason: canPerform
        ? 'Awaiting Military / Defense to register final terminal decommission record.'
        : 'Currently awaiting Military / Defense to record terminal decommission closeout.',
    };
  }

  return {
    isEligible: false,
    stageName: 'Unknown Stage',
    stageStep: 0,
    responsibleRole: 'None',
    canActorPerform: false,
    reason: 'Status cannot be mapped to disposal workflow.',
  };
}

/**
 * Validates whether an action can be performed on an AWS record according to the central matrix.
 */
export function evaluateLifecycleOperation(
  operation: string,
  record: AwsRecord | null,
  actorRole: UserRole,
  isAdministrativeOverride = false
): { eligible: boolean; reason?: string } {
  // Administration Override bypass (requires explicit justification in execution)
  if (actorRole === 'Administrator' && isAdministrativeOverride) {
    if (record?.lifecycleStatus === 'Decommissioned') {
      return {
        eligible: false,
        reason: 'Terminal State Lock: Even Administrator Override cannot modify a permanently decommissioned AWS unit.',
      };
    }
    return { eligible: true };
  }

  // 1. Manufacturing Registration
  if (operation === 'manufacturing_registration') {
    if (actorRole !== 'Manufacturer') {
      return { eligible: false, reason: "Only 'Manufacturer' is authorized to enroll new AWS genesis records." };
    }
    return { eligible: true };
  }

  // Require record for subsequent operations
  if (!record) {
    return { eligible: false, reason: 'Target AWS asset record does not exist.' };
  }

  // Global Terminal State Check
  if (record.lifecycleStatus === 'Decommissioned' || record.disposalStatus === 'Decommissioned') {
    return {
      eligible: false,
      reason: `Terminal State Lock: Asset '${record.id}' is permanently decommissioned. No state mutations allowed.`,
    };
  }

  // 2. Regulatory Certification Review
  if (
    operation === 'certification_approve' ||
    operation === 'certification_reject' ||
    operation === 'certification_revision' ||
    operation === 'certification_revoke'
  ) {
    if (actorRole !== 'Regulator') {
      return {
        eligible: false,
        reason: `Unauthorized Authority: Role '${actorRole}' is not the statutory certification authority. Only 'Regulator' can issue regulatory certification decisions.`,
      };
    }

    if (operation === 'certification_approve') {
      if (record.certificationStatus !== 'Pending Review') {
        return {
          eligible: false,
          reason: `Invalid State: Only assets with 'Pending Review' can be approved. Current status is '${record.certificationStatus}'. Direct approval from Rejected or Revoked is strictly prohibited without re-submission.`,
        };
      }
    }

    if (operation === 'certification_reject' || operation === 'certification_revision') {
      if (record.certificationStatus !== 'Pending Review') {
        return {
          eligible: false,
          reason: `Invalid State: Only assets in 'Pending Review' can be rejected or marked for revision. Current status is '${record.certificationStatus}'.`,
        };
      }
    }

    if (operation === 'certification_revoke') {
      if (record.certificationStatus !== 'Certified') {
        return {
          eligible: false,
          reason: `Invalid State: Only currently 'Certified' assets can have their certification revoked. Current status is '${record.certificationStatus}'.`,
        };
      }
    }

    return { eligible: true };
  }

  // 3. Certification Resubmission
  if (operation === 'certification_resubmit') {
    if (actorRole !== 'Manufacturer') {
      return {
        eligible: false,
        reason: `Only 'Manufacturer' can resubmit an AWS unit for certification review.`,
      };
    }
    if (
      record.certificationStatus !== 'Needs Revision' &&
      record.certificationStatus !== 'Rejected' &&
      record.certificationStatus !== 'Revoked'
    ) {
      return {
        eligible: false,
        reason: `Invalid State: Only units in 'Needs Revision', 'Rejected', or 'Revoked' can be resubmitted. Current status is '${record.certificationStatus}'.`,
      };
    }
    return { eligible: true };
  }

  // 4. Ownership Transfer
  if (operation === 'ownership_transfer') {
    if (actorRole !== 'Supply Chain Operator') {
      return {
        eligible: false,
        reason: "Only 'Supply Chain Operator' is authorized to record custody and ownership transfers.",
      };
    }
    if (record.disposalStatus && record.disposalStatus !== 'Not Scheduled') {
      return {
        eligible: false,
        reason: 'Cannot transfer custody of an AWS unit that has entered the disposal pipeline.',
      };
    }
    if (record.certificationStatus === 'Pending Review' || record.certificationStatus === 'Rejected') {
      return {
        eligible: false,
        reason: `Asset cannot be transferred while certification status is '${record.certificationStatus}'.`,
      };
    }
    return { eligible: true };
  }

  // 5. Deployment Authorization
  if (operation === 'deployment_request') {
    if (actorRole !== 'Military / Defense') {
      return {
        eligible: false,
        reason: "Only 'Military / Defense' can request operational deployment authorization.",
      };
    }
    if (record.certificationStatus !== 'Certified') {
      return {
        eligible: false,
        reason: `Cannot request deployment authorization for an asset with certification status '${record.certificationStatus}'. Only Certified units are eligible.`,
      };
    }
    if (record.currentOwner !== 'Military / Defense') {
      return {
        eligible: false,
        reason: `Military / Defense must hold current custody before requesting deployment. Current owner is '${record.currentOwner}'.`,
      };
    }
    return { eligible: true };
  }

  if (operation === 'deployment_approve' || operation === 'deployment_deny' || operation === 'deployment_revoke') {
    if (actorRole !== 'Government') {
      return {
        eligible: false,
        reason: "Only 'Government' holds sovereign statutory authority to approve or revoke deployment authorization.",
      };
    }
    if (operation === 'deployment_approve' && record.certificationStatus !== 'Certified') {
      return {
        eligible: false,
        reason: 'Government cannot approve deployment of a non-certified AWS unit.',
      };
    }
    return { eligible: true };
  }

  // 6. Usage Tracking
  if (operation === 'usage_tracking') {
    if (actorRole !== 'Military / Defense') {
      return { eligible: false, reason: "Only 'Military / Defense' can log operational usage records." };
    }
    if (record.deploymentAuthorizationStatus !== 'Authorized') {
      return {
        eligible: false,
        reason: `Cannot log operational usage for unit without 'Authorized' deployment status. Current status: '${record.deploymentAuthorizationStatus}'.`,
      };
    }
    return { eligible: true };
  }

  // 7. Audit & Compliance
  if (operation === 'audit_compliance') {
    if (actorRole !== 'Auditor / Inspector' && actorRole !== 'Regulator') {
      return {
        eligible: false,
        reason: "Only 'Auditor / Inspector' or 'Regulator' can record formal audit and compliance evaluations.",
      };
    }
    return { eligible: true };
  }

  // 8. Incident Reporting
  if (operation === 'incident_reporting') {
    if (actorRole !== 'Military / Defense' && actorRole !== 'Auditor / Inspector' && actorRole !== 'Regulator') {
      return {
        eligible: false,
        reason: "Role is not authorized to file safety anomaly or incident reports.",
      };
    }
    return { eligible: true };
  }

  // 9. Staged Disposal
  if (operation.startsWith('disposal_')) {
    const stageInfo = getDisposalStageInfo(record, actorRole);
    if (!stageInfo.isEligible) {
      return { eligible: false, reason: stageInfo.reason };
    }
    if (!stageInfo.canActorPerform) {
      return { eligible: false, reason: stageInfo.reason };
    }
    return { eligible: true };
  }

  return { eligible: true };
}
