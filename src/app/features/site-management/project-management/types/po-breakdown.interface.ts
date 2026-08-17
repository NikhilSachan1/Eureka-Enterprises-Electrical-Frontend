import { EDocChainNodeState, EDocChainStage } from './project-document-status-detail.enum';

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
}

export interface IPoBreakdownBookPayment {
  id: string;
  bookingDate: string | null;
  paymentTotalAmount: number;
  status: string;
  hasTransfer: boolean;
  bankTransfers: IPoBreakdownBankTransfer[];
}

export interface IPoBreakdownInvoice {
  id: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  status: string;
  totalAmount: number;
  paidTotal: number;
  remaining: number;
  bookPayments: IPoBreakdownBookPayment[];
  bankTransfers: IPoBreakdownBankTransfer[];
}

export interface IPoBreakdownReport {
  id: string;
  reportNumber: string | null;
  reportDate: string | null;
  status: string;
}

export interface IPoBreakdownJmc {
  id: string;
  jmcNumber: string;
  jmcDate: string | null;
  status: string;
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
  totalAmount: number;
  counts: IPoBreakdownCounts;
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
}
