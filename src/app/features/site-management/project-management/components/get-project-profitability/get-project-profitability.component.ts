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
import { IProjectProfitabilityGetResponseDto } from '../../types/project.dto';
import { finalize } from 'rxjs';

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

  protected readonly revenueData = signal<
    IProjectProfitabilityGetResponseDto['revenue']
  >({} as IProjectProfitabilityGetResponseDto['revenue']);

  protected readonly expenses = signal<
    IProjectProfitabilityGetResponseDto['expenses']['byCategory']
  >([]);
  protected readonly totalExpenses = signal(0);

  protected readonly profitability = signal<
    IProjectProfitabilityGetResponseDto['profitability']
  >({} as IProjectProfitabilityGetResponseDto['profitability']);

  protected readonly healthScore = signal(0);

  protected readonly healthScoreConfig = computed(() =>
    this.getHealthScoreConfig()
  );

  protected readonly expenseDistributionChartConfig = computed(() =>
    this.getExpenseDistributionChartConfig()
  );

  protected readonly revenueExpenseChartConfig = computed(() =>
    this.getRevenueExpenseChartConfig()
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

  private loadProfitability(projectId: string): void {
    this.projectService
      .getProjectProfitability(projectId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectProfitabilityGetResponseDto) => {
          this.mapApiResponse(response);
        },
        error: () => {
          this.error.set('Failed to load profitability data');
        },
      });
  }

  private mapApiResponse(res: IProjectProfitabilityGetResponseDto): void {
    this.revenueData.set({
      ...res.revenue,
      collectedAmount: res.revenue.collectedAmount ?? 0,
      pendingCollection: res.revenue.pendingCollection ?? 0,
      collectionRate: res.revenue.collectionRate ?? 0,
    });

    const expenseItems = (res.expenses.byCategory ?? []).map(item => ({
      label: item.label ?? item.name ?? item.category ?? 'Other',
      amount: item.amount,
    }));
    this.expenses.set(expenseItems);
    this.totalExpenses.set(res.expenses.total);

    this.profitability.set({
      grossProfit: res.profitability.grossProfit,
      profitMarginPercent: res.profitability.profitMarginPercent,
      revenuePerDay: res.profitability.revenuePerDay ?? 0,
      expensePerDay: res.profitability.expensePerDay ?? 0,
      profitPerDay: res.profitability.profitPerDay ?? 0,
    });

    this.healthScore.set(
      Math.min(100, Math.max(0, res.profitability.profitMarginPercent))
    );
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
}
