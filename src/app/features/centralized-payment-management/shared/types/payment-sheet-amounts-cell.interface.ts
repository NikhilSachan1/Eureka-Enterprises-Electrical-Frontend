export type TPaymentSheetAmountTone =
  | 'payable'
  | 'paid'
  | 'due'
  | 'advance'
  | 'advance-held'
  | 'settled'
  | 'neutral';

/** One slice of the bar; widths are proportional to amount. */
export interface IPaymentSheetAmountSegment {
  tone: TPaymentSheetAmountTone;
  amount: number;
  /** Read by screen readers and shown as the slice tooltip. */
  label: string;
}

export interface IPaymentSheetAmountStatus {
  tone: 'due' | 'settled' | 'advance' | 'neutral';
  label: string;
  /** null shows the label alone (e.g. "Fully settled"). */
  amount: number | null;
}

/** Everything the amounts cell shows: headline amount, what it is made of, and where it leaves things. */
export interface IPaymentSheetAmountsView {
  label: string;
  amount: number;
  caption: string | null;
  segments: IPaymentSheetAmountSegment[];
  status: IPaymentSheetAmountStatus;
}
