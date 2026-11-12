import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  IPoBreakdownGetRecordDto,
  IPoBreakdownGetResponseDto,
} from '../types/project.dto';
import {
  IPoBreakdownAdvance,
  IPoBreakdownApprovalCount,
  IPoBreakdownBankTransfer,
  IPoBreakdownBookPayment,
  IPoBreakdownCounts,
  IPoBreakdownInvoice,
  IPoBreakdownJmc,
  IPoBreakdownRecord,
  IPoBreakdownReport,
} from '../types/po-breakdown.interface';
import { IProjectPoBreakdownSnapshot } from '../types/project-document-status.interface';
import { buildProjectDocumentStatusSummary } from './project-document-status-chain.util';

export function buildPoBreakdownSnapshot(
  response: IPoBreakdownGetResponseDto
): IProjectPoBreakdownSnapshot {
  const { sales, purchase } = splitRecordsByPartyType(response.records);
  const salesRecords = mapPoBreakdownRecords(sales);
  const purchaseRecords = mapPoBreakdownRecords(purchase);

  return {
    sales: {
      records: salesRecords,
      totalRecords: salesRecords.length,
      summary: buildProjectDocumentStatusSummary(salesRecords, true),
    },
    purchase: {
      records: purchaseRecords,
      totalRecords: purchaseRecords.length,
      summary: buildProjectDocumentStatusSummary(purchaseRecords, false),
    },
  };
}

function splitRecordsByPartyType(records: IPoBreakdownGetRecordDto[]): {
  sales: IPoBreakdownGetRecordDto[];
  purchase: IPoBreakdownGetRecordDto[];
} {
  const sales: IPoBreakdownGetRecordDto[] = [];
  const purchase: IPoBreakdownGetRecordDto[] = [];

  for (const record of records) {
    if (record.partyType === EDocContext.PURCHASE) {
      purchase.push(record);
    } else {
      sales.push(record);
    }
  }

  return { sales, purchase };
}

export function mapPoBreakdownRecords(
  records: IPoBreakdownGetRecordDto[]
): IPoBreakdownRecord[] {
  return records.map(mapPoBreakdownRecord);
}

function mapPoBreakdownRecord(
  record: IPoBreakdownGetRecordDto
): IPoBreakdownRecord {
  const jmcs = record.jmcs.map(mapJmc);

  return {
    id: record.id,
    poNumber: record.poNumber,
    poDate: record.poDate ?? null,
    partyName: record.partyName,
    status: record.status,
    totalAmount: record.totalAmount ?? 0,
    counts: buildPoBreakdownCounts(jmcs),
    advances: (record.advances ?? []).map(mapAdvance),
    jmcs,
  };
}

function mapAdvance(
  advance: IPoBreakdownGetRecordDto['advances'][number]
): IPoBreakdownAdvance {
  return {
    id: advance.id,
    advanceNumber: advance.advanceNumber,
    advanceDate: advance.advanceDate ?? null,
    amount: advance.amount ?? 0,
    settledAmount: advance.settledAmount ?? 0,
    unsettled: advance.unsettled ?? 0,
    status: advance.status,
    hasUpload: advance.hasUpload ?? true,
    bookedAmount: advance.bookedAmount ?? 0,
    paidAmount: advance.paidAmount ?? 0,
    lastPaidAt: advance.lastPaidAt ?? null,
    utrNumber: advance.utrNumber ?? null,
  };
}

function mapJmc(
  jmc: IPoBreakdownGetRecordDto['jmcs'][number]
): IPoBreakdownJmc {
  const report = mapReport(jmc.report);
  const invoice = mapInvoice(jmc.invoice);

  return {
    id: jmc.id,
    jmcNumber: jmc.jmcNumber,
    jmcDate: jmc.jmcDate ?? null,
    status: jmc.status,
    hasReport: jmc.hasReport ?? true,
    hasInvoice: jmc.hasInvoice ?? true,
    report,
    invoice,
  };
}

function mapReport(
  report: IPoBreakdownGetRecordDto['jmcs'][number]['report']
): IPoBreakdownReport | null {
  if (!report) {
    return null;
  }

  return {
    id: report.id,
    reportNumber: report.reportNumber,
    reportDate: report.reportDate ?? null,
    status: report.status,
  };
}

function mapInvoice(
  invoice: IPoBreakdownGetRecordDto['jmcs'][number]['invoice']
): IPoBreakdownInvoice | null {
  if (!invoice) {
    return null;
  }

  const paidTotal = invoice.paidTotal ?? 0;
  const totalAmount = invoice.totalAmount ?? 0;
  const bookPayments = invoice.bookPayments ?? [];
  const transfers = invoice.bankTransfers ?? [];
  const isGstBooking = (bp: (typeof bookPayments)[number]): boolean =>
    bp.sourceType === 'GST_RELEASE';
  const isGstTransfer = (bt: (typeof transfers)[number]): boolean =>
    bt.paymentType === 'GST';

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate ?? null,
    status: invoice.status,
    totalAmount,
    paidTotal,
    remaining: invoice.remaining ?? Math.max(totalAmount - paidTotal, 0),
    gst: invoice.gst
      ? {
          gstAmount: invoice.gst.gstAmount,
          isGstHold: invoice.gst.isGstHold,
          isVerified: invoice.gst.isVerified,
          settlementStatus: invoice.gst.settlementStatus,
          settledAt: invoice.gst.settledAt ?? null,
        }
      : null,
    tds: invoice.tds
      ? {
          tdsAmount: invoice.tds.tdsAmount,
          isDeposited: invoice.tds.isDeposited,
          isVerified: invoice.tds.isVerified,
          lastDepositedAt: invoice.tds.lastDepositedAt ?? null,
        }
      : null,
    // Held GST moves on its own rail — kept out of the invoice's payment rail and counts.
    bookPayments: bookPayments
      .filter(bp => !isGstBooking(bp))
      .map(mapBookPayment),
    gstReleases: bookPayments.filter(isGstBooking).map(mapBookPayment),
    bankTransfers: transfers
      .filter(bt => !isGstTransfer(bt))
      .map(mapBankTransfer),
    gstReceipts: transfers.filter(isGstTransfer).map(mapBankTransfer),
  };
}

function mapBookPayment(
  bookPayment: NonNullable<
    IPoBreakdownGetRecordDto['jmcs'][number]['invoice']
  >['bookPayments'][number]
): IPoBreakdownBookPayment {
  return {
    id: bookPayment.id,
    bookingDate: bookPayment.bookingDate ?? null,
    paymentTotalAmount: bookPayment.paymentTotalAmount ?? 0,
    status: bookPayment.status,
    hasTransfer: bookPayment.hasTransfer ?? false,
    bankTransfers: (bookPayment.bankTransfers ?? []).map(mapBankTransfer),
  };
}

function mapBankTransfer(transfer: {
  id: string;
  utrNumber?: string | null;
  transferDate?: string | null;
  status: string;
  transferAmount?: number | null;
}): IPoBreakdownBankTransfer {
  return {
    id: transfer.id,
    utrNumber: transfer.utrNumber ?? null,
    transferDate: transfer.transferDate ?? null,
    status: transfer.status,
    transferAmount: transfer.transferAmount ?? null,
  };
}

export function buildPoBreakdownCounts(
  jmcs: IPoBreakdownJmc[]
): IPoBreakdownCounts {
  const invoices = jmcs
    .map(jmc => jmc.invoice)
    .filter((invoice): invoice is IPoBreakdownInvoice => invoice !== null);

  const reportApplicable = jmcs.length;
  const reportPresent = jmcs.filter(jmc => jmc.report !== null).length;

  let booked = 0;
  let withoutTransfer = 0;

  for (const invoice of invoices) {
    for (const bookPayment of invoice.bookPayments) {
      booked += bookPayment.paymentTotalAmount;
      if (!bookPayment.hasTransfer) {
        withoutTransfer += 1;
      }
    }
  }

  return {
    jmc: countApprovalStatuses(jmcs),
    report: {
      applicable: reportApplicable,
      present: reportPresent,
      missing: Math.max(reportApplicable - reportPresent, 0),
    },
    invoice: {
      ...countApprovalStatuses(invoices),
      missing: jmcs.length - invoices.length,
    },
    bookPayment: { withoutTransfer },
    amounts: {
      invoiceTotal: invoices.reduce(
        (sum, invoice) => sum + invoice.totalAmount,
        0
      ),
      booked,
      paid: invoices.reduce((sum, invoice) => sum + invoice.paidTotal, 0),
    },
  };
}

function countApprovalStatuses(
  items: readonly { status: string }[]
): IPoBreakdownApprovalCount {
  return {
    total: items.length,
    approved: items.filter(item => item.status.toUpperCase() === 'APPROVED')
      .length,
    pending: items.filter(item => item.status.toUpperCase() === 'PENDING')
      .length,
    rejected: items.filter(item => item.status.toUpperCase() === 'REJECTED')
      .length,
  };
}
