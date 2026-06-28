export enum EPaymentSheetBeneficiaryType {
  USER = 'USER',
  VENDOR = 'VENDOR',
}

export enum EPaymentSheetSourceType {
  EXPENSE = 'EXPENSE',
  FUEL_EXPENSE = 'FUEL_EXPENSE',
  VENDOR_PAYMENT = 'VENDOR_PAYMENT',
}

export enum EPaymentSheetWorkflowActionType {
  FORWARD_TO_HR = 'forward-to-hr',
  FORWARD_TO_ADMIN = 'forward-to-admin',
  FORWARD_TO_ACCOUNTANT = 'forward-to-accountant',
}

export const PAYMENT_SHEET_WORKFLOW_ACTION_TYPES = [
  EPaymentSheetWorkflowActionType.FORWARD_TO_HR,
  EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN,
  EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT,
] as const;
