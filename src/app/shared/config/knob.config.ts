import { IKnobConfig } from '@shared/types';

export const DEFAULT_KNOB_CONFIG: Partial<IKnobConfig> = {
  min: 0,
  max: 100,
  step: 1,
  readonly: true,
  disabled: false,
  showValue: true,
  strokeWidth: 14,
};
