import { Injectable, inject, DestroyRef, signal, Signal } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { InputFieldConfigService } from '@shared/services';
import {
  IFormConfig,
  IInputFieldsConfig,
  IFormInputFieldsConfig,
  IEnhancedForm,
  IFormButtonConfig,
  IMultiStepFormConfig,
  IEnhancedMultiStepForm,
  ITrackedFields,
  ITrackedForm,
  FormDataConstraint,
  DefaultFormData,
  MultiStepFormDataConstraint,
  DefaultMultiStepFormData,
  MultiStepFormsRecord,
} from '@shared/types';
import { IConditionalValidator } from '@shared/types/form/input-fields-config.interface';

export interface ICreateFormOptions<
  T extends FormDataConstraint = DefaultFormData,
> {
  destroyRef: DestroyRef;
  defaultValues?: Partial<T> | null;
  context?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private readonly fb = inject(FormBuilder);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);

  createForm<T extends FormDataConstraint = DefaultFormData>(
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

  createMultiStepForm<
    T extends MultiStepFormDataConstraint = DefaultMultiStepFormData,
    TFlattened extends FormDataConstraint = DefaultFormData,
  >(
    multiStepFormConfig: IMultiStepFormConfig<T>,
    destroyRef: DestroyRef,
    defaultValues?: Partial<T> | null
  ): IEnhancedMultiStepForm<T, TFlattened> {
    const forms: MultiStepFormsRecord = {};

    if (
      !multiStepFormConfig?.fields ||
      Object.keys(multiStepFormConfig.fields).length === 0
    ) {
      return this.createEnhancedMultiStepForm<T, TFlattened>(
        forms,
        multiStepFormConfig.buttons ?? {}
      );
    }

    Object.entries(multiStepFormConfig.fields).forEach(
      ([stepName, stepFields]) => {
        const stepDefaultValues = defaultValues?.[stepName] ?? {};

        const stepFormConfig: IFormConfig<T[typeof stepName]> = {
          fields: stepFields as IFormInputFieldsConfig<T[typeof stepName]>,
        };

        const createdForm = this.createForm<T[typeof stepName]>(
          stepFormConfig,
          {
            destroyRef,
            defaultValues: stepDefaultValues as Partial<T[typeof stepName]>,
          }
        );
        // Type assertion needed because MultiStepFormsRecord uses Record<string, unknown>
        // but we're creating forms with specific types T[typeof stepName]
        forms[stepName] = createdForm as IEnhancedForm<Record<string, unknown>>;
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

    return this.createEnhancedMultiStepForm<T, TFlattened>(
      forms,
      multiStepFormConfig.buttons ?? {}
    );
  }

  private isMultiStepFormValid(forms: MultiStepFormsRecord): boolean {
    return Object.values(forms).every(form => form.isValid());
  }

  private isMultiStepFormInvalid(forms: MultiStepFormsRecord): boolean {
    return Object.values(forms).some(form => form.isInvalid());
  }

  private isMultiStepFormDirty(forms: MultiStepFormsRecord): boolean {
    return Object.values(forms).some(form => form.isDirty());
  }

  private isMultiStepFormTouched(forms: MultiStepFormsRecord): boolean {
    return Object.values(forms).some(form => form.isTouched());
  }

  private markMultiStepFormTouched(forms: MultiStepFormsRecord): void {
    Object.values(forms).forEach(form => form.markTouched());
  }

  private resetMultiStepForm<
    T extends MultiStepFormDataConstraint = DefaultMultiStepFormData,
  >(forms: MultiStepFormsRecord, value?: Partial<T>): void {
    if (value) {
      Object.keys(forms).forEach(stepKey => {
        const form = forms[stepKey];
        const stepValue = value[stepKey as keyof T];
        form.reset(stepValue);
      });
    } else {
      Object.values(forms).forEach(form => form.reset());
    }
  }

  private disableMultiStepForm(forms: MultiStepFormsRecord): void {
    Object.values(forms).forEach(form => form.disable());
  }

  private enableMultiStepForm(forms: MultiStepFormsRecord): void {
    Object.values(forms).forEach(form => form.enable());
  }

  private validateAndMarkMultiStepFormTouched(
    forms: MultiStepFormsRecord
  ): boolean {
    const validationResults = Object.values(forms).map(form =>
      form.validateAndMarkTouched()
    );
    return validationResults.every(isValid => isValid);
  }

  private getMultiStepFormData<
    TFlattened extends FormDataConstraint = DefaultFormData,
  >(forms: MultiStepFormsRecord): TFlattened {
    // Flatten all form data from all steps into a single object
    return Object.values(forms).reduce(
      (acc, form) => ({
        ...acc,
        ...form.getData(),
      }),
      {} as TFlattened
    );
  }

  private getMultiStepFormRawData<
    TFlattened extends FormDataConstraint = DefaultFormData,
  >(forms: MultiStepFormsRecord): TFlattened {
    // Flatten all raw form data from all steps into a single object
    return Object.values(forms).reduce(
      (acc, form) => ({
        ...acc,
        ...form.getRawData(),
      }),
      {} as TFlattened
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

  trackFieldChanges<T = unknown>(
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

  trackMultipleFieldChanges<
    TFormData extends FormDataConstraint = DefaultFormData,
    TFieldNames extends keyof TFormData & string = keyof TFormData & string,
  >(
    formGroup: FormGroup,
    fieldNames: TFieldNames[],
    destroyRef: DestroyRef
  ): ITrackedFields<TFieldNames, TFormData> {
    const signals = {} as Record<TFieldNames, Signal<unknown>>;

    fieldNames.forEach(fieldName => {
      signals[fieldName] = this.trackFieldChanges(
        formGroup,
        fieldName as string,
        destroyRef
      );
    });

    // Create enhanced object with getValues method
    const trackedFields = {
      ...signals,
      getValues(): Pick<TFormData, TFieldNames> {
        const values = {} as Pick<TFormData, TFieldNames>;
        fieldNames.forEach(fieldName => {
          (values as Record<string, unknown>)[fieldName as string] =
            signals[fieldName]?.();
        });
        return values;
      },
    } as ITrackedFields<TFieldNames, TFormData>;

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
  private hasExplicitCrossStepDependencies<
    T extends MultiStepFormDataConstraint = DefaultMultiStepFormData,
  >(multiStepFormConfig: IMultiStepFormConfig<T>): boolean {
    if (!multiStepFormConfig?.fields) {
      return false;
    }

    return Object.values(multiStepFormConfig.fields).some(stepFields =>
      Object.values(
        stepFields as Record<string, Partial<IInputFieldsConfig>>
      ).some((config: Partial<IInputFieldsConfig>) =>
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
  private applyCrossStepConditionalValidators<
    T extends MultiStepFormDataConstraint = DefaultMultiStepFormData,
  >(
    forms: MultiStepFormsRecord,
    multiStepFormConfig: IMultiStepFormConfig<T>,
    destroyRef: DestroyRef
  ): void {
    Object.entries(multiStepFormConfig.fields).forEach(
      ([currentStepName, stepFields]) => {
        const currentForm = forms[currentStepName];
        if (!currentForm) {
          return;
        }

        Object.entries(
          stepFields as Record<string, Partial<IInputFieldsConfig>>
        ).forEach(([fieldName, config]) => {
          // Skip fields without conditional rules
          if (
            !config.conditionalValidators ||
            config.conditionalValidators.length === 0
          ) {
            return;
          }

          // Only process validators with explicit dependsOnStep and dependsOn
          const crossStepRules = config.conditionalValidators.filter(
            (rule: IConditionalValidator) =>
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
            crossStepRules.forEach((rule: IConditionalValidator) => {
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
          crossStepRules.forEach((rule: IConditionalValidator) => {
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
      reset: (value?: Partial<T> | null) => formGroup.reset(value ?? undefined),
      disable: () => formGroup.disable(),
      enable: () => formGroup.enable(),
      patch: (value?: Partial<T>) => formGroup.patchValue(value ?? {}), // Update only some fields in the form.
      setValue: (value: T) => formGroup.setValue(value), // Update all fields in the form.
      updateValidation: () => formGroup.updateValueAndValidity(), // Force validation to run again.
      validateAndMarkTouched: () => this.validateAndMarkTouched(formGroup), // Validate and mark touched in one method
      getData: () => formGroup.value as T, // Get form data (enabled controls only)
      getRawData: () => formGroup.getRawValue() as T, // Get raw form data (includes disabled controls)
      getFieldData: <K extends keyof T>(fieldName: K) =>
        formGroup.get(fieldName as string)?.value as T[K], // Get data for a specific field
    };
  }

  private createEnhancedMultiStepForm<
    T extends MultiStepFormDataConstraint = DefaultMultiStepFormData,
    TFlattened extends FormDataConstraint = DefaultFormData,
  >(
    forms: MultiStepFormsRecord,
    buttonConfigs: IFormButtonConfig
  ): IEnhancedMultiStepForm<T, TFlattened> {
    return {
      forms: forms as {
        [K in keyof T]: IEnhancedForm<T[K]>;
      },
      buttonConfigs,
      isValid: () => this.isMultiStepFormValid(forms), // true if all forms are valid, no errors.
      isInvalid: () => this.isMultiStepFormInvalid(forms), // true if any form has an error.
      isDirty: () => this.isMultiStepFormDirty(forms), // true if any form has been modified.
      isTouched: () => this.isMultiStepFormTouched(forms), // true if any form has been touched.
      markTouched: () => this.markMultiStepFormTouched(forms), // Force all forms to act like the user touched everything.
      reset: (value?: Partial<T>) => this.resetMultiStepForm<T>(forms, value), // Reset all forms.
      disable: () => this.disableMultiStepForm(forms), // Disable all forms.
      enable: () => this.enableMultiStepForm(forms), // Enable all forms.
      validateAndMarkTouched: () =>
        this.validateAndMarkMultiStepFormTouched(forms), // Validate and mark touched in one method for all forms
      getData: () => this.getMultiStepFormData<TFlattened>(forms), // Get combined flattened form data from all forms (enabled controls only)
      getRawData: () => this.getMultiStepFormRawData<TFlattened>(forms), // Get combined flattened raw form data from all forms (includes disabled controls)
    };
  }
}
