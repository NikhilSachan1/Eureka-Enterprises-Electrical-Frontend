import { IInvoiceLedgerRecordDto } from '../types/invoice-ledger.dto';
import {
  IInvoiceLedgerPaymentRow,
  IInvoiceLedgerSideConfig,
  IInvoiceLedgerTableRow,
} from '../types/invoice-ledger.interface';
import {
  formatLedgerPeriod,
  formatLedgerStatus,
} from './invoice-ledger-format.util';

const percent = (rate: number | null): string =>
  rate === null || rate === undefined ? '' : `${Number(rate)}%`;

/** "18% · Held" / "18% · Not held"; empty when the invoice carries no GST. */
function gstNote(record: IInvoiceLedgerRecordDto): string {
  if (!record.gstAmount) {
    return '';
  }
  return [percent(record.gstPercentage), record.isGstHold ? 'Held' : 'Not held']
    .filter(Boolean)
    .join(' · ');
}

/** "1 transfer" / "3 transfers"; empty when nothing was paid yet. */
function transfersNote(count: number): string {
  if (!count) {
    return '';
  }
  return `${count} ${count === 1 ? 'transfer' : 'transfers'}`;
}

/**
 * Share of the invoice's net payable (basic − TDS + GST, GST left out while held), e.g. 64.2;
 * null when there is nothing payable to compare with.
 */
function shareOfNetPayable(
  record: IInvoiceLedgerRecordDto,
  amount: number
): number | null {
  const gst = record.isGstHold && record.gstAmount > 0 ? 0 : record.gstAmount;
  const netPayable = record.taxableAmount - record.tdsAmount + gst;
  return netPayable > 0 ? Math.round((amount / netPayable) * 1000) / 10 : null;
}

/** "64.2% due"; empty once nothing is due. */
function outstandingNote(record: IInvoiceLedgerRecordDto): string {
  const share = record.outstandingAmount
    ? shareOfNetPayable(record, record.outstandingAmount)
    : null;
  return share === null ? '' : `${share}% due`;
}

/** "50.8% received · 2 transfers"; empty when nothing was received / paid yet. */
function paidNote(
  record: IInvoiceLedgerRecordDto,
  sideConfig: IInvoiceLedgerSideConfig
): string {
  const share = record.paidAmount
    ? shareOfNetPayable(record, record.paidAmount)
    : null;
  return [
    share === null ? '' : `${share}% ${sideConfig.paidLabel.toLowerCase()}`,
    transfersNote(record.payments.length),
  ]
    .filter(Boolean)
    .join(' · ');
}

/** One ledger row: the API record plus the labels and bracket notes the table shows. */
export function buildLedgerTableRow(
  record: IInvoiceLedgerRecordDto,
  sideConfig: IInvoiceLedgerSideConfig
): IInvoiceLedgerTableRow {
  return {
    id: record.id,
    partyName: record.partyName ?? '—',
    // Party is its own column; the overview shows client and project only.
    docWorkspaceContext: {
      companyName: record.companyName ?? '—',
      projectName: record.siteName,
      siteLocationSubtitle: [record.siteCity, record.siteState]
        .filter(Boolean)
        .join(', '),
    },
    invoiceNumber: record.invoiceNumber ?? '—',
    invoiceDate: record.invoiceDate,
    periodLabel:
      formatLedgerPeriod(record.financialYear, record.quarter) || '—',
    poNumber: record.poNumber ?? '—',
    taxableAmount: record.taxableAmount,
    cgstAmount: record.cgstAmount,
    sgstAmount: record.sgstAmount,
    igstAmount: record.igstAmount,
    gstAmount: record.gstAmount,
    gstAmountNote: gstNote(record),
    grossAmount: record.grossAmount,
    tdsAmount: record.tdsAmount,
    tdsAmountNote: record.tdsAmount ? percent(record.tdsPercentage) : '',
    advanceAdjusted: sideConfig.showAdvance ? record.advanceAdjusted : 0,
    paidAmount: record.paidAmount,
    paidAmountNote: paidNote(record, sideConfig),
    outstandingAmount: record.outstandingAmount,
    outstandingAmountNote: outstandingNote(record),
    paymentStatusLabel: formatLedgerStatus(record.paymentStatus),
    payments: buildLedgerPaymentRows(record),
  };
}

/** Transfers that paid the invoice, for the row's "Payment dates" cell. */
export function buildLedgerPaymentRows(
  record: IInvoiceLedgerRecordDto
): IInvoiceLedgerPaymentRow[] {
  return record.payments.map((payment, index) => ({
    id: `${record.id}-${index}`,
    date: payment.date,
    amount: payment.amount,
  }));
}
