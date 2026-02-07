import { EDataType } from '../common/data-types.type';
import { IKnobConfig } from '../knob/knob.interface';
import { IProgressBarConfig } from '../progress-bar/progress-bar.interface';

export interface IMetric {
  label: string;
  value: string | number;
  subtitle?: string; // Optional subtitle text shown below the value
  description?: string; // Footer description
  icon?: string;
  type?: EDataType;
  format?: string;
  permission?: string[];
  metricType?: EDataType;
  knobConfig?: Partial<IKnobConfig>;
  progressBarConfig?: Partial<IProgressBarConfig>;
}
