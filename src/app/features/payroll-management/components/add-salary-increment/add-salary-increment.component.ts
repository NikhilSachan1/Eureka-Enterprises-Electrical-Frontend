import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ADD_SALARY_INCREMENT_FORM_CONFIG } from '@features/payroll-management/config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  ISalaryIncrementAddFormDto,
  ISalaryStructureGetFormDto,
  ISalaryStructureGetResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { ISalaryFields } from '@features/payroll-management/types/payroll.interface';
import { PAYROLL_MESSAGES } from '@features/payroll-management/constants';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SalarySummaryComponent } from '@features/payroll-management/shared/components/salary-summary/salary-summary.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-add-salary-increment',
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    PageHeaderComponent,
    SalarySummaryComponent,
    ButtonComponent,
  ],
  templateUrl: './add-salary-increment.component.html',
  styleUrl: './add-salary-increment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSalaryIncrementComponent
  extends FormBase<ISalaryIncrementAddFormDto>
  implements OnInit
{
  private readonly payrollService = inject(PayrollService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  private trackedSalaryFields!: ITrackedFields<ISalaryIncrementAddFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly summaryCalculationFields = computed(() =>
    this.getSummaryCalculationFields()
  );

  constructor() {
    super();
    effect(() => {
      if (this.trackedSalaryFields && this.trackedSalaryFields.employeeName) {
        const employeeName = this.trackedSalaryFields.employeeName();
        if (employeeName && typeof employeeName === 'string') {
          this.loadEmployeeSalaryDetail(employeeName);
        }
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<ISalaryIncrementAddFormDto>(
      ADD_SALARY_INCREMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    const trackedFields: (keyof ISalaryIncrementAddFormDto)[] = [
      'basicSalary',
      'hra',
      'tds',
      'employerEsicContribution',
      'employeePfContribution',
      'employeeName',
    ];
    this.trackedSalaryFields =
      this.formService.trackMultipleFieldChanges<ISalaryIncrementAddFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private loadEmployeeSalaryDetail(userId: string): void {
    this.loadingService.show({
      title: PAYROLL_MESSAGES.LOADING.LOAD_EMPLOYEE_SALARY_DETAIL,
      message: PAYROLL_MESSAGES.LOADING_MESSAGES.LOAD_EMPLOYEE_SALARY_DETAIL,
    });

    const paramData = this.prepareParamDataForSalaryDetail(userId);

    this.payrollService
      .getSalaryStructureList(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISalaryStructureGetResponseDto) => {
          const { records } = response;
          if (records.length > 0) {
            const prefilledSalaryDetailData = this.preparePrefilledFormData(
              records,
              userId
            );
            this.form.patch(prefilledSalaryDetailData);
          }
        },
        error: error => {
          this.logger.error(
            PAYROLL_MESSAGES.ERROR.LOAD_EMPLOYEE_SALARY_DETAIL,
            error
          );
        },
      });
  }

  private prepareParamDataForSalaryDetail(
    userId: string
  ): ISalaryStructureGetFormDto {
    return {
      employeeName: userId,
    };
  }

  private preparePrefilledFormData(
    salaryDetail: ISalaryStructureGetResponseDto['records'],
    userId: string
  ): Partial<ISalaryIncrementAddFormDto> {
    const salaryDetailData = salaryDetail[0];
    return {
      employeeName: userId,
      basicSalary: Number(salaryDetailData.basic),
      hra: Number(salaryDetailData.hra),
      tds: Number(salaryDetailData.tds ?? 0),
      employerEsicContribution: Number(salaryDetailData.esic ?? 0),
      employeePfContribution: Number(salaryDetailData.employeePf ?? 0),
      foodAllowance: Number(salaryDetailData.foodAllowance ?? 0),
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddSalaryIncrement(formData);
  }

  private prepareFormData(): ISalaryIncrementAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddSalaryIncrement(
    formData: ISalaryIncrementAddFormDto
  ): void {
    this.loadingService.show({
      title: PAYROLL_MESSAGES.LOADING.ADD_SALARY_INCREMENT,
      message: PAYROLL_MESSAGES.LOADING_MESSAGES.ADD_SALARY_INCREMENT,
    });
    this.form.disable();

    this.payrollService
      .addSalaryIncrement(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            PAYROLL_MESSAGES.SUCCESS.ADD_SALARY_INCREMENT
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.PAYROLL,
            ROUTES.PAYROLL.STRUCTURE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error(
            PAYROLL_MESSAGES.ERROR.ADD_SALARY_INCREMENT
          );
        },
      });
  }

  private getSummaryCalculationFields(): ISalaryFields {
    const {
      basicSalary,
      hra,
      tds,
      employerEsicContribution,
      employeePfContribution,
    } = this.trackedSalaryFields.getValues();

    return {
      basic: basicSalary ?? 0,
      hra: hra ?? 0,
      tds: tds ?? 0,
      esic: employerEsicContribution ?? 0,
      employeePf: employeePfContribution ?? 0,
    };
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: PAYROLL_MESSAGES.PAGE_HEADER.ADD_SALARY_INCREMENT_TITLE,
      subtitle: PAYROLL_MESSAGES.PAGE_HEADER.ADD_SALARY_INCREMENT_SUBTITLE,
    };
  }
}
