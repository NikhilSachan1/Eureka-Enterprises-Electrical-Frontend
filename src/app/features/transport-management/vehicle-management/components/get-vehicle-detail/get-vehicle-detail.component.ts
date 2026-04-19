import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { VehicleService } from '../../services/vehicle.service';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import {
  IvehicleDetailGetFormDto,
  IVehicleDetailGetResponseDto,
  IVehicleGetBaseResponseDto,
} from '../../types/vehicle.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-get-vehicle-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-vehicle-detail.component.html',
  styleUrl: './get-vehicle-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    vehicle: IVehicleGetBaseResponseDto;
  };
  private readonly vehicleService = inject(VehicleService);
  private readonly loadingService = inject(LoadingService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _vehicleDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadVehicleDetails();
  }

  private loadVehicleDetails(): void {
    this.loadingService.show({
      title: 'Loading Vehicle Details',
      message:
        "We're loading the vehicle details. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.vehicleService
      .getVehicleDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._vehicleDetails.set(mappedData);
          this.logger.logUserAction('Vehicle details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IvehicleDetailGetFormDto {
    return {
      vehicleId: this.drawerData.vehicle.id,
    };
  }

  private mapDetailData(
    response: IVehicleDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = response.versionHistory.reverse().map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Vehicle Number',
          value: record.registrationNo,
        },
        {
          label: 'Brand',
          value: record.brand,
        },
        {
          label: 'Model',
          value: record.model,
        },
        {
          label: 'Fuel Type',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.vehicleFuelTypes(),
            record.fuelType
          ),
        },
        {
          label: 'Mileage',
          value: `${record.mileage} ${APP_CONFIG.VEHICLE_CONFIG.MILEAGE_UNIT}`,
        },
        {
          label: 'Purchase Date',
          value: record.purchaseDate,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Dealer Name',
          value: record.dealerName,
        },
        {
          label: 'Insurance Period',
          value: [record.insuranceStartDate, record.insuranceEndDate],
          type: EDataType.RANGE,
          dataType: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'PUC Period',
          value: [record.pucStartDate, record.pucEndDate],
          type: EDataType.RANGE,
          dataType: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Last Service Date',
          value: record.lastServiceDate,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Last Service KM',
          value: record.lastServiceKm,
          type: EDataType.NUMBER,
          format: APP_CONFIG.NUMBER_FORMATS.DEFAULT,
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
      entity: this.getVehicleDetails(),
    };
  }

  protected getVehicleDetails(): IEntityViewDetails {
    const { brand, registrationNo, model } = this.drawerData.vehicle;
    return {
      name: registrationNo,
      subtitle: `${brand} ${model}`,
    };
  }
}
