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

export type DocMetricSummaryTone =
  | 'taxable'
  | 'deduction'
  | 'gst'
  | 'total'
  | 'booked'
  | 'paid'
  | 'remaining'
  | 'invoiced';

export interface IDocMetricSummaryItem {
  label: string;
  value: number | string | null | undefined;
  tone: DocMetricSummaryTone;
  suffix?: string;
}

export interface IDocMetricSummaryRow {
  title: string;
  items: IDocMetricSummaryItem[];
}

@Component({
  selector: 'app-book-payment-invoice-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './book-payment-invoice-summary.component.html',
  styleUrl: './book-payment-invoice-summary.component.scss',
})
export class BookPaymentInvoiceSummaryComponent {
  readonly meta = input<IBookPaymentInvoiceDropdownMeta>();
  readonly rows = input<IDocMetricSummaryRow[]>();

  protected readonly APP_CONFIG = APP_CONFIG;

  protected readonly summaryRows = computed((): IDocMetricSummaryRow[] => {
    const customRows = this.rows();
    if (customRows?.length) {
      return customRows;
    }

    const meta = this.meta();
    if (!meta) {
      return [];
    }

    const rows: IDocMetricSummaryRow[] = [
      {
        title: 'Breakdown',
        items: [
          { label: 'Taxable', value: meta.taxableAmount, tone: 'taxable' },
          { label: 'TDS', value: meta.tdsAmount, tone: 'deduction' },
          {
            label: 'GST',
            suffix: getBookPaymentInvoiceGstHoldLabel(meta.isGstHold),
            value: meta.gstAmount,
            tone: 'gst',
          },
          { label: 'Total', value: meta.totalAmount, tone: 'total' },
        ],
      },
    ];

    const paymentItems: IDocMetricSummaryItem[] = [];

    if (meta.bookedTotal !== undefined && meta.bookedTotal !== null) {
      paymentItems.push({
        label: 'Booked',
        value: meta.bookedTotal,
        tone: 'booked',
      });
    }

    if (meta.paidTotal !== undefined && meta.paidTotal !== null) {
      paymentItems.push({
        label: 'Paid',
        value: meta.paidTotal,
        tone: 'paid',
      });
    }

    if (meta.remaining !== undefined && meta.remaining !== null) {
      paymentItems.push({
        label: 'Remaining',
        value: meta.remaining,
        tone: 'remaining',
      });
    }

    if (paymentItems.length > 0) {
      rows.push({ title: 'Payment', items: paymentItems });
    }

    return rows;
  });
}
