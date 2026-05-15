import { EDataType } from '@shared/types';

export interface IDocAmountSegment {
  dataType: EDataType.CURRENCY | EDataType.DATE;
  label: string;
  value: string | number | null | undefined;
  suffix?: string;
}

export type DocAmountTone =
  | 'taxable'
  | 'deduction'
  | 'gst'
  | 'total'
  | 'invoiced'
  | 'booked'
  | 'paid'
  | 'neutral'
  | 'muted';
