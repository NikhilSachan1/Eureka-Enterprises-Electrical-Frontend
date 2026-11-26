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
  EInvoiceLedgerAgeingBucket,
  EInvoiceLedgerPaymentStatus,
} from '../../types/invoice-ledger.enum';
import {
  IInvoiceLedgerAgeingBand,
  IInvoiceLedgerMoneySlice,
  IInvoiceLedgerSideConfig,
  IInvoiceLedgerStatementLine,
  IInvoiceLedgerStatusCount,
  IInvoiceLedgerSummaryView,
} from '../../types/invoice-ledger.interface';
import { formatLedgerStatus } from '../../utils/invoice-ledger-format.util';

/**
 * Summary colours are the table's column tones (Tailwind 600), so an amount has the same colour
 * above and inside the table: bill teal, GST amber, TDS indigo, advance sky, received green,
 * outstanding red. The ring keeps a 2px gap between segments and every segment is labelled in the
 * statement beside it, so it never relies on colour alone.
 */
export const INVOICE_LEDGER_CHART_COLORS = {
  bill: '#0d9488',
  gst: '#d97706',
  tds: '#4f46e5',
  advance: '#0284c7',
  received: '#16a34a',
  outstanding: '#dc2626',
  other: '#94a3b8',
  count: '#475569',
} as const;

/** Older is darker: one red ramp, so the bands read as "how bad" rather than as categories. */
const AGEING_BANDS: {
  key: EInvoiceLedgerAgeingBucket;
  label: string;
  color: string;
}[] = [
  {
    key: EInvoiceLedgerAgeingBucket.D0_30,
    label: '0–30 days',
    color: '#fca5a5',
  },
  {
    key: EInvoiceLedgerAgeingBucket.D31_60,
    label: '31–60 days',
    color: '#f87171',
  },
  {
    key: EInvoiceLedgerAgeingBucket.D61_90,
    label: '61–90 days',
    color: '#dc2626',
  },
  {
    key: EInvoiceLedgerAgeingBucket.D90_PLUS,
    label: '90+ days',
    color: '#991b1b',
  },
  {
    key: EInvoiceLedgerAgeingBucket.UNDATED,
    label: 'No invoice date',
    color: '#94a3b8',
  },
];

const STATUS_ORDER = [
  EInvoiceLedgerPaymentStatus.PAID,
  EInvoiceLedgerPaymentStatus.PARTIAL,
  EInvoiceLedgerPaymentStatus.UNPAID,
];

/** Status band colours: the status tag colours, with a light tint for each box. */
const STATUS_STYLE: Record<
  EInvoiceLedgerPaymentStatus,
  { color: string; tint: string }
> = {
  [EInvoiceLedgerPaymentStatus.PAID]: {
    color: INVOICE_LEDGER_CHART_COLORS.received,
    tint: 'color-mix(in srgb, #16a34a 8%, transparent)',
  },
  [EInvoiceLedgerPaymentStatus.PARTIAL]: {
    color: INVOICE_LEDGER_CHART_COLORS.gst,
    tint: 'color-mix(in srgb, #d97706 8%, transparent)',
  },
  [EInvoiceLedgerPaymentStatus.UNPAID]: {
    color: INVOICE_LEDGER_CHART_COLORS.outstanding,
    tint: 'color-mix(in srgb, #dc2626 8%, transparent)',
  },
};

const LAKH = 100_000;
const MONTH_LABEL = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  year: '2-digit',
});

const toLakh = (amount: number): number =>
  Math.round((amount / LAKH) * 100) / 100;

const shareOf = (amount: number, whole: number): number =>
  whole > 0 ? Math.round((amount / whole) * 1000) / 10 : 0;

/** "2026-04" → "Apr 26". */
function monthLabel(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  return MONTH_LABEL.format(new Date(year, mon - 1, 1));
}

/** GST held back from the net payable: what is left of the gross after TDS and the net payable. */
function gstHeldOf(totals: IInvoiceLedgerTotalsDto): number {
  return Math.max(totals.grossAmount - totals.tdsAmount - totals.netPayable, 0);
}

/**
 * Where the gross bill stands, in ring order. "Other" only appears when the parts do not add up to
 * the gross (rounding, or an invoice paid above its net payable).
 */
function buildMoneySlices(
  totals: IInvoiceLedgerTotalsDto,
  sideConfig: IInvoiceLedgerSideConfig
): IInvoiceLedgerMoneySlice[] {
  const gross = totals.grossAmount;
  const advance = sideConfig.showAdvance ? totals.advanceAdjusted : 0;
  const gstHeld = gstHeldOf(totals);
  const parts: Omit<IInvoiceLedgerMoneySlice, 'percent'>[] = [
    {
      key: 'received',
      label: sideConfig.paidLabel,
      amount: totals.paidAmount,
      color: INVOICE_LEDGER_CHART_COLORS.received,
    },
    {
      key: 'advance',
      label: 'Advance adjusted',
      amount: advance,
      color: INVOICE_LEDGER_CHART_COLORS.advance,
    },
    {
      key: 'tds',
      label: 'TDS',
      amount: totals.tdsAmount,
      color: INVOICE_LEDGER_CHART_COLORS.tds,
    },
    {
      key: 'gstHeld',
      label: 'GST held',
      amount: gstHeld,
      color: INVOICE_LEDGER_CHART_COLORS.gst,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      amount: totals.outstandingAmount,
      color: INVOICE_LEDGER_CHART_COLORS.outstanding,
    },
  ];
  const other = gross - parts.reduce((sum, part) => sum + part.amount, 0);
  if (other >= 1) {
    parts.push({
      key: 'other',
      label: 'Other',
      amount: other,
      color: INVOICE_LEDGER_CHART_COLORS.other,
    });
  }
  return parts
    .filter(part => part.amount > 0)
    .map(part => ({ ...part, percent: shareOf(part.amount, gross) }));
}

/** Basic + GST = gross − TDS − GST held = net payable − received − advance = outstanding. */
function buildStatement(
  totals: IInvoiceLedgerTotalsDto,
  slices: IInvoiceLedgerMoneySlice[],
  sideConfig: IInvoiceLedgerSideConfig
): IInvoiceLedgerStatementLine[] {
  const slice = (key: string): IInvoiceLedgerMoneySlice | undefined =>
    slices.find(s => s.key === key);
  const segment = (
    key: string,
    label: string,
    amount: number,
    hint?: string
  ): IInvoiceLedgerStatementLine => ({
    key,
    label,
    amount,
    sign: '−',
    isTotal: false,
    color: slice(key)?.color,
    percent: slice(key)?.percent,
    hint,
  });

  // GST broken into its parts, each on its own line, then the GST total.
  const gstParts: IInvoiceLedgerStatementLine[] = [
    { key: 'cgst', label: 'CGST', amount: totals.cgstAmount },
    { key: 'sgst', label: 'SGST', amount: totals.sgstAmount },
    { key: 'igst', label: 'IGST', amount: totals.igstAmount },
  ]
    .filter(part => part.amount > 0)
    .map(part => ({
      ...part,
      sign: '+' as const,
      isTotal: false,
      variant: 'part' as const,
    }));
  const gstHeld = gstHeldOf(totals);

  const lines: (IInvoiceLedgerStatementLine | null)[] = [
    {
      key: 'basic',
      label: 'Basic value',
      amount: totals.taxableAmount,
      sign: '',
      isTotal: false,
    },
    ...gstParts,
    {
      key: 'gst',
      label: 'Total GST',
      amount: totals.gstAmount,
      sign: gstParts.length ? '' : '+',
      isTotal: false,
      variant: gstParts.length ? 'groupTotal' : undefined,
    },
    {
      key: 'gross',
      label: 'Gross bill',
      amount: totals.grossAmount,
      sign: '=',
      isTotal: true,
      color: INVOICE_LEDGER_CHART_COLORS.bill,
    },
    segment('tds', 'TDS', totals.tdsAmount),
    gstHeld > 0 ? segment('gstHeld', 'GST held', gstHeld) : null,
    {
      key: 'net',
      label: 'Net payable',
      amount: totals.netPayable,
      sign: '=',
      isTotal: true,
    },
    segment('received', sideConfig.paidLabel, totals.paidAmount),
    sideConfig.showAdvance
      ? segment('advance', 'Advance adjusted', totals.advanceAdjusted)
      : null,
    {
      key: 'outstanding',
      label: 'Outstanding',
      amount: totals.outstandingAmount,
      sign: '=',
      isTotal: true,
      color: INVOICE_LEDGER_CHART_COLORS.outstanding,
      percent: slice('outstanding')?.percent,
    },
  ];
  return lines.filter((line): line is IInvoiceLedgerStatementLine => !!line);
}

/** Outstanding by age; empty bands are left out. */
function buildAgeing(
  ageing: IInvoiceLedgerInsightsDto['ageing'],
  outstanding: number
): IInvoiceLedgerAgeingBand[] {
  return AGEING_BANDS.flatMap(band => {
    const row = ageing.find(a => a.bucket === band.key);
    return row && row.outstanding > 0
      ? [
          {
            ...band,
            count: row.count,
            amount: row.outstanding,
            percent: shareOf(row.outstanding, outstanding),
          },
        ]
      : [];
  });
}

/** Paid / Partial / Unpaid, always in that order, zero counts included. */
function buildStatusMix(
  statusMix: IInvoiceLedgerInsightsDto['statusMix']
): IInvoiceLedgerStatusCount[] {
  const total = statusMix.reduce((sum, s) => sum + s.count, 0);
  return STATUS_ORDER.map(status => {
    const row = statusMix.find(s => s.status === status);
    const count = row?.count ?? 0;
    return {
      label: formatLedgerStatus(status),
      count,
      percent: shareOf(count, total),
      gross: row?.gross ?? 0,
      outstanding: row?.outstanding ?? 0,
      ...STATUS_STYLE[status],
    };
  });
}

/** Billed vs still outstanding per invoice month, in ₹ lakh so the axis stays readable. */
function buildTrendChart(
  byMonth: IInvoiceLedgerInsightsDto['byMonth']
): IChartsConfig | null {
  if (!byMonth.length) {
    return null;
  }
  // A month or two would otherwise draw bars as wide as the card.
  const categoryPercentage = byMonth.length <= 2 ? 0.3 : 0.65;
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
  const series = (
    label: string,
    data: number[],
    color: string
  ): IChartsConfig['datasets'][number] => ({
    label,
    data,
    backgroundColor: color,
    hoverBackgroundColor: color,
    borderWidth: 0,
    borderRadius: 4,
    barPercentage: 0.85,
    categoryPercentage,
  });
  return {
    chartType: EChartType.BAR,
    labels: byMonth.map(m => monthLabel(m.month)),
    datasets: [
      series(
        'Billed',
        byMonth.map(m => toLakh(m.billed)),
        INVOICE_LEDGER_CHART_COLORS.bill
      ),
      series(
        'Outstanding',
        byMonth.map(m => toLakh(m.outstanding)),
        INVOICE_LEDGER_CHART_COLORS.outstanding
      ),
    ],
    options,
  };
}

/** Everything the summary draws, from the totals and insights of every matching invoice. */
export function buildInvoiceLedgerSummaryView(
  totals: IInvoiceLedgerTotalsDto,
  insights: IInvoiceLedgerInsightsDto | undefined,
  sideConfig: IInvoiceLedgerSideConfig
): IInvoiceLedgerSummaryView {
  const slices = buildMoneySlices(totals, sideConfig);
  const settled = Math.max(totals.netPayable - totals.outstandingAmount, 0);
  const statusMix = buildStatusMix(insights?.statusMix ?? []);
  const ageing = buildAgeing(insights?.ageing ?? [], totals.outstandingAmount);
  const oldestOutstandingDays = insights?.oldestOutstandingDays ?? null;
  const topParties = insights?.topParties ?? [];
  const maxOutstanding = Math.max(...topParties.map(p => p.outstanding), 1);

  return {
    outstandingCompact: compactInr(totals.outstandingAmount),
    settledPercent:
      totals.netPayable > 0
        ? Math.min(Math.round((settled / totals.netPayable) * 100), 100)
        : 0,
    ringChart: buildDonutChart(
      slices.map(s => ({ label: s.label, amount: s.amount, color: s.color })),
      { cutout: '74%', title: 'Amount' }
    ),
    statement: buildStatement(totals, slices, sideConfig),
    ageing,
    ageingSummary: `Outstanding by age: ${ageing
      .map(band => `${band.label} ${band.percent}%`)
      .join(', ')}`,
    outstandingInvoiceCount: ageing.reduce((sum, band) => sum + band.count, 0),
    oldestOutstandingDays,
    statusMix,
    invoiceCount: statusMix.reduce((sum, s) => sum + s.count, 0),
    statusBandLabel: statusMix
      .map(s => `${s.count} ${s.label.toLowerCase()}`)
      .join(', '),
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
