import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AppConfigService } from '@core/services';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import {
  IExpenseDetailGetRequestDto,
  IExpenseDetailGetResponseDto,
  IExpenseGetBaseResponseDto,
} from '@features/expense-management/types/expense.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { LoadingService } from '@shared/services';
import {
  EDrawerDetailType,
  IDrawerDetail,
  IDrawerEmployeeDetails,
} from '@shared/types';
import { ViewDetailDrawerComponent } from '@shared/components/view-detail-drawer/view-detail-drawer.component';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import {
  EXPENSE_CATEGORY_DATA,
  EXPENSE_PAYMENT_METHOD_DATA,
} from '@shared/config/static-data.config';

@Component({
  selector: 'app-get-expense-detail',
  imports: [ViewDetailDrawerComponent],
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
  protected readonly appConfigService = inject(AppConfigService);

  protected readonly _employeeDetails = computed(() =>
    this.getEmployeeDetails()
  );
  protected readonly _expenseDetails = signal<IDrawerDetail[]>([]);

  protected readonly ALL_DRAWER_DETAIL_TYPES = EDrawerDetailType;

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
  ): IDrawerDetail[] {
    return response.history.map(record => {
      const entryData: IDrawerDetail['entryData'] = [
        {
          label: 'Date',
          value: record.expenseDate,
          type: EDrawerDetailType.DATE,
          format: this.appConfigService.dateFormats.DEFAULT,
        },
        {
          label: 'Category',
          value: getMappedValueFromArrayOfObjects(
            EXPENSE_CATEGORY_DATA,
            record.category
          ),
          type: EDrawerDetailType.NOTES,
        },
        {
          label: 'Amount',
          value: record.amount,
          type: EDrawerDetailType.CURRENCY,
          format: this.appConfigService.currencyConfig.DEFAULT,
          metadata: {
            transactionType: record.transactionType,
          },
        },
        {
          label: 'Payment Mode',
          value: getMappedValueFromArrayOfObjects(
            EXPENSE_PAYMENT_METHOD_DATA,
            record.paymentMode
          ),
          type: EDrawerDetailType.NOTES,
        },
        {
          label: 'Description',
          value: record.description,
          type: EDrawerDetailType.NOTES,
        },
        {
          label: 'Transaction ID',
          value: record.transactionId,
          type: EDrawerDetailType.NOTES,
        },
        {
          label: 'Status',
          value: record.approvalStatus,
          type: EDrawerDetailType.STATUS,
        },
        {
          label: 'Attachments',
          value: record.fileKeys,
          type: EDrawerDetailType.ATTACHMENTS,
        },
      ];

      return {
        status: {
          entryType: record.expenseEntryType,
          approvalStatus: record.approvalStatus,
        },
        entryData,
        approvalBy: {
          name:
            `${record.approvalByUser?.firstName ?? ''} ${record.approvalByUser?.lastName ?? ''}`.trim() ||
            'N/A',
          date: record.approvalAt,
          notes: record.approvalReason,
        },
        createdBy: {
          name: `${record.createdByUser.firstName} ${record.createdByUser.lastName}`,
          date: record.createdAt,
        },
        updatedBy: {
          name: record.updatedByUser
            ? `${record.updatedByUser.firstName} ${record.updatedByUser.lastName}`
            : 'N/A',
          date: record.updatedAt ?? 'N/A',
        },
      };
    });
  }

  protected getEmployeeDetails(): IDrawerEmployeeDetails {
    const { user } = this.drawerData.expense;
    return {
      name: `${user.firstName} ${user.lastName}`,
      employeeCode: user.employeeId ?? 'N/A',
    };
  }
}
