import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import {
  IExpenseDetailGetRequestDto,
  IExpenseDetailGetResponseDto,
  IExpenseGetBaseResponseDto,
} from '@features/expense-management/types/expense.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-get-expense-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-expense-detail.component.html',
  styleUrl: './get-expense-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetExpenseDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    expense: IExpenseGetBaseResponseDto;
  };
  private readonly expenseService = inject(ExpenseService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigService = inject(AppConfigurationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _expenseDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadExpenseDetails();
  }

  private loadExpenseDetails(): void {
    this.loadingService.show({
      title: 'Loading Expense Details',
      message: 'Please wait while we load the expense details...',
    });

    const paramData = this.prepareParamData();

    this.expenseService
      .getExpenseDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IExpenseDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._expenseDetails.set(mappedData);
          this.logger.logUserAction('Attendance history loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IExpenseDetailGetRequestDto {
    return {
      id: this.drawerData.expense.id,
    };
  }

  private mapDetailData(
    response: IExpenseDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = [...response.history].reverse().map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Date',
          value: record.expenseDate,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Category',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.expenseCategories(),
            record.category
          ),
        },
        {
          label: 'Amount',
          value: record.amount,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          metadata: {
            transactionType: record.transactionType,
          },
        },
        {
          label: 'Payment Mode',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.expensePaymentMethods(),
            record.paymentMode
          ),
        },
        {
          label: 'Transaction ID',
          value: record.transactionId,
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
          approvalStatus: record.approvalStatus,
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
    const { user } = this.drawerData.expense;
    return {
      name: `${user.firstName} ${user.lastName}`,
      subtitle: user.employeeId ?? 'N/A',
    };
  }
}
