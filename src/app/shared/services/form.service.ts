import { Injectable, inject, DestroyRef, signal, Signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldConfigService } from '@shared/services';
import {
  IFormConfig,
  IInputFieldsConfig,
  IEnhancedForm,
  IFormButtonConfig,
} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private readonly fb = inject(FormBuilder);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);

  createForm(
    formConfig: IFormConfig,
    defaultValues?: Record<string, unknown> | null
  ): IEnhancedForm {
    if (!formConfig.fields || Object.keys(formConfig.fields).length === 0) {
      return {} as IEnhancedForm;
    }

    const inputFieldsConfigs =
      this.inputFieldConfigService.initializeFieldConfigs(formConfig.fields);
    const formGroup = this.createReactiveFormGroup(
      inputFieldsConfigs,
      defaultValues ?? {}
    );

    return this.createEnhancedForm(
      formGroup,
      inputFieldsConfigs,
      formConfig.buttons
    );
  }

  validateAndMarkTouched(formGroup: FormGroup): boolean {
    if (formGroup.valid) {
      return true;
    }

    formGroup.markAllAsTouched();
    return false;
  }

  getData(formGroup: FormGroup): Record<string, unknown> {
    return formGroup.value;
  }

  getRawData(formGroup: FormGroup): Record<string, unknown> {
    return formGroup.getRawValue();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trackFieldChanges<T = any>(
    formGroup: FormGroup,
    fieldName: string,
    destroyRef: DestroyRef
  ): Signal<T> {
    // Get the form control
    const control = formGroup.get(fieldName);

    // Create a writable signal with the initial value
    const fieldSignal = signal<T>(control?.value as T);

    // Subscribe to value changes and update the signal
    control?.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((value: T) => {
        fieldSignal.set(value);
      });

    // Return as readonly signal
    return fieldSignal.asReadonly();
  }

  trackMultipleFieldChanges<T extends string>(
    formGroup: FormGroup,
    fieldNames: T[],
    destroyRef: DestroyRef
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<T, Signal<any>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signals = {} as Record<T, Signal<any>>;

    fieldNames.forEach(fieldName => {
      signals[fieldName] = this.trackFieldChanges(
        formGroup,
        fieldName,
        destroyRef
      );
    });

    return signals;
  }

  private createReactiveFormGroup(
    fieldConfigs: Record<string, IInputFieldsConfig>,
    defaultValues?: Record<string, unknown>
  ): FormGroup {
    const formControls: Record<string, unknown> = {};

    Object.keys(fieldConfigs).forEach(key => {
      const config = fieldConfigs[key];
      const defaultValue = defaultValues?.[key] ?? config.defaultValue ?? null;
      formControls[key] = [defaultValue, config.validators ?? []];
    });

    return this.fb.group(formControls);
  }

  private createEnhancedForm(
    formGroup: FormGroup,
    fieldConfigs: Record<string, IInputFieldsConfig>,
    buttonConfigs: IFormButtonConfig = {}
  ): IEnhancedForm {
    return {
      formGroup,
      fieldConfigs,
      buttonConfigs,
      isValid: () => formGroup.valid, // true if all fields are valid, no errors.
      isInvalid: () => formGroup.invalid, // true if any field has an error.
      isDirty: () => formGroup.dirty, // true if any field has been modified.
      isTouched: () => formGroup.touched, // true even if they didn't type anything.
      isReady: () => formGroup.valid && !formGroup.pending, // Is the form good to go? (Valid & no background checks running)
      markTouched: () => formGroup.markAllAsTouched(), // Force the form to act like the user touched everything.
      reset: (value?: Record<string, unknown>) => formGroup.reset(value),
      disable: () => formGroup.disable(),
      enable: () => formGroup.enable(),
      patch: (value: Record<string, unknown>) => formGroup.patchValue(value), // Update only some fields in the form.
      setValue: (value: Record<string, unknown>) => formGroup.setValue(value), // Update all fields in the form.
      updateValidation: () => formGroup.updateValueAndValidity(), // Force validation to run again.
      validateAndMarkTouched: () => this.validateAndMarkTouched(formGroup), // Validate and mark touched in one method
      getData: () => formGroup.value, // Get form data (enabled controls only)
      getRawData: () => formGroup.getRawValue(), // Get raw form data (includes disabled controls)
      getFieldData: (fieldName: string) => formGroup.get(fieldName)?.value, // Get data for a specific field
    };
  }
}
