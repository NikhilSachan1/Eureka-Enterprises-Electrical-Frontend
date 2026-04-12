import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  IFuelExpenseDetailGetRequestDto,
  IFuelExpenseDetailGetResponseDto,
  IFuelExpenseGetBaseResponseDto,
} from '../../types/fuel-expense.dto';
import { AppConfigurationService, LoadingService } from '@shared/services';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';

@Component({
  selector: 'app-get-fuel-expense-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-fuel-expense-detail.component.html',
  styleUrl: './get-fuel-expense-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetFuelExpenseDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    fuelExpense: IFuelExpenseGetBaseResponseDto;
  };
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigService = inject(AppConfigurationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _fuelExpenseDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadFuelExpenseDetails();
  }

  private loadFuelExpenseDetails(): void {
    this.loadingService.show({
      title: 'Loading Fuel Expense Details',
      message: 'Please wait while we load the fuel expense details...',
    });

    const paramData = this.prepareParamData();

    this.fuelExpenseService
      .getFuelExpenseDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IFuelExpenseDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._fuelExpenseDetails.set(mappedData);
          this.logger.logUserAction('Fuel expense details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IFuelExpenseDetailGetRequestDto {
    return {
      id: this.drawerData.fuelExpense.id,
    };
  }

  private mapDetailData(
    response: IFuelExpenseDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = response.history.reverse().map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Date',
          value: record.fillDate,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Amount',
          value: record.fuelAmount,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          metadata: {
            transactionType: record.transactionType,
          },
        },
        {
          label: 'Payment Mode',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.fuelExpensePaymentMethods(),
            record.paymentMode
          ),
        },
        {
          label: 'Transaction ID',
          value: record.transactionId,
        },
        {
          label: 'Odometer',
          value: record.odometerKm,
          suffix: 'km',
          type: EDataType.NUMBER,
          format: APP_CONFIG.NUMBER_FORMATS.FLEXIBLE_DECIMALS,
        },
        {
          label: 'Fuel Qty.',
          value: record.fuelLiters,
          suffix: 'L',
          type: EDataType.NUMBER,
          format: APP_CONFIG.NUMBER_FORMATS.FLEXIBLE_DECIMALS,
        },
        {
          label: 'Vehicle Number',
          value: record.vehicle?.registrationNo ?? '',
        },
        {
          label: 'Petro Card Number',
          value: record.card?.cardNumber ?? '',
        },
        {
          label: 'Attachment(s)',
          value: record.fileKeys,
          type: EDataType.ATTACHMENTS,
        },
      ];

      return {
        status: {
          entryType: record.expenseEntryType,
          approvalStatus: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.approvalStatus(),
            record.approvalStatus
          ),
        },
        entryData,
        approvalBy: {
          user: record.approvalByUser,
          date: record.approvalAt,
          notes: record.approvalReason,
        },
        createdBy: {
          user: record.createdByUser,
          date: record.createdAt,
          notes: record.description,
        },
        updatedBy: {
          user: record.updatedByUser,
          date: record.updatedAt,
        },
      };
    });

    return {
      details: mappedDetails,
      entity: this.getEmployeeDetails(),
    };
  }

  protected getEmployeeDetails(): IEntityViewDetails {
    const { user } = this.drawerData.fuelExpense;
    return {
      name: `${user.firstName} ${user.lastName}`,
      subtitle: user.employeeId ?? 'N/A',
    };
  }
}
