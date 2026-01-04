import { EDataType } from '../common/data-types.type';

export interface IMetric {
  label: string;
  value: string | number;
  icon?: string;
  type?: EDataType;
  format?: string;
  permission?: string[];
}
