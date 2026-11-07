import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import {
  ACTION_ASSET_FORM_CONFIG,
  isReturnPending,
} from '@features/asset-management/config';
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

  private static readonly LOADING_MESSAGES: Partial<
    Record<ETableActionTypeValue, { title: string; message: string }>
  > = {
    [ETableActionTypeValue.HANDOVER_INITIATED]: {
      title: 'Starting handover',
      message: "We're starting the handover. This will just take a moment.",
    },
    [ETableActionTypeValue.HANDOVER_ACCEPTED]: {
      title: 'Accepting Handover',
      message: "We're accepting the handover. This will just take a moment.",
    },
    [ETableActionTypeValue.HANDOVER_REJECTED]: {
      title: 'Rejecting handover',
      message: "We're rejecting the handover. This will just take a moment.",
    },
    [ETableActionTypeValue.HANDOVER_CANCELLED]: {
      title: 'Cancelling handover',
      message: "We're cancelling the handover. This will just take a moment.",
    },
    [ETableActionTypeValue.RETURN_INITIATED]: {
      title: 'Starting return',
      message:
        "We're sending the return request to the office. This will just take a moment.",
    },
    [ETableActionTypeValue.RETURN_ACCEPTED]: {
      title: 'Accepting return',
      message: "We're accepting the return. This will just take a moment.",
    },
    [ETableActionTypeValue.RETURN_REJECTED]: {
      title: 'Rejecting return',
      message: "We're rejecting the return. This will just take a moment.",
    },
    [ETableActionTypeValue.RETURN_CANCELLED]: {
      title: 'Cancelling return',
      message: "We're cancelling the return. This will just take a moment.",
    },
    [ETableActionTypeValue.DEALLOCATED]: {
      title: 'Deallocating asset',
      message: "We're deallocating this asset. This will just take a moment.",
    },
    [ETableActionTypeValue.RETIRED]: {
      title: 'Retiring asset',
      message: "We're retiring this asset. This will just take a moment.",
    },
  };

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
    const { id: assetId } = this.selectedRecord()[0];

    return {
      ...formData,
      assetId,
      actionType: this.resolveActionTypeValue(),
    };
  }

  /** Accept, reject and cancel are shared with handover: on a pending return they send the return event instead. */
  private resolveActionTypeValue(): ETableActionTypeValue {
    const forReturn = isReturnPending(this.selectedRecord()[0]);
    const actionTypeValues: Partial<
      Record<EButtonActionType, ETableActionTypeValue>
    > = {
      [EButtonActionType.HANDOVER_INITIATE]:
        ETableActionTypeValue.HANDOVER_INITIATED,
      [EButtonActionType.RETURN_TO_OFFICE]:
        ETableActionTypeValue.RETURN_INITIATED,
      [EButtonActionType.HANDOVER_ACCEPTED]: forReturn
        ? ETableActionTypeValue.RETURN_ACCEPTED
        : ETableActionTypeValue.HANDOVER_ACCEPTED,
      [EButtonActionType.HANDOVER_REJECTED]: forReturn
        ? ETableActionTypeValue.RETURN_REJECTED
        : ETableActionTypeValue.HANDOVER_REJECTED,
      [EButtonActionType.HANDOVER_CANCELLED]: forReturn
        ? ETableActionTypeValue.RETURN_CANCELLED
        : ETableActionTypeValue.HANDOVER_CANCELLED,
      [EButtonActionType.DEALLOCATE]: ETableActionTypeValue.DEALLOCATED,
      [EButtonActionType.RETIRED]: ETableActionTypeValue.RETIRED,
    };

    return actionTypeValues[this.dialogActionType()] as ETableActionTypeValue;
  }

  private executeAssetAction(formData: IActionAssetFormDto): void {
    const loadingMessage =
      ActionAssetComponent.LOADING_MESSAGES[
        formData.actionType as ETableActionTypeValue
      ];

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
