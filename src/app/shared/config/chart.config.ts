import {
  IBarChartOptions,
  IBarChartDataset,
  IDoughnutChartOptions,
  IDoughnutChartDataset,
  EChartLegendPosition,
  EChartLegendAlign,
  EChartTooltipMode,
} from '@shared/types';

export const DEFAULT_BAR_CHART_OPTIONS: Partial<IBarChartOptions> = {
  responsive: true,
  maintainAspectRatio: true,
  showLegend: true,
  legendPosition: EChartLegendPosition.TOP,
  legendAlign: EChartLegendAlign.END,
  showTitle: true,
  enableTooltip: true,
  tooltipMode: EChartTooltipMode.INDEX,
  enableAnimation: true,
  animationDuration: 1000,
  animationEasing: 'easeInOutQuart',
  beginAtZero: true,
  showXGrid: true,
  showYGrid: true,
  YAxisTicksLimit: 10,
};

export const DEFAULT_BAR_CHART_DATASET: Partial<IBarChartDataset> = {
  borderWidth: 2,
  borderRadius: 8,
  hoverBorderWidth: 3,
  barPercentage: 0.6,
  categoryPercentage: 0.6,
};

/**
 * Doughnut Chart Default Options
 */
export const DEFAULT_DOUGHNUT_CHART_OPTIONS: Partial<IDoughnutChartOptions> = {
  responsive: true,
  maintainAspectRatio: true,
  showLegend: true,
  legendPosition: EChartLegendPosition.TOP,
  legendAlign: EChartLegendAlign.END,
  showTitle: true,
  enableTooltip: true,
  tooltipMode: EChartTooltipMode.POINT,
  enableAnimation: true,
  animationDuration: 1500,
  animationEasing: 'easeInOutCubic',
  cutout: '50%',
  radius: '100%',
  rotation: 0,
  circumference: 360,
};

/**
 * Doughnut Chart Default Dataset
 * Enhanced with smooth hover effects
 */
export const DEFAULT_DOUGHNUT_DATASET: Partial<IDoughnutChartDataset> = {
  borderWidth: 2,
  borderAlign: 'center',
  spacing: 5,
  hoverBorderWidth: 4,
  hoverOffset: 15,
  offset: 0,
};
