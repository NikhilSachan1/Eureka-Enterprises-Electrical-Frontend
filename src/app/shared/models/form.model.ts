import { FormGroup } from "@angular/forms";
import { IInputFieldsConfig } from "./input-fields-config.model";

export interface IEnhancedForm {
    formGroup: FormGroup;
    fieldConfigs: Record<string, IInputFieldsConfig>;

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
}