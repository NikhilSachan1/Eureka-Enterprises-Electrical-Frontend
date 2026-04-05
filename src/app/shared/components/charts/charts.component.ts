import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import {
  IBarChartOptions,
  IDoughnutChartOptions,
  IChartsConfig,
  EChartType,
} from '@shared/types';
import {
  DEFAULT_BAR_CHART_OPTIONS,
  DEFAULT_BAR_CHART_DATASET,
  DEFAULT_DOUGHNUT_CHART_OPTIONS,
  DEFAULT_DOUGHNUT_DATASET,
} from '@shared/config';

@Component({
  selector: 'app-charts',
  imports: [ChartModule],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsComponent {
  chartConfig = input.required<IChartsConfig>();

  protected chartData = computed(() => this.resolveByChartType('data'));
  protected chartOptions = computed(() => this.resolveByChartType('options'));

  private resolveByChartType(
    type: 'data' | 'options'
  ): Record<string, unknown> {
    const { chartType } = this.chartConfig();

    const resolverMap = {
      [EChartType.BAR]: {
        data: (): Record<string, unknown> => this.buildBarChartData(),
        options: (): Record<string, unknown> => this.buildBarChartOptions(),
      },
      [EChartType.DOUGHNUT]: {
        data: (): Record<string, unknown> => this.buildDoughnutChartData(),
        options: (): Record<string, unknown> =>
          this.buildDoughnutChartOptions(),
      },
      [EChartType.PIE]: {
        data: (): Record<string, unknown> => this.buildDoughnutChartData(),
        options: (): Record<string, unknown> =>
          this.buildDoughnutChartOptions(),
      },
    };

    return (
      resolverMap[chartType as keyof typeof resolverMap]?.[type]() ??
      resolverMap[EChartType.BAR][type]()
    );
  }

  private buildBarChartData(): Record<string, unknown> {
    const config = this.chartConfig();
    const datasets = config.datasets.map(dataset => ({
      ...DEFAULT_BAR_CHART_DATASET,
      ...dataset,
    }));

    return {
      labels: config.labels,
      datasets,
    };
  }

  private buildBarChartOptions(): Record<string, unknown> {
    const config = this.chartConfig();
    const finalOptions: Partial<IBarChartOptions> = {
      ...DEFAULT_BAR_CHART_OPTIONS,
      ...config.options,
    };

    return {
      responsive: finalOptions.responsive,
      maintainAspectRatio: finalOptions.maintainAspectRatio,
      animation: {
        duration: finalOptions.animationDuration,
        easing: finalOptions.animationEasing,
      },
      plugins: {
        title: {
          display: !!config.chartTitle,
          text: config.chartTitle,
        },
        legend: {
          display: finalOptions.showLegend,
          position: finalOptions.legendPosition,
          align: finalOptions.legendAlign,
        },
        tooltip: {
          enabled: finalOptions.enableTooltip,
          mode: finalOptions.tooltipMode,
        },
      },
      scales: {
        x: {
          grid: {
            display: finalOptions.showXGrid,
          },
        },
        y: {
          beginAtZero: finalOptions.beginAtZero,
          grid: {
            display: finalOptions.showYGrid,
          },
          ticks: {
            maxTicksLimit: finalOptions.YAxisTicksLimit,
          },
        },
      },
    };
  }

  private buildDoughnutChartData(): Record<string, unknown> {
    const config = this.chartConfig();
    const datasets = config.datasets.map(dataset => ({
      ...DEFAULT_DOUGHNUT_DATASET,
      ...dataset,
    }));

    return {
      labels: config.labels,
      datasets,
    };
  }

  private buildDoughnutChartOptions(): Record<string, unknown> {
    const config = this.chartConfig();
    const finalOptions: Partial<IDoughnutChartOptions> = {
      ...DEFAULT_DOUGHNUT_CHART_OPTIONS,
      ...config.options,
    };

    return {
      responsive: finalOptions.responsive,
      maintainAspectRatio: finalOptions.maintainAspectRatio,
      cutout: finalOptions.cutout,
      radius: finalOptions.radius,
      rotation: finalOptions.rotation,
      circumference: finalOptions.circumference,
      animation: {
        animateRotate: finalOptions.enableAnimation,
        animateScale: finalOptions.enableAnimation,
        duration: finalOptions.animationDuration,
        easing: finalOptions.animationEasing,
      },
      plugins: {
        title: {
          display: !!config.chartTitle,
          text: config.chartTitle,
        },
        legend: {
          display: finalOptions.showLegend,
          position: finalOptions.legendPosition,
          align: finalOptions.legendAlign,
        },
        tooltip: {
          enabled: finalOptions.enableTooltip,
          mode: finalOptions.tooltipMode,
        },
      },
    };
  }
}
