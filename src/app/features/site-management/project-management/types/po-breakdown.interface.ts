import {
  EDocChainNodeState,
  EDocChainStage,
} from './project-document-status-detail.enum';

export interface IPoBreakdownApprovalCount {
  approved: number;
  total: number;
  pending: number;
  rejected: number;
}

export interface IPoBreakdownReportCount {
  present: number;
  applicable: number;
  missing: number;
}

export interface IPoBreakdownInvoiceCount extends IPoBreakdownApprovalCount {
  missing: number;
}

export interface IPoBreakdownAmounts {
  invoiceTotal: number;
  booked: number;
  paid: number;
}

export interface IPoBreakdownCounts {
  jmc: IPoBreakdownApprovalCount;
  report: IPoBreakdownReportCount;
  invoice: IPoBreakdownInvoiceCount;
  bookPayment: { withoutTransfer: number };
  amounts: IPoBreakdownAmounts;
}

export interface IPoBreakdownBankTransfer {
  id: string;
  utrNumber: string | null;
  transferDate: string | null;
  status: string;
  transferAmount: number | null;
  /** Bank statement / receipt uploaded on the transfer. */
  hasProof: boolean;
  /** Vendor transfers only. */
  paymentAdvice: IPoBreakdownPaymentAdvice | null;
}

export interface IPoBreakdownPaymentAdvice {
  referenceNumber: string | null;
  generatedAt: string | null;
  /** Sent to the vendor by email at least once. */
  isEmailed: boolean;
}

export interface IPoBreakdownBookPayment {
  id: string;
  bookingDate: string | null;
  paymentTotalAmount: number;
  status: string;
  hasTransfer: boolean;
  bankTransfers: IPoBreakdownBankTransfer[];
}

export type IPoBreakdownGstSettlement =
  | 'NOT_HELD'
  | 'PENDING'
  | 'IN_PROCESS'
  | 'SETTLED';

/** Invoice GST: portal match + settlement of the held GST. */
export interface IPoBreakdownInvoiceGst {
  gstAmount: number;
  isGstHold: boolean;
  isVerified: boolean;
  settlementStatus: IPoBreakdownGstSettlement;
  settledAt: string | null;
}

/** Invoice TDS: challan (vendor) and 26Q / 26AS verification. */
export interface IPoBreakdownInvoiceTds {
  tdsAmount: number;
  isDeposited: boolean;
  isVerified: boolean;
  lastDepositedAt: string | null;
}

export interface IPoBreakdownInvoice {
  id: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  status: string;
  /** A real invoice without its document uploaded. */
  fileMissing: boolean;
  totalAmount: number;
  paidTotal: number;
  /** Net payable less advance settled and paid — what is still to pay / receive. */
  remaining: number;
  gst: IPoBreakdownInvoiceGst | null;
  tds: IPoBreakdownInvoiceTds | null;
  /** Invoice payments (GST releases are kept apart in `gstReleases`). */
  bookPayments: IPoBreakdownBookPayment[];
  /** Vendor: held GST paid out through a GST book payment. */
  gstReleases: IPoBreakdownBookPayment[];
  /** Contractor: invoice receipts (GST receipts are kept apart in `gstReceipts`). */
  bankTransfers: IPoBreakdownBankTransfer[];
  /** Contractor: held GST the client paid, recorded as a GST bank transfer. */
  gstReceipts: IPoBreakdownBankTransfer[];
}

export interface IPoBreakdownAdvance {
  id: string;
  advanceNumber: string | null;
  advanceDate: string | null;
  amount: number;
  settledAmount: number;
  unsettled: number;
  status: string;
  hasUpload: boolean;
  bookedAmount: number;
  paidAmount: number;
  lastPaidAt: string | null;
  utrNumber: string | null;
}

export interface IPoBreakdownReport {
  id: string;
  reportNumber: string | null;
  reportDate: string | null;
  status: string;
}

export interface IPoBreakdownJmc {
  id: string;
  jmcNumber: string | null;
  jmcDate: string | null;
  status: string;
  /** An uploaded-type JMC without its signed copy (No-JMC / system-generated need none). */
  fileMissing: boolean;
  hasReport: boolean;
  hasInvoice: boolean;
  report: IPoBreakdownReport | null;
  invoice: IPoBreakdownInvoice | null;
}

export interface IPoBreakdownRecord {
  id: string;
  poNumber: string;
  poDate: string | null;
  partyName: string | null;
  status: string;
  /** Signed PO not uploaded (system-generated POs need none). */
  fileMissing: boolean;
  totalAmount: number;
  counts: IPoBreakdownCounts;
  /** Vendor POs: advances paid before any invoice. */
  advances: IPoBreakdownAdvance[];
  jmcs: IPoBreakdownJmc[];
}

export interface IPoPanelMetric {
  label: string;
  value: string;
  tone?: 'ok' | 'warn' | 'danger' | null;
}

export interface IPoPanelMetrics {
  approvals: IPoPanelMetric[];
  amounts: IPoPanelMetric[];
}

export interface IDocChainNodeVm {
  docName: string;
  stage: EDocChainStage;
  docNumber: string | null;
  docDate: string | null;
  statusLabel: string;
  state: EDocChainNodeState;
  /** Document marked not applicable after upload (hasReport/hasInvoice false with data present). */
  isNotApplicable?: boolean;
  /** Placeholder for the next document expected in the chain but not yet created. */
  isExpectedMissing?: boolean;
  /** Monetary amount for invoice, book payment, or bank transfer nodes. */
  amount?: number | null;
  /** The document exists but its file / proof is not uploaded — shown as a badge. */
  missingFileLabel?: string | null;
}
