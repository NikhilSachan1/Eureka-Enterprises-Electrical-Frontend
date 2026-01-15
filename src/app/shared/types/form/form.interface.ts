import type { FormGroup } from '@angular/forms';
import type { Signal } from '@angular/core';
import { IInputFieldsConfig } from '@shared/types/form/input-fields-config.interface';
import { IButtonConfig } from '@shared/types/button/button.interface';

export type FormDataConstraint = Record<string, unknown> | object;
export type DefaultFormData = Record<string, unknown>;
export type MultiStepFormDataConstraint = Record<string, FormDataConstraint>;
export type DefaultMultiStepFormData = Record<string, Record<string, unknown>>;
export type MultiStepFormsRecord = Record<
  string,
  IEnhancedForm<Record<string, unknown>>
>;

export type IFormInputFieldsConfig<
  T extends FormDataConstraint = DefaultFormData,
> = {
  [K in keyof T]: Partial<IInputFieldsConfig>;
};

export type IFormButtonConfig = Record<string, Partial<IButtonConfig>>;

export interface IFormConfig<T extends FormDataConstraint = DefaultFormData> {
  fields: IFormInputFieldsConfig<T>;
  buttons?: IFormButtonConfig;
}

export interface IMultiStepFormConfig<
  T extends MultiStepFormDataConstraint = DefaultMultiStepFormData,
> {
  fields: {
    [K in keyof T]: IFormInputFieldsConfig<T[K]>;
  };
  buttons?: IFormButtonConfig;
}

export interface IEnhancedMultiStepForm<
  T extends MultiStepFormDataConstraint = DefaultMultiStepFormData,
  TFlattened extends FormDataConstraint = DefaultFormData,
> {
  forms: {
    [K in keyof T]: IEnhancedForm<T[K]>;
  };
  buttonConfigs: Record<string, Partial<IButtonConfig>>;
  isValid(): boolean;
  isInvalid(): boolean;
  isDirty(): boolean;
  isTouched(): boolean;
  markTouched(): void;
  reset(value?: Partial<T>): void;
  disable(): void;
  enable(): void;
  validateAndMarkTouched(): boolean;
  getData(): TFlattened;
  getRawData(): TFlattened;
}

export interface IEnhancedForm<T extends FormDataConstraint = DefaultFormData> {
  formGroup: FormGroup;
  fieldConfigs: Record<keyof T, IInputFieldsConfig>;
  buttonConfigs: Record<string, Partial<IButtonConfig>>;
  isValid(): boolean;
  isInvalid(): boolean;
  isDirty(): boolean;
  isTouched(): boolean;
  isReady(): boolean;
  markTouched(): void;
  reset(value?: Partial<T> | null): void;
  disable(): void;
  enable(): void;
  patch(value?: Partial<T>): void;
  setValue(value: T): void;
  updateValidation(): void;
  validateAndMarkTouched(): boolean;
  getData(): T;
  getRawData(): T;
  getFieldData<K extends keyof T>(fieldName: K): T[K];
}

export type ITrackedFields<
  TFieldNames extends keyof TFormData & string,
  TFormData extends FormDataConstraint = DefaultFormData,
> = Record<TFieldNames, Signal<unknown>> & {
  getValues(): Pick<TFormData, TFieldNames>;
};

export interface ITrackedForm {
  isValid: Signal<boolean>;
  isInvalid: Signal<boolean>;
  isDirty: Signal<boolean>;
  isTouched: Signal<boolean>;
  status: Signal<string>;
}
