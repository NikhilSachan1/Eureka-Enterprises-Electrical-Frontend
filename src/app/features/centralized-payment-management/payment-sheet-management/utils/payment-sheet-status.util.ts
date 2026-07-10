import {
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetWorkflowActionType,
  EPaymentSheetWorkflowRole,
} from '../types/payment-sheet.enum';
import { IPaymentSheetWorkflowRow } from '../types/payment-sheet.interface';
import { IPaymentSheetCurrentOwnerBanner } from '../types/payment-sheet-detail.interface';
import { EUserRole, ICONS } from '@shared/constants';

type ActiveRole = string | null | undefined;

function isPaymentSheetDraftOrReturned(row: IPaymentSheetWorkflowRow): boolean {
  const { status } = row;

  return (
    status === EPaymentSheetStatus.DRAFT ||
    status === EPaymentSheetStatus.RETURNED
  );
}

function isPaymentSheetHrReview(row: IPaymentSheetWorkflowRow): boolean {
  return (
    row.status === EPaymentSheetStatus.IN_REVIEW &&
    row.currentStage === EPaymentSheetStage.HR_REVIEW
  );
}

function isPaymentSheetAdminReview(row: IPaymentSheetWorkflowRow): boolean {
  return (
    row.status === EPaymentSheetStatus.IN_REVIEW &&
    row.currentStage === EPaymentSheetStage.ADMIN_REVIEW
  );
}

function isPaymentSheetProcessing(row: IPaymentSheetWorkflowRow): boolean {
  return row.status === EPaymentSheetStatus.PROCESSING;
}

function getWorkflowRoleForRow(
  row: IPaymentSheetWorkflowRow
): EPaymentSheetWorkflowRole | null {
  if (isPaymentSheetDraftOrReturned(row)) {
    return EPaymentSheetWorkflowRole.OPERATION_MANAGER;
  }

  if (isPaymentSheetHrReview(row)) {
    return EPaymentSheetWorkflowRole.HR;
  }

  if (isPaymentSheetAdminReview(row)) {
    return EPaymentSheetWorkflowRole.ADMIN;
  }

  if (isPaymentSheetProcessing(row)) {
    return EPaymentSheetWorkflowRole.ACCOUNTS;
  }

  return null;
}

function paymentSheetDraftOrReturnedOmDisableReason(
  actionLabel: string
): string {
  return `${actionLabel} can only be performed by Operation Manager while the payment sheet is in draft or returned.`;
}

export function getPaymentSheetCurrentOwnerBanner(
  row: IPaymentSheetWorkflowRow
): IPaymentSheetCurrentOwnerBanner | null {
  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return {
      prefix: 'Status',
      ownerLabel: 'Completed',
      stageHint: null,
      tone: 'completed',
      icon: ICONS.ACTIONS.CHECK_CIRCLE,
    };
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return {
      prefix: 'Status',
      ownerLabel: 'Rejected',
      stageHint: null,
      tone: 'rejected',
      icon: ICONS.ACTIONS.BAN,
    };
  }

  if (isPaymentSheetDraftOrReturned(row)) {
    return {
      prefix: 'Currently with',
      ownerLabel: 'Operation Manager',
      stageHint: status === EPaymentSheetStatus.RETURNED ? 'Returned' : 'Draft',
      tone: 'draft',
      icon: ICONS.COMMON.BRIEFCASE,
    };
  }

  if (isPaymentSheetHrReview(row)) {
    return {
      prefix: 'Currently with',
      ownerLabel: 'HR',
      stageHint: 'HR Review',
      tone: 'hr',
      icon: ICONS.COMMON.USER,
    };
  }

  if (isPaymentSheetAdminReview(row)) {
    return {
      prefix: 'Currently with',
      ownerLabel: 'Admin',
      stageHint: 'Admin Review',
      tone: 'admin',
      icon: ICONS.COMMON.USER,
    };
  }

  if (isPaymentSheetProcessing(row)) {
    return {
      prefix: 'Currently with',
      ownerLabel: 'Accounts',
      stageHint: 'Account Review',
      tone: 'accounts',
      icon: ICONS.PAYROLL.WALLET,
    };
  }

  return null;
}

export function isPaymentSheetReturnAllowed(
  row: IPaymentSheetWorkflowRow,
  activeRole: ActiveRole
): boolean {
  const { status } = row;

  if (!status) {
    return false;
  }

  if (
    status === EPaymentSheetStatus.COMPLETED ||
    status === EPaymentSheetStatus.REJECTED ||
    status === EPaymentSheetStatus.DRAFT ||
    status === EPaymentSheetStatus.RETURNED
  ) {
    return false;
  }

  const requiredRole = getWorkflowRoleForRow(row);

  if (!requiredRole) {
    return false;
  }

  return requiredRole === activeRole;
}

export function isPaymentSheetReturnDisabled(
  row: IPaymentSheetWorkflowRow,
  activeRole: ActiveRole
): boolean {
  return !isPaymentSheetReturnAllowed(row, activeRole);
}

export function isPaymentSheetRejectAllowed(
  row: IPaymentSheetWorkflowRow,
  activeRole: ActiveRole
): boolean {
  if (!isPaymentSheetDraftOrReturned(row)) {
    return false;
  }

  return activeRole === EUserRole.OPERATION_MANAGER;
}

export function isPaymentSheetRejectDisabled(
  row: IPaymentSheetWorkflowRow,
  activeRole: ActiveRole
): boolean {
  return !isPaymentSheetRejectAllowed(row, activeRole);
}

export function getPaymentSheetReturnDisableReason(
  row: IPaymentSheetWorkflowRow,
  activeRole: ActiveRole
): string | undefined {
  if (!isPaymentSheetReturnDisabled(row, activeRole)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and cannot be returned.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is already rejected and cannot be returned.';
  }

  if (status === EPaymentSheetStatus.DRAFT) {
    return 'Return is not available for draft payment sheets.';
  }

  if (status === EPaymentSheetStatus.RETURNED) {
    return 'This payment sheet is already returned and cannot be returned again.';
  }

  if (isPaymentSheetHrReview(row)) {
    return 'Return can only be performed by HR while the payment sheet is in HR review.';
  }

  if (isPaymentSheetAdminReview(row)) {
    return 'Return can only be performed by Admin while the payment sheet is in Admin review.';
  }

  if (isPaymentSheetProcessing(row)) {
    return 'Return can only be performed by Accounts while the payment sheet is in processing.';
  }

  return 'Return is not available for this payment sheet at the current status.';
}

export function getPaymentSheetRejectDisableReason(
  row: IPaymentSheetWorkflowRow,
  activeRole: ActiveRole
): string | undefined {
  if (!isPaymentSheetRejectDisabled(row, activeRole)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and cannot be rejected.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is already rejected and cannot be rejected again.';
  }

  if (!isPaymentSheetDraftOrReturned(row)) {
    return 'Reject is only available while the payment sheet is in draft or returned.';
  }

  return paymentSheetDraftOrReturnedOmDisableReason('Reject');
}

export function getPaymentSheetForwardActionForUserRole(
  role: string | null | undefined
): EPaymentSheetWorkflowActionType | null {
  switch (role) {
    case EUserRole.OPERATION_MANAGER:
      return EPaymentSheetWorkflowActionType.FORWARD_TO_HR;
    case EUserRole.HR:
      return EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN;
    case EUserRole.ADMIN:
      return EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT;
    default:
      return null;
  }
}

export function isPaymentSheetForwardActionAllowed(
  row: IPaymentSheetWorkflowRow,
  action: EPaymentSheetWorkflowActionType
): boolean {
  switch (action) {
    case EPaymentSheetWorkflowActionType.FORWARD_TO_HR:
      return isPaymentSheetDraftOrReturned(row);
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN:
      return isPaymentSheetHrReview(row);
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT:
      return isPaymentSheetAdminReview(row);
    default:
      return false;
  }
}

export function isPaymentSheetForwardActionDisabled(
  row: IPaymentSheetWorkflowRow,
  action: EPaymentSheetWorkflowActionType
): boolean {
  return !isPaymentSheetForwardActionAllowed(row, action);
}

export function getPaymentSheetForwardDisableReason(
  row: IPaymentSheetWorkflowRow,
  action: EPaymentSheetWorkflowActionType
): string | undefined {
  if (!isPaymentSheetForwardActionDisabled(row, action)) {
    return undefined;
  }

  switch (action) {
    case EPaymentSheetWorkflowActionType.FORWARD_TO_HR:
      return 'Forward to HR is only available while the payment sheet is in draft or returned.';
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN:
      return 'Forward to Admin is only available while the payment sheet is in HR review.';
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT:
      return 'Forward to Accountant is only available while the payment sheet is in Admin review.';
    default:
      return 'Forward is not available for this payment sheet at the current status.';
  }
}
