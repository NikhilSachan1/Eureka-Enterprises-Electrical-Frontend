import {
  EPaymentSheetItemStatus,
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetWorkflowRole,
} from '../types/payment-sheet.enum';
import { IPaymentSheetWorkflowRow } from '../types/payment-sheet.interface';
import { IPaymentSheetDetailItemRow } from '../types/payment-sheet-detail.interface';
import { EUserRole } from '@shared/constants';

type ActiveRole = string | null | undefined;
type PaymentSheetTableActionRow = IPaymentSheetDetailItemRow;

export function isPaymentSheetDraftOrReturned(
  row: IPaymentSheetWorkflowRow
): boolean {
  const { status } = row;

  return (
    status === EPaymentSheetStatus.DRAFT ||
    status === EPaymentSheetStatus.RETURNED
  );
}

export function isPaymentSheetHrReview(row: IPaymentSheetWorkflowRow): boolean {
  return (
    row.status === EPaymentSheetStatus.IN_REVIEW &&
    row.currentStage === EPaymentSheetStage.HR_REVIEW
  );
}

export function isPaymentSheetAdminReview(
  row: IPaymentSheetWorkflowRow
): boolean {
  return (
    row.status === EPaymentSheetStatus.IN_REVIEW &&
    row.currentStage === EPaymentSheetStage.ADMIN_REVIEW
  );
}

export function isPaymentSheetProcessing(
  row: IPaymentSheetWorkflowRow
): boolean {
  return row.status === EPaymentSheetStatus.PROCESSING;
}

export function isPaymentSheetCompleted(
  row: IPaymentSheetWorkflowRow
): boolean {
  return row.status === EPaymentSheetStatus.COMPLETED;
}

function paymentSheetCompletedDisableReason(actionLabel: string): string {
  return `This payment sheet is completed and ${actionLabel} is no longer available.`;
}

function paymentSheetDraftOrReturnedOmDisableReason(
  actionLabel: string
): string {
  return `${actionLabel} can only be performed by Operation Manager while the payment sheet is in draft or returned.`;
}

export function isPaymentSheetItemPaid(
  row: PaymentSheetTableActionRow
): boolean {
  const itemStatus = row.itemStatus?.toLowerCase().trim();

  if (itemStatus === EPaymentSheetItemStatus.PAID) {
    return true;
  }

  return Boolean(row.paidAt) || Boolean(row.paymentRef);
}

function paymentSheetItemPaidDisableReason(actionLabel: string): string {
  return `This beneficiary is already paid and ${actionLabel} is no longer available.`;
}

function normalizePaymentSheetItemStatus(
  itemStatus: string | null | undefined
): string {
  return itemStatus?.toLowerCase().trim() ?? '';
}

export function isPaymentSheetItemRejected(
  row: PaymentSheetTableActionRow
): boolean {
  return (
    normalizePaymentSheetItemStatus(row.itemStatus) ===
    EPaymentSheetItemStatus.REJECTED
  );
}

export function isPaymentSheetItemVerifiedForCurrentStage(
  row: PaymentSheetTableActionRow
): boolean {
  return row.isVerifiedForCurrentStage;
}

export function isPaymentSheetItemVerified(
  row: PaymentSheetTableActionRow
): boolean {
  if (isPaymentSheetItemVerifiedForCurrentStage(row)) {
    return true;
  }

  if (
    normalizePaymentSheetItemStatus(row.itemStatus) ===
    EPaymentSheetItemStatus.VERIFIED
  ) {
    return true;
  }

  return row.verifiedStages.length > 0;
}

function canPerformPaymentSheetVerifyOrUnverify(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): boolean {
  return (
    (isPaymentSheetHrReview(row) && activeRole === EUserRole.HR) ||
    (isPaymentSheetAdminReview(row) && activeRole === EUserRole.ADMIN)
  );
}

export function getPaymentSheetWorkflowOwnerLabel(
  row: IPaymentSheetWorkflowRow
): string {
  if (isPaymentSheetDraftOrReturned(row)) {
    return 'Operation Manager';
  }

  if (isPaymentSheetHrReview(row)) {
    return 'HR';
  }

  if (isPaymentSheetAdminReview(row)) {
    return 'Admin';
  }

  if (isPaymentSheetProcessing(row)) {
    return 'Accounts';
  }

  return 'the assigned reviewer';
}

export function disablePaymentSheetEdit(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): boolean {
  if (isPaymentSheetCompleted(row) || isPaymentSheetItemPaid(row)) {
    return true;
  }

  const canEdit =
    (isPaymentSheetDraftOrReturned(row) &&
      activeRole === EUserRole.OPERATION_MANAGER) ||
    (isPaymentSheetHrReview(row) && activeRole === EUserRole.HR) ||
    (isPaymentSheetAdminReview(row) && activeRole === EUserRole.ADMIN);

  return !canEdit;
}

export function paymentSheetEditDisableReason(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): string | undefined {
  if (isPaymentSheetCompleted(row)) {
    return paymentSheetCompletedDisableReason('Edit');
  }

  if (isPaymentSheetItemPaid(row)) {
    return paymentSheetItemPaidDisableReason('Edit');
  }

  if (!disablePaymentSheetEdit(row, activeRole)) {
    return undefined;
  }

  if (isPaymentSheetDraftOrReturned(row)) {
    return paymentSheetDraftOrReturnedOmDisableReason('Edit');
  }

  if (isPaymentSheetHrReview(row)) {
    return 'Edit can only be performed by HR while the payment sheet is in HR review.';
  }

  if (isPaymentSheetAdminReview(row)) {
    return 'Edit can only be performed by Admin while the payment sheet is in Admin review.';
  }

  return `Edit is not available while the payment sheet is with ${getPaymentSheetWorkflowOwnerLabel(row)}.`;
}

export function disablePaymentSheetDelete(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): boolean {
  if (
    isPaymentSheetCompleted(row) ||
    isPaymentSheetItemPaid(row) ||
    isPaymentSheetItemVerified(row) ||
    isPaymentSheetItemRejected(row)
  ) {
    return true;
  }

  return !(
    isPaymentSheetDraftOrReturned(row) &&
    activeRole === EUserRole.OPERATION_MANAGER
  );
}

export function paymentSheetDeleteDisableReason(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): string | undefined {
  if (isPaymentSheetCompleted(row)) {
    return paymentSheetCompletedDisableReason('Delete');
  }

  if (isPaymentSheetItemPaid(row)) {
    return paymentSheetItemPaidDisableReason('Delete');
  }

  if (isPaymentSheetItemVerified(row)) {
    return 'Verified beneficiaries cannot be deleted.';
  }

  if (isPaymentSheetItemRejected(row)) {
    return 'Rejected beneficiaries cannot be deleted.';
  }

  if (!disablePaymentSheetDelete(row, activeRole)) {
    return undefined;
  }

  if (isPaymentSheetDraftOrReturned(row)) {
    return paymentSheetDraftOrReturnedOmDisableReason('Delete');
  }

  return `Delete is not available while the payment sheet is with ${getPaymentSheetWorkflowOwnerLabel(row)}.`;
}

export function disablePaymentSheetVerify(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): boolean {
  if (isPaymentSheetCompleted(row) || isPaymentSheetItemPaid(row)) {
    return true;
  }

  if (
    isPaymentSheetItemRejected(row) ||
    isPaymentSheetItemVerifiedForCurrentStage(row)
  ) {
    return true;
  }

  return !canPerformPaymentSheetVerifyOrUnverify(row, activeRole);
}

export function paymentSheetVerifyDisableReason(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): string | undefined {
  if (isPaymentSheetCompleted(row)) {
    return paymentSheetCompletedDisableReason('Verify');
  }

  if (isPaymentSheetItemPaid(row)) {
    return paymentSheetItemPaidDisableReason('Verify');
  }

  if (isPaymentSheetItemRejected(row)) {
    return 'Rejected beneficiaries cannot be verified.';
  }

  if (isPaymentSheetItemVerifiedForCurrentStage(row)) {
    return 'This beneficiary is already verified.';
  }

  if (!disablePaymentSheetVerify(row, activeRole)) {
    return undefined;
  }

  if (isPaymentSheetHrReview(row)) {
    return 'Verify can only be performed by HR while the payment sheet is in HR review.';
  }

  if (isPaymentSheetAdminReview(row)) {
    return 'Verify can only be performed by Admin while the payment sheet is in Admin review.';
  }

  return `Verify is not available while the payment sheet is with ${getPaymentSheetWorkflowOwnerLabel(row)}.`;
}

export function disablePaymentSheetUnverify(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): boolean {
  if (isPaymentSheetCompleted(row) || isPaymentSheetItemPaid(row)) {
    return true;
  }

  if (
    isPaymentSheetItemRejected(row) ||
    !isPaymentSheetItemVerifiedForCurrentStage(row)
  ) {
    return true;
  }

  return !canPerformPaymentSheetVerifyOrUnverify(row, activeRole);
}

export function paymentSheetUnverifyDisableReason(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): string | undefined {
  if (isPaymentSheetCompleted(row)) {
    return paymentSheetCompletedDisableReason('Unverify');
  }

  if (isPaymentSheetItemPaid(row)) {
    return paymentSheetItemPaidDisableReason('Unverify');
  }

  if (isPaymentSheetItemRejected(row)) {
    return 'Rejected beneficiaries cannot be unverified.';
  }

  if (!isPaymentSheetItemVerifiedForCurrentStage(row)) {
    return 'This beneficiary is not verified yet.';
  }

  if (!disablePaymentSheetUnverify(row, activeRole)) {
    return undefined;
  }

  if (isPaymentSheetHrReview(row)) {
    return 'Unverify can only be performed by HR while the payment sheet is in HR review.';
  }

  if (isPaymentSheetAdminReview(row)) {
    return 'Unverify can only be performed by Admin while the payment sheet is in Admin review.';
  }

  return `Unverify is not available while the payment sheet is with ${getPaymentSheetWorkflowOwnerLabel(row)}.`;
}

export function disablePaymentSheetRejectItem(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): boolean {
  if (isPaymentSheetCompleted(row) || isPaymentSheetItemPaid(row)) {
    return true;
  }

  if (
    isPaymentSheetItemRejected(row) ||
    isPaymentSheetItemVerifiedForCurrentStage(row)
  ) {
    return true;
  }

  const canReject =
    (isPaymentSheetHrReview(row) && activeRole === EUserRole.HR) ||
    (isPaymentSheetAdminReview(row) && activeRole === EUserRole.ADMIN) ||
    (isPaymentSheetProcessing(row) &&
      activeRole === EPaymentSheetWorkflowRole.ACCOUNTS);

  return !canReject;
}

export function paymentSheetRejectItemDisableReason(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): string | undefined {
  if (isPaymentSheetCompleted(row)) {
    return paymentSheetCompletedDisableReason('Reject');
  }

  if (isPaymentSheetItemPaid(row)) {
    return paymentSheetItemPaidDisableReason('Reject');
  }

  if (isPaymentSheetItemRejected(row)) {
    return 'This beneficiary is already rejected.';
  }

  if (isPaymentSheetItemVerifiedForCurrentStage(row)) {
    return 'Verified beneficiaries cannot be rejected.';
  }

  if (!disablePaymentSheetRejectItem(row, activeRole)) {
    return undefined;
  }

  if (isPaymentSheetHrReview(row)) {
    return 'Reject can only be performed by HR while the payment sheet is in HR review.';
  }

  if (isPaymentSheetAdminReview(row)) {
    return 'Reject can only be performed by Admin while the payment sheet is in Admin review.';
  }

  return `Reject is not available while the payment sheet is with ${getPaymentSheetWorkflowOwnerLabel(row)}.`;
}

export function disablePaymentSheetRecordPayment(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): boolean {
  if (isPaymentSheetCompleted(row) || isPaymentSheetItemPaid(row)) {
    return true;
  }

  return !(
    isPaymentSheetProcessing(row) &&
    activeRole === EPaymentSheetWorkflowRole.ACCOUNTS
  );
}

export function paymentSheetRecordPaymentDisableReason(
  row: PaymentSheetTableActionRow,
  activeRole: ActiveRole
): string | undefined {
  if (isPaymentSheetCompleted(row)) {
    return paymentSheetCompletedDisableReason('Record payment');
  }

  if (isPaymentSheetItemPaid(row)) {
    return paymentSheetItemPaidDisableReason('Record payment');
  }

  if (!disablePaymentSheetRecordPayment(row, activeRole)) {
    return undefined;
  }

  if (isPaymentSheetProcessing(row)) {
    return 'Record payment can only be performed by Accounts while the payment sheet is in processing.';
  }

  return `Record payment is not available while the payment sheet is with ${getPaymentSheetWorkflowOwnerLabel(row)}.`;
}
