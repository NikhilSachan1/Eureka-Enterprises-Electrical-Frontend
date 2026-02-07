import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import {
  EChartType,
  EProgressBarMode,
  IChartsConfig,
  IKnobConfig,
  IProgressBarConfig,
  ITimelineConfig,
} from '@shared/types';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { KnobComponent } from '@shared/components/knob/knob.component';
import { TimelineComponent } from '@shared/components/timeline/timeline.component';

@Component({
  selector: 'app-get-project-analysis',
  imports: [
    ChartsComponent,
    ProgressBarComponent,
    KnobComponent,
    TimelineComponent,
  ],
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

  protected timelineConfig: Partial<ITimelineConfig> = {
    value: [
      { status: 'Started', date: '15/10/2024 10:30' },
      { status: 'In Progress', date: '15/10/2024 14:00' },
      { status: 'Completed', date: '16/10/2024 10:00' },
    ],
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
