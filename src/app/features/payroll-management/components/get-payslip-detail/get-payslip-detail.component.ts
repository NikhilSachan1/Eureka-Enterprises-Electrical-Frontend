import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppConfigService } from '@core/services';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  IPayslipDetailGetRequestDto,
  IPayslipDetailGetResponseDto,
  IPayslipGetBaseResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { formatMonthYear } from '@shared/utility';
import { finalize } from 'rxjs';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-get-payslip-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-payslip-detail.component.html',
  styleUrl: './get-payslip-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPayslipDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    payslip: IPayslipGetBaseResponseDto;
  };
  private readonly payrollService = inject(PayrollService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigService = inject(AppConfigService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _payslipDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadPayslipDetails();
  }

  private loadPayslipDetails(): void {
    this.loadingService.show({
      title: 'Loading Payslip Details',
      message: 'Please wait while we load the payslip details...',
    });

    const paramData = this.prepareParamData();

    this.payrollService
      .getPayslipDetailById(paramData.payslipId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPayslipDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._payslipDetails.set(mappedData);
          this.logger.logUserAction('Payslip details loaded successfully');
        },
        error: error => {
          this.logger.logUserAction('Payslip details loading failed', error);
        },
      });
  }

  private prepareParamData(): IPayslipDetailGetRequestDto {
    return {
      payslipId: this.drawerData.payslip.id,
    };
  }

  private mapDetailData(
    response: IPayslipDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const responseData = [response];

    const mappedDetails = responseData.map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Period',
          value: formatMonthYear(record.month, record.year),
        },
        {
          label: 'Total Days',
          value: record.totalDays,
        },
        {
          label: 'Working Days',
          value: record.workingDays,
        },
        {
          label: 'Present Days',
          value: record.presentDays,
        },
        {
          label: 'Absent Days',
          value: record.absentDays,
        },
        {
          label: 'Paid Leave',
          value: record.paidLeaveDays,
        },
        {
          label: 'Holidays',
          value: record.holidays,
        },
        {
          label: 'Holidays Worked',
          value: record.holidaysWorked,
        },
        {
          label: 'Basic Salary',
          value: record.basicProrated,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
        {
          label: 'HRA',
          value: record.hraProrated,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
        {
          label: 'Employee PF',
          value: record.employeePf,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
        {
          label: 'Employer PF',
          value: record.employerPf,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
        {
          label: 'ESIC',
          value: record.esic,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
        {
          label: 'TDS',
          value: record.tds,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
        {
          label: 'Gross Earnings',
          value: record.grossEarnings,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
        {
          label: 'Total Deductions',
          value: record.totalDeductions,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
        {
          label: 'Net Payable',
          value: record.netPayable,
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        },
      ];

      return {
        status: {
          approvalStatus: record.status,
        },
        entryData,
        approvalBy: {
          name:
            `${record.approver?.firstName ?? ''} ${record.approver?.lastName ?? ''}`.trim() ||
            'N/A',
          date: record.approvedAt,
          notes: record.remarks,
        },
      };
    });

    return {
      details: mappedDetails,
      entity: this.getEmployeeDetails(),
    };
  }

  protected getEmployeeDetails(): IEntityViewDetails {
    const { user } = this.drawerData.payslip;
    return {
      name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`,
      subtitle: user?.employeeId ?? 'N/A',
    };
  }
}
