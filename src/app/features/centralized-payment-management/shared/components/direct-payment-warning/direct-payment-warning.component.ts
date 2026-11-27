import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICONS } from '@shared/constants';
import { DIRECT_PAYMENT_WARNING } from '@features/centralized-payment-management/payment-sheet-management/config/form/payment-record-mode.config';

/** Warning shown on Reimburse / Bank Transfer while "Direct (no Payment Sheet)" is selected. */
@Component({
  selector: 'app-direct-payment-warning',
  templateUrl: './direct-payment-warning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectPaymentWarningComponent {
  protected readonly ICONS = ICONS;
  protected readonly WARNING = DIRECT_PAYMENT_WARNING;
}
