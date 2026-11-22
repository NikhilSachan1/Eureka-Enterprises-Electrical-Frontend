import { EDataType } from '@shared/types';
import { EDocAmountTone } from './doc-amount.types';

export interface IDocAmountSegment {
  dataType: EDataType.CURRENCY | EDataType.DATE;
  label: string;
  value: string | number | null | undefined;
  /** Colour of the line. Set here, not derived from the label, so relabelling keeps it. Dates render neutral. */
  tone: EDocAmountTone;
  suffix?: string;
}
