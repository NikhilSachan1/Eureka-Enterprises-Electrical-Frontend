import { EDataType } from '../common/data-types.type';

export interface IMetric {
  label: string;
  value: string | number;
  subtitle?: string; // Optional subtitle text shown below the value
  icon?: string;
  type?: EDataType;
  format?: string;
  permission?: string[];
}
