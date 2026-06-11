import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';

import {
  getBookPaymentInvoiceGstHoldLabel,
  type IBookPaymentInvoiceDropdownMeta,
} from '../../utils/book-payment-invoice-meta.util';

type SummaryTone =
  | 'taxable'
  | 'deduction'
  | 'gst'
  | 'total'
  | 'booked'
  | 'paid'
  | 'remaining';

interface ISummaryMetric {
  label: string;
  value: number | null | undefined;
  tone: SummaryTone;
  suffix?: string;
}

@Component({
  selector: 'app-book-payment-invoice-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './book-payment-invoice-summary.component.html',
  styleUrl: './book-payment-invoice-summary.component.scss',
})
export class BookPaymentInvoiceSummaryComponent {
  readonly meta = input.required<IBookPaymentInvoiceDropdownMeta>();

  protected readonly APP_CONFIG = APP_CONFIG;

  protected readonly breakdownMetrics = computed((): ISummaryMetric[] => {
    const meta = this.meta();
    return [
      {
        label: 'Payment Total',
        value: meta.paymentTotalAmount,
        tone: 'taxable',
      },
      { label: 'TDS', value: meta.tdsAmount, tone: 'deduction' },
      {
        label: 'GST',
        suffix: getBookPaymentInvoiceGstHoldLabel(meta.isGstHold),
        value: meta.gstAmount,
        tone: 'gst',
      },
      { label: 'Total', value: meta.totalAmount, tone: 'total' },
    ];
  });

  protected readonly paymentMetrics = computed((): ISummaryMetric[] => {
    const meta = this.meta();
    const metrics: ISummaryMetric[] = [];

    if (meta.bookedTotal !== undefined && meta.bookedTotal !== null) {
      metrics.push({
        label: 'Booked',
        value: meta.bookedTotal,
        tone: 'booked',
      });
    }

    if (meta.paidTotal !== undefined && meta.paidTotal !== null) {
      metrics.push({
        label: 'Paid',
        value: meta.paidTotal,
        tone: 'paid',
      });
    }

    if (meta.remaining !== undefined && meta.remaining !== null) {
      metrics.push({
        label: 'Remaining',
        value: meta.remaining,
        tone: 'remaining',
      });
    }

    return metrics;
  });

  protected readonly showPaymentMetrics = computed(
    () => this.paymentMetrics().length > 0
  );
}
