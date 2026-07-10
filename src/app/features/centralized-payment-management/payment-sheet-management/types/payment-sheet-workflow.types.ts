import { EPaymentSheetStage } from './payment-sheet.enum';

export type TPaymentSheetWorkflowStepState = 'complete' | 'current' | 'pending';

export interface IPaymentSheetListWorkflowStep {
  stage: EPaymentSheetStage;
  shortLabel: string;
}

export const PAYMENT_SHEET_LIST_WORKFLOW_STEPS = [
  { stage: EPaymentSheetStage.INITIATION, shortLabel: 'Draft' },
  { stage: EPaymentSheetStage.HR_REVIEW, shortLabel: 'HR' },
  { stage: EPaymentSheetStage.ADMIN_REVIEW, shortLabel: 'Admin' },
  { stage: EPaymentSheetStage.PROCESSING, shortLabel: 'Accounts' },
] as const satisfies readonly IPaymentSheetListWorkflowStep[];
