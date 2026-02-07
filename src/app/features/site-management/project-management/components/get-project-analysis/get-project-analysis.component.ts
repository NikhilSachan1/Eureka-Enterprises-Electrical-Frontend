import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import { EChartType, IChartsConfig } from '@shared/types';

@Component({
  selector: 'app-get-project-analysis',
  imports: [ChartsComponent],
  templateUrl: './get-project-analysis.component.html',
  styleUrl: './get-project-analysis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectAnalysisComponent {
  // Example chart configuration
  protected barChartConfig: IChartsConfig = {
    chartType: EChartType.BAR,
    chartTitle: 'Quarterly Sales Performance',
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Sales 2024',
        data: [540, 325, null, 620],
      },
      {
        label: 'Sales 2023',
        data: [450, 380, 650, 580],
      },
    ],
  };

  protected doughnutChartConfig: IChartsConfig = {
    chartType: EChartType.DOUGHNUT,
    chartTitle: 'Quarterly Sales Performance',
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Sales 2024',
        data: [540, 325, 2, 620],
      },
    ],
  };
}
