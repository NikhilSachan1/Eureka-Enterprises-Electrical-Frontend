import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import {
  IPaymentSheetAmountSegment,
  IPaymentSheetAmountsView,
} from '../../types/payment-sheet-amounts-cell.interface';

interface ISegmentSlice extends IPaymentSheetAmountSegment {
  percent: number;
}

/** Below this a slice would vanish, so it is drawn at least this wide. */
const MIN_SLICE_PERCENT = 4;

@Component({
  selector: 'app-payment-sheet-amounts-cell',
  imports: [CurrencyPipe],
  templateUrl: './payment-sheet-amounts-cell.component.html',
  styleUrl: './payment-sheet-amounts-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSheetAmountsCellComponent {
  protected readonly APP_CONFIG = APP_CONFIG;

  view = input.required<IPaymentSheetAmountsView>();
  /** Fills its container instead of the compact table-cell width (e.g. in a dialog). */
  fluid = input<boolean>(false);

  protected readonly slices = computed((): ISegmentSlice[] => {
    const segments = this.view().segments.filter(s => s.amount > 0);
    const total = segments.reduce((sum, s) => sum + s.amount, 0);

    if (total <= 0) {
      return [];
    }

    const raw = segments.map(s =>
      Math.max(MIN_SLICE_PERCENT, (s.amount / total) * 100)
    );
    const scale = 100 / raw.reduce((sum, p) => sum + p, 0);

    return segments.map((s, i) => ({ ...s, percent: raw[i] * scale }));
  });
}
