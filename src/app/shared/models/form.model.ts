import { FormGroup } from '@angular/forms';
import { IInputFieldsConfig } from '@shared/models/input-fields-config.model';
import { IButtonConfig } from '@shared/models/button.model';

export type IFormInputFieldsConfig = Record<
  string,
  Partial<IInputFieldsConfig>
>;

export type IFormButtonConfig = Record<string, Partial<IButtonConfig>>;

export interface IFormConfig {
  fields: IFormInputFieldsConfig;
  buttons?: IFormButtonConfig;
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
