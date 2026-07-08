import {
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetWorkflowActionType,
  EPaymentSheetWorkflowRole,
} from '../types/payment-sheet.enum';
import { IPaymentSheetWorkflowRow } from '../types/payment-sheet.interface';
import { EUserRole } from '@shared/constants';

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
