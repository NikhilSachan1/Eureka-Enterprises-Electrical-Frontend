import { Injectable, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  IConfirmationDialogConfig,
  IConfirmationDialogSettingConfig,
  IDialogState,
  IEnhancedConfirmationDialog,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EDialogType } from '@shared/types';
import { FormService } from '@shared/services';
import { deepMerge } from '@shared/utility';
import {
  ALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  CANCEL_CONFIRMATION_DIALOG_CONFIG,
  CONFIRMATION_DIALOG_CONFIG,
  DEALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly formService = inject(FormService);

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
  };

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
    const formGroup = this.createFormGroup(
      confirmationDialogConfig?.inputFields
    );

    const completeConfig: IConfirmationDialogConfig = {
      dialogSettingConfig: finalDialogSettingConfig,
      inputFields: confirmationDialogConfig?.inputFields,
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
}
