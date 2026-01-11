import { Injectable, inject, DestroyRef, signal, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { InputFieldConfigService } from '@shared/services';
import {
  IFormConfig,
  IInputFieldsConfig,
  IEnhancedForm,
  IFormButtonConfig,
  IMultiStepFormConfig,
  IEnhancedMultiStepForm,
  ITrackedFields,
  ITrackedForm,
} from '@shared/types';

export interface ICreateFormOptions<
  T extends Record<string, unknown> | object = Record<string, unknown>,
> {
  destroyRef: DestroyRef;
  defaultValues?: T | null;
  context?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private readonly fb = inject(FormBuilder);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);

  createForm<
    T extends Record<string, unknown> | object = Record<string, unknown>,
  >(
    formConfig: IFormConfig<T>,
    options: ICreateFormOptions<T>
  ): IEnhancedForm<T> {
    const { destroyRef, defaultValues, context } = options;
    if (!formConfig?.fields || Object.keys(formConfig.fields).length === 0) {
      return {} as IEnhancedForm<T>;
    }

    const inputFieldsConfigs =
      this.inputFieldConfigService.initializeFieldConfigs(formConfig.fields);
    const formGroup = this.createReactiveFormGroup(
      inputFieldsConfigs,
      (defaultValues ?? {}) as Record<string, unknown>
    );

    this.applyConditionalValidators(
      formGroup,
      inputFieldsConfigs,
      destroyRef,
      context
    );

    return this.createEnhancedForm<T>(
      formGroup,
      inputFieldsConfigs,
      formConfig.buttons
    );
  }

  createMultiStepForm(
    multiStepFormConfig: IMultiStepFormConfig,
    destroyRef: DestroyRef,
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

        forms[stepName] = this.createForm(stepFormConfig, {
          destroyRef,
          defaultValues: stepDefaultValues,
        });
      }
    );

    // Apply cross-step conditional validators only if there are explicit cross-step dependencies (dependsOnStep)
    if (this.hasExplicitCrossStepDependencies(multiStepFormConfig)) {
      this.applyCrossStepConditionalValidators(
        forms,
        multiStepFormConfig,
        destroyRef
      );
    }

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

  private resetMultiStepForm(
    forms: Record<string, IEnhancedForm>,
    value?: Record<string, Record<string, unknown>>
  ): void {
    if (value) {
      Object.keys(forms).forEach(stepKey => {
        const form = forms[stepKey];
        const stepValue = value[stepKey];
        form.reset(stepValue);
      });
    } else {
      Object.values(forms).forEach(form => form.reset());
    }
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
  ): ITrackedFields<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signals = {} as Record<T, Signal<any>>;

    fieldNames.forEach(fieldName => {
      signals[fieldName] = this.trackFieldChanges(
        formGroup,
        fieldName,
        destroyRef
      );
    });

    // Create enhanced object with getValues method
    const trackedFields = {
      ...signals,
      getValues(): Record<T, unknown> {
        const values = {} as Record<T, unknown>;
        fieldNames.forEach(fieldName => {
          values[fieldName] = signals[fieldName]?.();
        });
        return values;
      },
    } as ITrackedFields<T>;

    return trackedFields;
  }

  /**
   * Tracks formGroup changes (validity, status, dirty, touched) and returns signals
   * Similar to trackMultipleFieldChanges but for entire formGroup
   * Use effect() in component to react to signal changes
   * @param formGroup - The form group to track
   * @param destroyRef - DestroyRef for automatic cleanup
   * @returns ITrackedForm with signals for form state
   */
  trackFormChanges(formGroup: FormGroup, destroyRef: DestroyRef): ITrackedForm {
    const isValidSignal = signal<boolean>(formGroup.valid);
    const isInvalidSignal = signal<boolean>(formGroup.invalid);
    const isDirtySignal = signal<boolean>(formGroup.dirty);
    const isTouchedSignal = signal<boolean>(formGroup.touched);
    const statusSignal = signal<string>(formGroup.status);

    // Track all form changes
    merge(formGroup.statusChanges, formGroup.valueChanges)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        isValidSignal.set(formGroup.valid);
        isInvalidSignal.set(formGroup.invalid);
        isDirtySignal.set(formGroup.dirty);
        isTouchedSignal.set(formGroup.touched);
        statusSignal.set(formGroup.status);
      });

    return {
      isValid: isValidSignal.asReadonly(),
      isInvalid: isInvalidSignal.asReadonly(),
      isDirty: isDirtySignal.asReadonly(),
      isTouched: isTouchedSignal.asReadonly(),
      status: statusSignal.asReadonly(),
    };
  }

  private createReactiveFormGroup(
    fieldConfigs: Record<string, IInputFieldsConfig>,
    defaultValues?: Record<string, unknown>
  ): FormGroup {
    const formControls: Record<string, unknown> = {};

    Object.keys(fieldConfigs).forEach(key => {
      const config = fieldConfigs[key];
      const fieldName = config.fieldName ?? key;
      const defaultValue = defaultValues?.[key] ?? config.defaultValue ?? null;
      formControls[fieldName] = [defaultValue, config.validators ?? []];
    });

    return this.fb.group(formControls);
  }

  private applyConditionalValidators(
    formGroup: FormGroup,
    fieldConfigs: Record<string, IInputFieldsConfig>,
    destroyRef: DestroyRef,
    context?: Record<string, unknown>
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
          let currentValue: unknown;
          let isActive: boolean;

          // Handle field-based rules
          if (rule.dependsOn) {
            const dependencyControl = formGroup.get(rule.dependsOn);
            currentValue = dependencyControl?.value;
            isActive = rule.shouldApply(currentValue, context);
          }
          // Handle pure context rules (no specific field dependency)
          else if (context) {
            isActive = rule.shouldApply(context, context);
          } else {
            // Skip rules without any dependency
            return;
          }

          if (isActive) {
            if (rule.validators?.length) {
              extraValidators.push(...rule.validators);
            }
          } else {
            if (rule.resetOnFalse) {
              shouldResetValue = true;
            }
          }
        });

        control.setValidators([...baseValidators, ...extraValidators]);
        control.updateValueAndValidity();

        if (shouldResetValue) {
          control.reset(undefined, { emitEvent: false });
        }
      };

      runConditionalLogic();

      // Subscribe to changes on field-based dependency fields only
      const dependencyFieldNames = Array.from(
        new Set(
          config.conditionalValidators
            .filter(rule => rule.dependsOn)
            .map(rule => rule.dependsOn)
        )
      );

      dependencyFieldNames.forEach(dependencyName => {
        const dependencyControl = formGroup.get(dependencyName ?? '');

        if (!dependencyControl) {
          return;
        }

        // Subscribe with automatic cleanup
        dependencyControl.valueChanges
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe(() => {
            runConditionalLogic();
          });
      });
    });
  }

  /**
   * Checks if multi-step form has any explicit cross-step dependencies (dependsOnStep property)
   */
  private hasExplicitCrossStepDependencies(
    multiStepFormConfig: IMultiStepFormConfig
  ): boolean {
    if (!multiStepFormConfig?.fields) {
      return false;
    }

    return Object.values(multiStepFormConfig.fields).some(stepFields =>
      Object.values(stepFields).some(config =>
        config.conditionalValidators?.some(
          rule =>
            rule.dependsOnStep !== undefined && rule.dependsOnStep !== null
        )
      )
    );
  }

  /**
   * Applies conditional validators for multi-step forms
   * Only handles explicit cross-step dependencies (when dependsOnStep is specified)
   */
  private applyCrossStepConditionalValidators(
    forms: Record<string, IEnhancedForm>,
    multiStepFormConfig: IMultiStepFormConfig,
    destroyRef: DestroyRef
  ): void {
    Object.entries(multiStepFormConfig.fields).forEach(
      ([currentStepName, stepFields]) => {
        const currentForm = forms[currentStepName];
        if (!currentForm) {
          return;
        }

        Object.entries(stepFields).forEach(([fieldName, config]) => {
          // Skip fields without conditional rules
          if (
            !config.conditionalValidators ||
            config.conditionalValidators.length === 0
          ) {
            return;
          }

          // Only process validators with explicit dependsOnStep and dependsOn
          const crossStepRules = config.conditionalValidators.filter(
            rule =>
              rule.dependsOnStep !== undefined &&
              rule.dependsOnStep !== null &&
              rule.dependsOn !== undefined
          );

          if (crossStepRules.length === 0) {
            return;
          }

          const control = currentForm.formGroup.get(fieldName);
          if (!control) {
            return;
          }

          const runConditionalLogic = (): void => {
            const baseValidators: ValidatorFn[] = config.validators ?? [];
            const extraValidators: ValidatorFn[] = [];
            let shouldResetValue = false;

            // Process only cross-step conditional validators
            crossStepRules.forEach(rule => {
              if (!rule.dependsOn) {
                return;
              }

              const dependencyStepKey = String(rule.dependsOnStep);
              const dependencyForm = forms[dependencyStepKey];

              if (!dependencyForm) {
                return;
              }

              const dependencyControl = dependencyForm.formGroup.get(
                rule.dependsOn
              );
              if (!dependencyControl) {
                return;
              }

              const currentValue = dependencyControl.value;
              const isActive = rule.shouldApply(currentValue);

              if (isActive) {
                if (rule.validators?.length) {
                  extraValidators.push(...rule.validators);
                }
              } else {
                if (rule.resetOnFalse) {
                  shouldResetValue = true;
                }
              }
            });

            control.setValidators([...baseValidators, ...extraValidators]);
            control.updateValueAndValidity();

            if (shouldResetValue) {
              control.reset(undefined, { emitEvent: false });
            }
          };

          // Initial run
          runConditionalLogic();

          // Subscribe to changes on cross-step dependency fields
          crossStepRules.forEach(rule => {
            if (!rule.dependsOn) {
              return;
            }

            const dependencyStepKey = String(rule.dependsOnStep);
            const dependencyForm = forms[dependencyStepKey];

            if (!dependencyForm) {
              return;
            }

            const dependencyControl = dependencyForm.formGroup.get(
              rule.dependsOn
            );
            if (!dependencyControl) {
              return;
            }

            // Subscribe with automatic cleanup
            dependencyControl.valueChanges
              .pipe(takeUntilDestroyed(destroyRef))
              .subscribe(() => {
                runConditionalLogic();
              });
          });
        });
      }
    );
  }

  private createEnhancedForm<
    T extends Record<string, unknown> | object = Record<string, unknown>,
  >(
    formGroup: FormGroup,
    fieldConfigs: Record<string, IInputFieldsConfig>,
    buttonConfigs: IFormButtonConfig = {}
  ): IEnhancedForm<T> {
    return {
      formGroup,
      fieldConfigs: fieldConfigs as Record<keyof T, IInputFieldsConfig>,
      buttonConfigs,
      isValid: () => formGroup.valid, // true if all fields are valid, no errors.
      isInvalid: () => formGroup.invalid, // true if any field has an error.
      isDirty: () => formGroup.dirty, // true if any field has been modified.
      isTouched: () => formGroup.touched, // true even if they didn't type anything.
      isReady: () => formGroup.valid && !formGroup.pending, // Is the form good to go? (Valid & no background checks running)
      markTouched: () => formGroup.markAllAsTouched(), // Force the form to act like the user touched everything.
      reset: (value?: T) => formGroup.reset(value),
      disable: () => formGroup.disable(),
      enable: () => formGroup.enable(),
      patch: (value?: T) => formGroup.patchValue(value ?? {}), // Update only some fields in the form.
      setValue: (value: T) => formGroup.setValue(value), // Update all fields in the form.
      updateValidation: () => formGroup.updateValueAndValidity(), // Force validation to run again.
      validateAndMarkTouched: () => this.validateAndMarkTouched(formGroup), // Validate and mark touched in one method
      getData: () => formGroup.value as T, // Get form data (enabled controls only)
      getRawData: () => formGroup.getRawValue() as T, // Get raw form data (includes disabled controls)
      getFieldData: <K extends keyof T>(fieldName: K) =>
        formGroup.get(fieldName as string)?.value as T[K], // Get data for a specific field
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
      reset: (value?: Record<string, Record<string, unknown>>) =>
        this.resetMultiStepForm(forms, value), // Reset all forms.
      disable: () => this.disableMultiStepForm(forms), // Disable all forms.
      enable: () => this.enableMultiStepForm(forms), // Enable all forms.
      validateAndMarkTouched: () =>
        this.validateAndMarkMultiStepFormTouched(forms), // Validate and mark touched in one method for all forms
      getData: () => this.getMultiStepFormData(forms), // Get combined form data from all forms (enabled controls only)
      getRawData: () => this.getMultiStepFormRawData(forms), // Get combined raw form data from all forms (includes disabled controls)
    };
  }
}
