import { EUserRole } from '@shared/constants';

export enum EPaymentSheetBeneficiaryType {
  USER = 'USER',
  VENDOR = 'VENDOR',
}

export enum EPaymentSheetSourceType {
  EXPENSE = 'EXPENSE',
  FUEL_EXPENSE = 'FUEL_EXPENSE',
  VENDOR_PAYMENT = 'VENDOR_PAYMENT',
}

export enum EPaymentSheetStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  RETURNED = 'RETURNED',
  REJECTED = 'REJECTED',
}

export enum EPaymentSheetStage {
  INITIATION = 'INITIATION',
  HR_REVIEW = 'HR_REVIEW',
  ADMIN_REVIEW = 'ADMIN_REVIEW',
  PROCESSING = 'PROCESSING',
}

/** Payment sheet workflow actors aligned with {@link EUserRole} where applicable. */
export enum EPaymentSheetWorkflowRole {
  OPERATION_MANAGER = EUserRole.OPERATION_MANAGER,
  HR = EUserRole.HR,
  ADMIN = EUserRole.ADMIN,
  /** Processing stage; uses process permission (no dedicated {@link EUserRole}). */
  ACCOUNTS = 'ACCOUNTS',
}

export enum EPaymentSheetWorkflowAction {
  RETURN = 'return',
  REJECT = 'reject',
}

export enum EPaymentSheetDetailAction {
  ADD_BENEFICIARY = 'add-beneficiary',
  EDIT_ITEM = 'edit-item',
  DELETE_ITEM = 'delete-item',
  REJECT_ITEM = 'reject-item',
  VERIFY_ITEM = 'verify-item',
  UNVERIFY_ITEM = 'unverify-item',
  RECORD_PAYMENT = 'record-payment',
  FORWARD_TO_HR = 'forward-to-hr',
  FORWARD_TO_ADMIN = 'forward-to-admin',
  FORWARD_TO_ACCOUNTANT = 'forward-to-accountant',
}

export enum EPaymentSheetWorkflowActionType {
  FORWARD_TO_HR = 'forward-to-hr',
  FORWARD_TO_ADMIN = 'forward-to-admin',
  FORWARD_TO_ACCOUNTANT = 'forward-to-accountant',
}

export enum EPaymentSheetItemStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export const PAYMENT_SHEET_WORKFLOW_ACTION_TYPES = [
  EPaymentSheetWorkflowActionType.FORWARD_TO_HR,
  EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN,
  EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT,
] as const;
