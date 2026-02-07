import {
  ChartColor,
  EChartType,
  EChartLegendAlign,
  EChartLegendPosition,
  EChartTooltipMode,
} from './charts.types';

export interface IChartGlobalOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;

  showLegend: boolean;
  legendPosition: EChartLegendPosition;
  legendAlign: EChartLegendAlign;

  showTitle: boolean;
  title: string;

  enableTooltip: boolean;
  tooltipMode: EChartTooltipMode;

  enableAnimation: boolean;
  animationDuration: number;
  animationEasing:
    | 'linear'
    | 'easeInQuad'
    | 'easeOutQuad'
    | 'easeInOutQuad'
    | 'easeInCubic'
    | 'easeOutCubic'
    | 'easeInOutCubic'
    | 'easeInQuart'
    | 'easeOutQuart'
    | 'easeInOutQuart';
}

export interface IBarChartDataset {
  label: string;
  data: (number | null)[];

  backgroundColor?: ChartColor | ChartColor[];
  borderColor?: ChartColor | ChartColor[];
  borderWidth?: number;
  borderRadius?: number;

  hoverBackgroundColor?: ChartColor | ChartColor[];
  hoverBorderColor?: ChartColor | ChartColor[];
  hoverBorderWidth?: number;

  barPercentage?: number;
  categoryPercentage?: number;
}

/**
 * Chart Options Configuration
 */
export interface IBarChartOptions extends IChartGlobalOptions {
  beginAtZero: boolean;

  showXGrid: boolean;
  showYGrid: boolean;

  YAxisTicksLimit: number;
}

/**
 * Doughnut/Pie Chart Dataset Configuration
 */
export interface IDoughnutChartDataset {
  label: string;
  data: (number | null)[];

  backgroundColor?: ChartColor[];

  borderColor?: ChartColor[];
  borderWidth?: number;
  borderAlign?: 'center' | 'inner';
  borderJoinStyle?: 'bevel' | 'round' | 'miter';

  hoverBackgroundColor?: ChartColor[];
  hoverBorderColor?: ChartColor[];
  hoverBorderJoinStyle?: 'bevel' | 'round' | 'miter';
  hoverBorderWidth?: number;

  hoverOffset?: number;
  offset?: number;
  spacing?: number;
  weight?: number;
}

/**
 * Doughnut/Pie Chart Options Configuration
 */
export interface IDoughnutChartOptions extends IChartGlobalOptions {
  cutout: string | number;
  radius: string | number;

  rotation?: number;
  circumference?: number;
}

export interface IChartsConfig {
  chartType: EChartType;
  chartTitle?: string;
  labels: string[];
  datasets: IBarChartDataset[] | IDoughnutChartDataset[];
  options?: Partial<IBarChartOptions | IDoughnutChartOptions>;
}
