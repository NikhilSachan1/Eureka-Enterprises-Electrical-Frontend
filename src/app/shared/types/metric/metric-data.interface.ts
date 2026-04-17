import { EDataType } from '../common/data-types.type';
import { IKnobConfig } from '../knob/knob.interface';

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
}

/** `kpi` = one centered figure, no panel header / list rows (same grid cell as other panels). */
export type IMetricGroupLayout = 'default' | 'kpi';

// Group of metrics with header
export interface IMetricGroup {
  id: string;
  title: string;
  icon?: string;
  metrics: IMetric[];
  permission?: string[];
  layout?: IMetricGroupLayout;
}
