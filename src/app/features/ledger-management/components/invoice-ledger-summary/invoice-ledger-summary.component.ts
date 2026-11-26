import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import { IInvoiceLedgerSummaryView } from '../../types/invoice-ledger.interface';
import { INVOICE_LEDGER_CHART_COLORS } from '../../config/summary/invoice-ledger-summary.config';

/**
 * Summary above the ledger table: headline figures, where the gross bill stands (ring + statement),
 * outstanding ageing with the status mix, billed vs outstanding by month, and who has the most
 * outstanding. Purely presentational.
 */
@Component({
  selector: 'app-invoice-ledger-summary',
  imports: [ChartsComponent, CurrencyPipe, DecimalPipe],
  templateUrl: './invoice-ledger-summary.component.html',
  styleUrl: './invoice-ledger-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceLedgerSummaryComponent {
  readonly view = input<IInvoiceLedgerSummaryView | null>(null);
  readonly loading = input(false);

  protected readonly currencyCode = APP_CONFIG.CURRENCY_CONFIG.DEFAULT;
  protected readonly locale = APP_CONFIG.NUMBER_FORMATS.LOCALE;
  protected readonly outstandingColor = INVOICE_LEDGER_CHART_COLORS.outstanding;
}
