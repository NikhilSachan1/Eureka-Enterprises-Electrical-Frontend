import {
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetWorkflowAction,
  EPaymentSheetWorkflowActionType,
  EPaymentSheetWorkflowRole,
} from '../types/payment-sheet.enum';
import { IPaymentSheetWorkflowRow } from '../types/payment-sheet.interface';
import { EUserRole } from '@shared/constants';

function getWorkflowRoleForRow(
  row: IPaymentSheetWorkflowRow
): EPaymentSheetWorkflowRole | null {
  const { status, currentStage } = row;

  if (
    status === EPaymentSheetStatus.DRAFT ||
    status === EPaymentSheetStatus.RETURNED
  ) {
    return EPaymentSheetWorkflowRole.OPERATION_MANAGER;
  }

  if (status === EPaymentSheetStatus.IN_REVIEW) {
    if (currentStage === EPaymentSheetStage.HR_REVIEW) {
      return EPaymentSheetWorkflowRole.HR;
    }

    if (currentStage === EPaymentSheetStage.ADMIN_REVIEW) {
      return EPaymentSheetWorkflowRole.ADMIN;
    }

    return null;
  }

  if (status === EPaymentSheetStatus.PROCESSING) {
    return EPaymentSheetWorkflowRole.ACCOUNTS;
  }

  return null;
}

function isPaymentSheetActionAllowed(
  row: IPaymentSheetWorkflowRow,
  action: EPaymentSheetWorkflowAction
): boolean {
  const { status } = row;

  if (!status) {
    return false;
  }

  if (action === EPaymentSheetWorkflowAction.RETURN) {
    if (
      status === EPaymentSheetStatus.COMPLETED ||
      status === EPaymentSheetStatus.REJECTED ||
      status === EPaymentSheetStatus.DRAFT ||
      status === EPaymentSheetStatus.RETURNED
    ) {
      return false;
    }
  } else if (
    status === EPaymentSheetStatus.COMPLETED ||
    status === EPaymentSheetStatus.REJECTED
  ) {
    return false;
  }

  return getWorkflowRoleForRow(row) !== null;
}

export function isPaymentSheetReturnAllowed(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetActionAllowed(row, EPaymentSheetWorkflowAction.RETURN);
}

export function isPaymentSheetReturnDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return !isPaymentSheetReturnAllowed(row);
}

function isPaymentSheetRejectAllowed(row: IPaymentSheetWorkflowRow): boolean {
  return isPaymentSheetActionAllowed(row, EPaymentSheetWorkflowAction.REJECT);
}

export function isPaymentSheetRejectDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return !isPaymentSheetRejectAllowed(row);
}

export function getPaymentSheetReturnDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetReturnDisabled(row)) {
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

  if (!getWorkflowRoleForRow(row)) {
    return 'Return is not available at the current review stage.';
  }

  return 'Return is not available for this payment sheet at the current status.';
}

export function getPaymentSheetRejectDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetRejectDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and cannot be rejected.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is already rejected and cannot be rejected again.';
  }

  if (!getWorkflowRoleForRow(row)) {
    return 'Reject is not available at the current review stage.';
  }

  return 'Reject is not available for this payment sheet at the current status.';
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
