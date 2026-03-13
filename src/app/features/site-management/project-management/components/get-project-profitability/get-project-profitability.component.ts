import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import {
  EChartType,
  IChartsConfig,
  IProgressBarConfig,
  EProgressBarMode,
} from '@shared/types';
import { ProjectService } from '../../services/project.service';
import { APP_CONFIG } from '@core/config';
import type {
  IProjectDetailGetResponseDto,
  IProjectProfitabilityGetResponseDto,
} from '../../types/project.dto';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { transformDateFormat } from '@shared/utility';

@Component({
  selector: 'app-get-project-profitability',
  imports: [CommonModule, CurrencyPipe, ChartsComponent, ProgressBarComponent],
  templateUrl: './get-project-profitability.component.html',
  styleUrl: './get-project-profitability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectProfitabilityComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currencyFormat = APP_CONFIG.CURRENCY_CONFIG.DEFAULT;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly projectDetail =
    signal<IProjectDetailGetResponseDto | null>(null);

  protected readonly revenueData = signal<
    IProjectProfitabilityGetResponseDto['revenue']
  >({} as IProjectProfitabilityGetResponseDto['revenue']);

  protected readonly expenses = signal<
    { label: string; amount: number; percentage?: number }[]
  >([]);
  protected readonly totalExpenses = signal(0);
  protected readonly contractorExpenses = signal(0);
  protected readonly employeeExpenses = signal(0);
  protected readonly fuelExpenses = signal(0);
  protected readonly payrollCosts = signal(0);

  protected readonly profitability = signal<
    IProjectProfitabilityGetResponseDto['profitability']
  >({} as IProjectProfitabilityGetResponseDto['profitability']);

  protected readonly documentSummary = signal<
    NonNullable<IProjectProfitabilityGetResponseDto['documentSummary']>
  >({ totalDocuments: 0, byType: [], byStatus: [] });

  protected readonly monthlyTrend = signal<
    NonNullable<IProjectProfitabilityGetResponseDto['monthlyTrend']>
  >([]);

  protected readonly healthScore = signal(0);
  protected readonly healthGrade = signal<string>('');

  protected readonly healthScoreConfig = computed(() =>
    this.getHealthScoreConfig()
  );

  protected readonly expenseDistributionChartConfig = computed(() =>
    this.getExpenseDistributionChartConfig()
  );

  protected readonly revenueExpenseChartConfig = computed(() =>
    this.getRevenueExpenseChartConfig()
  );

  protected readonly monthlyTrendChartConfig = computed(() =>
    this.getMonthlyTrendChartConfig()
  );

  ngOnInit(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;

    if (!projectId) {
      this.loading.set(false);
      this.error.set('Project ID is missing');
      return;
    }
    this.loadProfitability(projectId);
  }

  private getStartOfMonth(): Date {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private loadProfitability(projectId: string): void {
    const startDate = transformDateFormat(this.getStartOfMonth());
    const endDate = transformDateFormat(new Date());
    const params = { startDate, endDate };

    forkJoin({
      profitability: this.projectService.getProjectProfitability(
        projectId,
        params
      ),
      projectDetail: this.projectService.getProjectDetailById({ projectId }),
      health: this.projectService
        .getSiteHealth(projectId)
        .pipe(catchError(() => of({ healthScore: 0, healthGrade: '' }))),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({
          profitability,
          projectDetail: detail,
          health,
        }: {
          profitability: IProjectProfitabilityGetResponseDto;
          projectDetail: IProjectDetailGetResponseDto;
          health: { healthScore: number; healthGrade?: string };
        }) => {
          this.mapApiResponse(profitability);
          this.projectDetail.set(detail);
          this.healthScore.set(
            Math.min(100, Math.max(0, health.healthScore ?? 0))
          );
          this.healthGrade.set(health.healthGrade ?? '');
        },
        error: () => {
          this.error.set('Failed to load profitability data');
        },
      });
  }

  private mapApiResponse(res: IProjectProfitabilityGetResponseDto): void {
    this.revenueData.set({
      ...res.revenue,
      collectedAmount: res.revenue?.collectedAmount ?? 0,
      pendingCollection: res.revenue?.pendingCollection ?? 0,
      collectionRate: res.revenue?.collectionRate ?? 0,
    });

    const breakdown = res.expenses?.breakdown ?? [];
    const byCategory = res.expenses?.byCategory ?? [];
    const expenseItems =
      breakdown.length > 0
        ? breakdown.map(item => ({
            label: item.category ?? 'Other',
            amount: item.amount,
            percentage: item.percentage,
          }))
        : byCategory.map(item => ({
            label: item.label ?? item.name ?? item.category ?? 'Other',
            amount: item.amount,
          }));

    this.expenses.set(expenseItems);
    this.totalExpenses.set(res.expenses?.total ?? 0);
    this.contractorExpenses.set(res.expenses?.contractorExpenses ?? 0);
    this.employeeExpenses.set(res.expenses?.employeeExpenses ?? 0);
    this.fuelExpenses.set(res.expenses?.fuelExpenses ?? 0);
    this.payrollCosts.set(res.expenses?.payrollCosts ?? 0);

    this.profitability.set({
      grossProfit: res.profitability?.grossProfit ?? 0,
      profitMarginPercent: res.profitability?.profitMarginPercent ?? 0,
      revenuePerDay: res.profitability?.revenuePerDay ?? 0,
      expensePerDay: res.profitability?.expensePerDay ?? 0,
      profitPerDay: res.profitability?.profitPerDay ?? 0,
    });

    this.documentSummary.set({
      totalDocuments: res.documentSummary?.totalDocuments ?? 0,
      byType: res.documentSummary?.byType ?? [],
      byStatus: res.documentSummary?.byStatus ?? [],
    });

    this.monthlyTrend.set(res.monthlyTrend ?? []);
  }

  private getHealthScoreConfig(): Partial<IProgressBarConfig> {
    return {
      value: this.healthScore(),
      showValue: false,
      mode: EProgressBarMode.DETERMINATE,
    };
  }

  private getExpenseDistributionChartConfig(): IChartsConfig | null {
    const expenseList = this.expenses();
    if (!expenseList.length) {
      return null;
    }
    const colors = [
      '#4F8EF7',
      '#9D4EDD',
      '#FFA726',
      '#26C485',
      '#EC4899',
      '#66BB6A',
      '#AB47BC',
    ];
    return {
      chartType: EChartType.DOUGHNUT,
      labels: expenseList.map(e => e.label ?? 'Other'),
      datasets: [
        {
          label: 'Expenses',
          data: expenseList.map(e => e.amount),
          backgroundColor: expenseList.map((_, i) => colors[i % colors.length]),
          borderWidth: 0,
        },
      ],
      options: {
        maintainAspectRatio: false,
        cutout: '70%',
      },
    };
  }

  private getRevenueExpenseChartConfig(): IChartsConfig | null {
    const rev = this.revenueData();
    const total = this.totalExpenses();
    const profit = this.profitability();
    const revenueAmount = rev.totalPOValue ?? rev.totalInvoiced;
    if (revenueAmount === 0 && total === 0 && profit.grossProfit === 0) {
      return null;
    }
    return {
      chartType: EChartType.BAR,
      labels: ['Revenue', 'Expenses', 'Profit'],
      datasets: [
        {
          label: 'Amount',
          data: [revenueAmount, total, profit.grossProfit],
        },
      ],
      options: {
        maintainAspectRatio: true,
      },
    };
  }

  private getMonthlyTrendChartConfig(): IChartsConfig | null {
    const trend = this.monthlyTrend();
    if (!trend.length) {
      return null;
    }
    return {
      chartType: EChartType.BAR,
      labels: trend.map(t => t.monthLabel),
      datasets: [
        {
          label: 'Revenue',
          data: trend.map(t => t.revenue),
        },
        {
          label: 'Expenses',
          data: trend.map(t => t.totalExpenses),
        },
        {
          label: 'Profit',
          data: trend.map(t => t.profit),
        },
      ],
      options: {
        maintainAspectRatio: true,
      },
    };
  }

  protected formatSiteDate(dateStr: string | undefined): string {
    if (!dateStr) {
      return '-';
    }
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
}
