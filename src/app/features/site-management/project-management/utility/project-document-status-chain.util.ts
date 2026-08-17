import {
  IPoBreakdownInvoice,
  IPoBreakdownJmc,
  IPoBreakdownRecord,
} from '../types/po-breakdown.interface';
import { EDocChainStage } from '../types/project-document-status-detail.enum';
import { IProjectDocumentStatus } from '../types/project-document-status.interface';

export function countPoNextMissing(
  record: IPoBreakdownRecord,
  isSales: boolean
): number {
  if (!record.jmcs.length) {
    return 1;
  }

  const branchMissing = record.jmcs.reduce(
    (count, jmc) => count + countJmcBranchMissing(jmc, isSales),
    0
  );

  return branchMissing + countPoUninvoicedMissing(record);
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

function countJmcBranchMissing(
  jmc: IPoBreakdownJmc,
  isSales: boolean
): number {
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

  return count + countInvoicePaymentMissing(jmc.invoice, isSales);
}

function countInvoicePaymentMissing(
  invoice: IPoBreakdownInvoice,
  isSales: boolean
): number {
  if (isSales) {
    return getSalesPaymentNextMissing(invoice) !== null ? 1 : 0;
  }

  if (invoice.totalAmount <= 0 && invoice.remaining <= 0) {
    return 0;
  }

  if (!invoice.bookPayments.length) {
    return 1;
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
    c.bookPayment.withoutTransfer
  );
}

export function countPoSelfPendingApprovals(status: string): number {
  const normalized = status.toUpperCase();
  return normalized === 'PENDING' || normalized === 'REJECTED' ? 1 : 0;
}

export function getSalesPaymentNextMissing(
  invoice: IPoBreakdownInvoice
): EDocChainStage | null {
  if (invoice.remaining > 0) {
    return EDocChainStage.BANK_TRANSFER;
  }

  if (
    invoice.bankTransfers.length === 0 &&
    invoice.totalAmount > 0 &&
    invoice.paidTotal <= 0
  ) {
    return EDocChainStage.BANK_TRANSFER;
  }

  return null;
}

export function needsAdditionalBookPayment(
  invoice: IPoBreakdownInvoice
): boolean {
  if (invoice.remaining <= 0) {
    return false;
  }

  if (!invoice.bookPayments.length) {
    return invoice.totalAmount > 0 || invoice.remaining > 0;
  }

  return true;
}
