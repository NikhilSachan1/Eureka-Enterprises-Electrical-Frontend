import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AssetService } from '@features/asset-management/services/asset.service';
import {
  IAssetDetailGetFormDto,
  IAssetDetailGetResponseDto,
  IAssetGetBaseResponseDto,
} from '@features/asset-management/types/asset.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { finalize } from 'rxjs';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-get-asset-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-asset-detail.component.html',
  styleUrl: './get-asset-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAssetDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    asset: IAssetGetBaseResponseDto;
  };
  private readonly assetService = inject(AssetService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigService = inject(AppConfigurationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _assetDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadAssetDetails();
  }

  private loadAssetDetails(): void {
    this.loadingService.show({
      title: 'Loading Asset Details',
      message: 'Please wait while we load the asset details...',
    });

    const paramData = this.prepareParamData();

    this.assetService
      .getAssetDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAssetDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._assetDetails.set(mappedData);
          this.logger.logUserAction('Asset details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IAssetDetailGetFormDto {
    return {
      assetId: this.drawerData.asset.id,
    };
  }

  private mapDetailData(
    response: IAssetDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = response.versionHistory.map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Asset Name',
          value: record.name,
        },
        {
          label: 'Model',
          value: record.model,
        },
        {
          label: 'Serial Number',
          value: record.serialNumber,
        },
        {
          label: 'Category',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.assetCategories(),
            record.category
          ),
        },
        {
          label: 'Asset Type',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.assetTypes(),
            record.assetType
          ),
        },
        {
          label: 'Calibration From',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.assetCalibrationSources(),
            record.calibrationFrom
          ),
        },
        {
          label: 'Calibration Frequency',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.assetCalibrationFrequencies(),
            record.calibrationFrequency
          ),
        },
        {
          label: 'Calibration Period',
          value: [record.calibrationStartDate, record.calibrationEndDate],
          type: EDataType.DATE_RANGE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Purchase Date',
          value: record.purchaseDate,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Vendor Name',
          value: record.vendorName,
        },
        {
          label: 'Warranty Period',
          value: [record.warrantyStartDate, record.warrantyEndDate],
          type: EDataType.DATE_RANGE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Attachment(s)',
          value: record.documentKeys,
          type: EDataType.ATTACHMENTS,
        },
      ];

      return {
        status: {
          approvalStatus: record.status,
        },
        entryData,
        createdBy: {
          user: record.createdByUser,
          date: record.createdAt,
          notes: record.remarks,
        },
      };
    });

    return {
      details: mappedDetails,
      entity: this.getAssetDetails(),
    };
  }

  protected getAssetDetails(): IEntityViewDetails {
    const { name, assetId } = this.drawerData.asset;
    return {
      name,
      subtitle: assetId,
    };
  }
}
