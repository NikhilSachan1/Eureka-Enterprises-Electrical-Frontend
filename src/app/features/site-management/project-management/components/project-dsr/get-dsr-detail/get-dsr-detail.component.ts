import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DsrService } from '@features/site-management/project-management/services/dsr.service';
import {
  IDsrHistoryGetFormDto,
  IDsrHistoryGetResponseDto,
} from '@features/site-management/project-management/types/project.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-get-dsr-detail',
  imports: [],
  templateUrl: './get-dsr-detail.component.html',
  styleUrl: './get-dsr-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    dsr: IDsrHistoryGetResponseDto;
  };
  private readonly dsrService = inject(DsrService);
  private readonly loadingService = inject(LoadingService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _dsrHistoryDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadDsrHistoryDetails();
  }

  private loadDsrHistoryDetails(): void {
    this.loadingService.show({
      title: 'Loading Dsr History Details',
      message: 'Please wait while we load the dsr history details...',
    });

    const paramData = this.prepareParamData();

    this.dsrService
      .getDsrHistory(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrHistoryGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._dsrHistoryDetails.set(mappedData);
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IDsrHistoryGetFormDto {
    return {
      dsrId: this.drawerData.dsr.id,
    };
  }

  private mapDetailData(
    response: IDsrHistoryGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = [response].map(_record => {
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
        // status: {
        //   entryType: record.expenseEntryType,
        //   approvalStatus: record.approvalStatus,
        // },
        entryData,
        // approvalBy: {
        //   user: record.approvalByUser,
        //   date: record.approvalAt,
        //   notes: record.approvalReason,
        // },
        // createdBy: {
        //   user: record.createdByUser,
        //   date: record.createdAt,
        //   notes: record.description,
        // },
      };
    });

    return {
      details: mappedDetails,
      entity: this.getEmployeeDetails(),
    };
  }

  protected getEmployeeDetails(): IEntityViewDetails {
    // const { user: _user } = this.drawerData.dsr;
    return {
      name: 'John Doe', // TODO: Replace hard-coded name with created by user name once created by user mapping is available from backend.
      subtitle: 'N/A',
    };
  }
}
