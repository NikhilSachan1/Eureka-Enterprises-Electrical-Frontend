import { EFormVariant, EInputType, ENumberMode } from "../types/input.types";

export interface IInputFieldsConfig {
  name: string;
  label: string;
  placeholder?: string;
  type: EInputType;
  validation?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean;
  };
  options?: Array<{ label: string; value: any }>; // For select, radio, checkbox
  defaultValue?: any;
  disabled?: boolean;
  styleClass?: string;
  inputId?: string;
  showClear?: boolean;
  autofocus: boolean;
  fluid: boolean;
}

export interface IFormConfig {
  variant: EFormVariant;
}

export interface INumberFieldConfig extends IInputFieldsConfig {
  mode: ENumberMode;
  useGrouping: boolean;
  minFractionDigits: number;
  maxFractionDigits: number;
  min: number;
  max: number;
  locale: string;
  currency: string;
  currencyDisplay: string;
  suffix: string;
  prefix: string;
  showButtons: boolean;
  buttonLayout: string;
  spinnerMode: string;
  step: number;
}