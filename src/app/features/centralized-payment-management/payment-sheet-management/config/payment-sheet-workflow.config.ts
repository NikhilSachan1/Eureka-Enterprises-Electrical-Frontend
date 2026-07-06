import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { EPaymentSheetWorkflowActionType } from '../types/payment-sheet.enum';

export const PAYMENT_SHEET_FORWARD_ACTION_PERMISSION: Record<
  EPaymentSheetWorkflowActionType,
  string
> = {
  [EPaymentSheetWorkflowActionType.FORWARD_TO_HR]:
    APP_PERMISSION.PAYMENT_SHEET.SUBMIT,
  [EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN]:
    APP_PERMISSION.PAYMENT_SHEET.FORWARD,
  [EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT]:
    APP_PERMISSION.PAYMENT_SHEET.FORWARD,
};
