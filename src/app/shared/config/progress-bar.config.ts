import { IProgressBarConfig, EProgressBarMode } from '@shared/types';

/**
 * Default Progress Bar Configuration
 */
export const DEFAULT_PROGRESS_BAR_CONFIG: Partial<IProgressBarConfig> = {
  mode: EProgressBarMode.DETERMINATE,
  showValue: true,
  unit: '%',
  value: 0,
};
