import { EPaymentSheetItemStatus } from '../types/payment-sheet.enum';

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
