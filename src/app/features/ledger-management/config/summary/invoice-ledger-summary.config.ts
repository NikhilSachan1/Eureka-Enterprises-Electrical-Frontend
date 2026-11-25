import {
  EChartLegendAlign,
  EChartLegendPosition,
  EChartType,
  IBarChartOptions,
  IChartsConfig,
} from '@shared/types';
import {
  buildDonutChart,
  compactInr,
} from '@features/site-management/project-profitability/utility/profitability-chart.util';
import {
  IInvoiceLedgerInsightsDto,
  IInvoiceLedgerTotalsDto,
} from '../../types/invoice-ledger.dto';
import {
  IInvoiceLedgerMoneySlice,
  IInvoiceLedgerSideConfig,
  IInvoiceLedgerSummaryView,
} from '../../types/invoice-ledger.interface';
import { formatLedgerAmount } from '../../utils/invoice-ledger-format.util';

/**
 * Ledger chart colours, validated for colour-blind separation in light and dark mode (dataviz
 * validate_palette). The ring order below keeps similar hues apart, including the wrap-around
 * pair; the 2px gaps and the labelled legend are the secondary encoding the two closest pairs need.
 */
export const INVOICE_LEDGER_CHART_COLORS = {
  settled: '#16a34a',
  gstHeld: '#d97706',
  tds: '#6366f1',
  outstanding: '#db2777',
  advance: '#0284c7',
  billed: '#6366f1',
} as const;

const LAKH = 100_000;
const MONTH_LABEL = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  year: '2-digit',
});

const toLakh = (amount: number): number =>
  Math.round((amount / LAKH) * 100) / 100;

/** "2026-04" → "Apr 26". */
function monthLabel(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  return MONTH_LABEL.format(new Date(year, mon - 1, 1));
}

/**
 * Where the gross bill stands, in ring order. "GST held / other" is what the other parts do not
 * explain — mostly GST held back and settled on its own.
 */
function buildMoneySlices(
  totals: IInvoiceLedgerTotalsDto,
  sideConfig: IInvoiceLedgerSideConfig
): IInvoiceLedgerMoneySlice[] {
  const gross = totals.grossAmount;
  const advance = sideConfig.showAdvance ? totals.advanceAdjusted : 0;
  const explained =
    totals.paidAmount + totals.tdsAmount + advance + totals.outstandingAmount;
  const other = Math.max(gross - explained, 0);
  const percent = (amount: number): number =>
    gross > 0 ? Math.round((amount / gross) * 1000) / 10 : 0;

  const slices: IInvoiceLedgerMoneySlice[] = [
    {
      key: 'settled',
      label: sideConfig.paidLabel,
      amount: totals.paidAmount,
      percent: percent(totals.paidAmount),
      color: INVOICE_LEDGER_CHART_COLORS.settled,
    },
    {
      key: 'gstHeld',
      label: 'GST held / other',
      amount: other,
      percent: percent(other),
      color: INVOICE_LEDGER_CHART_COLORS.gstHeld,
    },
    {
      key: 'tds',
      label: 'TDS',
      amount: totals.tdsAmount,
      percent: percent(totals.tdsAmount),
      color: INVOICE_LEDGER_CHART_COLORS.tds,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      amount: totals.outstandingAmount,
      percent: percent(totals.outstandingAmount),
      color: INVOICE_LEDGER_CHART_COLORS.outstanding,
    },
  ];
  if (sideConfig.showAdvance) {
    slices.push({
      key: 'advance',
      label: 'Advance adjusted',
      amount: advance,
      percent: percent(advance),
      color: INVOICE_LEDGER_CHART_COLORS.advance,
    });
  }
  return slices;
}

/** Billed vs still outstanding per invoice month, in ₹ lakh so the axis stays readable. */
function buildTrendChart(
  byMonth: IInvoiceLedgerInsightsDto['byMonth']
): IChartsConfig | null {
  if (!byMonth.length) {
    return null;
  }
  const options: Partial<IBarChartOptions> = {
    responsive: true,
    maintainAspectRatio: false,
    showLegend: true,
    legendPosition: EChartLegendPosition.TOP,
    legendAlign: EChartLegendAlign.END,
    enableTooltip: true,
    animationDuration: 600,
    beginAtZero: true,
    showXGrid: false,
    showYGrid: true,
    YAxisTicksLimit: 5,
  };
  return {
    chartType: EChartType.BAR,
    labels: byMonth.map(m => monthLabel(m.month)),
    datasets: [
      {
        label: 'Billed (₹ lakh)',
        data: byMonth.map(m => toLakh(m.billed)),
        backgroundColor: INVOICE_LEDGER_CHART_COLORS.billed,
        hoverBackgroundColor: INVOICE_LEDGER_CHART_COLORS.billed,
        borderWidth: 0,
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.6,
      },
      {
        label: 'Still outstanding (₹ lakh)',
        data: byMonth.map(m => toLakh(m.outstanding)),
        backgroundColor: INVOICE_LEDGER_CHART_COLORS.outstanding,
        hoverBackgroundColor: INVOICE_LEDGER_CHART_COLORS.outstanding,
        borderWidth: 0,
        borderRadius: 4,
        barPercentage: 0.85,
        categoryPercentage: 0.6,
      },
    ],
    options,
  };
}

/** Everything the summary draws, from the totals and insights of every matching invoice. */
export function buildInvoiceLedgerSummaryView(
  totals: IInvoiceLedgerTotalsDto,
  insights: IInvoiceLedgerInsightsDto | undefined,
  invoiceCount: number,
  sideConfig: IInvoiceLedgerSideConfig
): IInvoiceLedgerSummaryView {
  const slices = buildMoneySlices(totals, sideConfig);
  const settled = Math.max(totals.netPayable - totals.outstandingAmount, 0);
  const topParties = insights?.topParties ?? [];
  const maxOutstanding = Math.max(...topParties.map(p => p.outstanding), 1);

  const gstSplit =
    totals.igstAmount > 0
      ? `CGST ${formatLedgerAmount(totals.cgstAmount)} · SGST ${formatLedgerAmount(totals.sgstAmount)} · IGST ${formatLedgerAmount(totals.igstAmount)}`
      : `CGST ${formatLedgerAmount(totals.cgstAmount)} · SGST ${formatLedgerAmount(totals.sgstAmount)}`;

  return {
    kpis: [
      { label: 'Invoices', value: invoiceCount, isCount: true },
      {
        label: 'Gross bill',
        value: totals.grossAmount,
        hint: `Basic ${formatLedgerAmount(totals.taxableAmount)}`,
      },
      { label: 'GST', value: totals.gstAmount, hint: gstSplit },
      { label: 'TDS', value: totals.tdsAmount },
    ],
    outstanding: totals.outstandingAmount,
    outstandingCompact: compactInr(totals.outstandingAmount),
    settledPercent:
      totals.netPayable > 0
        ? Math.min(Math.round((settled / totals.netPayable) * 100), 100)
        : 0,
    slices,
    ringChart: buildDonutChart(
      slices.map(s => ({ label: s.label, amount: s.amount, color: s.color })),
      { cutout: '74%', title: 'Amount' }
    ),
    trendChart: buildTrendChart(insights?.byMonth ?? []),
    parties: topParties.map(p => ({
      name: p.partyName,
      outstanding: p.outstanding,
      invoiceCount: p.count,
      widthPercent: Math.max(
        Math.round((p.outstanding / maxOutstanding) * 100),
        2
      ),
    })),
    partyHeading: `Most outstanding · ${sideConfig.partyLabel.toLowerCase()}s`,
  };
}
