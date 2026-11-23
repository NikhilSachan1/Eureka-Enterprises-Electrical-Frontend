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
import { AppConfigurationService } from '@shared/services';
import {
  IPaymentReceipt,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { PaymentReceiptComponent } from '@shared/components/payment-receipt/payment-receipt.component';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  getMappedValueFromArrayOfObjects,
  mapPaidFromAccountToBankDetails,
} from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { AppPermissionService } from '@core/services';

@Component({
  selector: 'app-get-expense-detail',
  imports: [ViewDetailComponent, PaymentReceiptComponent],
  templateUrl: './get-expense-detail.component.html',
  styleUrl: './get-expense-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetExpenseDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    expense: IExpenseGetBaseResponseDto;
  };
  private readonly expenseService = inject(ExpenseService);
  protected readonly appConfigService = inject(AppConfigurationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly permissionService = inject(AppPermissionService);

  protected readonly _expenseDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadExpenseDetails();
  }

  private loadExpenseDetails(): void {
    this.setDrawerLoading(true);
    const paramData = this.prepareParamData();

    this.expenseService
      .getExpenseDetailById(paramData)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IExpenseDetailGetResponseDto) => {
          this.appConfigurationService.runAfterTouchedConfiguration(
            () => this.mapDetailData(response),
            mappedData => this._expenseDetails.set(mappedData)
          );
          this.logger.logUserAction('Attendance history loaded successfully');
        },
        error: error => {
          this.logger.error('Failed to load expense details', error);
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
          label: 'Payment',
          value: {
            mode: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.expensePaymentMethods(),
              record.paymentMode
            ),
            reference: record.transactionId,
            referenceLabel: 'Transaction ID',
            // The account stays behind its own permission, as its separate row was.
            paidFrom:
              record.paidFromAccount &&
              this.permissionService.hasAnyPermission([
                APP_PERMISSION.UI.EXPENSE.SEARCH_FILTER_PAID_FROM_ACCOUNT,
              ])
                ? mapPaidFromAccountToBankDetails(record.paidFromAccount)
                : null,
          } satisfies IPaymentReceipt,
          customTemplateKey: 'paymentReceipt',
          detailTemplateFullRow: true,
          detailTemplatePlain: true,
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
