import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { InputFieldConfigService } from './input-field-config.service';
import { IFormConfig, IInputFieldsConfig } from '../models/input-fields-config.model';
import { IEnhancedForm } from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private readonly fb = inject(FormBuilder);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);

  createForm(formConfig: IFormConfig, defaultValues?: Record<string, any>): IEnhancedForm {
    const fieldConfigs = this.inputFieldConfigService.initializeFieldConfigs(formConfig);
    const formGroup = this.createReactiveFormGroup(fieldConfigs, defaultValues);
    
    return this.createEnhancedForm(formGroup, fieldConfigs);
  }
  
  validateAndMarkTouched(formGroup: FormGroup): boolean {
    if (formGroup.valid) {
      return true;
    }
    
    formGroup.markAllAsTouched();
    return false;
  }

  private createReactiveFormGroup(
    fieldConfigs: Record<string, IInputFieldsConfig>,
    defaultValues?: Record<string, any>
  ): FormGroup {
    const formControls: Record<string, any> = {};
    
    Object.keys(fieldConfigs).forEach(key => {
      const config = fieldConfigs[key];
      const defaultValue = defaultValues?.[key] ?? config.defaultValue ?? null;
      formControls[key] = [defaultValue, config.validators || []];
    });
    
    return this.fb.group(formControls);
  }

  private createEnhancedForm(formGroup: FormGroup, fieldConfigs: Record<string, IInputFieldsConfig>): IEnhancedForm {
    return {
      formGroup,
      fieldConfigs,
      
      isValid: () => formGroup.valid, // true if all fields are valid, no errors.
      isInvalid: () => formGroup.invalid, // true if any field has an error.
      isDirty: () => formGroup.dirty, // true if any field has been modified.
      isTouched: () => formGroup.touched, // true even if they didn't type anything.
      isReady: () => formGroup.valid && !formGroup.pending, // Is the form good to go? (Valid & no background checks running)
      markTouched: () => formGroup.markAllAsTouched(), // Force the form to act like the user touched everything.
      reset: (value?: any) => formGroup.reset(value),
      disable: () => formGroup.disable(),
      enable: () => formGroup.enable(),
      patch: (value: any) => formGroup.patchValue(value), // Update only some fields in the form.
      setValue: (value: any) => formGroup.setValue(value), // Update all fields in the form.
      updateValidation: () => formGroup.updateValueAndValidity(), // Force validation to run again.
      validateAndMarkTouched: () => this.validateAndMarkTouched(formGroup), // Validate and mark touched in one method
      getData: () => formGroup.value, // Get form data (enabled controls only)
      getRawData: () => formGroup.getRawValue() // Get raw form data (includes disabled controls)
    };
  }
}
