import { EProgressBarMode } from './progress-bar.types';

export interface IProgressBarConfig {
  value: number;
  showValue: boolean;
  mode: EProgressBarMode;
  unit: string;
}
