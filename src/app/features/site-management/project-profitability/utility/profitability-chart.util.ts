import {
  EChartType,
  IChartsConfig,
  IDoughnutChartOptions,
} from '@shared/types';

export interface IDonutSegment {
  label: string;
  amount: number;
  color: string;
}

/**
 * Doughnut for the shared chart component. The page draws its own legend and centre label, so
 * the chart shows only the ring and its tooltips. Null when there is nothing to draw.
 */
export function buildDonutChart(
  segments: IDonutSegment[],
  options: { cutout?: string; title?: string } = {}
): IChartsConfig | null {
  const drawn = segments.filter(segment => segment.amount > 0);
  if (!drawn.length) {
    return null;
  }

  const chartOptions: Partial<IDoughnutChartOptions> = {
    responsive: true,
    maintainAspectRatio: false,
    showLegend: false,
    enableTooltip: true,
    animationDuration: 600,
    cutout: options.cutout ?? '72%',
    radius: '92%',
  };

  return {
    chartType: EChartType.DOUGHNUT,
    labels: drawn.map(segment => segment.label),
    datasets: [
      {
        label: options.title ?? '',
        data: drawn.map(segment => Math.round(segment.amount)),
        backgroundColor: drawn.map(segment => segment.color),
        hoverBackgroundColor: drawn.map(segment => segment.color),
        borderWidth: 0,
        spacing: drawn.length > 1 ? 2 : 0,
        hoverOffset: 6,
      },
    ],
    options: chartOptions,
  };
}

/** ₹18.9K, ₹1.04L, ₹2.30Cr — short enough for the centre of a ring. */
export function compactInr(value: number): string {
  const sign = value < 0 ? '−' : '';
  const abs = Math.abs(value);
  if (abs >= 1e7) {
    return `${sign}₹${(abs / 1e7).toFixed(2)}Cr`;
  }
  if (abs >= 1e5) {
    return `${sign}₹${(abs / 1e5).toFixed(2)}L`;
  }
  if (abs >= 1e3) {
    return `${sign}₹${(abs / 1e3).toFixed(1)}K`;
  }
  return `${sign}₹${Math.round(abs)}`;
}
