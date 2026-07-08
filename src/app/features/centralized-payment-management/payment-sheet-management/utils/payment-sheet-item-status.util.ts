import {
  EPaymentSheetItemStatus,
  EPaymentSheetStatus,
} from '../types/payment-sheet.enum';
import { IPaymentSheetDetailItemRow } from '../types/payment-sheet-detail.interface';
import { isPaymentSheetRejectDisabled } from './payment-sheet-status.util';

export function normalizePaymentSheetItemStatusCode(
  status: string | null | undefined
): string {
  return (status ?? '').trim().toLowerCase();
}

export function isPaymentSheetItemVerifyAllowed(
  itemStatusCode: string | null | undefined
): boolean {
  const status = normalizePaymentSheetItemStatusCode(itemStatusCode);

  return (
    status === EPaymentSheetItemStatus.PENDING ||
    status === EPaymentSheetItemStatus.UNVERIFIED
  );
}

export function isPaymentSheetItemUnverifyAllowed(
  itemStatusCode: string | null | undefined
): boolean {
  const status = normalizePaymentSheetItemStatusCode(itemStatusCode);

  return (
    status === EPaymentSheetItemStatus.PENDING ||
    status === EPaymentSheetItemStatus.VERIFIED
  );
}

export function getPaymentSheetItemVerifyDisableReason(
  itemStatusCode: string | null | undefined
): string | undefined {
  if (isPaymentSheetItemVerifyAllowed(itemStatusCode)) {
    return undefined;
  }

  const status = normalizePaymentSheetItemStatusCode(itemStatusCode);

  if (status === EPaymentSheetItemStatus.VERIFIED) {
    return 'This beneficiary is already verified.';
  }

  if (status === EPaymentSheetItemStatus.REJECTED) {
    return 'Rejected beneficiaries cannot be verified.';
  }

  if (status === EPaymentSheetItemStatus.PAID) {
    return 'Paid beneficiaries cannot be verified.';
  }

  return 'Verify is not available for this beneficiary status.';
}

export function getPaymentSheetItemUnverifyDisableReason(
  itemStatusCode: string | null | undefined
): string | undefined {
  if (isPaymentSheetItemUnverifyAllowed(itemStatusCode)) {
    return undefined;
  }

  const status = normalizePaymentSheetItemStatusCode(itemStatusCode);

  if (status === EPaymentSheetItemStatus.UNVERIFIED) {
    return 'This beneficiary is not verified yet.';
  }

  if (status === EPaymentSheetItemStatus.REJECTED) {
    return 'Rejected beneficiaries cannot be unverified.';
  }

  if (status === EPaymentSheetItemStatus.PAID) {
    return 'Paid beneficiaries cannot be unverified.';
  }

  return 'Unverify is not available for this beneficiary status.';
}

export function getPaymentSheetDetailItemVerifyDisableReason(
  itemRow: IPaymentSheetDetailItemRow
): string | undefined {
  if (isPaymentSheetRejectDisabled(itemRow)) {
    const { status } = itemRow;

    if (status === EPaymentSheetStatus.COMPLETED) {
      return 'This payment sheet is completed and verify is no longer available.';
    }

    if (status === EPaymentSheetStatus.REJECTED) {
      return 'This payment sheet is rejected and verify is no longer available.';
    }

    return 'Verify is not available at the current review stage.';
  }

  return getPaymentSheetItemVerifyDisableReason(itemRow.itemStatusCode);
}

export function isPaymentSheetDetailItemVerifyDisabled(
  itemRow: IPaymentSheetDetailItemRow
): boolean {
  return (
    isPaymentSheetRejectDisabled(itemRow) ||
    !isPaymentSheetItemVerifyAllowed(itemRow.itemStatusCode)
  );
}

export function isPaymentSheetDetailItemUnverifyDisabled(
  itemRow: IPaymentSheetDetailItemRow
): boolean {
  return (
    isPaymentSheetRejectDisabled(itemRow) ||
    !isPaymentSheetItemUnverifyAllowed(itemRow.itemStatusCode)
  );
}

export function getPaymentSheetDetailItemUnverifyDisableReason(
  itemRow: IPaymentSheetDetailItemRow
): string | undefined {
  if (isPaymentSheetRejectDisabled(itemRow)) {
    const { status } = itemRow;

    if (status === EPaymentSheetStatus.COMPLETED) {
      return 'This payment sheet is completed and unverify is no longer available.';
    }

    if (status === EPaymentSheetStatus.REJECTED) {
      return 'This payment sheet is rejected and unverify is no longer available.';
    }

    return 'Unverify is not available at the current review stage.';
  }

  return getPaymentSheetItemUnverifyDisableReason(itemRow.itemStatusCode);
}
