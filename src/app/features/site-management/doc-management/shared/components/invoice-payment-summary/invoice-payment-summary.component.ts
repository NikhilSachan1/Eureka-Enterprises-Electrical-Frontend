import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import type { IInvoicePaymentSummary } from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.interface';

type RowState = 'done' | 'progress' | 'pending';

interface ISummaryRow {
  key: string;
  label: string;
  amount: number;
  /** What the label means, shown on the info icon. */
  meaning: string;
  /** Short status beside the amount, e.g. "₹10,000 awaiting transfer". */
  status?: string;
  state?: RowState;
}

/**
 * The invoice's money in plain rows: what it is worth, what was booked and paid, what advances,
 * GST and TDS covered, and what is left. Every figure is the server's `paymentSummary`; each label
 * explains itself on hover.
 */
@Component({
  selector: 'app-invoice-payment-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgTemplateOutlet, TooltipModule],
  templateUrl: './invoice-payment-summary.component.html',
  styleUrl: './invoice-payment-summary.component.scss',
})
export class InvoicePaymentSummaryComponent {
  protected readonly fmt = APP_CONFIG.NUMBER_FORMATS.WITH_DECIMALS;
  protected readonly loc = APP_CONFIG.NUMBER_FORMATS.LOCALE;
  protected readonly infoIcon = ICONS.COMMON.INFO_CIRCLE;

  readonly summary = input<IInvoicePaymentSummary | null | undefined>(null);
  readonly isSales = input(false);

  /** Invoice value and net payable: what the rows below are measured against. */
  protected readonly headRows = computed<ISummaryRow[]>(() => {
    const s = this.summary();
    if (!s) {
      return [];
    }
    const sales = this.isSales();
    return [
      {
        key: 'value',
        label: 'Invoice value',
        amount: s.invoiceValue,
        meaning: 'Taxable amount + GST — the full worth of this invoice.',
      },
      {
        key: 'net',
        label: sales ? 'Net receivable' : 'Net payable',
        amount: s.netPayable,
        meaning: sales
          ? 'What the client pays into our bank for this invoice: taxable − TDS, plus GST unless the client holds it.'
          : 'What goes to the vendor’s bank for this invoice: taxable − TDS, plus GST unless it is held.',
      },
    ];
  });

  /** How the invoice is being cleared. */
  protected readonly rows = computed<ISummaryRow[]>(() => {
    const s = this.summary();
    if (!s) {
      return [];
    }
    const sales = this.isSales();
    const rows: ISummaryRow[] = [];

    if (sales) {
      rows.push({
        key: 'received',
        label: 'Received',
        amount: s.paid,
        meaning:
          'Money the client has transferred to us against this invoice (bank transfers).',
        ...(s.paymentBalance > 0
          ? {
              status: `${this.money(s.paymentBalance)} due`,
              state: 'pending' as RowState,
            }
          : { status: 'Fully received', state: 'done' as RowState }),
      });
    } else {
      const toBook = s.toBook ?? 0;
      const awaiting = s.awaitingTransfer ?? 0;
      const booked = s.booked ?? 0;
      rows.push(
        {
          key: 'booked',
          label: 'Booked',
          amount: booked,
          meaning:
            'Amount put up for payment (book payment) against this invoice. GST release bookings are shown under GST, not here.',
          ...(toBook > 0
            ? {
                status: `${this.money(toBook)} to book`,
                state: 'pending' as RowState,
              }
            : { status: 'Fully booked', state: 'done' as RowState }),
        },
        {
          key: 'paid',
          label: 'Paid',
          amount: s.paid,
          meaning:
            'Money actually transferred to the vendor’s bank against the booked amount.',
          ...(awaiting > 0
            ? {
                status: `${this.money(awaiting)} awaiting transfer`,
                state: 'progress' as RowState,
              }
            : booked > 0
              ? { status: 'All booked paid', state: 'done' as RowState }
              : {}),
        }
      );
    }

    if (s.advanceAdjusted > 0) {
      rows.push({
        key: 'advance',
        label: 'Advance adjusted',
        amount: s.advanceAdjusted,
        meaning: sales
          ? 'Advance already received from the client, set off against this invoice.'
          : 'Advance already paid to the vendor on this PO, set off against this invoice — no new transfer is needed for this part.',
      });
    }

    if (s.gst) {
      rows.push(this.gstRow(s.gst, sales));
    }

    if (s.tds) {
      const { tds } = s;
      const status = sales
        ? tds.status === 'CLEARED'
          ? 'Credited in 26AS'
          : '26AS check pending'
        : tds.status === 'CLEARED'
          ? 'Deposited · 26Q filed'
          : tds.status === 'DEPOSITED'
            ? 'Deposited · 26Q pending'
            : 'Challan pending';
      rows.push({
        key: 'tds',
        label: 'TDS',
        amount: tds.amount,
        meaning: sales
          ? 'Tax the client deducted from our payment. The client deposits it; we check it shows in our Form 26AS.'
          : 'Tax we deducted from the vendor’s payment. We deposit it with the government by challan, then file it in the 26Q return.',
        status,
        state:
          tds.status === 'CLEARED'
            ? 'done'
            : tds.status === 'DEPOSITED'
              ? 'progress'
              : 'pending',
      });
    }

    return rows;
  });

  protected readonly settledMeaning = computed(() =>
    this.isSales()
      ? 'Received + advance adjusted + held GST received + TDS credited.'
      : 'Paid + advance adjusted + held GST released + TDS deposited.'
  );

  protected readonly balanceMeaning =
    'Part of the invoice value not settled yet: invoice value − settled.';

  private gstRow(
    gst: NonNullable<IInvoicePaymentSummary['gst']>,
    sales: boolean
  ): ISummaryRow {
    if (!gst.isHeld) {
      return {
        key: 'gst',
        label: 'GST',
        amount: gst.amount,
        meaning: sales
          ? 'GST is not held — the client pays it with the invoice payment.'
          : 'GST is not held — it is paid to the vendor with the invoice payment.',
        status: 'With invoice payment',
        state: 'done',
      };
    }

    const states: Record<
      typeof gst.status,
      { status: string; state: RowState }
    > = {
      SETTLED: { status: sales ? 'Received' : 'Released', state: 'done' },
      IN_PROCESS: { status: 'Release in process', state: 'progress' },
      PENDING: {
        status: sales ? 'Receipt pending' : 'Release pending',
        state: 'pending',
      },
      NOT_HELD: { status: sales ? 'Received' : 'Released', state: 'done' },
    };

    return {
      key: 'gst',
      label: 'GST held',
      amount: gst.amount,
      meaning: sales
        ? 'GST the client kept back from the payment. We receive it separately once they release it.'
        : 'GST kept back until the vendor files it on the GST portal. It is released separately through a GST book payment and bank transfer.',
      ...states[gst.status],
    };
  }

  private money(value: number): string {
    return `₹${value.toLocaleString(this.loc, {
      maximumFractionDigits: 2,
    })}`;
  }
}
