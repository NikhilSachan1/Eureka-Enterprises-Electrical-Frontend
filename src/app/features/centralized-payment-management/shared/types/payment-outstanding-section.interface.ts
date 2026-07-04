export type TPaymentOutstandingSummaryStatKind = 'count' | 'currency';

export interface IVendorSectionSummaryStat {
  kind: TPaymentOutstandingSummaryStatKind;
  value: number;
  label: string;
  ariaLabel: string;
  tone?: 'debit' | 'credit' | 'to-book' | null;
}

export interface IVendorSectionSummaryStatGroup {
  title: string;
  stats: IVendorSectionSummaryStat[];
}
