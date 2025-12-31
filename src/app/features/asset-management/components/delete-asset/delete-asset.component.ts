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
import { LoggerService } from '@core/services';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IAssetDeleteRequestDto,
  IAssetDeleteResponseDto,
  IAssetGetBaseResponseDto,
} from '@features/asset-management/types/asset.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { EButtonActionType } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-asset',
  imports: [],
  templateUrl: './delete-asset.component.html',
  styleUrl: './delete-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAssetComponent implements OnInit {
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
  protected readonly onSuccess = input<() => void>();

  protected readonly isSubmitting = signal(false);

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
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: IAssetGetBaseResponseDto[]): void {
    if (this.isSubmitting()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeAssetDeleteAction(formData);
  }

  private prepareFormData(
    record: IAssetGetBaseResponseDto[]
  ): IAssetDeleteRequestDto {
    return {
      assetIds: record.map((row: IAssetGetBaseResponseDto) => row.id),
    };
  }

  private executeAssetDeleteAction(formData: IAssetDeleteRequestDto): void {
    const loadingMessage = {
      title: 'Deleting Asset',
      message: 'Please wait while we delete the asset...',
    };
    this.isSubmitting.set(true);
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
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'asset',
            actionLabel: EButtonActionType.DELETE,
            errors,
            result,
          });

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
