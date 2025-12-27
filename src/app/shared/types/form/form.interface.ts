import type { FormGroup } from '@angular/forms';
import type { Signal } from '@angular/core';
import { IInputFieldsConfig } from '@shared/types/form/input-fields-config.interface';
import { IButtonConfig } from '@shared/types/button/button.interface';

export type IFormInputFieldsConfig = Record<
  string,
  Partial<IInputFieldsConfig>
>;

export type IFormButtonConfig = Record<string, Partial<IButtonConfig>>;

export interface IFormConfig {
  fields: IFormInputFieldsConfig;
  buttons?: IFormButtonConfig;
}

export interface IMultiStepFormConfig {
  fields: Record<string, IFormInputFieldsConfig>;
  buttons?: IFormButtonConfig;
}

export interface IEnhancedMultiStepForm {
  forms: Record<string, IEnhancedForm>;
  buttonConfigs: Record<string, Partial<IButtonConfig>>;
  isValid(): boolean;
  isInvalid(): boolean;
  isDirty(): boolean;
  isTouched(): boolean;
  markTouched(): void;
  reset(value?: Record<string, Record<string, unknown>>): void;
  disable(): void;
  enable(): void;
  validateAndMarkTouched(): boolean;
  getData(): Record<string, unknown>;
  getRawData(): Record<string, unknown>;
}

export interface IEnhancedForm {
  formGroup: FormGroup;
  fieldConfigs: Record<string, IInputFieldsConfig>;
  buttonConfigs: Record<string, Partial<IButtonConfig>>;
  isValid(): boolean;
  isInvalid(): boolean;
  isDirty(): boolean;
  isTouched(): boolean;
  isReady(): boolean;
  markTouched(): void;
  reset(value?: Record<string, unknown>): void;
  disable(): void;
  enable(): void;
  patch(value: Record<string, unknown>): void;
  setValue(value: Record<string, unknown>): void;
  updateValidation(): void;
  validateAndMarkTouched(): boolean;
  getData(): Record<string, unknown>;
  getRawData(): Record<string, unknown>;
  getFieldData(fieldName: string): unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ITrackedFields<T extends string> = Record<T, Signal<any>> & {
  getValues(): Record<T, unknown>;
};

export interface ITrackedForm {
  isValid: Signal<boolean>;
  isInvalid: Signal<boolean>;
  isDirty: Signal<boolean>;
  isTouched: Signal<boolean>;
  status: Signal<string>;
}
