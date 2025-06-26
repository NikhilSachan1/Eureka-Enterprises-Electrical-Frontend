import { inject, Injectable } from '@angular/core';
import {
  ALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  CANCEL_CONFIRMATION_DIALOG_CONFIG,
  CONFIRMATION_DIALOG_CONFIG,
  DEALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '../config';
import { 
  IConfirmationDialogConfig, 
  IEnhancedConfirmationDialogConfig
} from '../models';
import { EDialogType } from '../types';
import { ConfirmationService } from 'primeng/api';
import { deepMerge } from '../utility';
import { FormService } from './form.service';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

interface IDialogState {
  formGroup: FormGroup | null;
  config: IConfirmationDialogConfig | null;
  onAccept?: (formData?: any) => void;
  onReject?: (formData?: any) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly defaultConfigs = {
    [EDialogType.DEFAULT]: CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.DELETE]: DELETE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.APPROVE]: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.REJECT]: REJECT_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.CANCEL]: CANCEL_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.ALLOCATE]: ALLOCATE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.DEALLOCATE]: DEALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  };

  private readonly confirmationService = inject(ConfirmationService);
  private readonly formService = inject(FormService);

  private dialogState$ = new BehaviorSubject<IDialogState>({
    formGroup: null,
    config: null
  });

  getDialogState() {
    return this.dialogState$.asObservable();
  }

  createConfirmationDialog(
    dialogType: EDialogType = EDialogType.DEFAULT,
    dialogConfig?: IEnhancedConfirmationDialogConfig
  ) {
    const finalConfig = this.getConfirmationDialogConfig(dialogType, dialogConfig?.dialogConfig);
    const formGroup = this.createFormGroup(dialogConfig, finalConfig);

    return {
      show: () => this.showDialog(finalConfig, formGroup, dialogConfig?.onAccept, dialogConfig?.onReject)
    };
  }

  private getConfirmationDialogConfig(
    dialogType: EDialogType,
    options?: Partial<IConfirmationDialogConfig>
  ): IConfirmationDialogConfig {
    const defaultConfig = this.defaultConfigs[dialogType] || this.defaultConfigs[EDialogType.DEFAULT];
    return deepMerge(defaultConfig, options || {}) as IConfirmationDialogConfig;
  }

  private createFormGroup(
    dialogConfig?: IEnhancedConfirmationDialogConfig,
    finalConfig?: IConfirmationDialogConfig
  ): FormGroup | null {
    const inputFields = dialogConfig?.inputFields || finalConfig?.inputFieldConfigs;
    if (!inputFields?.length) return null;

    const formConfig = {
      fields: this.convertInputFieldsToFormConfig(inputFields),
      buttons: {}
    };
    return this.formService.createForm(formConfig).formGroup;
  }

  private showDialog(
    config: IConfirmationDialogConfig,
    formGroup: FormGroup | null,
    onAccept?: (formData?: any) => void,
    onReject?: (formData?: any) => void
  ): void {
    this.dialogState$.next({ formGroup, config, onAccept, onReject });
    this.confirmationService.confirm(config);
  }

  private convertInputFieldsToFormConfig(inputFields: Partial<any>[]): Record<string, any> {
    const formConfig: Record<string, any> = {};
    inputFields.forEach((field) => {
      if (field['fieldName']) {
        formConfig[field['fieldName']] = field;
      }
    });
    return formConfig;
  }
}
