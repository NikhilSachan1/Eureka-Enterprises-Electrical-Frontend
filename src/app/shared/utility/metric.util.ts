import { IMetric, IMetricGroup } from '@shared/types';

export function applyMetricValueLoading(
  metrics: IMetric[],
  loading: boolean
): IMetric[] {
  if (!loading) {
    return metrics;
  }

  return metrics.map(metric => ({
    ...metric,
    valueLoading: true,
  }));
}

export function applyGroupMetricValueLoading(
  groups: IMetricGroup[],
  loading: boolean
): IMetricGroup[] {
  if (!loading) {
    return groups;
  }

  return groups.map(group => ({
    ...group,
    metrics: applyMetricValueLoading(group.metrics, loading),
  }));
}
