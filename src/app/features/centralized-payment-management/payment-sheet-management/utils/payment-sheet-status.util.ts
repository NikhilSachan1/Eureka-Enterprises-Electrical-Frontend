import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { AppPermissionService } from '@core/services';
import {
  EPaymentSheetDetailAction,
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetWorkflowAction,
  EPaymentSheetWorkflowActionType,
  EPaymentSheetWorkflowRole,
} from '../types/payment-sheet.enum';
import {
  IPaymentSheetWorkflowPermissions,
  IPaymentSheetWorkflowRow,
} from '../types/payment-sheet.interface';

/** Show return when user has a workflow review/process permission (not create). */
export const PAYMENT_SHEET_RETURN_VISIBLE_PERMISSIONS = [
  APP_PERMISSION.PAYMENT_SHEET.HR_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ADMIN_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ACCOUNTS_PROCESS,
] as const;

/** Show reject when user has any payment sheet workflow permission. */
export const PAYMENT_SHEET_REJECT_VISIBLE_PERMISSIONS = [
  APP_PERMISSION.PAYMENT_SHEET.CREATE,
  APP_PERMISSION.PAYMENT_SHEET.HR_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ADMIN_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ACCOUNTS_PROCESS,
] as const;

/** Route access for payment sheet detail (any workflow participant). */
export const PAYMENT_SHEET_DETAIL_ROUTE_PERMISSIONS = [
  APP_PERMISSION.PAYMENT_SHEET.TABLE_VIEW,
  APP_PERMISSION.PAYMENT_SHEET.CREATE,
  APP_PERMISSION.PAYMENT_SHEET.HR_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ADMIN_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ACCOUNTS_PROCESS,
] as const;

/** Detail page line-item action visibility. */
export const PAYMENT_SHEET_DETAIL_ITEM_EDIT_PERMISSIONS = [
  APP_PERMISSION.PAYMENT_SHEET.CREATE,
  APP_PERMISSION.PAYMENT_SHEET.HR_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ADMIN_REVIEW,
] as const;

export const PAYMENT_SHEET_DETAIL_ITEM_DELETE_PERMISSIONS = [
  APP_PERMISSION.PAYMENT_SHEET.CREATE,
] as const;

export const PAYMENT_SHEET_DETAIL_ITEM_REJECT_PERMISSIONS = [
  APP_PERMISSION.PAYMENT_SHEET.CREATE,
  APP_PERMISSION.PAYMENT_SHEET.HR_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ADMIN_REVIEW,
  APP_PERMISSION.PAYMENT_SHEET.ACCOUNTS_PROCESS,
] as const;

export const PAYMENT_SHEET_DETAIL_ITEM_RECORD_PAYMENT_PERMISSIONS = [
  APP_PERMISSION.PAYMENT_SHEET.ACCOUNTS_PROCESS,
] as const;

/** Forward action visibility by workflow role permission. */
export const PAYMENT_SHEET_FORWARD_ACTION_PERMISSION: Record<
  EPaymentSheetWorkflowActionType,
  (typeof APP_PERMISSION.PAYMENT_SHEET)[keyof typeof APP_PERMISSION.PAYMENT_SHEET]
> = {
  [EPaymentSheetWorkflowActionType.FORWARD_TO_HR]:
    APP_PERMISSION.PAYMENT_SHEET.CREATE,
  [EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN]:
    APP_PERMISSION.PAYMENT_SHEET.HR_REVIEW,
  [EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT]:
    APP_PERMISSION.PAYMENT_SHEET.ADMIN_REVIEW,
};

const WORKFLOW_ROLE_PERMISSION: Record<
  EPaymentSheetWorkflowRole,
  (typeof APP_PERMISSION.PAYMENT_SHEET)[keyof typeof APP_PERMISSION.PAYMENT_SHEET]
> = {
  [EPaymentSheetWorkflowRole.OPERATION_MANAGER]:
    APP_PERMISSION.PAYMENT_SHEET.CREATE,
  [EPaymentSheetWorkflowRole.HR]: APP_PERMISSION.PAYMENT_SHEET.HR_REVIEW,
  [EPaymentSheetWorkflowRole.ADMIN]: APP_PERMISSION.PAYMENT_SHEET.ADMIN_REVIEW,
  [EPaymentSheetWorkflowRole.ACCOUNTS]:
    APP_PERMISSION.PAYMENT_SHEET.ACCOUNTS_PROCESS,
};

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

export function getPaymentSheetWorkflowPermissions(
  permissionService: AppPermissionService
): IPaymentSheetWorkflowPermissions {
  return {
    canCreate: permissionService.hasPermission(
      WORKFLOW_ROLE_PERMISSION[EPaymentSheetWorkflowRole.OPERATION_MANAGER]
    ),
    canReview: permissionService.hasPermission(
      WORKFLOW_ROLE_PERMISSION[EPaymentSheetWorkflowRole.HR]
    ),
    canAdminReview: permissionService.hasPermission(
      WORKFLOW_ROLE_PERMISSION[EPaymentSheetWorkflowRole.ADMIN]
    ),
    canProcess: permissionService.hasPermission(
      WORKFLOW_ROLE_PERMISSION[EPaymentSheetWorkflowRole.ACCOUNTS]
    ),
  };
}

function isWorkflowRoleAllowed(
  role: EPaymentSheetWorkflowRole,
  permissions: IPaymentSheetWorkflowPermissions
): boolean {
  switch (role) {
    case EPaymentSheetWorkflowRole.OPERATION_MANAGER:
      return permissions.canCreate;
    case EPaymentSheetWorkflowRole.HR:
      return permissions.canReview;
    case EPaymentSheetWorkflowRole.ADMIN:
      return permissions.canAdminReview;
    case EPaymentSheetWorkflowRole.ACCOUNTS:
      return permissions.canProcess;
    default:
      return false;
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
  permissions: IPaymentSheetWorkflowPermissions,
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

  const role = getWorkflowRoleForRow(row);
  return role !== null && isWorkflowRoleAllowed(role, permissions);
}

export function isPaymentSheetReturnAllowed(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions
): boolean {
  return isPaymentSheetActionAllowed(
    row,
    permissions,
    EPaymentSheetWorkflowAction.RETURN
  );
}

export function isPaymentSheetRejectAllowed(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions
): boolean {
  return isPaymentSheetActionAllowed(
    row,
    permissions,
    EPaymentSheetWorkflowAction.REJECT
  );
}

export function isPaymentSheetReturnDisabled(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions
): boolean {
  return !isPaymentSheetReturnAllowed(row, permissions);
}

export function isPaymentSheetRejectDisabled(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions
): boolean {
  return !isPaymentSheetRejectAllowed(row, permissions);
}

export function getPaymentSheetReturnDisableReason(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions
): string | undefined {
  if (!isPaymentSheetReturnDisabled(row, permissions)) {
    return undefined;
  }

  return getPaymentSheetActionDisableReason(
    row,
    permissions,
    EPaymentSheetWorkflowAction.RETURN
  );
}

export function getPaymentSheetRejectDisableReason(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions
): string | undefined {
  if (!isPaymentSheetRejectDisabled(row, permissions)) {
    return undefined;
  }

  return getPaymentSheetActionDisableReason(
    row,
    permissions,
    EPaymentSheetWorkflowAction.REJECT
  );
}

function getPaymentSheetActionDisableReason(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions,
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

  if (role && !isWorkflowRoleAllowed(role, permissions)) {
    return `${actionLabel} is available only for ${WORKFLOW_ROLE_STAGE_LABEL[role]} at this stage.`;
  }

  if (!role) {
    return `${actionLabel} is not available at the current review stage.`;
  }

  return `${actionLabel} is not available for this payment sheet at the current status.`;
}

function isPaymentSheetDetailEditAllowed(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions
): boolean {
  const { status } = row;

  if (!status || DETAIL_MUTATION_BLOCKED_STATUSES.has(status)) {
    return false;
  }

  const role = getWorkflowRoleForRow(row);

  if (!role || role === EPaymentSheetWorkflowRole.ACCOUNTS) {
    return false;
  }

  return isWorkflowRoleAllowed(role, permissions);
}

export function isPaymentSheetDetailActionAllowed(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions,
  action: EPaymentSheetDetailAction
): boolean {
  if (action === EPaymentSheetDetailAction.REJECT_ITEM) {
    return isPaymentSheetRejectAllowed(row, permissions);
  }

  if (action === EPaymentSheetDetailAction.EDIT_ITEM) {
    return isPaymentSheetDetailEditAllowed(row, permissions);
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

  return isWorkflowRoleAllowed(currentRole, permissions);
}

export function isPaymentSheetDetailActionDisabled(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions,
  action: EPaymentSheetDetailAction
): boolean {
  return !isPaymentSheetDetailActionAllowed(row, permissions, action);
}

export function getPaymentSheetDetailActionDisableReason(
  row: IPaymentSheetWorkflowRow,
  permissions: IPaymentSheetWorkflowPermissions,
  action: EPaymentSheetDetailAction
): string | undefined {
  if (!isPaymentSheetDetailActionDisabled(row, permissions, action)) {
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
      : action === EPaymentSheetDetailAction.REJECT_ITEM
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

  if (
    requiredRole &&
    currentRole === requiredRole &&
    !isWorkflowRoleAllowed(requiredRole, permissions)
  ) {
    return `${actionLabel} is available only for ${WORKFLOW_ROLE_STAGE_LABEL[requiredRole]} at this stage.`;
  }

  if (!currentRole || !requiredRole) {
    return `${actionLabel} is not available at the current review stage.`;
  }

  return `${actionLabel} is not available for this payment sheet at the current status.`;
}
