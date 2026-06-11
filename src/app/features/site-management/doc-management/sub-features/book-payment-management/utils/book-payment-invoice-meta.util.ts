export interface IBookPaymentInvoiceDropdownMeta {
  taxableAmount: number;
  gstAmount: number;
  tdsAmount: number;
  totalAmount: number;
  isGstHold?: boolean | null;
  bookedTotal?: number;
  paidTotal?: number;
  remaining?: number;
}

export function getBookPaymentInvoiceGstHoldLabel(
  isGstHold: boolean | null | undefined
): string {
  return isGstHold === false ? 'No Hold' : 'Hold';
}

export const BOOK_PAYMENT_FORM_CONTEXT_KEYS = {
  invoiceRemaining: 'invoiceRemaining',
} as const;

export function isBookPaymentHoldReasonRequired(
  amount: unknown,
  remaining: unknown
): boolean {
  if (
    remaining === null ||
    remaining === undefined ||
    amount === null ||
    amount === undefined ||
    amount === ''
  ) {
    return false;
  }

  const amountNum = Number(amount);
  const remainingNum = Number(remaining);

  if (Number.isNaN(amountNum) || Number.isNaN(remainingNum)) {
    return false;
  }

  return amountNum < remainingNum;
}
