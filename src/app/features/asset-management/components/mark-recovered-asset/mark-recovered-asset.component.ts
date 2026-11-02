import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MARK_RECOVERED_ASSET_FORM_CONFIG } from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IAssetGetBaseResponseDto,
  ILostRecoveryAssetResponseDto,
  IMarkRecoveredAssetFormDto,
} from '@features/asset-management/types/asset.dto';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-mark-recovered-asset',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './mark-recovered-asset.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkRecoveredAssetComponent
  extends FormBase<IMarkRecoveredAssetFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly assetService = inject(AssetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAssetGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const [record] = this.selectedRecord() ?? [];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to mark an asset as recovered but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IMarkRecoveredAssetFormDto>(
      MARK_RECOVERED_ASSET_FORM_CONFIG,
      { destroyRef: this.destroyRef }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.form.getData();
    const [record] = this.selectedRecord();

    this.loadingService.show({
      title: 'Marking asset as recovered',
      message: "We're recording the recovery. This will just take a moment.",
    });
    this.form.disable();

    this.assetService
      .markAssetRecovered(record.id, formData)
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
