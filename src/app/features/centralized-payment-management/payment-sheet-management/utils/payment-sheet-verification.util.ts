import { EPaymentSheetStage } from '../types/payment-sheet.enum';

export function getPaymentSheetVerificationStageLabel(stage: string): string {
  switch (stage) {
    case EPaymentSheetStage.HR_REVIEW:
      return 'HR';
    case EPaymentSheetStage.ADMIN_REVIEW:
      return 'Admin';
    default:
      return stage;
  }
}

export function getVisiblePaymentSheetItemVerificationStages(
  currentStage: string | null | undefined,
  verifiedStages: string[]
): EPaymentSheetStage[] {
  const stages: EPaymentSheetStage[] = [];

  const showHr =
    currentStage === EPaymentSheetStage.HR_REVIEW ||
    currentStage === EPaymentSheetStage.ADMIN_REVIEW ||
    currentStage === EPaymentSheetStage.PROCESSING ||
    verifiedStages.includes(EPaymentSheetStage.HR_REVIEW) ||
    verifiedStages.includes(EPaymentSheetStage.ADMIN_REVIEW);

  const showAdmin =
    currentStage === EPaymentSheetStage.ADMIN_REVIEW ||
    currentStage === EPaymentSheetStage.PROCESSING ||
    verifiedStages.includes(EPaymentSheetStage.ADMIN_REVIEW);

  if (showHr) {
    stages.push(EPaymentSheetStage.HR_REVIEW);
  }

  if (showAdmin) {
    stages.push(EPaymentSheetStage.ADMIN_REVIEW);
  }

  return stages;
}
