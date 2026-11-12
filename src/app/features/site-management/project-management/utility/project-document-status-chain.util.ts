import {
  IPoBreakdownAdvance,
  IPoBreakdownInvoice,
  IPoBreakdownInvoiceGst,
  IPoBreakdownInvoiceTds,
  IPoBreakdownJmc,
  IPoBreakdownRecord,
} from '../types/po-breakdown.interface';
import { EDocChainStage } from '../types/project-document-status-detail.enum';
import { IProjectDocumentStatus } from '../types/project-document-status.interface';

export function countPoNextMissing(
  record: IPoBreakdownRecord,
  isSales: boolean,
  options?: { includePoUninvoicedBalance?: boolean }
): number {
  const advanceMissing = (record.advances ?? []).reduce(
    (count, advance) => count + countAdvanceMissing(advance),
    0
  );

  if (!record.jmcs.length) {
    return 1 + advanceMissing;
  }

  const branchMissing = record.jmcs.reduce(
    (count, jmc) => count + countJmcBranchMissing(jmc, isSales),
    0
  );

  if (options?.includePoUninvoicedBalance === false) {
    return branchMissing + advanceMissing;
  }

  return branchMissing + advanceMissing + countPoUninvoicedMissing(record);
}

// ── GST / TDS / advance steps ────────────────────────────────────────────────

/** Held GST that has actually moved — by bank transfer, or a legacy direct record. */
export function isGstSettled(gst: IPoBreakdownInvoiceGst): boolean {
  return gst.settlementStatus === 'SETTLED';
}

/**
 * Something is still to do on the invoice's GST: match it on the portal (GSTR-2B / GSTR-1), and
 * when it was held, release it to the vendor / receive it from the client.
 */
export function gstNeedsAction(gst: IPoBreakdownInvoiceGst | null): boolean {
  if (!gst || gst.gstAmount <= 0) {
    return false;
  }
  return !gst.isVerified || (gst.isGstHold && !isGstSettled(gst));
}

/**
 * Something is still to do on the invoice's TDS. Vendor: deposit by challan, then verify in 26Q.
 * Contractor: the client deposits — we verify the credit in Form 26AS.
 */
export function tdsNeedsAction(
  tds: IPoBreakdownInvoiceTds | null,
  isSales: boolean
): boolean {
  if (!tds || tds.tdsAmount <= 0) {
    return false;
  }
  return isSales ? !tds.isVerified : !tds.isDeposited || !tds.isVerified;
}

/** The advance's money has gone out in full. */
export function isAdvancePaid(advance: IPoBreakdownAdvance): boolean {
  const due = advance.bookedAmount > 0 ? advance.bookedAmount : advance.amount;
  return advance.paidAmount > 0 && advance.paidAmount >= due;
}

/**
 * Open steps on an approved advance: the payment not yet transferred, the balance not yet settled
 * against an invoice, and the vendor's document not uploaded. Pending / rejected advances are
 * counted as approvals instead.
 */
export function countAdvanceMissing(advance: IPoBreakdownAdvance): number {
  if (advance.status.toUpperCase() !== 'APPROVED') {
    return 0;
  }

  let count = 0;
  if (!isAdvancePaid(advance)) {
    count += 1;
  } else if (advance.unsettled > 0) {
    count += 1;
  }
  if (!advance.hasUpload) {
    count += 1;
  }
  return count;
}

function countInvoiceTaxMissing(
  invoice: IPoBreakdownInvoice,
  isSales: boolean
): number {
  return (
    (gstNeedsAction(invoice.gst) ? 1 : 0) +
    (tdsNeedsAction(invoice.tds, isSales) ? 1 : 0)
  );
}

export function getPoUninvoicedAmount(record: IPoBreakdownRecord): number {
  if (record.totalAmount <= 0) {
    return 0;
  }

  return Math.max(record.totalAmount - record.counts.amounts.invoiceTotal, 0);
}

export function hasPoUninvoicedBalance(record: IPoBreakdownRecord): boolean {
  return countPoUninvoicedMissing(record) > 0;
}

function countPoUninvoicedMissing(record: IPoBreakdownRecord): number {
  const hasOpenInvoiceSlots = record.jmcs.some(jmc => !jmc.invoice);
  if (hasOpenInvoiceSlots || getPoUninvoicedAmount(record) <= 0) {
    return 0;
  }

  return 1;
}

function countJmcBranchMissing(jmc: IPoBreakdownJmc, isSales: boolean): number {
  let count = 0;

  if (!jmc.report) {
    count += 1;
  }

  if (!jmc.invoice) {
    count += 1;
    return count;
  }

  if (!jmc.hasInvoice) {
    return count;
  }

  return (
    count +
    countInvoicePaymentMissing(jmc.invoice, isSales) +
    countInvoiceTaxMissing(jmc.invoice, isSales)
  );
}

function countInvoicePaymentMissing(
  invoice: IPoBreakdownInvoice,
  isSales: boolean
): number {
  if (isSales) {
    return getSalesPaymentNextMissing(invoice) !== null ? 1 : 0;
  }

  // Nothing left to pay (net payable covered by advances / payments): no booking is owed.
  if (!invoice.bookPayments.length) {
    return invoice.remaining > 0 ? 1 : 0;
  }

  let count = invoice.bookPayments.reduce((total, bookPayment) => {
    if (bookPayment.bankTransfers.length || bookPayment.hasTransfer) {
      return total;
    }

    return total + 1;
  }, 0);

  if (needsAdditionalBookPayment(invoice)) {
    count += 1;
  }

  return count;
}

export function buildProjectDocumentStatusSummary(
  records: readonly IPoBreakdownRecord[],
  isSales: boolean
): IProjectDocumentStatus {
  if (!records.length) {
    return {
      missingDocsCount: 1,
      pendingApprovalsCount: 0,
      toBeInvoicedAmount: 0,
    };
  }

  return records.reduce<IProjectDocumentStatus>(
    (summary, record) => ({
      missingDocsCount:
        summary.missingDocsCount + countPoNextMissing(record, isSales),
      pendingApprovalsCount:
        summary.pendingApprovalsCount + countPoPendingApprovals(record),
      toBeInvoicedAmount:
        summary.toBeInvoicedAmount +
        (isSales
          ? getPoUninvoicedAmount(record)
          : Math.max(
              record.counts.amounts.invoiceTotal - record.counts.amounts.paid,
              0
            )),
    }),
    {
      missingDocsCount: 0,
      pendingApprovalsCount: 0,
      toBeInvoicedAmount: 0,
    }
  );
}

export function countPoPendingApprovals(record: IPoBreakdownRecord): number {
  const c = record.counts;

  return (
    countPoSelfPendingApprovals(record.status) +
    c.jmc.pending +
    c.jmc.rejected +
    c.invoice.pending +
    c.invoice.rejected +
    c.bookPayment.withoutTransfer +
    (record.advances ?? []).filter(
      advance => advance.status.toUpperCase() === 'PENDING'
    ).length
  );
}

export function countPoSelfPendingApprovals(status: string): number {
  const normalized = status.toUpperCase();
  return normalized === 'PENDING' || normalized === 'REJECTED' ? 1 : 0;
}

export function getSalesPaymentNextMissing(
  invoice: IPoBreakdownInvoice
): EDocChainStage | null {
  // `remaining` is net payable less advances settled and received, so it is 0 once the client
  // has paid what the invoice owes (held GST and TDS are tracked separately).
  return invoice.remaining > 0 ? EDocChainStage.BANK_TRANSFER : null;
}

/**
 * Vendor invoice amount not yet booked: what is still to pay, less bookings already made and
 * awaiting their transfer (those are counted on their own rail).
 */
export function getInvoicePendingToBook(invoice: IPoBreakdownInvoice): number {
  const awaitingTransfer = invoice.bookPayments
    .filter(bp => !bp.hasTransfer && !bp.bankTransfers.length)
    .reduce((sum, bp) => sum + bp.paymentTotalAmount, 0);

  return Math.max(Number((invoice.remaining - awaitingTransfer).toFixed(2)), 0);
}

export function needsAdditionalBookPayment(
  invoice: IPoBreakdownInvoice
): boolean {
  return getInvoicePendingToBook(invoice) > 0.01;
}
