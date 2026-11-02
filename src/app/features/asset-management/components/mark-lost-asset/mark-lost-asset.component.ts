import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MARK_LOST_ASSET_FORM_CONFIG } from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IAssetGetBaseResponseDto,
  ILostRecoveryAssetResponseDto,
  IMarkLostAssetFormDto,
} from '@features/asset-management/types/asset.dto';
import { EAssetStatus } from '@features/asset-management/types/asset.enum';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-mark-lost-asset',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './mark-lost-asset.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkLostAssetComponent
  extends FormBase<IMarkLostAssetFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly assetService = inject(AssetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAssetGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  /** Recovery can only be charged to someone who holds the asset. */
  protected assigneeName: string | null = null;

  ngOnInit(): void {
    const [record] = this.selectedRecord() ?? [];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to mark an asset as lost but was not provided'
      );
      return;
    }

    if (record.status === EAssetStatus.ASSIGNED) {
      const user = record.assignedToUser;
      this.assigneeName =
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null;
    }
    this.form = this.formService.createForm<IMarkLostAssetFormDto>(
      MARK_LOST_ASSET_FORM_CONFIG,
      { destroyRef: this.destroyRef }
    );

    if (this.assigneeName) {
      const recoveryAmount = this.form.formGroup.get('recoveryAmount');
      recoveryAmount?.addValidators(Validators.required);
      recoveryAmount?.updateValueAndValidity({ emitEvent: false });
    }
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.form.getData();
    const [record] = this.selectedRecord();

    this.loadingService.show({
      title: 'Marking asset as lost',
      message: "We're recording the loss. This will just take a moment.",
    });
    this.form.disable();

    this.assetService
      .markAssetLost(record.id, {
        ...formData,
        // Without an assignee there is nobody to charge.
        recoveryAmount: this.assigneeName ? formData.recoveryAmount : null,
      })
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ILostRecoveryAssetResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
