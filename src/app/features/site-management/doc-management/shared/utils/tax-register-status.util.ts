import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

/**
 * Real-world GST / TDS rules shared by the registers, invoice and PO summaries.
 *
 * GST
 *  - Verification: invoice matched on the GST portal — GSTR-2B (purchase) / GSTR-1 (sale).
 *    Needed for every entry, held or not.
 *  - Settlement: only HELD GST, through the normal payment chain.
 *    Purchase → once verified in 2B, "release" books a GST book payment ("Release in process");
 *    its bank transfer (payment sheet or direct) makes it "Released".
 *    Sale → the client withheld it; "mark received" records a GST bank transfer ("Received").
 *    GST that was not held moved with the invoice payment ("With payment").
 *    Older settlements recorded directly (gstPaymentId) still count as settled.
 *
 * TDS
 *  - Purchase: we deduct → deposit via challan → verify once filed in 26Q.
 *  - Sale: the client deducts and deposits → we verify the credit in Form 26AS.
 */

export const TAX_STATUS_LABEL = {
  VERIFIED: 'Verified',
  PENDING: 'Pending',
  WITH_PAYMENT: 'With payment',
  RELEASED: 'Released',
  RECEIVED: 'Received',
  RELEASE_PENDING: 'Release pending',
  RELEASE_IN_PROCESS: 'Release in process',
  RECEIPT_PENDING: 'Receipt pending',
  DEPOSITED: 'Deposited',
  CHALLAN_PENDING: 'Challan pending',
  DEPOSITED_BY_CLIENT: 'Deposited by client',
} as const;

export interface IGstSettlementState {
  partyType: EDocContext;
  isGstHold: boolean;
  isVerified: boolean;
  /** Legacy direct settlement. */
  gstPaymentId: string | null;
  /** Purchase: GST release booked (book payment). */
  gstBookPaymentId?: string | null;
  /** The bank transfer that moved the held GST. */
  gstBankTransferId?: string | null;
}

/** Held GST that has actually moved — by bank transfer, or a legacy direct record. */
export function isGstSettled(state: IGstSettlementState): boolean {
  return Boolean(state.gstPaymentId || state.gstBankTransferId);
}

/** Purchase: GST release booked, bank transfer not done yet. */
export function isGstReleaseInProcess(state: IGstSettlementState): boolean {
  return !isGstSettled(state) && Boolean(state.gstBookPaymentId);
}

export interface ITdsDepositState {
  partyType: EDocContext;
  isVerified: boolean;
  tdsPaymentId: string | null;
}

const isPurchase = (partyType: EDocContext): boolean =>
  partyType === EDocContext.PURCHASE;

export function getVerificationLabel(isVerified: boolean): string {
  return isVerified ? TAX_STATUS_LABEL.VERIFIED : TAX_STATUS_LABEL.PENDING;
}

// ── GST ──────────────────────────────────────────────────────────────────────

export function getGstSettlementLabel(state: IGstSettlementState): string {
  if (!state.isGstHold) {
    return TAX_STATUS_LABEL.WITH_PAYMENT;
  }
  if (isGstSettled(state)) {
    return isPurchase(state.partyType)
      ? TAX_STATUS_LABEL.RELEASED
      : TAX_STATUS_LABEL.RECEIVED;
  }
  if (isGstReleaseInProcess(state)) {
    return TAX_STATUS_LABEL.RELEASE_IN_PROCESS;
  }
  return isPurchase(state.partyType)
    ? TAX_STATUS_LABEL.RELEASE_PENDING
    : TAX_STATUS_LABEL.RECEIPT_PENDING;
}

export function getGstVerifyPortalName(partyType: EDocContext): string {
  return isPurchase(partyType) ? 'GSTR-2B' : 'GSTR-1';
}

export function getGstSettleActionLabel(partyType: EDocContext): string {
  return isPurchase(partyType) ? 'Book GST release' : 'Mark received';
}

/** Why held GST cannot be settled for this entry, or undefined when it can. */
export function getGstSettleDisableReason(
  state: IGstSettlementState
): string | undefined {
  if (!state.isGstHold) {
    return 'GST was not held — it was settled with the invoice payment.';
  }
  if (isGstSettled(state)) {
    return isPurchase(state.partyType)
      ? 'Held GST is already released to the vendor.'
      : 'Held GST is already received from the client.';
  }
  if (isGstReleaseInProcess(state)) {
    return 'GST release is already booked — pay it from the payment sheet or bank transfer.';
  }
  if (isPurchase(state.partyType) && !state.isVerified) {
    return 'Verify the invoice in GSTR-2B before releasing GST to the vendor.';
  }
  return undefined;
}

export function getGstRevertDisableReason(
  state: IGstSettlementState
): string | undefined {
  if (!state.isVerified) {
    return 'Only verified entries can be reverted.';
  }
  if (isGstSettled(state)) {
    return 'Held GST is already settled — verification can no longer be reverted.';
  }
  if (isGstReleaseInProcess(state)) {
    return 'A GST release is booked — delete the GST book payment before reverting.';
  }
  return undefined;
}

// ── Payment type (book payment / bank transfer) ──────────────────────────────

export const PAYMENT_TYPE_LABEL = {
  INVOICE: 'Invoice payment',
  ADVANCE: 'Advance payment',
  GST_RELEASE: 'GST release',
  GST_RECEIPT: 'GST receipt',
} as const;

/** What a book payment pays: the invoice, an advance, or the invoice's held GST. */
export function getBookPaymentTypeLabel(
  sourceType: string | null | undefined
): string {
  if (sourceType === 'GST_RELEASE') {
    return PAYMENT_TYPE_LABEL.GST_RELEASE;
  }
  if (sourceType === 'ADVANCE') {
    return PAYMENT_TYPE_LABEL.ADVANCE;
  }
  return PAYMENT_TYPE_LABEL.INVOICE;
}

/** What a bank transfer pays. GST: released to a vendor (purchase) / received from a client (sale). */
export function getBankTransferTypeLabel(transfer: {
  partyType: EDocContext;
  paymentType?: string | null;
  bookPayment?: { sourceType?: string | null } | null;
}): string {
  if (transfer.paymentType === 'GST') {
    return isPurchase(transfer.partyType)
      ? PAYMENT_TYPE_LABEL.GST_RELEASE
      : PAYMENT_TYPE_LABEL.GST_RECEIPT;
  }
  return isPurchase(transfer.partyType)
    ? getBookPaymentTypeLabel(transfer.bookPayment?.sourceType)
    : PAYMENT_TYPE_LABEL.INVOICE;
}

// ── TDS ──────────────────────────────────────────────────────────────────────

export function getTdsDepositLabel(state: ITdsDepositState): string {
  if (!isPurchase(state.partyType)) {
    return TAX_STATUS_LABEL.DEPOSITED_BY_CLIENT;
  }
  return state.tdsPaymentId
    ? TAX_STATUS_LABEL.DEPOSITED
    : TAX_STATUS_LABEL.CHALLAN_PENDING;
}

export function getTdsVerifyPortalName(partyType: EDocContext): string {
  return isPurchase(partyType) ? '26Q' : 'Form 26AS';
}

export function getTdsChallanDisableReason(
  state: ITdsDepositState
): string | undefined {
  if (!isPurchase(state.partyType)) {
    return 'TDS on sales is deposited by the client — verify it in Form 26AS.';
  }
  if (state.tdsPaymentId) {
    return 'Already included in a deposited challan.';
  }
  return undefined;
}

export function getTdsVerifyDisableReason(
  state: ITdsDepositState
): string | undefined {
  if (state.isVerified) {
    return 'This entry is already verified.';
  }
  if (isPurchase(state.partyType) && !state.tdsPaymentId) {
    return 'Record the TDS challan before verifying it in 26Q.';
  }
  return undefined;
}

// ── Bulk selection ───────────────────────────────────────────────────────────

/**
 * A settlement / challan covers one site and one side; a GST settlement also covers one party.
 * Returns why the selection cannot go together, or undefined when it can.
 */
export function getBulkSelectionMismatchReason(
  rows: readonly {
    partyType: EDocContext;
    siteId?: string | null;
    vendorId?: string | null;
    contractorId?: string | null;
  }[],
  options: { requireSameParty: boolean }
): string | undefined {
  const distinct = (values: (string | null | undefined)[]): number =>
    new Set(values.map(v => v ?? '')).size;

  if (distinct(rows.map(r => r.siteId)) > 1) {
    return 'Select entries of a single project only.';
  }
  if (distinct(rows.map(r => r.partyType)) > 1) {
    return 'Select either contractor or vendor entries, not both.';
  }
  if (options.requireSameParty) {
    const purchase = rows[0] ? isPurchase(rows[0].partyType) : false;
    const parties = rows.map(r => (purchase ? r.vendorId : r.contractorId));
    if (distinct(parties) > 1) {
      return purchase
        ? 'Select entries of a single vendor only.'
        : 'Select entries of a single contractor only.';
    }
  }
  return undefined;
}

/**
 * Rate shown beside a GST / TDS amount, e.g. "(18%)". Uses the invoice's own rate (rates vary per
 * invoice) and falls back to tax ÷ taxable for entries whose invoice carries no rate.
 */
export function formatTaxRateSuffix(
  rate: string | number | null | undefined,
  taxAmount: string | number | null | undefined,
  taxableAmount: string | number | null | undefined
): string {
  const label = formatTaxRateLabel(rate, taxAmount, taxableAmount);
  return label === '—' ? '' : `(${label})`;
}

/** Rate as a standalone value, e.g. "18%" — "—" when it cannot be worked out. */
export function formatTaxRateLabel(
  rate: string | number | null | undefined,
  taxAmount: string | number | null | undefined,
  taxableAmount: string | number | null | undefined
): string {
  const percent = resolveTaxRate(rate, taxAmount, taxableAmount);
  return percent === null ? '—' : `${percent}%`;
}

function resolveTaxRate(
  rate: string | number | null | undefined,
  taxAmount: string | number | null | undefined,
  taxableAmount: string | number | null | undefined
): number | null {
  const fromInvoice = Number(rate);
  if (
    rate !== null &&
    rate !== undefined &&
    rate !== '' &&
    Number.isFinite(fromInvoice)
  ) {
    return Number(fromInvoice.toFixed(2));
  }
  const tax = Number(taxAmount);
  const taxable = Number(taxableAmount);
  if (!Number.isFinite(tax) || !Number.isFinite(taxable) || taxable <= 0) {
    return null;
  }
  return Number(((tax / taxable) * 100).toFixed(2));
}
