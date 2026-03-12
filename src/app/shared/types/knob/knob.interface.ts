export interface IKnobConfig {
  value: number;
  min: number;
  max: number;
  step: number;
  readonly: boolean;
  disabled: boolean;
  showValue: boolean;
  strokeWidth: number;
  valueTemplate?: string;
  size?: number;
}
