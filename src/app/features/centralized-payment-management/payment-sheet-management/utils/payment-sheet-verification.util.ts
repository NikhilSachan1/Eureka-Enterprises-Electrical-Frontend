import { EPaymentSheetStage } from '../types/payment-sheet.enum';

export function getPaymentSheetVerificationStageLabel(stage: string): string {
  switch (stage.toUpperCase()) {
    case EPaymentSheetStage.INITIATION:
      return 'Operation Manager';
    case EPaymentSheetStage.HR_REVIEW:
      return 'HR';
    case EPaymentSheetStage.ADMIN_REVIEW:
      return 'Admin';
    case EPaymentSheetStage.PROCESSING:
      return 'Accounts';
    default:
      return stage;
  }
}

export function getVisiblePaymentSheetItemVerificationStages(
  currentStage: string | null | undefined,
  verifiedStages: string[],
  options?: {
    onlyVerifiedStages?: string[];
  }
): EPaymentSheetStage[] {
  if (options?.onlyVerifiedStages) {
    const verifiedStageSet = new Set(
      options.onlyVerifiedStages.map(stage => stage.toUpperCase())
    );
    const stages: EPaymentSheetStage[] = [];

    if (verifiedStageSet.has(EPaymentSheetStage.HR_REVIEW)) {
      stages.push(EPaymentSheetStage.HR_REVIEW);
    }

    if (verifiedStageSet.has(EPaymentSheetStage.ADMIN_REVIEW)) {
      stages.push(EPaymentSheetStage.ADMIN_REVIEW);
    }

    return stages;
  }

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
