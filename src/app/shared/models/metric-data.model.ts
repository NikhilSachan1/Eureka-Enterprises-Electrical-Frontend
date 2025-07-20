export interface IMetricData {
  title: string;
  subtitle: string;
  iconClass: string;
  iconBgClass: string;
  metrics: IMetric[];
}

export interface IMetric {
  label: string;
  value: number;
}
