import { FormGroup } from "@angular/forms";
import { IInputFieldsConfig } from "./input-fields-config.model";
import { IButtonConfig } from "./button.model";

export interface IFormInputFieldsConfig {
  [key: string]: Partial<IInputFieldsConfig>;
}

export interface IFormButtonConfig {
  [key: string]: Partial<IButtonConfig>;
}

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
    reset(value?: any): void;
    disable(): void;
    enable(): void;
    patch(value: any): void;
    setValue(value: any): void;
    updateValidation(): void;
    validateAndMarkTouched(): boolean;
    getData(): Record<string, any>;
    getRawData(): Record<string, any>;
    getFieldData(fieldName: string): any;
}