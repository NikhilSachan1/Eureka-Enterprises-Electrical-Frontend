import { IInvoiceLedgerGetResponseDto } from './invoice-ledger.dto';
import {
  EInvoiceLedgerQuarter,
  EInvoiceLedgerSide,
} from './invoice-ledger.enum';
import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import type { IChartsConfig } from '@shared/types';

/** Wording and filter shape for one ledger side. */
export interface IInvoiceLedgerSideConfig {
  side: EInvoiceLedgerSide;
  title: string;
  subtitle: string;
  partyLabel: string;
  /** Contractor money is received from the client; vendor money is paid out by us. */
  paidLabel: string;
  /** Needed to see and use "Export PDF" on this side. */
  exportPermission: string;
  /** Advances are settled only against purchase (vendor) invoices. */
  showAdvance: boolean;
}

/** Search filter form fields (the table global search arrives as `search`). */
export interface IInvoiceLedgerSearchFilterFormDto {
  companyName?: string[];
  projectName?: string[];
  partyName?: string[];
  financialYear?: string;
  quarter?: EInvoiceLedgerQuarter[];
  paymentStatus?: string[];
  dateRange?: Date[];
  globalSearch?: string;
}

/** One transfer that paid an invoice, listed in the row's "Payment dates" cell. */
export interface IInvoiceLedgerPaymentRow extends Record<string, unknown> {
  id: string;
  date: string;
  amount: number;
}

export interface IInvoiceLedgerTableRow extends Record<string, unknown> {
  id: string;
  partyName: string;
  /** Client and project, shown by the shared workspace-context cell. */
  docWorkspaceContext: IDocWorkspaceContextView;
  invoiceNumber: string;
  invoiceDate: string | null;
  /** "FY 2025-26 · Q3". */
  periodLabel: string;
  /** The PO this invoice was raised against. */
  poNumber: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  gstAmount: number;
  /** Shown in brackets under the total GST: rate and whether it is held, e.g. "18% · Held". */
  gstAmountNote: string;
  grossAmount: number;
  tdsAmount: number;
  /** TDS rate, e.g. "2%". */
  tdsAmountNote: string;
  advanceAdjusted: number;
  paidAmount: number;
  /** How many transfers paid it, e.g. "2 transfers". */
  paidAmountNote: string;
  outstandingAmount: number;
  paymentStatusLabel: string;
  payments: IInvoiceLedgerPaymentRow[];
}

/** The part of a ledger response the summary is built from (everything but the page rows). */
export type IInvoiceLedgerSummarySource = Pick<
  IInvoiceLedgerGetResponseDto,
  'totals' | 'insights' | 'totalRecords'
>;

/** One slice of "where the money stands" (the ring). */
export interface IInvoiceLedgerMoneySlice {
  key: string;
  label: string;
  amount: number;
  /** Share of the gross bill, 0–100. */
  percent: number;
  color: string;
}

/** One line of the bill-to-outstanding statement beside the ring. */
export interface IInvoiceLedgerStatementLine {
  key: string;
  label: string;
  amount: number;
  /** How the line combines with the one above: added, deducted, or a running total. */
  sign: '+' | '−' | '=' | '';
  isTotal: boolean;
  /** Ring colour when the line is a ring segment; text colour of a total. */
  color?: string;
  /** Share of the gross bill, shown for ring segments. */
  percent?: number;
  hint?: string;
  /** `part`: one piece of a group (CGST / SGST / IGST); `groupTotal`: that group's total (Total GST). */
  variant?: 'part' | 'groupTotal';
}

/** One age band of the outstanding. */
export interface IInvoiceLedgerAgeingBand {
  key: string;
  label: string;
  count: number;
  amount: number;
  /** Share of the outstanding, 0–100. */
  percent: number;
  color: string;
}

/** Invoices in one payment status. */
export interface IInvoiceLedgerStatusCount {
  /** Label the shared status tag colours by (Paid / Partial / Unpaid). */
  label: string;
  count: number;
  /** Share of all invoices, 0–100. */
  percent: number;
  gross: number;
  outstanding: number;
  color: string;
  /** Light background of the status box. */
  tint: string;
}

/** One row of "most outstanding": a contractor / vendor and how much they still owe / are owed. */
export interface IInvoiceLedgerPartyBar {
  name: string;
  outstanding: number;
  invoiceCount: number;
  /** Bar length relative to the largest row, 0–100. */
  widthPercent: number;
}

/** Everything the summary above the ledger table draws. Covers every matching invoice. */
export interface IInvoiceLedgerSummaryView {
  outstandingCompact: string;
  /** Share of the net payable already settled, 0–100. */
  settledPercent: number;
  ringChart: IChartsConfig | null;
  /** Basic + GST = gross − TDS − GST held = net payable − received − advance = outstanding. */
  statement: IInvoiceLedgerStatementLine[];
  ageing: IInvoiceLedgerAgeingBand[];
  /** The ageing bar read out for screen readers. */
  ageingSummary: string;
  outstandingInvoiceCount: number;
  oldestOutstandingDays: number | null;
  statusMix: IInvoiceLedgerStatusCount[];
  /** Every invoice the filters match. */
  invoiceCount: number;
  /** The status bar read out for screen readers. */
  statusBandLabel: string;
  trendChart: IChartsConfig | null;
  parties: IInvoiceLedgerPartyBar[];
  partyHeading: string;
}
