/** Headline of a detail popup: what it shows and how its total is worked out. */
export interface IProfitabilityDetailMeta {
  icon: string;
  tone: 'revenue' | 'vendor' | 'employee' | 'fuel' | 'expense';
  title: string;
  subtitle: string;
  formula: string;
}

export interface IProfitabilityDetailStat {
  label: string;
  value: number;
  kind: 'money' | 'count';
  hint?: string;
  tone?: 'main' | 'good' | 'bad';
}

/** A coloured piece of a total: a category, a vehicle, an employee. */
export interface IProfitabilityPart {
  key: string;
  label: string;
  amount: number;
  /** Share of the parent total, 0–100. */
  share: number;
  color: string;
}

/**
 * One line of a ranked list (employee, category), with its share of the total. When it has `parts`,
 * the popup shows a master–detail view: the list on the left, the selected row's parts on the right.
 */
export interface IProfitabilityShareRow {
  key: string;
  title: string;
  subtitle: string;
  avatar: string | null;
  color: string;
  amount: number;
  share: number;
  parts?: IProfitabilityPart[];
}

/** Donut in the popup overview. */
export interface IProfitabilityDonut {
  segments: IProfitabilityPart[];
  centerValue: string;
  centerLabel: string;
}

export type TInvoiceSettlement = 'settled' | 'partial' | 'open';

export interface IProfitabilityInvoiceRow {
  key: string;
  invoiceNumber: string;
  invoiceDate: string;
  partyName: string;
  partyAvatar: string;
  poNumber: string;
  taxableAmount: number;
  gstAmount: number;
  tdsAmount: number;
  invoiceAmount: number;
  settledAmount: number;
  outstandingAmount: number;
  status: TInvoiceSettlement;
  /** GST on this invoice is held until it is released / received separately. */
  isGstHold: boolean;
  /** Tags on the party: "Freelancer". */
  partyTags: string[];
}

export interface IProfitabilityInvoiceTotals {
  taxableAmount: number;
  gstAmount: number;
  tdsAmount: number;
  invoiceAmount: number;
  settledAmount: number;
  outstandingAmount: number;
}
