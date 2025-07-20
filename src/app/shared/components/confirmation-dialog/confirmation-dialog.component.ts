import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  computed,
  DestroyRef,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationDialogService, FormService } from '@shared/services';
import {
  IButtonConfig,
  IConfirmationDialogConfig,
  IDialogState,
  IInputFieldsConfig,
} from '@shared/models';
import { ButtonComponent } from '../button/button.component';
import { InputFieldComponent } from '../input-field/input-field.component';
import { LoggerService } from '@app/core/services';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    ButtonComponent,
    InputFieldComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent implements OnInit {
  @ViewChild('cd') confirmDialog!: ConfirmDialog;

  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);

  // State signals
  protected readonly currentFormGroup = signal<FormGroup | null>(null);
  protected readonly currentDialogConfig = signal<IConfirmationDialogConfig>(
    {}
  );
  protected readonly onAcceptCallback = signal<
    ((formData?: Record<string, unknown>) => void) | undefined
  >(undefined);
  protected readonly onRejectCallback = signal<
    ((formData?: Record<string, unknown>) => void) | undefined
  >(undefined);

  ngOnInit(): void {
    this.initializeDialogStateSubscription();
  }

  private initializeDialogStateSubscription(): void {
    this.confirmationDialogService
      .getDialogState()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state: IDialogState) => {
        this.updateDialogState(state);
      });
  }

  private updateDialogState(state: IDialogState): void {
    this.logger.info('Dialog state updated:', state);
    this.currentFormGroup.set(state.formGroup);
    this.currentDialogConfig.set(state.config);
    this.onAcceptCallback.set(state.onAccept);
    this.onRejectCallback.set(state.onReject);
  }

  private executeCallback(
    confirmed: boolean,
    formData: Record<string, unknown> | null
  ): void {
    try {
      if (confirmed) {
        this.onAcceptCallback()?.(formData ?? undefined);
      } else {
        this.onRejectCallback()?.(formData ?? undefined);
      }
    } catch (error) {
      console.error('Error executing dialog callback:', error);
    }
  }

  // Button configurations as computed signals
  protected readonly acceptButtonConfig = computed<Partial<IButtonConfig>>(
    () => {
      const dialog = this.currentDialogConfig();
      return {
        label: dialog?.dialogSettingConfig?.acceptButtonProps?.label,
        icon: dialog?.dialogSettingConfig?.acceptButtonProps?.icon,
        severity: dialog?.dialogSettingConfig?.acceptButtonProps?.severity,
        visible: dialog?.dialogSettingConfig?.acceptButtonProps?.visible,
      };
    }
  );

  protected readonly rejectButtonConfig = computed<Partial<IButtonConfig>>(
    () => {
      const dialog = this.currentDialogConfig();
      return {
        label: dialog?.dialogSettingConfig?.rejectButtonProps?.label,
        icon: dialog?.dialogSettingConfig?.rejectButtonProps?.icon,
        severity: dialog?.dialogSettingConfig?.rejectButtonProps?.severity,
        visible: dialog?.dialogSettingConfig?.rejectButtonProps?.visible,
      };
    }
  );

  // Computed properties for dialog state
  protected readonly hasFormFields = computed(() => {
    const dialog = this.currentDialogConfig();
    return dialog?.inputFields && Object.keys(dialog.inputFields).length > 0;
  });

  protected readonly formFieldConfigs = computed<IInputFieldsConfig[]>(() => {
    const dialog = this.currentDialogConfig();
    return dialog?.inputFields
      ? (Object.values(dialog.inputFields) as IInputFieldsConfig[])
      : [];
  });

  protected readonly hasRecordDetails = computed(() => {
    const dialog = this.currentDialogConfig();
    return (
      dialog?.recordDetails?.details && dialog.recordDetails.details.length > 0
    );
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
