import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  IVehicleServiceDetailGetFormDto,
  IVehicleServiceDetailGetResponseDto,
  IVehicleServiceGetBaseResponseDto,
} from '../../types/vehicle-service.dto';
import { VehicleServiceService } from '../../services/vehicle-service.service';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';

@Component({
  selector: 'app-get-vehicle-service-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-vehicle-service-detail.component.html',
  styleUrl: './get-vehicle-service-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVehicleServiceDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    vehicleService: IVehicleServiceGetBaseResponseDto;
  };
  private readonly vehicleServiceService = inject(VehicleServiceService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigService = inject(AppConfigurationService);

  protected readonly _vehicleServiceDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadVehicleServiceDetails();
  }

  private loadVehicleServiceDetails(): void {
    this.loadingService.show({
      title: 'Loading Vehicle Service Details',
      message: 'Please wait while we load the vehicle service details...',
    });

    const paramData = this.prepareParamData();

    this.vehicleServiceService
      .getVehicleServiceDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleServiceDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._vehicleServiceDetails.set(mappedData);
          this.logger.logUserAction(
            'Vehicle service details loaded successfully'
          );
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IVehicleServiceDetailGetFormDto {
    return {
      vehicleServiceId: this.drawerData.vehicleService.id,
    };
  }

  private mapDetailData(
    response: IVehicleServiceDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const responseData = [response];
    const mappedDetails = responseData.map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        // {
        //   label: 'Date',
        //   value: record.expenseDate,
        //   type: EDataType.DATE,
        //   format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        // },
        // {
        //   label: 'Category',
        //   value: getMappedValueFromArrayOfObjects(
        //     this.appConfigurationService.expenseCategories(),
        //     record.category
        //   ),
        // },
        // {
        //   label: 'Amount',
        //   value: record.amount,
        //   type: EDataType.CURRENCY,
        //   format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        //   metadata: {
        //     transactionType: record.transactionType,
        //   },
        // },
        // {
        //   label: 'Payment Mode',
        //   value: getMappedValueFromArrayOfObjects(
        //     this.appConfigurationService.expensePaymentMethods(),
        //     record.paymentMode
        //   ),
        // },
        // {
        //   label: 'Transaction ID',
        //   value: record.transactionId,
        // },
        // {
        //   label: 'Attachment(s)',
        //   value: record.fileKeys,
        //   type: EDataType.ATTACHMENTS,
        // },
      ];

      return {
        entryData,
        createdBy: {
          user: record.createdByUser,
          date: record.createdAt,
          notes: record.remarks,
        },
        // updatedBy: {
        //   user: record.updatedByUser,
        //   date: record.updatedAt,
        // },
      };
    });

    return {
      details: mappedDetails,
      entity: this.getEmployeeDetails(),
    };
  }

  protected getEmployeeDetails(): IEntityViewDetails {
    const { vehicle } = this.drawerData.vehicleService;
    return {
      name: `${vehicle.registrationNo}`,
      subtitle: `${vehicle.brand} ${vehicle.model}`,
    };
  }
}
