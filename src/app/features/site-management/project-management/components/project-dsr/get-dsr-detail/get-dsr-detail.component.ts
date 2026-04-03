import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DsrService } from '@features/site-management/project-management/services/dsr.service';
import {
  IDsrDetailGetFormDto,
  IDsrDetailGetResponseDto,
  IDsrGetBaseResponseDto,
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
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';

@Component({
  selector: 'app-get-dsr-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-dsr-detail.component.html',
  styleUrl: './get-dsr-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    dsr: IDsrGetBaseResponseDto;
  };
  private readonly dsrService = inject(DsrService);
  private readonly loadingService = inject(LoadingService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _dsrDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadDsrDetails();
  }

  private loadDsrDetails(): void {
    this.loadingService.show({
      title: 'Loading DSR Details',
      message: 'Please wait while we load the DSR details...',
    });

    const paramData = this.prepareParamData();

    this.dsrService
      .getDsrDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._dsrDetails.set(mappedData);
          this.logger.logUserAction('DSR details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IDsrDetailGetFormDto {
    return {
      dsrId: this.drawerData.dsr.id,
    };
  }

  private mapDetailData(
    response: IDsrDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = response.editHistory?.map(record => {
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const entryData: IDataViewDetails['entryData'] = [
        // {
        //   label: 'Date',
        //   value: record.reportDate,
        //   type: EDataType.DATE,
        //   format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        // },
        // {
        //   label: 'Work Types',
        //   value: record.workTypes.join(', '),
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
        status: {
          entryType: record.expenseEntryType,
        },
        entryData: [],
        createdBy: {
          user: record.createdByUser,
          date: record.createdAt,
          notes: record.remarks,
        },
      };
    });

    return {
      details: mappedDetails ?? [],
      entity: this.getEmployeeDetails(),
    };
  }

  protected getEmployeeDetails(): IEntityViewDetails {
    const { createdByUser } = this.drawerData.dsr;
    return {
      name: `${createdByUser.firstName} ${createdByUser.lastName}`,
      subtitle: createdByUser.employeeId ?? 'N/A',
    };
  }
}
