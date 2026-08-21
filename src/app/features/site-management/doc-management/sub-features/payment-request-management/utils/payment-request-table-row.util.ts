import { IPaymentRequestGetBaseResponseDto } from '../types/payment-request.dto';

function normalizePaymentRequestStatus(
  status: string | null | undefined
): string {
  return (status ?? '').trim().toLowerCase();
}

export function isPaymentRequestPending(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  const status = normalizePaymentRequestStatus(row.status);
  return status === 'pending' || status === 'pending approval';
}

export function parsePaymentRequestAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function shouldDisablePaymentRequestApprove(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  return !isPaymentRequestPending(row);
}

export function shouldDisablePaymentRequestReject(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  return !isPaymentRequestPending(row);
}

export const PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON = {
  actionOnlyWhilePending:
    'Approve and reject are only available while the payment request is pending.',
  editOnlyWhilePending:
    'Edit is only available while the payment request is pending.',
  deleteOnlyWhilePending:
    'Delete is only available while the payment request is pending.',
} as const;

export function shouldDisablePaymentRequestEdit(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  return !isPaymentRequestPending(row);
}

export function shouldDisablePaymentRequestDelete(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  return !isPaymentRequestPending(row);
}

export function paymentRequestEditDisableReason(
  row: IPaymentRequestGetBaseResponseDto
): string {
  if (!shouldDisablePaymentRequestEdit(row)) {
    return '';
  }
  return PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON.editOnlyWhilePending;
}

export function paymentRequestDeleteDisableReason(
  row: IPaymentRequestGetBaseResponseDto
): string {
  if (!shouldDisablePaymentRequestDelete(row)) {
    return '';
  }
  return PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON.deleteOnlyWhilePending;
}

export function paymentRequestApproveDisableReason(
  row: IPaymentRequestGetBaseResponseDto
): string {
  if (!shouldDisablePaymentRequestApprove(row)) {
    return '';
  }
  return PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON.actionOnlyWhilePending;
}

export function paymentRequestRejectDisableReason(
  row: IPaymentRequestGetBaseResponseDto
): string {
  if (!shouldDisablePaymentRequestReject(row)) {
    return '';
  }
  return PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON.actionOnlyWhilePending;
}
