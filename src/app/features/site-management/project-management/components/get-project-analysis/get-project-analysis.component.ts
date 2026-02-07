import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import {
  EChartType,
  EProgressBarMode,
  IChartsConfig,
  IKnobConfig,
  IProgressBarConfig,
} from '@shared/types';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { KnobComponent } from '@shared/components/knob/knob.component';

@Component({
  selector: 'app-get-project-analysis',
  imports: [ChartsComponent, ProgressBarComponent, KnobComponent],
  templateUrl: './get-project-analysis.component.html',
  styleUrl: './get-project-analysis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectAnalysisComponent {
  protected progressBarConfig: Partial<IProgressBarConfig> = {
    value: 50,
    mode: EProgressBarMode.DETERMINATE,
  };

  protected knobConfig: Partial<IKnobConfig> = {
    value: 50,
  };
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
