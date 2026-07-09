export interface IPaymentOutstandingSectionStat {
  label: string;
  kind: 'count' | 'currency';
  value: number;
  tone?: 'debit' | 'to-book' | null;
  dividerBefore?: boolean;
}

export interface IPaymentOutstandingSectionOverview {
  value: string;
  label: string;
  icon: string;
  accentLight: string;
  accentDark: string;
  stats: IPaymentOutstandingSectionStat[];
}

export interface IPaymentOutstandingSectionTab {
  value: string;
  label: string;
  badgeCount?: number;
}
