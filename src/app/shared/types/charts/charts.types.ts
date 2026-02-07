export type ChartColor = string | CanvasGradient | CanvasPattern;

/**
 * Chart Type Enum
 */
export enum EChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
}

/**
 * Chart Legend Position Enum
 */
export enum EChartLegendPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Chart Legend Align Enum
 */
export enum EChartLegendAlign {
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

/**
 * Chart Tooltip Mode Enum
 */
export enum EChartTooltipMode {
  NEAREST = 'nearest',
  INDEX = 'index',
  POINT = 'point',
  DATASET = 'dataset',
  X = 'x',
  Y = 'y',
}
