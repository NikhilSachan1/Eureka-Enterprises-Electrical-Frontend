import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IAssetDeleteFormDto,
  IAssetDeleteResponseDto,
  IAssetGetBaseResponseDto,
} from '@features/asset-management/types/asset.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-asset',
  imports: [],
  templateUrl: './delete-asset.component.html',
  styleUrl: './delete-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAssetComponent
  extends FormBase<IAssetDeleteFormDto>
  implements OnInit
{
  private readonly assetService = inject(AssetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<IAssetGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete asset but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeAssetDeleteAction(formData);
  }

  private prepareFormData(
    record: IAssetGetBaseResponseDto[]
  ): IAssetDeleteFormDto {
    return {
      assetIds: record.map((row: IAssetGetBaseResponseDto) => row.id),
    };
  }

  private executeAssetDeleteAction(formData: IAssetDeleteFormDto): void {
    const loadingMessage = {
      title: 'Removing asset',
      message: "We're removing this asset. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.assetService
      .deleteAsset(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAssetDeleteResponseDto) => {
          this.notificationService.bulkOperationFromResponse(response, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) =>
                count === 1
                  ? 'Asset deleted successfully.'
                  : `Successfully deleted ${count} assets.`,
              error: 'Failed to delete asset.',
              empty: 'Failed to delete asset.',
            },
          });

          this.appConfigurationService.refreshAssetDropdowns();

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete asset.', error);
          this.notificationService.error('Failed to delete asset.');
        },
      });
  }
}
