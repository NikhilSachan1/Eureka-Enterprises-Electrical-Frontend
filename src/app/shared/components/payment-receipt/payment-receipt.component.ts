import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { PAYMENT_RECEIPT_LABELS } from '@shared/constants';
import { AppConfigurationService } from '@shared/services';
import {
  EBankDetailsDisplayMode,
  EPaymentReceiptVariant,
  IPaymentReceipt,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { BankDetailsCellComponent } from '../bank-details-cell/bank-details-cell.component';

/**
 * One way to show how something was paid: date, mode, UTR / reference and the account it
 * was paid from. Used by tables, detail drawers and the payment sheet timeline.
 */
@Component({
  selector: 'app-payment-receipt',
  imports: [DatePipe, BankDetailsCellComponent],
  templateUrl: './payment-receipt.component.html',
  styleUrl: './payment-receipt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentReceiptComponent {
  private readonly appConfigurationService = inject(AppConfigurationService);

  receipt = input<IPaymentReceipt | null>(null);
  variant = input<EPaymentReceiptVariant>(EPaymentReceiptVariant.CARD);
  dateFormat = input<string>(APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME);

  protected readonly EPaymentReceiptVariant = EPaymentReceiptVariant;
  protected readonly EBankDetailsDisplayMode = EBankDetailsDisplayMode;
  protected readonly LABELS = PAYMENT_RECEIPT_LABELS;
  protected readonly dateLocale = APP_CONFIG.DATE_FORMATS.DISPLAY_LOCALE;

  protected readonly paidAt = computed(() => this.receipt()?.paidAt ?? null);
  protected readonly mode = computed(() => clean(this.receipt()?.mode));
  protected readonly reference = computed(() =>
    clean(this.receipt()?.reference)
  );
  protected readonly referenceLabel = computed(
    () => this.receipt()?.referenceLabel ?? PAYMENT_RECEIPT_LABELS.REFERENCE
  );
  protected readonly paidFrom = computed(() => {
    const account = this.receipt()?.paidFrom;
    return account && (clean(account.bankName) ?? clean(account.accountNumber))
      ? account
      : null;
  });
  protected readonly paidFromLabel = computed(
    () => this.receipt()?.paidFromLabel ?? PAYMENT_RECEIPT_LABELS.PAID_FROM
  );

  /** Bank name for the inline variant, which has no room for the bank card. */
  protected readonly paidFromBankName = computed(() => {
    const bankName = clean(this.paidFrom()?.bankName);
    return bankName
      ? getMappedValueFromArrayOfObjects(
          this.appConfigurationService.bankNames(),
          bankName
        )
      : null;
  });

  protected readonly isEmpty = computed(
    () =>
      !this.paidAt() && !this.mode() && !this.reference() && !this.paidFrom()
  );
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}
