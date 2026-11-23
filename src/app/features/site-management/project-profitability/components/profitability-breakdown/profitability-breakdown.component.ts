import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { ICONS } from '@shared/constants';
import { AppConfigurationService, AvatarService } from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { TooltipModule } from 'primeng/tooltip';
import {
  IProfitabilityDetailMeta,
  IProfitabilityDetailStat,
  IProfitabilityDonut,
  IProfitabilityInvoiceRow,
  IProfitabilityInvoiceTotals,
  IProfitabilityPart,
  IProfitabilityShareRow,
  TInvoiceSettlement,
} from '../../types/profitability-detail.interface';
import {
  IProjectProfitabilityReport,
  ProfitabilityBreakdownType,
} from '../../types/project-profitability.interface';
import {
  buildDonutChart,
  compactInr,
} from '../../utility/profitability-chart.util';

type TExpenseView = 'category' | 'employee';

/** Colours handed out by rank, so the biggest piece always gets the first colour. */
const PALETTE = [
  '#6366f1',
  '#0ea5e9',
  '#f59e0b',
  '#ec4899',
  '#10b981',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#f97316',
  '#84cc16',
];
const OTHERS_COLOR = '#94a3b8';
/** Donut slices shown by name; the rest are folded into "Others". */
const DONUT_SLICES = 6;
const SETTLED_COLOR = '#16a34a';
const OUTSTANDING_COLOR = '#f87171';

const META: Record<ProfitabilityBreakdownType, IProfitabilityDetailMeta> = {
  'sales-invoices': {
    icon: 'pi pi-file-export',
    tone: 'revenue',
    title: 'Sales invoices',
    subtitle: 'Approved invoices billed to the contractor for this project.',
    formula:
      'Revenue counts only the taxable value. Expected in bank = total − TDS deducted by the contractor. Outstanding = expected − received.',
  },
  'vendor-invoices': {
    icon: 'pi pi-file-import',
    tone: 'vendor',
    title: 'Vendor invoices',
    subtitle: 'Approved invoices from vendors for this project.',
    formula:
      'Vendor cost counts the taxable value (plus GST on freelancer invoices, which gives no credit). Due to vendor = total − TDS we deduct. Outstanding = due − paid − advance adjusted.',
  },
  'employee-cost': {
    icon: 'pi pi-users',
    tone: 'employee',
    title: 'Employee cost',
    subtitle:
      'Salary of staff allocated to this site, for the days they were on site.',
    formula:
      'Monthly company cost = gross pay − LOP + employer PF, from approved / paid payroll, counted for the days the employee was allocated here.',
  },
  'fuel-employee': {
    icon: 'pi pi-car',
    tone: 'fuel',
    title: 'Fuel expense',
    subtitle:
      'Approved fuel filled by site staff while allocated to this site.',
    formula:
      'Sum of approved fuel entries. Pick an employee to see the vehicles behind their total.',
  },
  'regular-expense-detail': {
    icon: 'pi pi-receipt',
    tone: 'expense',
    title: 'Site expenses',
    subtitle:
      'Approved expenses tagged to this site or claimed by its staff while allocated here.',
    formula:
      'Sum of approved expenses. Payroll items (gratuity, FnF, leave encashment, bonus) and asset recovery are left out.',
  },
};

/**
 * Breakdown under the P&L, one tab per statement line: sales and vendor invoices, employee cost,
 * fuel and site expenses — each with a donut of where its total goes and the entries behind it.
 */
@Component({
  selector: 'app-profitability-breakdown',
  imports: [
    ChartsComponent,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    EmptyMessagesComponent,
    TooltipModule,
  ],
  templateUrl: './profitability-breakdown.component.html',
  styleUrl: './profitability-breakdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfitabilityBreakdownComponent {
  protected readonly DATE_FORMATS = APP_CONFIG.DATE_FORMATS;
  private readonly avatarService = inject(AvatarService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  readonly report = input.required<IProjectProfitabilityReport>();
  /** Open tab; the P&L statement sets it when a line is clicked. */
  readonly type = model<ProfitabilityBreakdownType>('sales-invoices');

  protected readonly icons = ICONS;
  protected readonly currency = APP_CONFIG.CURRENCY_CONFIG.DEFAULT;
  protected readonly locale = APP_CONFIG.NUMBER_FORMATS.LOCALE;
  protected readonly expenseView = signal<TExpenseView>('category');
  protected readonly expenseViews: { label: string; value: TExpenseView }[] = [
    { label: 'By category', value: 'category' },
    { label: 'By employee', value: 'employee' },
  ];
  /** Row picked in a master–detail list; null falls back to the first row. */
  protected readonly selectedKey = signal<string | null>(null);

  protected readonly meta = computed(() => META[this.type()]);

  /** One tab per P&L line, with the amount it adds to the statement. */
  protected readonly tabs = computed(() => {
    const report = this.report();
    const profit = report.profitabilitySummary;
    const ops = report.expenseSummary.operationalExpense;
    const amounts: Record<ProfitabilityBreakdownType, number> = {
      'sales-invoices': profit.revenue,
      'vendor-invoices': profit.projectCost.vendorCost,
      'employee-cost': profit.projectCost.employeeCost,
      'fuel-employee': ops.fuelExpense.totalFuelExpense,
      'regular-expense-detail': ops.regularExpense.totalRegularExpense,
    };
    return (Object.keys(META) as ProfitabilityBreakdownType[]).map(type => ({
      type,
      label: META[type].title,
      icon: META[type].icon,
      tone: META[type].tone,
      amount: amounts[type],
    }));
  });

  protected readonly stats = computed<IProfitabilityDetailStat[]>(() => {
    switch (this.type()) {
      case 'employee-cost':
        return this.employeeStats();
      case 'fuel-employee':
        return this.fuelStats();
      case 'regular-expense-detail':
        return this.expenseStats();
      case 'sales-invoices':
        return this.invoiceStats(
          this.salesInvoices().totals,
          'Received',
          'To receive'
        );
      case 'vendor-invoices':
        return this.invoiceStats(
          this.vendorInvoices().totals,
          'Paid',
          'To pay'
        );
      default:
        return [];
    }
  });

  protected readonly listRows = computed<IProfitabilityShareRow[]>(() => {
    switch (this.type()) {
      case 'employee-cost':
        return this.employeeRows();
      case 'fuel-employee':
        return this.fuelRows();
      case 'regular-expense-detail':
        return this.expenseView() === 'category'
          ? this.expenseCategoryRows()
          : this.expenseEmployeeRows();
      default:
        return [];
    }
  });

  protected readonly listTotal = computed(() =>
    this.listRows().reduce((sum, row) => sum + row.amount, 0)
  );

  /** Rows with parts get the master–detail layout. */
  protected readonly hasDetail = computed(() =>
    this.listRows().some(row => row.parts?.length)
  );

  protected readonly selectedRow = computed<IProfitabilityShareRow | null>(
    () => {
      const rows = this.listRows();
      const key = this.selectedKey();
      return rows.find(row => row.key === key) ?? rows[0] ?? null;
    }
  );

  protected readonly detailHeading = computed(() => {
    if (this.type() === 'fuel-employee') {
      return 'Vehicles';
    }
    return this.expenseView() === 'category' ? 'Employees' : 'Categories';
  });

  protected readonly invoices = computed(() => {
    const type = this.type();
    if (type === 'sales-invoices') {
      return this.salesInvoices();
    }
    if (type === 'vendor-invoices') {
      return this.vendorInvoices();
    }
    return null;
  });

  protected readonly settledLabel = computed(() =>
    this.type() === 'sales-invoices' ? 'Received' : 'Paid'
  );

  protected readonly donut = computed<IProfitabilityDonut | null>(() => {
    const invoices = this.invoices();
    if (invoices) {
      const { settledAmount, outstandingAmount } = invoices.totals;
      const base = settledAmount + outstandingAmount;
      return {
        segments: [
          {
            key: 'settled',
            label: this.settledLabel(),
            amount: settledAmount,
            share: this.share(settledAmount, base),
            color: SETTLED_COLOR,
          },
          {
            key: 'outstanding',
            label: 'Outstanding',
            amount: outstandingAmount,
            share: this.share(outstandingAmount, base),
            color: OUTSTANDING_COLOR,
          },
        ],
        centerValue: `${Math.round(this.share(settledAmount, base))}%`,
        centerLabel: this.settledLabel().toLowerCase(),
      };
    }

    const rows = this.listRows();
    if (!rows.length) {
      return null;
    }
    const total = this.listTotal();
    const shown = rows.slice(0, DONUT_SLICES).map(row => ({
      key: row.key,
      label: row.title,
      amount: row.amount,
      share: row.share,
      color: row.color,
    }));
    const rest = rows
      .slice(DONUT_SLICES)
      .reduce((sum, row) => sum + row.amount, 0);
    if (rest > 0) {
      shown.push({
        key: 'others',
        label: `Others (${rows.length - DONUT_SLICES})`,
        amount: rest,
        share: this.share(rest, total),
        color: OTHERS_COLOR,
      });
    }
    return {
      segments: shown,
      centerValue: compactInr(total),
      centerLabel: 'total',
    };
  });

  /** Doughnut for the shared chart component; the legend is drawn beside it. */
  protected readonly donutChart = computed(() =>
    buildDonutChart(this.donut()?.segments ?? [], { title: this.meta().title })
  );

  constructor() {
    // A new tab starts from categories and its first row.
    effect(() => {
      this.type();
      untracked(() => {
        this.expenseView.set('category');
        this.selectedKey.set(null);
      });
    });
  }

  protected setExpenseView(view: TExpenseView): void {
    this.expenseView.set(view);
    this.selectedKey.set(null);
  }

  protected statusLabel(status: TInvoiceSettlement): string {
    if (status === 'settled') {
      return 'Settled';
    }
    return status === 'partial' ? 'Part settled' : 'Not settled';
  }

  // ── Employee cost ─────────────────────────────────────────────────────────

  private readonly employeeRows = computed<IProfitabilityShareRow[]>(() => {
    const cost = this.report().expenseSummary.employeeCost;
    const rows = cost.employeeWiseSummary
      .map((row, index) => ({
        key: `${row.employeeCode ?? row.employeeName}-${index}`,
        title: row.employeeName,
        subtitle: [
          row.employeeCode,
          `${row.workingDays} ${row.workingDays === 1 ? 'day' : 'days'} on site`,
          `${this.money(row.perDayCost)}/day`,
        ]
          .filter(Boolean)
          .join(' · '),
        avatar: this.avatar(row.employeeName),
        color: '',
        amount: row.allocatedAmount,
        share: this.share(row.allocatedAmount, cost.totalEmployeeCost),
      }))
      .sort((a, b) => b.amount - a.amount);
    return this.colorByRank(rows);
  });

  private employeeStats(): IProfitabilityDetailStat[] {
    const cost = this.report().expenseSummary.employeeCost;
    const days = cost.employeeWiseSummary.reduce(
      (sum, row) => sum + row.workingDays,
      0
    );
    return [
      {
        label: 'Total cost',
        value: cost.totalEmployeeCost,
        kind: 'money',
        tone: 'main',
      },
      {
        label: 'Employees',
        value: cost.employeeWiseSummary.length,
        kind: 'count',
      },
      {
        label: 'Person-days',
        value: days,
        kind: 'count',
        hint: 'On this site',
      },
      {
        label: 'Per person-day',
        value: days ? cost.totalEmployeeCost / days : 0,
        kind: 'money',
        hint: 'Average',
      },
    ];
  }

  // ── Fuel: employee → vehicles ─────────────────────────────────────────────

  private readonly fuelRows = computed<IProfitabilityShareRow[]>(() => {
    const fuel = this.report().expenseSummary.operationalExpense.fuelExpense;
    const vehicleColors = this.rankColors(
      fuel.employeeWiseSummary.map(row => ({
        key: row.vehicleNumber,
        amount: row.expenseAmount,
      }))
    );
    const groups = new Map<
      string,
      { title: string; code: string; parts: IProfitabilityPart[] }
    >();
    for (const row of fuel.employeeWiseSummary) {
      const key = row.employeeCode || row.employeeName;
      const group = groups.get(key) ?? {
        title: row.employeeName,
        code: row.employeeCode,
        parts: [],
      };
      group.parts.push({
        key: row.vehicleNumber,
        label: `Vehicle ${row.vehicleNumber}`,
        amount: row.expenseAmount,
        share: 0,
        color: vehicleColors.get(row.vehicleNumber) ?? OTHERS_COLOR,
      });
      groups.set(key, group);
    }
    const rows = [...groups.entries()].map(([key, group]) => {
      const amount = group.parts.reduce((sum, part) => sum + part.amount, 0);
      return {
        key,
        title: group.title,
        subtitle: `${group.code} · ${group.parts.length} ${group.parts.length === 1 ? 'vehicle' : 'vehicles'}`,
        avatar: this.avatar(group.title),
        color: '',
        amount,
        share: this.share(amount, fuel.totalFuelExpense),
        parts: this.withShares(group.parts, amount),
      };
    });
    return this.colorByRank(rows.sort((a, b) => b.amount - a.amount));
  });

  private fuelStats(): IProfitabilityDetailStat[] {
    const fuel = this.report().expenseSummary.operationalExpense.fuelExpense;
    const rows = fuel.employeeWiseSummary;
    return [
      {
        label: 'Total fuel',
        value: fuel.totalFuelExpense,
        kind: 'money',
        tone: 'main',
      },
      {
        label: 'Employees',
        value: new Set(rows.map(r => r.employeeCode)).size,
        kind: 'count',
      },
      {
        label: 'Vehicles',
        value: new Set(rows.map(r => r.vehicleNumber)).size,
        kind: 'count',
      },
    ];
  }

  // ── Site expenses: category ⇄ employee ────────────────────────────────────

  /** One colour per category for the whole popup, by the category's overall size. */
  private readonly categoryColors = computed(() =>
    this.rankColors(
      this.report().expenseSummary.operationalExpense.regularExpense.categoryWiseSummary.map(
        row => ({
          key: row.categoryName,
          amount: row.amount,
        })
      )
    )
  );

  private readonly employeeColors = computed(() =>
    this.rankColors(
      this.report().expenseSummary.operationalExpense.regularExpense.employeeWiseSummary.map(
        row => ({
          key: row.employeeCode || row.employeeName,
          amount: row.expenseAmount,
        })
      )
    )
  );

  private readonly expenseCategoryRows = computed<IProfitabilityShareRow[]>(
    () => {
      const regular =
        this.report().expenseSummary.operationalExpense.regularExpense;
      const categoryColors = this.categoryColors();
      const employeeColors = this.employeeColors();
      return regular.categoryWiseSummary
        .map(row => {
          const parts = regular.employeeWiseSummary
            .filter(entry => entry.expenseType === row.categoryName)
            .map(entry => {
              const key = entry.employeeCode || entry.employeeName;
              return {
                key,
                label: entry.employeeName,
                amount: entry.expenseAmount,
                share: 0,
                color: employeeColors.get(key) ?? OTHERS_COLOR,
              };
            });
          return {
            key: row.categoryName,
            title: this.categoryLabel(row.categoryName),
            subtitle: `${parts.length} ${parts.length === 1 ? 'employee' : 'employees'}`,
            avatar: null,
            color: categoryColors.get(row.categoryName) ?? OTHERS_COLOR,
            amount: row.amount,
            share: this.share(row.amount, regular.totalRegularExpense),
            parts: this.withShares(parts, row.amount),
          };
        })
        .sort((a, b) => b.amount - a.amount);
    }
  );

  private readonly expenseEmployeeRows = computed<IProfitabilityShareRow[]>(
    () => {
      const regular =
        this.report().expenseSummary.operationalExpense.regularExpense;
      const categoryColors = this.categoryColors();
      const employeeColors = this.employeeColors();
      const groups = new Map<
        string,
        { title: string; code: string; parts: IProfitabilityPart[] }
      >();
      for (const row of regular.employeeWiseSummary) {
        const key = row.employeeCode || row.employeeName;
        const group = groups.get(key) ?? {
          title: row.employeeName,
          code: row.employeeCode,
          parts: [],
        };
        group.parts.push({
          key: row.expenseType,
          label: this.categoryLabel(row.expenseType),
          amount: row.expenseAmount,
          share: 0,
          color: categoryColors.get(row.expenseType) ?? OTHERS_COLOR,
        });
        groups.set(key, group);
      }
      return [...groups.entries()]
        .map(([key, group]) => {
          const amount = group.parts.reduce(
            (sum, part) => sum + part.amount,
            0
          );
          return {
            key,
            title: group.title,
            subtitle: `${group.code} · ${group.parts.length} ${group.parts.length === 1 ? 'category' : 'categories'}`,
            avatar: this.avatar(group.title),
            color: employeeColors.get(key) ?? OTHERS_COLOR,
            amount,
            share: this.share(amount, regular.totalRegularExpense),
            parts: this.withShares(group.parts, amount),
          };
        })
        .sort((a, b) => b.amount - a.amount);
    }
  );

  private expenseStats(): IProfitabilityDetailStat[] {
    const regular =
      this.report().expenseSummary.operationalExpense.regularExpense;
    return [
      {
        label: 'Total expenses',
        value: regular.totalRegularExpense,
        kind: 'money',
        tone: 'main',
      },
      {
        label: 'Categories',
        value: regular.categoryWiseSummary.length,
        kind: 'count',
      },
      {
        label: 'Employees',
        value: new Set(regular.employeeWiseSummary.map(r => r.employeeCode))
          .size,
        kind: 'count',
      },
    ];
  }

  // ── Invoices ──────────────────────────────────────────────────────────────

  private readonly salesInvoices = computed(() => {
    const list =
      this.report().metaSummary.salesSummary.salesInvoiceSummary.invoiceSummary;
    return this.buildInvoices(
      list.map(row => ({
        ...row,
        partyName: row.clientName,
        partyTags: [],
      }))
    );
  });

  private readonly vendorInvoices = computed(() => {
    const list =
      this.report().metaSummary.purchaseSummary.vendorInvoiceSummary
        .invoiceSummary;
    return this.buildInvoices(
      list.map(row => ({
        ...row,
        partyName: row.vendorName,
        partyTags: row.vendorType === 'FREELANCER' ? ['Freelancer'] : [],
      }))
    );
  });

  private buildInvoices(
    list: {
      invoiceNumber: string;
      invoiceDate: string;
      poNumber: string;
      partyName: string;
      taxableAmount: number;
      gstAmount: number;
      tdsAmount: number;
      invoiceAmount: number;
      settledAmount: number;
      outstandingAmount: number;
      isGstHold: boolean;
      partyTags: string[];
    }[]
  ): { rows: IProfitabilityInvoiceRow[]; totals: IProfitabilityInvoiceTotals } {
    const rows = list.map((row, index) => ({
      key: `${row.invoiceNumber}-${index}`,
      invoiceNumber: row.invoiceNumber,
      invoiceDate: row.invoiceDate,
      partyName: row.partyName,
      partyAvatar: this.avatar(row.partyName),
      poNumber: row.poNumber,
      taxableAmount: row.taxableAmount,
      gstAmount: row.gstAmount,
      tdsAmount: row.tdsAmount,
      invoiceAmount: row.invoiceAmount,
      settledAmount: row.settledAmount,
      outstandingAmount: row.outstandingAmount,
      status: this.settlement(row.outstandingAmount, row.settledAmount),
      isGstHold: row.isGstHold,
      partyTags: row.partyTags,
    }));
    const sum = (key: keyof IProfitabilityInvoiceTotals): number =>
      rows.reduce((total, row) => total + row[key], 0);
    return {
      rows,
      totals: {
        taxableAmount: sum('taxableAmount'),
        gstAmount: sum('gstAmount'),
        tdsAmount: sum('tdsAmount'),
        invoiceAmount: sum('invoiceAmount'),
        settledAmount: sum('settledAmount'),
        outstandingAmount: sum('outstandingAmount'),
      },
    };
  }

  private invoiceStats(
    totals: IProfitabilityInvoiceTotals,
    settledLabel: string,
    outstandingLabel: string
  ): IProfitabilityDetailStat[] {
    return [
      {
        label: 'Taxable value',
        value: totals.taxableAmount,
        kind: 'money',
        tone: 'main',
        hint: 'Counted in P&L',
      },
      {
        label: 'GST',
        value: totals.gstAmount,
        kind: 'money',
        hint: 'Kept out of P&L',
      },
      {
        label: 'TDS',
        value: totals.tdsAmount,
        kind: 'money',
        hint: 'Goes to the government',
      },
      {
        label: settledLabel,
        value: totals.settledAmount,
        kind: 'money',
        tone: 'good',
      },
      {
        label: outstandingLabel,
        value: totals.outstandingAmount,
        kind: 'money',
        tone: totals.outstandingAmount > 0 ? 'bad' : 'good',
      },
    ];
  }

  private settlement(outstanding: number, settled: number): TInvoiceSettlement {
    if (outstanding <= 0.5) {
      return 'settled';
    }
    return settled > 0 ? 'partial' : 'open';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Colour per key, by size: the largest gets the first palette colour. */
  private rankColors(
    items: { key: string; amount: number }[]
  ): Map<string, string> {
    const totals = new Map<string, number>();
    for (const item of items) {
      totals.set(item.key, (totals.get(item.key) ?? 0) + item.amount);
    }
    const colors = new Map<string, string>();
    [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([key], index) =>
        colors.set(key, PALETTE[index] ?? OTHERS_COLOR)
      );
    return colors;
  }

  private colorByRank(
    rows: IProfitabilityShareRow[]
  ): IProfitabilityShareRow[] {
    return rows.map((row, index) => ({
      ...row,
      color: PALETTE[index] ?? OTHERS_COLOR,
    }));
  }

  private withShares(
    parts: IProfitabilityPart[],
    total: number
  ): IProfitabilityPart[] {
    return parts
      .map(part => ({ ...part, share: this.share(part.amount, total) }))
      .sort((a, b) => b.amount - a.amount);
  }

  private share(part: number, whole: number): number {
    return whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;
  }

  private avatar(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }

  /** Configured label, tidied: "fooding_employee" → "Fooding employee". */
  private categoryLabel(value: string): string {
    const label = String(
      getMappedValueFromArrayOfObjects(
        this.appConfigurationService.expenseCategories(),
        value
      )
    ).replace(/_/g, ' ');
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private money(value: number): string {
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  }
}
