import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { VehicleReadingService } from '../../services/vehicle-reading.service';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  IvehicleReadingDetailGetFormDto,
  IVehicleReadingDetailGetResponseDto,
  IVehicleReadingGetBaseResponseDto,
} from '../../types/vehicle-reading.dto';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { APP_CONFIG } from '@core/config';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-get-vehicle-reading-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-vehicle-reading-detail.component.html',
  styleUrl: './get-vehicle-reading-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleReadingDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    vehicleReading: IVehicleReadingGetBaseResponseDto;
  };
  private readonly vehicleReadingService = inject(VehicleReadingService);
  private readonly loadingService = inject(LoadingService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _vehicleReadingDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadVehicleReadingDetails();
  }

  private loadVehicleReadingDetails(): void {
    this.loadingService.show({
      title: 'Loading Vehicle Reading Details',
      message: 'Please wait while we load the vehicle reading details...',
    });

    const paramData = this.prepareParamData();

    this.vehicleReadingService
      .getVehicleReadingDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleReadingDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._vehicleReadingDetails.set(mappedData);
          this.logger.logUserAction(
            'Vehicle reading details loaded successfully'
          );
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IvehicleReadingDetailGetFormDto {
    return {
      vehicleReadingId: this.drawerData.vehicleReading.id,
    };
  }

  private mapDetailData(
    response: IVehicleReadingDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = [response].map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Reading Date',
          value: record.logDate,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Meter Reading',
          value: [
            record.startOdometerReading?.toString() ?? '0',
            record.endOdometerReading?.toString() ?? '0',
          ],
          suffix: 'km',
          type: EDataType.RANGE,
          dataType: EDataType.NUMBER,
          format: APP_CONFIG.NUMBER_FORMATS.FLEXIBLE_DECIMALS,
        },
        {
          label: 'Duration',
          value: [record.startTime ?? '00:00:00', record.endTime ?? '00:00:00'],
          type: EDataType.RANGE,
          dataType: EDataType.TIME,
          format: APP_CONFIG.TIME_FORMATS.DEFAULT,
        },
        {
          label: 'Location',
          value: [record.startLocation ?? '', record.endLocation ?? ''],
          type: EDataType.RANGE,
        },
        {
          label: 'Total Distance',
          value: record.totalKmTraveled,
          suffix: 'km',
          type: EDataType.NUMBER,
          format: APP_CONFIG.NUMBER_FORMATS.FLEXIBLE_DECIMALS,
        },
        {
          label: 'Anomaly Reason',
          value: record.anomalyReason,
          type: EDataType.TEXT_WITH_READ_MORE,
        },
        {
          label: 'Driver Detail',
          value: `${record.driver.firstName} ${record.driver.lastName}`,
          type: EDataType.TEXT,
        },
        {
          label: 'Project Name',
          value: record.site?.name,
          type: EDataType.TEXT,
        },
        {
          label: 'Project Location',
          value: `${record.site?.city ? getMappedValueFromArrayOfObjects(this.appConfigurationService.cities(), record.site.city) : ''}, ${record.site?.state ? getMappedValueFromArrayOfObjects(this.appConfigurationService.states(), record.site.state) : ''}`,
          type: EDataType.TEXT,
        },
        {
          label: 'Attachments',
          value: record.documentKeys,
          type: EDataType.ATTACHMENTS,
        },
      ];

      return {
        status: {
          // entryType: record.expenseEntryType,
          approvalStatus: record.anomalyDetected
            ? 'Anomaly Detected'
            : 'Normal',
        },
        entryData,
        createdBy: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          user: record.createdBy as any,
          date: record.createdAt,
          notes: record.driverRemarks,
        },
        updatedBy: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          user: record.updatedBy as any,
          date: record.updatedAt,
        },
      };
    });

    return {
      details: mappedDetails,
      entity: this.getVehicleReadingDetails(),
    };
  }

  protected getVehicleReadingDetails(): IEntityViewDetails {
    const { vehicle } = this.drawerData.vehicleReading;
    return {
      name: vehicle.registrationNo,
      subtitle: 'N/A',
    };
  }
}
