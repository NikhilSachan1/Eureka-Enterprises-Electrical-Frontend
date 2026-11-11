import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

/**
 * Real-world GST / TDS rules shared by the registers, invoice and PO summaries.
 *
 * GST
 *  - Verification: invoice matched on the GST portal — GSTR-2B (purchase) / GSTR-1 (sale).
 *    Needed for every entry, held or not.
 *  - Settlement: only HELD GST. Purchase → we release it to the vendor once verified in 2B.
 *    Sale → the client withheld it; we record it as received when they pay.
 *    GST that was not held moved with the invoice payment ("With payment").
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
  RECEIPT_PENDING: 'Receipt pending',
  DEPOSITED: 'Deposited',
  CHALLAN_PENDING: 'Challan pending',
  DEPOSITED_BY_CLIENT: 'Deposited by client',
} as const;

export interface IGstSettlementState {
  partyType: EDocContext;
  isGstHold: boolean;
  isVerified: boolean;
  gstPaymentId: string | null;
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
  if (state.gstPaymentId) {
    return isPurchase(state.partyType)
      ? TAX_STATUS_LABEL.RELEASED
      : TAX_STATUS_LABEL.RECEIVED;
  }
  return isPurchase(state.partyType)
    ? TAX_STATUS_LABEL.RELEASE_PENDING
    : TAX_STATUS_LABEL.RECEIPT_PENDING;
}

export function getGstVerifyPortalName(partyType: EDocContext): string {
  return isPurchase(partyType) ? 'GSTR-2B' : 'GSTR-1';
}

export function getGstSettleActionLabel(partyType: EDocContext): string {
  return isPurchase(partyType) ? 'Release to vendor' : 'Mark received';
}

/** Why held GST cannot be settled for this entry, or undefined when it can. */
export function getGstSettleDisableReason(
  state: IGstSettlementState
): string | undefined {
  if (!state.isGstHold) {
    return 'GST was not held — it was settled with the invoice payment.';
  }
  if (state.gstPaymentId) {
    return isPurchase(state.partyType)
      ? 'Held GST is already released to the vendor.'
      : 'Held GST is already received from the client.';
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
  if (state.gstPaymentId) {
    return 'Held GST is already settled — verification can no longer be reverted.';
  }
  return undefined;
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
