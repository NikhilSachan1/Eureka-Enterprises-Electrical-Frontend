import {
  EPaymentSheetDetailAction,
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetWorkflowAction,
  EPaymentSheetWorkflowActionType,
  EPaymentSheetWorkflowRole,
} from '../types/payment-sheet.enum';
import { IPaymentSheetWorkflowRow } from '../types/payment-sheet.interface';

const WORKFLOW_ROLE_STAGE_LABEL: Record<EPaymentSheetWorkflowRole, string> = {
  [EPaymentSheetWorkflowRole.OPERATION_MANAGER]: 'operation manager',
  [EPaymentSheetWorkflowRole.HR]: 'HR review',
  [EPaymentSheetWorkflowRole.ADMIN]: 'admin review',
  [EPaymentSheetWorkflowRole.ACCOUNTS]: 'accounts',
};

const RETURN_BLOCKED_STATUSES = new Set<string>([
  EPaymentSheetStatus.COMPLETED,
  EPaymentSheetStatus.REJECTED,
  EPaymentSheetStatus.DRAFT,
  EPaymentSheetStatus.RETURNED,
]);

const REJECT_BLOCKED_STATUSES = new Set<string>([
  EPaymentSheetStatus.COMPLETED,
  EPaymentSheetStatus.REJECTED,
]);

const DETAIL_MUTATION_BLOCKED_STATUSES = new Set<string>([
  EPaymentSheetStatus.COMPLETED,
  EPaymentSheetStatus.REJECTED,
]);

const DETAIL_ACTION_REQUIRED_ROLE: Partial<
  Record<EPaymentSheetDetailAction, EPaymentSheetWorkflowRole>
> = {
  [EPaymentSheetDetailAction.ADD_BENEFICIARY]:
    EPaymentSheetWorkflowRole.OPERATION_MANAGER,
  [EPaymentSheetDetailAction.DELETE_ITEM]:
    EPaymentSheetWorkflowRole.OPERATION_MANAGER,
  [EPaymentSheetDetailAction.RECORD_PAYMENT]:
    EPaymentSheetWorkflowRole.ACCOUNTS,
  [EPaymentSheetDetailAction.FORWARD_TO_HR]:
    EPaymentSheetWorkflowRole.OPERATION_MANAGER,
  [EPaymentSheetDetailAction.FORWARD_TO_ADMIN]: EPaymentSheetWorkflowRole.HR,
  [EPaymentSheetDetailAction.FORWARD_TO_ACCOUNTANT]:
    EPaymentSheetWorkflowRole.ADMIN,
};

const DETAIL_ACTION_LABEL: Record<EPaymentSheetDetailAction, string> = {
  [EPaymentSheetDetailAction.ADD_BENEFICIARY]: 'Add Beneficiaries',
  [EPaymentSheetDetailAction.EDIT_ITEM]: 'Edit',
  [EPaymentSheetDetailAction.DELETE_ITEM]: 'Delete',
  [EPaymentSheetDetailAction.REJECT_ITEM]: 'Reject',
  [EPaymentSheetDetailAction.VERIFY_ITEM]: 'Verify',
  [EPaymentSheetDetailAction.UNVERIFY_ITEM]: 'Unverify',
  [EPaymentSheetDetailAction.RECORD_PAYMENT]: 'Record Payment',
  [EPaymentSheetDetailAction.FORWARD_TO_HR]: 'Forward to HR',
  [EPaymentSheetDetailAction.FORWARD_TO_ADMIN]: 'Forward to Admin',
  [EPaymentSheetDetailAction.FORWARD_TO_ACCOUNTANT]: 'Forward to Accountant',
};

export function toPaymentSheetDetailAction(
  actionType: EPaymentSheetWorkflowActionType
): EPaymentSheetDetailAction {
  switch (actionType) {
    case EPaymentSheetWorkflowActionType.FORWARD_TO_HR:
      return EPaymentSheetDetailAction.FORWARD_TO_HR;
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN:
      return EPaymentSheetDetailAction.FORWARD_TO_ADMIN;
    case EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT:
      return EPaymentSheetDetailAction.FORWARD_TO_ACCOUNTANT;
    default:
      throw new Error(
        `Unknown payment sheet workflow action type: ${actionType}`
      );
  }
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
  const blockedStatuses =
    action === EPaymentSheetWorkflowAction.RETURN
      ? RETURN_BLOCKED_STATUSES
      : REJECT_BLOCKED_STATUSES;

  if (!status || blockedStatuses.has(status)) {
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

  return getPaymentSheetActionDisableReason(
    row,
    EPaymentSheetWorkflowAction.RETURN
  );
}

export function getPaymentSheetRejectDisableReason(
  row: IPaymentSheetWorkflowRow
): string | undefined {
  if (!isPaymentSheetRejectDisabled(row)) {
    return undefined;
  }

  return getPaymentSheetActionDisableReason(
    row,
    EPaymentSheetWorkflowAction.REJECT
  );
}

function getPaymentSheetActionDisableReason(
  row: IPaymentSheetWorkflowRow,
  action: EPaymentSheetWorkflowAction
): string {
  const actionLabel =
    action === EPaymentSheetWorkflowAction.RETURN ? 'Return' : 'Reject';
  const { status } = row;
  const role = getWorkflowRoleForRow(row);

  if (status === EPaymentSheetStatus.COMPLETED) {
    return `This payment sheet is completed and cannot be ${action === EPaymentSheetWorkflowAction.RETURN ? 'returned' : 'rejected'}.`;
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return `This payment sheet is already rejected and cannot be ${action === EPaymentSheetWorkflowAction.RETURN ? 'returned' : 'rejected again'}.`;
  }

  if (
    status === EPaymentSheetStatus.DRAFT &&
    action === EPaymentSheetWorkflowAction.RETURN
  ) {
    return 'Return is not available for draft payment sheets.';
  }

  if (
    status === EPaymentSheetStatus.RETURNED &&
    action === EPaymentSheetWorkflowAction.RETURN
  ) {
    return 'This payment sheet is already returned and cannot be returned again.';
  }

  if (!role) {
    return `${actionLabel} is not available at the current review stage.`;
  }

  return `${actionLabel} is not available for this payment sheet at the current status.`;
}

function isPaymentSheetDetailEditAllowed(
  row: IPaymentSheetWorkflowRow
): boolean {
  const { status } = row;

  if (!status || DETAIL_MUTATION_BLOCKED_STATUSES.has(status)) {
    return false;
  }

  const role = getWorkflowRoleForRow(row);

  if (!role || role === EPaymentSheetWorkflowRole.ACCOUNTS) {
    return false;
  }

  return true;
}

export function isPaymentSheetDetailActionAllowed(
  row: IPaymentSheetWorkflowRow,
  action: EPaymentSheetDetailAction
): boolean {
  if (
    action === EPaymentSheetDetailAction.REJECT_ITEM ||
    action === EPaymentSheetDetailAction.VERIFY_ITEM ||
    action === EPaymentSheetDetailAction.UNVERIFY_ITEM
  ) {
    return isPaymentSheetRejectAllowed(row);
  }

  if (action === EPaymentSheetDetailAction.EDIT_ITEM) {
    return isPaymentSheetDetailEditAllowed(row);
  }

  const { status } = row;

  if (!status || DETAIL_MUTATION_BLOCKED_STATUSES.has(status)) {
    return false;
  }

  const currentRole = getWorkflowRoleForRow(row);
  const requiredRole = DETAIL_ACTION_REQUIRED_ROLE[action];

  if (!currentRole || !requiredRole || currentRole !== requiredRole) {
    return false;
  }

  return true;
}

export function isPaymentSheetDetailActionDisabled(
  row: IPaymentSheetWorkflowRow,
  action: EPaymentSheetDetailAction
): boolean {
  return !isPaymentSheetDetailActionAllowed(row, action);
}

export function getPaymentSheetDetailActionDisableReason(
  row: IPaymentSheetWorkflowRow,
  action: EPaymentSheetDetailAction
): string | undefined {
  if (!isPaymentSheetDetailActionDisabled(row, action)) {
    return undefined;
  }

  const actionLabel = DETAIL_ACTION_LABEL[action];
  const { status } = row;
  const currentRole = getWorkflowRoleForRow(row);
  const requiredRole =
    action === EPaymentSheetDetailAction.EDIT_ITEM
      ? currentRole && currentRole !== EPaymentSheetWorkflowRole.ACCOUNTS
        ? currentRole
        : undefined
      : action === EPaymentSheetDetailAction.REJECT_ITEM ||
          action === EPaymentSheetDetailAction.VERIFY_ITEM ||
          action === EPaymentSheetDetailAction.UNVERIFY_ITEM
        ? (getWorkflowRoleForRow(row) ?? undefined)
        : DETAIL_ACTION_REQUIRED_ROLE[action];

  if (status === EPaymentSheetStatus.COMPLETED) {
    return `This payment sheet is completed and ${actionLabel.toLowerCase()} is no longer available.`;
  }

  if (status === EPaymentSheetStatus.REJECTED) {
    return `This payment sheet is rejected and ${actionLabel.toLowerCase()} is no longer available.`;
  }

  if (
    action === EPaymentSheetDetailAction.EDIT_ITEM &&
    currentRole === EPaymentSheetWorkflowRole.ACCOUNTS
  ) {
    return 'Edit is not available while the payment sheet is with accounts for processing.';
  }

  if (requiredRole && currentRole && currentRole !== requiredRole) {
    return `${actionLabel} is only available while the payment sheet is with ${WORKFLOW_ROLE_STAGE_LABEL[requiredRole]}.`;
  }

  if (!currentRole || !requiredRole) {
    return `${actionLabel} is not available at the current review stage.`;
  }

  return `${actionLabel} is not available for this payment sheet at the current status.`;
}
