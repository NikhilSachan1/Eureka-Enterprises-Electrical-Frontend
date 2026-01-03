import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { LoggerService } from '@core/services';
import { ACTION_ASSET_FORM_CONFIG } from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IActionAssetRequestDto,
  IActionAssetResponseDto,
  IAssetGetBaseResponseDto,
} from '@features/asset-management/types/asset.dto';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import {
  EButtonActionType,
  ETableActionTypeValue,
  IDialogActionHandler,
  IEnhancedForm,
} from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-action-asset',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-asset.component.html',
  styleUrl: './action-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionAssetComponent implements OnInit, IDialogActionHandler {
  private readonly formService = inject(FormService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly assetService = inject(AssetService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAssetGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected form!: IEnhancedForm;
  protected readonly EButtonActionTypeEnum = EButtonActionType;

  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to perform action on asset but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm(ACTION_ASSET_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: null,
      context: {
        actionType,
      },
    });
  }

  onDialogAccept(): void {
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: IAssetGetBaseResponseDto[]): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeAssetAction(formData);
  }

  private prepareFormData(
    record: IAssetGetBaseResponseDto[]
  ): IActionAssetRequestDto {
    const { assetAssignee, assetImages, comment } = this.form.getData() as {
      assetAssignee: string;
      assetImages: File[];
      comment: string;
    };

    let actionTypeValue: ETableActionTypeValue | undefined;

    if (this.dialogActionType() === EButtonActionType.HANDOVER_INITIATE) {
      actionTypeValue = ETableActionTypeValue.HANDOVER_INITIATED;
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_ACCEPTED
    ) {
      actionTypeValue = ETableActionTypeValue.HANDOVER_ACCEPTED;
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_REJECTED
    ) {
      actionTypeValue = ETableActionTypeValue.HANDOVER_REJECTED;
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_CANCELLED
    ) {
      actionTypeValue = ETableActionTypeValue.HANDOVER_CANCELLED;
    } else if (this.dialogActionType() === EButtonActionType.DEALLOCATE) {
      actionTypeValue = ETableActionTypeValue.DEALLOCATED;
    }

    return {
      assetId: record[0].id,
      action: actionTypeValue as unknown as string,
      toUserId: assetAssignee,
      assetFiles: assetImages,
      metadata: {
        remark: comment,
      },
    };
  }

  private executeAssetAction(formData: IActionAssetRequestDto): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.HANDOVER_INITIATE) {
      loadingMessage = {
        title: 'Initiating Handover',
        message: 'Please wait while we initiate the handover...',
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_ACCEPTED
    ) {
      loadingMessage = {
        title: 'Accepting Handover',
        message: 'Please wait while we accept the handover...',
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_REJECTED
    ) {
      loadingMessage = {
        title: 'Rejecting Handover',
        message: 'Please wait while we reject the handover...',
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_CANCELLED
    ) {
      loadingMessage = {
        title: 'Cancelling Handover',
        message: 'Please wait while we cancel the handover...',
      };
    } else if (this.dialogActionType() === EButtonActionType.DEALLOCATE) {
      loadingMessage = {
        title: 'Deallocating Asset',
        message: 'Please wait while we deallocate the asset...',
      };
    }

    this.isSubmitting.set(true);
    this.loadingService.show(loadingMessage);
    this.form.disable();

    this.assetService
      .actionAsset(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IActionAssetResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Action asset form validation failed');
      return false;
    }
    return true;
  }
}
