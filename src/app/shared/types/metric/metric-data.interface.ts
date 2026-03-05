import { EDataType } from '../common/data-types.type';
import { IKnobConfig } from '../knob/knob.interface';
import { IProgressBarConfig } from '../progress-bar/progress-bar.interface';

export interface IMetric {
  label: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: string;
  type?: EDataType;
  format?: string;
  permission?: string[];
  metricType?: EDataType;
  knobConfig?: Partial<IKnobConfig>;
  progressBarConfig?: Partial<IProgressBarConfig>;
}

// Group of metrics with header
export interface IMetricGroup {
  id: string;
  title: string;
  icon?: string;
  metrics: IMetric[];
  permission?: string[];
}
