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
  IAssetExportReportFormDto,
  IAssetExportReportResponseDto,
  IAssetGetBaseResponseDto,
} from '@features/asset-management/types/asset.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService, GalleryService } from '@shared/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-export-asset',
  imports: [],
  templateUrl: './export-asset.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportAssetComponent
  extends FormBase<IAssetExportReportFormDto>
  implements OnInit
{
  private readonly assetService = inject(AssetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly galleryService = inject(GalleryService);

  protected readonly selectedRecord =
    input.required<IAssetGetBaseResponseDto[]>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to export asset report but was not provided'
      );
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    if (formData.assetMasterIds.length === 0) {
      this.notificationService.warning(
        'Select at least one asset to export.'
      );
      this.isSubmitting.set(false);
      return;
    }

    this.executeAssetExportAction(formData);
  }

  private prepareFormData(
    record: IAssetGetBaseResponseDto[]
  ): IAssetExportReportFormDto {
    return {
      assetMasterIds: record
        .map(row => row.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    };
  }

  private executeAssetExportAction(formData: IAssetExportReportFormDto): void {
    this.loadingService.show({
      title: 'Exporting assets',
      message: 'Preparing the asset report PDF. Please wait…',
    });

    this.assetService
      .exportAssetReportPdf(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAssetExportReportResponseDto) => {
          this.galleryService.show([
            {
              mediaKey: response.key,
              actualMediaUrl: response.url,
            },
          ]);
          this.logger.logUserAction('Asset report exported successfully', {
            count: formData.assetMasterIds.length,
            key: response.key,
          });
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to export asset report.', error);
        },
      });
  }
}
