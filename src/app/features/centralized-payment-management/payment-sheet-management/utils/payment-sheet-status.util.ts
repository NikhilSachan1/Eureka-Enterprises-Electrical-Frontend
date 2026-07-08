import {
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetWorkflowAction,
  EPaymentSheetWorkflowActionType,
  EPaymentSheetWorkflowRole,
} from '../types/payment-sheet.enum';
import { IPaymentSheetWorkflowRow } from '../types/payment-sheet.interface';

function isPaymentSheetDetailMutationDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  const { status } = row;

  return (
    !status ||
    status === EPaymentSheetStatus.COMPLETED ||
    status === EPaymentSheetStatus.REJECTED
  );
}

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

export function isPaymentSheetDetailAddBeneficiaryDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetDetailMutationDisabled(row);
}

export function getPaymentSheetDetailAddBeneficiaryDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetDetailAddBeneficiaryDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and add beneficiaries is no longer available.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is rejected and add beneficiaries is no longer available.';
  }

  return 'Add beneficiaries is not available for this payment sheet at the current status.';
}

export function isPaymentSheetDetailEditDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetDetailMutationDisabled(row);
}

export function getPaymentSheetDetailEditDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetDetailEditDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and edit is no longer available.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is rejected and edit is no longer available.';
  }

  return 'Edit is not available for this payment sheet at the current status.';
}

export function isPaymentSheetDetailDeleteDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetDetailMutationDisabled(row);
}

export function getPaymentSheetDetailDeleteDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetDetailDeleteDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and delete is no longer available.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is rejected and delete is no longer available.';
  }

  return 'Delete is not available for this payment sheet at the current status.';
}

export function isPaymentSheetDetailRejectItemDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetRejectDisabled(row);
}

export function getPaymentSheetDetailRejectItemDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetDetailRejectItemDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and reject is no longer available.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is rejected and reject is no longer available.';
  }

  return 'Reject is not available at the current review stage.';
}

export function isPaymentSheetDetailRecordPaymentDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetDetailMutationDisabled(row);
}

export function getPaymentSheetDetailRecordPaymentDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetDetailRecordPaymentDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and record payment is no longer available.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is rejected and record payment is no longer available.';
  }

  return 'Record payment is not available for this payment sheet at the current status.';
}

export function isPaymentSheetDetailForwardToHrDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetDetailMutationDisabled(row);
}

export function getPaymentSheetDetailForwardToHrDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetDetailForwardToHrDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and forward to HR is no longer available.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is rejected and forward to HR is no longer available.';
  }

  return 'Forward to HR is not available for this payment sheet at the current status.';
}

export function isPaymentSheetDetailForwardToAdminDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetDetailMutationDisabled(row);
}

export function getPaymentSheetDetailForwardToAdminDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetDetailForwardToAdminDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and forward to admin is no longer available.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is rejected and forward to admin is no longer available.';
  }

  return 'Forward to admin is not available for this payment sheet at the current status.';
}

export function isPaymentSheetDetailForwardToAccountantDisabled(
  row: IPaymentSheetWorkflowRow
): boolean {
  return isPaymentSheetDetailMutationDisabled(row);
}

export function getPaymentSheetDetailForwardToAccountantDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetDetailForwardToAccountantDisabled(row)) {
    return undefined;
  }

  const { status } = row;

  if (status === EPaymentSheetStatus.COMPLETED) {
    return 'This payment sheet is completed and forward to accountant is no longer available.';
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return 'This payment sheet is rejected and forward to accountant is no longer available.';
  }

  return 'Forward to accountant is not available for this payment sheet at the current status.';
}

export function isPaymentSheetWorkflowForwardDisabled(
  actionType: EPaymentSheetWorkflowActionType,
  row: IPaymentSheetWorkflowRow
): boolean {
  switch (actionType) {
    case EPaymentSheetWorkflowActionType.FORWARD_TO_HR:
      return isPaymentSheetDetailForwardToHrDisabled(row);
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN:
      return isPaymentSheetDetailForwardToAdminDisabled(row);
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT:
      return isPaymentSheetDetailForwardToAccountantDisabled(row);
    default:
      return true;
  }
}

export function getPaymentSheetWorkflowForwardDisableReason(
  actionType: EPaymentSheetWorkflowActionType,
  row: IPaymentSheetWorkflowRow
): string | undefined {
  switch (actionType) {
    case EPaymentSheetWorkflowActionType.FORWARD_TO_HR:
      return getPaymentSheetDetailForwardToHrDisableReason(row);
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN:
      return getPaymentSheetDetailForwardToAdminDisableReason(row);
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT:
      return getPaymentSheetDetailForwardToAccountantDisableReason(row);
    default:
      return 'Forward is not available for this payment sheet at the current status.';
  }
}
