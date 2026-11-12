import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import type { IInvoicePaymentSummary } from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.interface';

type Tone = 'paid' | 'advance' | 'gst' | 'tds' | 'pending' | 'progress';

interface IBarPart {
  key: string;
  tone: Tone;
  label: string;
  amount: number;
  pct: number;
}

interface IStatusLine {
  key: string;
  tone: Tone;
  label: string;
  amount: number;
  status: string;
  /** Status text tone: done (green), progress (blue), pending (amber). */
  state: 'done' | 'progress' | 'pending';
  detail?: string;
}

/**
 * The invoice's money at a glance: one bar showing how its value has been cleared (paid,
 * advance, GST, TDS, balance), then each part on its own line with its status. Every figure comes
 * from the server's `paymentSummary`; nothing is added up here.
 */
@Component({
  selector: 'app-invoice-payment-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './invoice-payment-summary.component.html',
  styleUrl: './invoice-payment-summary.component.scss',
})
export class InvoicePaymentSummaryComponent {
  protected readonly fmt = APP_CONFIG.NUMBER_FORMATS.WITH_DECIMALS;
  protected readonly loc = APP_CONFIG.NUMBER_FORMATS.LOCALE;

  readonly summary = input<IInvoicePaymentSummary | null | undefined>(null);
  readonly isSales = input(false);

  protected readonly bar = computed<IBarPart[]>(() => {
    const s = this.summary();
    if (!s || s.invoiceValue <= 0) {
      return [];
    }
    const parts: Omit<IBarPart, 'pct'>[] = [
      {
        key: 'paid',
        tone: 'paid',
        label: this.isSales() ? 'Received' : 'Paid',
        amount: s.paid,
      },
      {
        key: 'advance',
        tone: 'advance',
        label: 'Advance',
        amount: s.advanceAdjusted,
      },
      {
        key: 'gst',
        tone: 'gst',
        label: this.isSales() ? 'GST received' : 'GST released',
        amount: s.gst?.isHeld ? s.gst.settled : 0,
      },
      {
        key: 'tds',
        tone: 'tds',
        label: this.isSales() ? 'TDS credited' : 'TDS deposited',
        amount: s.tds?.cleared ?? 0,
      },
    ];
    return parts
      .filter(part => part.amount > 0)
      .map(part => ({
        ...part,
        pct: Math.min((part.amount / s.invoiceValue) * 100, 100),
      }));
  });

  protected readonly lines = computed<IStatusLine[]>(() => {
    const s = this.summary();
    if (!s) {
      return [];
    }
    const sales = this.isSales();
    const lines: IStatusLine[] = [];

    if (sales) {
      lines.push({
        key: 'payment',
        tone: 'paid',
        label: 'Received',
        amount: s.paid,
        status:
          s.paymentBalance > 0
            ? `${this.money(s.paymentBalance)} due`
            : 'Fully received',
        state: s.paymentBalance > 0 ? 'pending' : 'done',
        detail: `of ${this.money(s.netPayable)} net`,
      });
    } else {
      const booked = s.booked ?? 0;
      lines.push({
        key: 'booked',
        tone: 'progress',
        label: 'Booked',
        amount: booked,
        status:
          (s.toBook ?? 0) > 0
            ? `${this.money(s.toBook ?? 0)} to book`
            : 'Fully booked',
        state: (s.toBook ?? 0) > 0 ? 'pending' : 'done',
        detail: `of ${this.money(s.netPayable)} net`,
      });
      lines.push({
        key: 'paid',
        tone: 'paid',
        label: 'Paid',
        amount: s.paid,
        status:
          (s.awaitingTransfer ?? 0) > 0
            ? `${this.money(s.awaitingTransfer ?? 0)} awaiting transfer`
            : booked > 0
              ? 'All booked paid'
              : 'Nothing booked',
        state:
          (s.awaitingTransfer ?? 0) > 0
            ? 'progress'
            : booked > 0
              ? 'done'
              : 'pending',
        detail: `of ${this.money(booked)} booked`,
      });
    }

    if (s.advanceAdjusted > 0) {
      lines.push({
        key: 'advance',
        tone: 'advance',
        label: 'Advance',
        amount: s.advanceAdjusted,
        status: 'Adjusted',
        state: 'done',
      });
    }

    if (s.gst) {
      lines.push(this.gstLine(s.gst, sales));
    }

    if (s.tds) {
      const done = s.tds.status === 'CLEARED';
      lines.push({
        key: 'tds',
        tone: 'tds',
        label: 'TDS',
        amount: s.tds.amount,
        status: sales
          ? done
            ? '26AS credited'
            : '26AS pending'
          : done
            ? 'Deposited · 26Q filed'
            : s.tds.status === 'DEPOSITED'
              ? 'Deposited · 26Q pending'
              : 'Challan pending',
        state: done
          ? 'done'
          : s.tds.status === 'DEPOSITED'
            ? 'progress'
            : 'pending',
      });
    }

    return lines;
  });

  private gstLine(
    gst: NonNullable<IInvoicePaymentSummary['gst']>,
    sales: boolean
  ): IStatusLine {
    if (!gst.isHeld) {
      return {
        key: 'gst',
        tone: 'gst',
        label: 'GST',
        amount: gst.amount,
        status: sales ? 'With payment' : 'Paid with invoice',
        state: 'done',
      };
    }
    const settledWord = sales ? 'Received' : 'Released';
    const byStatus: Record<
      typeof gst.status,
      { status: string; state: IStatusLine['state'] }
    > = {
      SETTLED: { status: settledWord, state: 'done' },
      IN_PROCESS: { status: 'Release in process', state: 'progress' },
      PENDING: {
        status: sales ? 'Receipt pending' : 'Release pending',
        state: 'pending',
      },
      NOT_HELD: { status: settledWord, state: 'done' },
    };
    return {
      key: 'gst',
      tone: 'gst',
      label: 'GST held',
      amount: gst.amount,
      ...byStatus[gst.status],
    };
  }

  private money(value: number): string {
    return `₹${value.toLocaleString(this.loc, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
}
