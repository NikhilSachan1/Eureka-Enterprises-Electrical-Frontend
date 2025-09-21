import { Injectable, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, filter } from 'rxjs';

import {
  IConfirmationDialogConfig,
  IConfirmationDialogSettingConfig,
  IDialogState,
  IDynamicFieldConfig,
  IEnhancedConfirmationDialog,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EDialogType } from '@shared/types';
import { FormService, InputFieldConfigService } from '@shared/services';
import { deepMerge } from '@shared/utility';
import {
  ALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  CANCEL_CONFIRMATION_DIALOG_CONFIG,
  CONFIRMATION_DIALOG_CONFIG,
  DEALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
  REGULARIZE_CONFIRMATION_DIALOG_CONFIG,
  WARNING_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly formService = inject(FormService);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);

  private readonly defaultConfigs: Record<
    EDialogType,
    Partial<IConfirmationDialogSettingConfig>
  > = {
    [EDialogType.DEFAULT]: CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.DELETE]: DELETE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.APPROVE]: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.REJECT]: REJECT_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.CANCEL]: CANCEL_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.ALLOCATE]: ALLOCATE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.DEALLOCATE]: DEALLOCATE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.WARNING]: WARNING_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.REGULARIZE]: REGULARIZE_CONFIRMATION_DIALOG_CONFIG,
  };

  // Store dynamic field configurations for automatic handling
  private dynamicFieldConfigs: IDynamicFieldConfig[] = [];

  // Track active subscriptions to avoid duplicate listeners
  private activeValueChangeSubscriptions: Record<string, boolean> = {};

  // Flag to prevent recursive updates
  private isUpdatingFields = false;

  private readonly dialogState$ = new BehaviorSubject<IDialogState>({
    formGroup: null,
    config: {},
  });

  getDialogState(): Observable<IDialogState> {
    return this.dialogState$.asObservable();
  }

  createConfirmationDialog(
    dialogType: EDialogType = EDialogType.DEFAULT,
    confirmationDialogConfig?: IConfirmationDialogConfig
  ): IEnhancedConfirmationDialog {
    const finalDialogSettingConfig = this.buildFinalDialogConfig(
      dialogType,
      confirmationDialogConfig
    );
    const inputFieldsConfigs =
      this.inputFieldConfigService.initializeFieldConfigs(
        confirmationDialogConfig?.inputFields ?? {}
      );
    const formGroup = this.createFormGroup(inputFieldsConfigs);

    const completeConfig: IConfirmationDialogConfig = {
      dialogSettingConfig: finalDialogSettingConfig,
      inputFields: inputFieldsConfigs,
      recordDetails: confirmationDialogConfig?.recordDetails,
      onAccept: confirmationDialogConfig?.onAccept,
      onReject: confirmationDialogConfig?.onReject,
    };

    return this.createEnhancedConfirmationDialog(completeConfig, formGroup);
  }

  private buildFinalDialogConfig(
    dialogType: EDialogType,
    config?: IConfirmationDialogConfig
  ): IConfirmationDialogSettingConfig {
    const defaultConfig =
      this.defaultConfigs[dialogType] ||
      this.defaultConfigs[EDialogType.DEFAULT];
    const dialogSettingConfig = config?.dialogSettingConfig ?? {};
    return deepMerge(
      defaultConfig,
      dialogSettingConfig
    ) as IConfirmationDialogSettingConfig;
  }

  private createFormGroup(inputFields?: IFormInputFieldsConfig): FormGroup {
    const enhancedForm = this.formService.createForm({
      fields: inputFields ?? {},
    });

    return enhancedForm?.formGroup;
  }

  private createEnhancedConfirmationDialog(
    confirmationDialogConfig: IConfirmationDialogConfig,
    formGroup: FormGroup | null
  ): IEnhancedConfirmationDialog {
    const isOpenSignal = signal(false);
    const isLoadingSignal = signal(false);

    return {
      config: signal(confirmationDialogConfig),
      formGroup: signal(formGroup),
      isOpen: isOpenSignal,
      isLoading: isLoadingSignal,

      show: (): void => {
        this.showDialog(
          confirmationDialogConfig,
          formGroup,
          confirmationDialogConfig?.onAccept,
          confirmationDialogConfig?.onReject
        );
        isOpenSignal.set(true);
      },

      hide: (): void => {
        isOpenSignal.set(false);
      },

      setLoading: (loading: boolean): void => {
        isLoadingSignal.set(loading);
      },

      updateConfig: (
        newConfig: Partial<IConfirmationDialogConfig>
      ): IConfirmationDialogConfig => {
        const updatedConfig = { ...confirmationDialogConfig, ...newConfig };
        return updatedConfig;
      },
    };
  }

  private showDialog(
    config: IConfirmationDialogConfig,
    formGroup: FormGroup | null,
    onAccept?: (formData?: Record<string, unknown>) => void,
    onReject?: (formData?: Record<string, unknown>) => void
  ): void {
    this.dialogState$.next({ formGroup, config, onAccept, onReject });

    if (config.dialogSettingConfig) {
      this.confirmationService.confirm(config.dialogSettingConfig);
    }
  }

  /**
   * Register a dynamic field configuration for automatic handling
   * @param config The dynamic field configuration
   */
  registerDynamicField(config: IDynamicFieldConfig): void {
    // Wrap the getFieldsForValue function to apply default configurations
    const wrappedConfig: IDynamicFieldConfig = {
      triggerFieldName: config.triggerFieldName,
      getFieldsForValue: (value: string | number | boolean | null) => {
        // Get the raw fields from the original function
        const rawFields = config.getFieldsForValue(value);

        // Apply default configurations to ensure all styling properties are set
        const fieldsWithDefaults: IFormInputFieldsConfig = {};
        Object.entries(rawFields).forEach(([key, field]) => {
          // Use the input field config service to apply defaults based on field type
          fieldsWithDefaults[key] =
            this.inputFieldConfigService.getInputFieldConfig(
              field.fieldType,
              field
            );
        });

        return fieldsWithDefaults;
      },
    };

    this.dynamicFieldConfigs.push(wrappedConfig);

    // Set up listener for field changes
    this.setupDynamicFieldListener(wrappedConfig);
  }

  /**
   * Set up listener for dynamic field changes
   * @param config The dynamic field configuration
   */
  private setupDynamicFieldListener(config: IDynamicFieldConfig): void {
    this.dialogState$
      .pipe(
        filter(
          state =>
            state.formGroup !== null &&
            state.config.inputFields !== undefined &&
            config.triggerFieldName in (state.config.inputFields || {})
        )
      )
      .subscribe(state => {
        if (state.formGroup) {
          const triggerControl = state.formGroup.get(config.triggerFieldName);
          if (triggerControl) {
            // Create a unique key for this form control
            const controlKey = `${config.triggerFieldName}-${Math.random().toString(36).substring(2, 9)}`;

            // Only set up the listener if we haven't already for this control
            if (!this.activeValueChangeSubscriptions[controlKey]) {
              this.activeValueChangeSubscriptions[controlKey] = true;

              // Listen for changes on the trigger field
              triggerControl.valueChanges.subscribe(value => {
                // Prevent recursive updates
                if (this.isUpdatingFields) {
                  return;
                }

                // Get updated fields based on the trigger value
                const updatedFields = config.getFieldsForValue(value);

                // Set flag to prevent recursion
                this.isUpdatingFields = true;

                try {
                  // Update dialog state with new fields
                  this.updateDialogState({ inputFields: updatedFields });
                } finally {
                  // Reset flag
                  setTimeout(() => {
                    this.isUpdatingFields = false;
                  }, 0);
                }
              });
            }

            // We'll skip auto-initialization to avoid the loop
            // Let the user's first selection trigger the change
          }
        }
      });
  }

  showConfirmationDialog(
    dialogConfig: IConfirmationDialogConfig,
    dialogType: EDialogType
  ): void {
    const confirmationDialog = this.createConfirmationDialog(
      dialogType,
      dialogConfig
    );
    confirmationDialog.show();
  }

  /**
   * Update dialog state with new configuration
   * @param updatedConfig The updated configuration
   * @param skipValueChangeEvents Whether to skip triggering value change events
   */
  updateDialogState(
    updatedConfig: Partial<IConfirmationDialogConfig>,
    skipValueChangeEvents = false
  ): void {
    const currentState = this.dialogState$.value;
    const newConfig = { ...currentState.config, ...updatedConfig };

    // If inputFields changed, recreate the form but preserve existing values
    let newFormGroup = currentState.formGroup;
    if (updatedConfig.inputFields && currentState.formGroup) {
      // Save current form values
      const currentValues = currentState.formGroup.getRawValue();

      // Create new form with updated fields
      const inputFieldsConfigs =
        this.inputFieldConfigService.initializeFieldConfigs(
          updatedConfig.inputFields
        );
      newFormGroup = this.createFormGroup(inputFieldsConfigs);

      // Restore values for fields that still exist
      if (newFormGroup) {
        Object.keys(currentValues).forEach(key => {
          if (newFormGroup?.contains(key)) {
            // Use setValue with emitEvent: false to avoid triggering valueChanges
            newFormGroup.get(key)?.setValue(currentValues[key], {
              emitEvent: !skipValueChangeEvents,
            });
          }
        });
      }
    }

    this.dialogState$.next({
      ...currentState,
      config: newConfig,
      formGroup: newFormGroup,
    });
  }
}
