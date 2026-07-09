import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { TPaymentSheetAmountTileVariant } from '../../types/payment-sheet-amounts-cell.interface';

@Component({
  selector: 'app-payment-sheet-amounts-cell',
  imports: [CurrencyPipe],
  templateUrl: './payment-sheet-amounts-cell.component.html',
  styleUrl: './payment-sheet-amounts-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSheetAmountsCellComponent {
  protected readonly APP_CONFIG = APP_CONFIG;

  leftLabel = input.required<string>();
  leftAmount = input.required<number>();
  leftVariant = input<TPaymentSheetAmountTileVariant>('payable');

  rightLabel = input.required<string>();
  rightAmount = input.required<number>();
  rightVariant = input<TPaymentSheetAmountTileVariant>('paid');

  footerLabel = input.required<string>();
  footerAmount = input.required<number>();
  settledLabel = input<string>('Fully paid');
  isSettled = input<boolean>(false);
}
