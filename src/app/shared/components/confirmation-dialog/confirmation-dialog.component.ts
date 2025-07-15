import { Component, ViewChild, ChangeDetectionStrategy, inject, signal, OnInit, computed, DestroyRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ConfirmationDialogService } from '@shared/services/confirmation-dialog-config.service';
import { FormService } from '@shared/services/form.service';
import { IButtonConfig, IConfirmationDialogConfig, IDialogState, IInputFieldsConfig } from '@shared/models';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ConfirmDialogModule, ButtonComponent, InputFieldComponent, ReactiveFormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent implements OnInit {

  @ViewChild('cd') confirmDialog: any;

  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  protected readonly currentFormGroup = signal<FormGroup | null>(null);
  protected readonly currentDialogConfig = signal<IConfirmationDialogConfig>({});
  protected readonly onAcceptCallback = signal<((formData?: any) => void) | undefined>(undefined);
  protected readonly onRejectCallback = signal<((formData?: any) => void) | undefined>(undefined);

  ngOnInit(): void {
    this.initializeDialogStateSubscription();
  }

  private initializeDialogStateSubscription(): void {
    this.confirmationDialogService.getDialogState()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state: IDialogState) => {
        this.updateDialogState(state);
      });
  }

  private updateDialogState(state: IDialogState): void {
    console.log('Dialog state updated:', state);
    this.currentFormGroup.set(state.formGroup);
    this.currentDialogConfig.set(state.config);
    this.onAcceptCallback.set(state.onAccept);
    this.onRejectCallback.set(state.onReject);
  }

  private executeCallback(confirmed: boolean, formData: any): void {
    try {
      if (confirmed) {
        this.onAcceptCallback()?.(formData);
      } else {
        this.onRejectCallback()?.(formData);
      }
    } catch (error) {
      console.error('Error executing dialog callback:', error);
    }
  }

  // Button configurations as computed signals
  protected readonly acceptButtonConfig = computed<Partial<IButtonConfig>>(() => {
    const dialog = this.currentDialogConfig();
    return {
      label: dialog?.dialogSettingConfig?.acceptButtonProps?.label,
      icon: dialog?.dialogSettingConfig?.acceptButtonProps?.icon,
      severity: dialog?.dialogSettingConfig?.acceptButtonProps?.severity,
      visible: dialog?.dialogSettingConfig?.acceptButtonProps?.visible,
    };
  });

  protected readonly rejectButtonConfig = computed<Partial<IButtonConfig>>(() => {
    const dialog = this.currentDialogConfig();
    return {
      label: dialog?.dialogSettingConfig?.rejectButtonProps?.label,
      icon: dialog?.dialogSettingConfig?.rejectButtonProps?.icon,
      severity: dialog?.dialogSettingConfig?.rejectButtonProps?.severity,
      visible: dialog?.dialogSettingConfig?.rejectButtonProps?.visible,
    };
  });

  // Computed properties for dialog state
  protected readonly hasFormFields = computed(() => {
    const dialog = this.currentDialogConfig();
    return dialog?.inputFields && Object.keys(dialog.inputFields).length > 0;
  });

  protected readonly formFieldConfigs = computed<IInputFieldsConfig[]>(() => {
    const dialog = this.currentDialogConfig();
    return dialog?.inputFields ? Object.values(dialog.inputFields) as IInputFieldsConfig[] : [];
  });

  protected readonly hasRecordDetails = computed(() => {
    const dialog = this.currentDialogConfig();
    return dialog?.recordDetails?.details && dialog.recordDetails.details.length > 0;
  });

  protected readonly isAcceptButtonVisible = computed(() => {
    const dialog = this.currentDialogConfig();
    return dialog?.dialogSettingConfig?.acceptButtonProps?.visible !== false;
  });

  protected readonly isRejectButtonVisible = computed(() => {
    const dialog = this.currentDialogConfig();
    return dialog?.dialogSettingConfig?.rejectButtonProps?.visible !== false;
  });

  protected handleDialog(confirmed: boolean): void {
    const formGroup = this.currentFormGroup();
    let formData = null;

    if (formGroup) {
      if (confirmed && !this.formService.validateAndMarkTouched(formGroup)) {
        return;
      }
      formData = this.formService.getData(formGroup);
    }

    this.executeCallback(confirmed, formData);
    this.closeDialog();
  }

  private closeDialog(): void {
    this.confirmDialog?.close();
  }
} 