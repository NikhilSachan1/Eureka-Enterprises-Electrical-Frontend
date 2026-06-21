import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import { ISectionHeaderConfig } from '@shared/types';

@Component({
  selector: 'app-payment-outstanding-section',
  imports: [CurrencyPipe],
  templateUrl: './payment-outstanding-section.component.html',
  styleUrl: './payment-outstanding-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentOutstandingSectionComponent {
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;

  sectionConfig = input.required<ISectionHeaderConfig>();
  loading = input(false);
  recordCount = input(0);
  recordCountUnit = input('record');
  totalPendingAmount = input(0);

  protected readonly pendingTransactionType = computed(() => {
    const amount = this.totalPendingAmount();
    if (amount > 0) {
      return 'debit';
    }
    if (amount < 0) {
      return 'credit';
    }
    return null;
  });

  protected recordCountLabel(): string {
    const count = this.recordCount();
    const unit = this.recordCountUnit();

    return `${count} ${count === 1 ? unit : `${unit}s`}`;
  }
}
