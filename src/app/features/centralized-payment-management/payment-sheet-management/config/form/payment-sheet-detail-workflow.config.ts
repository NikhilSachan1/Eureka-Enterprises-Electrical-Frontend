import { APP_PERMISSION } from '@core/constants';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonSeverity,
  IFormButtonConfig,
} from '@shared/types';
import { EPaymentSheetWorkflowActionType } from '../../types/payment-sheet.enum';

export const PAYMENT_SHEET_DETAIL_WORKFLOW_BUTTONS_CONFIG: IFormButtonConfig = {
  forwardToHr: {
    id: EButtonActionType.SUBMIT,
    actionName: EPaymentSheetWorkflowActionType.FORWARD_TO_HR,
    label: 'Forward to HR',
    icon: ICONS.ACTIONS.SEND,
    severity: EButtonSeverity.SUCCESS,
    permission: [APP_PERMISSION.PAYMENT_SHEET.SUBMIT],
  },
  forwardToAdmin: {
    id: EButtonActionType.SUBMIT,
    actionName: EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN,
    label: 'Forward to Admin',
    icon: ICONS.ACTIONS.SEND,
    severity: EButtonSeverity.SUCCESS,
    permission: [APP_PERMISSION.PAYMENT_SHEET.FORWARD],
  },
  forwardToAccountant: {
    id: EButtonActionType.SUBMIT,
    actionName: EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT,
    label: 'Forward to Accountant',
    icon: ICONS.ACTIONS.SEND,
    severity: EButtonSeverity.SUCCESS,
    permission: [APP_PERMISSION.PAYMENT_SHEET.FORWARD],
  },
};
