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
import { ICONS } from '@shared/constants';

@Component({
  selector: 'app-project-chart-dashboard',
  imports: [Card, ChartsComponent],
  templateUrl: './project-chart-dashboard.component.html',
  styleUrl: './project-chart-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectChartDashboardComponent {
  protected readonly ICONS = ICONS;
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
}
