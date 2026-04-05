import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { Card } from 'primeng/card';
import type { IDashboardProjectMetrics } from '@features/dashboard/types/dashboard.interface';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import { EChartType, IChartsConfig } from '@shared/types';

@Component({
  selector: 'app-project-chart-dashboard',
  imports: [Card, ChartsComponent],
  templateUrl: './project-chart-dashboard.component.html',
  styleUrl: './project-chart-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectChartDashboardComponent {
  protected readonly metrics = signal<IDashboardProjectMetrics | null>(null);

  protected readonly barChartConfig = computed<IChartsConfig | null>(() => {
    const m = this.metrics();
    if (!m?.activeProjects.length) {
      return null;
    }
    const toLakh = (rupees: number): number =>
      Math.round((rupees / 100000) * 10) / 10;
    return {
      chartType: EChartType.BAR,
      labels: m.activeProjects.map(p => p.shortLabel),
      datasets: [
        {
          label: 'Contract',
          data: m.activeProjects.map(p => toLakh(p.contractValue)),
          backgroundColor: 'rgba(37, 99, 235, 0.65)',
          borderColor: 'rgb(37, 99, 235)',
        },
        {
          label: 'Spend',
          data: m.activeProjects.map(p => toLakh(p.expenseToDate)),
          backgroundColor: 'rgba(245, 158, 11, 0.65)',
          borderColor: 'rgb(217, 119, 6)',
        },
        {
          label: 'Net P&L',
          data: m.activeProjects.map(p => toLakh(p.netPosition)),
          backgroundColor: m.activeProjects.map(p =>
            p.netPosition >= 0
              ? 'rgba(22, 163, 74, 0.7)'
              : 'rgba(220, 38, 38, 0.7)'
          ),
          borderColor: m.activeProjects.map(p =>
            p.netPosition >= 0 ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)'
          ),
        },
      ],
      options: {
        maintainAspectRatio: false,
        beginAtZero: true,
      },
    };
  });

  constructor() {
    this.metrics.set(this.buildProjectMock());
  }

  private buildProjectMock(): IDashboardProjectMetrics {
    const activeProjects = [
      {
        name: 'Mumbai Metro — traction substation package',
        code: 'PRJ-2401',
        shortLabel: 'MMX Sub',
        contractValue: 4_20_00_000,
        expenseToDate: 2_98_00_000,
        netPosition: 38_50_000,
        progressPercent: 72,
      },
      {
        name: 'Pune IT park — HT cabling & panels',
        code: 'PRJ-2388',
        shortLabel: 'Pune HT',
        contractValue: 1_85_00_000,
        expenseToDate: 1_62_00_000,
        netPosition: -8_20_000,
        progressPercent: 54,
      },
      {
        name: 'Goa resort — DG & UPS rollout',
        shortLabel: 'Goa DG',
        contractValue: 92_00_000,
        expenseToDate: 61_00_000,
        netPosition: 14_20_000,
        progressPercent: 48,
      },
      {
        name: 'Nashik warehouse — solar + LT network',
        code: 'PRJ-2412',
        shortLabel: 'NSK Solar',
        contractValue: 2_40_00_000,
        expenseToDate: 1_05_00_000,
        netPosition: 52_00_000,
        progressPercent: 33,
      },
      {
        name: 'Thane hospital — fire pump electrical',
        shortLabel: 'THN Fire',
        contractValue: 64_00_000,
        expenseToDate: 58_00_000,
        netPosition: -2_10_000,
        progressPercent: 88,
      },
    ] as const;

    const activeContractTotal = activeProjects.reduce(
      (s, p) => s + p.contractValue,
      0
    );
    const activeExpenseTotal = activeProjects.reduce(
      (s, p) => s + p.expenseToDate,
      0
    );
    const activeNetTotal = activeProjects.reduce(
      (s, p) => s + p.netPosition,
      0
    );

    return {
      total: 24,
      active: activeProjects.length,
      upcoming: 4,
      completed: 14,
      onHold: 1,
      activeContractTotal,
      activeExpenseTotal,
      activeNetTotal,
      activeProjects,
    };
  }
}
