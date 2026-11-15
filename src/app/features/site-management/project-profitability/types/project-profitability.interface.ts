import { IProjectProfitabilityGetResponseDto } from './project-profitability.dto';

export type IProjectProfitabilityReport = IProjectProfitabilityGetResponseDto;

export type ProfitabilityBreakdownType =
  | 'sales-invoices'
  | 'vendor-invoices'
  | 'employee-cost'
  | 'regular-expense-detail'
  | 'fuel-employee';

// ── Page view model ─────────────────────────────────────────────────────────

/** Colour family of a figure, shared by the page and the breakdown. */
export type TProfitabilityTone =
  | 'revenue'
  | 'vendor'
  | 'employee'
  | 'fuel'
  | 'expense'
  | 'profit'
  | 'loss';

export interface IProfitabilityStatementLine {
  key: string;
  kind: 'revenue' | 'cost' | 'subtotal' | 'total';
  label: string;
  icon: string;
  tone: TProfitabilityTone;
  /** How the figure is worked out, in one sentence. */
  hint: string;
  amount: number;
  /** Share of revenue, for cost lines. */
  share?: number;
  /** Margin on revenue, for profit lines. */
  margin?: number;
  detail?: { type: ProfitabilityBreakdownType; title: string };
}

export interface IProfitabilityCostShare {
  key: string;
  label: string;
  color: string;
  amount: number;
  /** Width in the split bar. */
  percent: number;
}

export interface IProfitabilityCashStep {
  label: string;
  hint?: string;
  amount: number;
  sign?: 'minus' | 'equals';
}

export interface IProfitabilityCashFlow {
  side: 'in' | 'out';
  title: string;
  subtitle: string;
  /** Received / paid so far, for the ring. */
  settled: number;
  settledLabel: string;
  steps: IProfitabilityCashStep[];
  outstandingLabel: string;
  outstanding: number;
  /** Settled share of what moves through the bank. */
  progress: number;
  note: { amount: number; text: string } | null;
}

export interface IProfitabilityBillingLine {
  key: string;
  label: string;
  poLabel: string;
  poValue: number;
  invoiced: number;
  remainingLabel: string;
  remaining: number;
  percent: number;
}

export interface IProfitabilityView {
  isLoss: boolean;
  statement: IProfitabilityStatementLine[];
  costShares: IProfitabilityCostShare[];
  gst: IProjectProfitabilityReport['profitabilitySummary']['gstSummary'];
  receivable: IProfitabilityCashFlow;
  payable: IProfitabilityCashFlow;
  billing: IProfitabilityBillingLine[];
}
