import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import { SalaryAnnexureComponent } from '@features/payroll-management/shared/components/salary-annexure/salary-annexure.component';
import {
  ISalaryStructureGetBaseResponseDto,
  ISalaryStructureHistoryGetFormDto,
  ISalaryStructureHistoryGetResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import { IEmployeeSalaryRevisionHistoryItem } from '@features/payroll-management/types/payroll.interface';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { ICONS } from '@shared/constants';
import { AvatarService, LoadingService } from '@shared/services';
import { parseAmount } from '@shared/utility';
import { APP_CONFIG } from '@core/config/app.config';
import { IEntityViewDetails } from '@shared/types';
import { PAYROLL_MESSAGES } from '@features/payroll-management/constants';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionDirective } from '@shared/directives/app-permission.directive';
import { EPayrollChangeType } from '@features/payroll-management/types/payroll.enum';

@Component({
  selector: 'app-get-salary-structure-history',
  imports: [
    CardModule,
    Divider,
    DatePipe,
    SalaryAnnexureComponent,
    AppPermissionDirective,
  ],
  templateUrl: './get-salary-structure-history.component.html',
  styleUrl: './get-salary-structure-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetSalaryStructureHistoryComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    salaryStructure: ISalaryStructureGetBaseResponseDto;
  };
  private readonly payrollService = inject(PayrollService);
  private readonly loadingService = inject(LoadingService);
  private readonly avatarService = inject(AvatarService);

  protected readonly _salaryDetails = signal<
    IEmployeeSalaryRevisionHistoryItem[]
  >([]);

  // Date and Currency formats from APP_CONFIG
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;
  protected readonly timeFormat = APP_CONFIG.TIME_FORMATS.DEFAULT;
  protected readonly ICONS = ICONS;
  protected readonly APP_PERMISSION = APP_PERMISSION;

  override onDrawerShow(): void {
    this.loadSalaryDetails();
  }

  private loadSalaryDetails(): void {
    this.loadingService.show({
      title: PAYROLL_MESSAGES.LOADING.SALARY_REVISION_HISTORY,
      message: PAYROLL_MESSAGES.LOADING_MESSAGES.SALARY_REVISION_HISTORY,
    });

    const paramData = this.prepareParamData();

    this.payrollService
      .getSalaryStructureHistory(paramData.salaryStructureId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISalaryStructureHistoryGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._salaryDetails.set(mappedData);
        },
        error: () => {
          this._salaryDetails.set([]);
        },
      });
  }

  private prepareParamData(): ISalaryStructureHistoryGetFormDto {
    return {
      salaryStructureId: this.drawerData.salaryStructure.id,
    };
  }

  private mapDetailData(
    response: ISalaryStructureHistoryGetResponseDto
  ): IEmployeeSalaryRevisionHistoryItem[] {
    return response.map(
      (record: ISalaryStructureHistoryGetResponseDto[number]) => {
        const { newValues, changedByUser, changedAt, reason, changeType } =
          record;

        return {
          earnings: {
            items: [
              { label: 'Basic Salary', value: parseAmount(newValues.basic) },
              { label: 'HRA', value: parseAmount(newValues.hra) },
            ],
            total: parseAmount(newValues.grossSalary),
          },
          deductions: {
            items: [
              {
                label: 'Employee PF',
                value: parseAmount(newValues.employeePf),
              },
              { label: 'TDS', value: parseAmount(newValues.tds) },
              { label: 'ESIC', value: parseAmount(newValues.esic) },
            ],
            total: parseAmount(newValues.totalDeductions),
          },
          employerBenefits: {
            items: [
              {
                label: 'Employer PF',
                value: parseAmount(newValues.employerPf),
              },
              { label: 'ESIC', value: parseAmount(newValues.esic) },
            ],
            total:
              parseAmount(newValues.employerPf) + parseAmount(newValues.esic),
          },
          salarySummary: {
            items: [
              {
                title: PAYROLL_MESSAGES.SUMMARY.NET_SALARY,
                monthlyValue: parseAmount(newValues.netSalary) / 12,
                annualValue: parseAmount(newValues.netSalary),
              },
              {
                title: PAYROLL_MESSAGES.SUMMARY.ANNUAL_CTC,
                monthlyValue: parseAmount(newValues.ctc) / 12,
                annualValue: parseAmount(newValues.ctc),
              },
            ],
          },
          notPartCTC: {
            items: [
              {
                label: 'Food Allowance',
                value: parseAmount(newValues.foodAllowance),
              },
            ],
          },
          effectiveFrom: newValues.effectiveFrom,
          changedByUser: `${changedByUser.firstName} ${changedByUser.lastName}`,
          changedAt,
          reason,
          changeType: this.getChangeTypeLabel(changeType),
          isActive: record.isActive,
        };
      }
    );
  }

  private getChangeTypeLabel(changeType: EPayrollChangeType): string {
    switch (changeType) {
      case EPayrollChangeType.CREATE:
        return 'Initial';
      case EPayrollChangeType.UPDATE:
        return 'Updated';
      case EPayrollChangeType.INCREMENT:
        return 'Increased';
      default:
        return '';
    }
  }

  protected getEmployeeDetails(): IEntityViewDetails {
    const { user } = this.drawerData.salaryStructure;
    if (!user) {
      return {
        name: PAYROLL_MESSAGES.ENTITY.SUBTITLE_NA,
        subtitle: PAYROLL_MESSAGES.ENTITY.SUBTITLE_NA,
      };
    }
    return {
      name: `${user.firstName} ${user.lastName}`,
      subtitle: user.employeeId ?? PAYROLL_MESSAGES.ENTITY.SUBTITLE_NA,
    };
  }

  /**
   * Get avatar URL from employee name using AvatarService
   */
  protected getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }
}
