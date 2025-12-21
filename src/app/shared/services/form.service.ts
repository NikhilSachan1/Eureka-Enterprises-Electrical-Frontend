import { Injectable, inject, DestroyRef, signal, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldConfigService } from '@shared/services';
import {
  IFormConfig,
  IInputFieldsConfig,
  IEnhancedForm,
  IFormButtonConfig,
  IMultiStepFormConfig,
  IEnhancedMultiStepForm,
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
    if (!formConfig?.fields || Object.keys(formConfig.fields).length === 0) {
      return {} as IEnhancedForm;
    }

    const inputFieldsConfigs =
      this.inputFieldConfigService.initializeFieldConfigs(formConfig.fields);
    const formGroup = this.createReactiveFormGroup(
      inputFieldsConfigs,
      defaultValues ?? {}
    );

    this.applyConditionalValidators(formGroup, inputFieldsConfigs);

    return this.createEnhancedForm(
      formGroup,
      inputFieldsConfigs,
      formConfig.buttons
    );
  }

  createMultiStepForm(
    multiStepFormConfig: IMultiStepFormConfig,
    defaultValues?: Record<string, Record<string, unknown>> | null
  ): IEnhancedMultiStepForm {
    const forms: Record<string, IEnhancedForm> = {};

    if (
      !multiStepFormConfig?.fields ||
      Object.keys(multiStepFormConfig.fields).length === 0
    ) {
      return this.createEnhancedMultiStepForm(
        forms,
        multiStepFormConfig.buttons ?? {}
      );
    }

    Object.entries(multiStepFormConfig.fields).forEach(
      ([stepName, stepFields]) => {
        const stepDefaultValues = defaultValues?.[stepName] ?? {};

        const stepFormConfig: IFormConfig = {
          fields: stepFields,
        };

        forms[stepName] = this.createForm(stepFormConfig, stepDefaultValues);
      }
    );

    return this.createEnhancedMultiStepForm(
      forms,
      multiStepFormConfig.buttons ?? {}
    );
  }

  private isMultiStepFormValid(forms: Record<string, IEnhancedForm>): boolean {
    return Object.values(forms).every(form => form.isValid());
  }

  private isMultiStepFormInvalid(
    forms: Record<string, IEnhancedForm>
  ): boolean {
    return Object.values(forms).some(form => form.isInvalid());
  }

  private isMultiStepFormDirty(forms: Record<string, IEnhancedForm>): boolean {
    return Object.values(forms).some(form => form.isDirty());
  }

  private isMultiStepFormTouched(
    forms: Record<string, IEnhancedForm>
  ): boolean {
    return Object.values(forms).some(form => form.isTouched());
  }

  private markMultiStepFormTouched(forms: Record<string, IEnhancedForm>): void {
    Object.values(forms).forEach(form => form.markTouched());
  }

  private resetMultiStepForm(forms: Record<string, IEnhancedForm>): void {
    Object.values(forms).forEach(form => form.reset());
  }

  private disableMultiStepForm(forms: Record<string, IEnhancedForm>): void {
    Object.values(forms).forEach(form => form.disable());
  }

  private enableMultiStepForm(forms: Record<string, IEnhancedForm>): void {
    Object.values(forms).forEach(form => form.enable());
  }

  private validateAndMarkMultiStepFormTouched(
    forms: Record<string, IEnhancedForm>
  ): boolean {
    const validationResults = Object.values(forms).map(form =>
      form.validateAndMarkTouched()
    );
    return validationResults.every(isValid => isValid);
  }

  private getMultiStepFormData(
    forms: Record<string, IEnhancedForm>
  ): Record<string, unknown> {
    return Object.values(forms).reduce(
      (acc, form) => ({
        ...acc,
        ...form.getData(),
      }),
      {} as Record<string, unknown>
    );
  }

  private getMultiStepFormRawData(
    forms: Record<string, IEnhancedForm>
  ): Record<string, unknown> {
    return Object.values(forms).reduce(
      (acc, form) => ({
        ...acc,
        ...form.getRawData(),
      }),
      {} as Record<string, unknown>
    );
  }

  validateAndMarkTouched(formGroup: FormGroup): boolean {
    if (formGroup.valid) {
      return true;
    }

    formGroup.markAllAsTouched();

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control?.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });

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

  private applyConditionalValidators(
    formGroup: FormGroup,
    fieldConfigs: Record<string, IInputFieldsConfig>
  ): void {
    Object.entries(fieldConfigs).forEach(([fieldName, config]) => {
      // Skip fields without conditional rules.
      if (
        !config.conditionalValidators ||
        config.conditionalValidators.length === 0
      ) {
        return;
      }

      const control = formGroup.get(fieldName);

      if (!control) {
        return;
      }

      const runConditionalLogic = (): void => {
        const baseValidators: ValidatorFn[] = config.validators ?? [];
        const extraValidators: ValidatorFn[] = [];
        let shouldResetValue = false;

        config.conditionalValidators?.forEach(rule => {
          const dependencyControl = formGroup.get(rule.dependsOn);
          const currentValue = dependencyControl?.value;
          const isActive = rule.shouldApply(currentValue);

          if (isActive) {
            if (rule.validators?.length) {
              extraValidators.push(...rule.validators);
            }
          } else if (rule.resetOnFalse) {
            shouldResetValue = true;
          }
        });

        control.setValidators([...baseValidators, ...extraValidators]);
        control.updateValueAndValidity();

        if (shouldResetValue) {
          control.reset();
        }
      };

      runConditionalLogic();

      const dependencyFieldNames = Array.from(
        new Set(config.conditionalValidators.map(rule => rule.dependsOn))
      );

      // Subscribe to changes on each dependency field.
      dependencyFieldNames.forEach(dependencyName => {
        const dependencyControl = formGroup.get(dependencyName);

        if (!dependencyControl) {
          return;
        }

        dependencyControl.valueChanges.subscribe(() => {
          runConditionalLogic();
        });
      });
    });
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

  private createEnhancedMultiStepForm(
    forms: Record<string, IEnhancedForm>,
    buttonConfigs: IFormButtonConfig
  ): IEnhancedMultiStepForm {
    return {
      forms,
      buttonConfigs,
      isValid: () => this.isMultiStepFormValid(forms), // true if all forms are valid, no errors.
      isInvalid: () => this.isMultiStepFormInvalid(forms), // true if any form has an error.
      isDirty: () => this.isMultiStepFormDirty(forms), // true if any form has been modified.
      isTouched: () => this.isMultiStepFormTouched(forms), // true if any form has been touched.
      markTouched: () => this.markMultiStepFormTouched(forms), // Force all forms to act like the user touched everything.
      reset: () => this.resetMultiStepForm(forms), // Reset all forms.
      disable: () => this.disableMultiStepForm(forms), // Disable all forms.
      enable: () => this.enableMultiStepForm(forms), // Enable all forms.
      validateAndMarkTouched: () =>
        this.validateAndMarkMultiStepFormTouched(forms), // Validate and mark touched in one method for all forms
      getData: () => this.getMultiStepFormData(forms), // Get combined form data from all forms (enabled controls only)
      getRawData: () => this.getMultiStepFormRawData(forms), // Get combined raw form data from all forms (includes disabled controls)
    };
  }
}
