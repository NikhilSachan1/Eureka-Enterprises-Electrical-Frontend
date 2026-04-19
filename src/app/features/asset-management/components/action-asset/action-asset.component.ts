import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ACTION_ASSET_FORM_CONFIG } from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IActionAssetFormDto,
  IActionAssetResponseDto,
  IActionAssetUIFormDto,
  IAssetGetBaseResponseDto,
} from '@features/asset-management/types/asset.dto';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import {
  EButtonActionType,
  ETableActionTypeValue,
  IDialogActionHandler,
} from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-action-asset',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-asset.component.html',
  styleUrl: './action-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionAssetComponent
  extends FormBase<IActionAssetUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly assetService = inject(AssetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAssetGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

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
    this.form = this.formService.createForm<IActionAssetUIFormDto>(
      ACTION_ASSET_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          actionType,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAssetAction(formData);
  }

  private prepareFormData(): IActionAssetFormDto {
    const formData = this.form.getData();

    let actionTypeValue!: ETableActionTypeValue;

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

    const { id: assetId } = this.selectedRecord()[0];

    return {
      ...formData,
      assetId,
      actionType: actionTypeValue,
    };
  }

  private executeAssetAction(formData: IActionAssetFormDto): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.HANDOVER_INITIATE) {
      loadingMessage = {
        title: 'Starting handover',
        message: "We're starting the handover. This will just take a moment.",
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_ACCEPTED
    ) {
      loadingMessage = {
        title: 'Accepting Handover',
        message: "We're accepting the handover. This will just take a moment.",
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_REJECTED
    ) {
      loadingMessage = {
        title: 'Rejecting handover',
        message: "We're rejecting the handover. This will just take a moment.",
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_CANCELLED
    ) {
      loadingMessage = {
        title: 'Cancelling handover',
        message: "We're cancelling the handover. This will just take a moment.",
      };
    } else if (this.dialogActionType() === EButtonActionType.DEALLOCATE) {
      loadingMessage = {
        title: 'Deallocating asset',
        message: "We're deallocating this asset. This will just take a moment.",
      };
    }

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
}
