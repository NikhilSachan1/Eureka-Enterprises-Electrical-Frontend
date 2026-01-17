import type { FormGroup } from '@angular/forms';
import type { Signal } from '@angular/core';
import { IInputFieldsConfig } from '@shared/types/form/input-fields-config.interface';
import { IButtonConfig } from '@shared/types/button/button.interface';

export type FormDataConstraint = Record<string, unknown> | object;
export type DefaultFormData = Record<string, unknown>;
export type MultiStepFormDataConstraint = Record<string, FormDataConstraint>;
export type DefaultMultiStepFormData = Record<string, Record<string, unknown>>;

export type IFormInputFieldsConfig<T extends FormDataConstraint> = {
  [K in keyof T]: Partial<IInputFieldsConfig>;
};

export type IFormButtonConfig = Record<string, Partial<IButtonConfig>>;

export interface IFormConfig<T extends FormDataConstraint> {
  fields: IFormInputFieldsConfig<T>;
  buttons?: IFormButtonConfig;
}

export interface IMultiStepFormConfig<
  TFlattened extends FormDataConstraint = FormDataConstraint,
> {
  fields: Record<string, IFormInputFieldsConfig<Partial<TFlattened>>>;
  buttons?: IFormButtonConfig;
}

export type FormWithRequiredFieldConfigs<T extends FormDataConstraint> = Omit<
  IEnhancedForm<T>,
  'fieldConfigs'
> & {
  fieldConfigs: { [K in keyof Required<T>]: IInputFieldsConfig };
};

export type MultiStepFormsRecord<
  TFlattened extends FormDataConstraint = FormDataConstraint,
> = Record<string, FormWithRequiredFieldConfigs<Partial<TFlattened>>>;

export interface IEnhancedMultiStepForm<TFlattened extends FormDataConstraint> {
  forms: MultiStepFormsRecord<TFlattened>;
  buttonConfigs: Record<string, Partial<IButtonConfig>>;
  isValid(): boolean;
  isInvalid(): boolean;
  isDirty(): boolean;
  isTouched(): boolean;
  markTouched(): void;
  reset(value?: Partial<Record<string, Partial<TFlattened>>>): void;
  disable(): void;
  enable(): void;
  patch(value?: Partial<Record<string, Partial<TFlattened>>>): void;
  setValue(value: Record<string, Partial<TFlattened>>): void;
  validateAndMarkTouched(): boolean;
  getData(): TFlattened;
  getRawData(): TFlattened;
}

export interface IEnhancedForm<T extends FormDataConstraint> {
  formGroup: FormGroup;
  fieldConfigs: { [K in keyof T]: IInputFieldsConfig };
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

export type ITrackedFields<TFormData extends FormDataConstraint> = Partial<
  Record<keyof TFormData & string, Signal<unknown>>
> & {
  getValues(): Partial<Pick<TFormData, keyof TFormData & string>>;
};

export interface ITrackedForm {
  isValid: Signal<boolean>;
  isInvalid: Signal<boolean>;
  isDirty: Signal<boolean>;
  isTouched: Signal<boolean>;
  status: Signal<string>;
}
