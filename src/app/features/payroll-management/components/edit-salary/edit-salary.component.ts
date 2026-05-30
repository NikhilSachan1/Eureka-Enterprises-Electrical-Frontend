import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EDIT_SALARY_FORM_CONFIG } from '@features/payroll-management/config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  ISalaryEditFormDto,
  ISalaryEditUiFormDto,
} from '@features/payroll-management/types/payroll.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import {
  PAYROLL_MESSAGES,
  MONTHLY_FOOD_ALLOWANCE_AMOUNT,
} from '@features/payroll-management/constants';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { finalize } from 'rxjs';
import { SalarySummaryComponent } from '@features/payroll-management/shared/components/salary-summary/salary-summary.component';
import {
  ISalaryDetailResolverResponse,
  ISalaryFields,
} from '@features/payroll-management/types/payroll.interface';
import {
  calculateEmployeeEsic,
  calculateEmployeePf,
  deriveGrossFromEarnings,
  omitGrossSalaryFromFormData,
  syncDeductionsFromBasic,
  syncFoodAllowance,
  syncSalaryFieldsFromGross,
} from '@features/payroll-management/shared/utils/salary-calculation.util';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-edit-salary',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    SalarySummaryComponent,
  ],
  templateUrl: './edit-salary.component.html',
  styleUrl: './edit-salary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSalaryComponent
  extends FormBase<ISalaryEditUiFormDto>
  implements OnInit
{
  private readonly payrollService = inject(PayrollService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  private trackedSalaryFields!: ITrackedFields<ISalaryEditUiFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly summaryCalculationFields = computed(() =>
    this.getSummaryCalculationFields()
  );
  protected readonly initialSalaryData = signal<ISalaryEditUiFormDto | null>(
    null
  );

  constructor() {
    super();
    effect(() => {
      const tracked = this.trackedSalaryFields;
      if (!tracked?.['grossSalary'] || !this.form) {
        return;
      }

      syncSalaryFieldsFromGross(
        this.form.formGroup,
        Number(tracked['grossSalary']())
      );
    });

    effect(() => {
      const tracked = this.trackedSalaryFields;
      if (!tracked?.['basicSalary'] || !this.form) {
        return;
      }

      syncDeductionsFromBasic(
        this.form.formGroup,
        Number(tracked['basicSalary']())
      );
    });
  }

  ngOnInit(): void {
    this.loadSalaryDataFromRoute();

    this.form = this.formService.createForm<ISalaryEditUiFormDto>(
      EDIT_SALARY_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialSalaryData(),
      }
    );

    const trackedFields: (keyof ISalaryEditUiFormDto)[] = [
      'grossSalary',
      'basicSalary',
      'hra',
      'specialAllowance',
      'employerEsicContribution',
      'employeePfContribution',
    ];
    this.trackedSalaryFields =
      this.formService.trackMultipleFieldChanges<ISalaryEditUiFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );

    syncFoodAllowance(this.form.formGroup);
  }

  private loadSalaryDataFromRoute(): void {
    const salaryDetailFromResolver = this.activatedRoute.snapshot.data[
      'salaryDetail'
    ] as ISalaryDetailResolverResponse;

    if (!salaryDetailFromResolver) {
      this.logger.error(PAYROLL_MESSAGES.ERROR.NO_SALARY_DATA);
      const routeSegments = [
        ROUTE_BASE_PATHS.PAYROLL,
        ROUTES.PAYROLL.STRUCTURE,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledSalaryData = this.preparePrefilledFormData(
      salaryDetailFromResolver
    );
    this.initialSalaryData.set(prefilledSalaryData);
  }

  private preparePrefilledFormData(
    salaryDetailFromResolver: ISalaryDetailResolverResponse
  ): ISalaryEditUiFormDto {
    const basicSalary = Number(salaryDetailFromResolver.basicSalary);
    const hra = Number(salaryDetailFromResolver.hra);
    const specialAllowance = Number(salaryDetailFromResolver.specialAllowance);

    return {
      grossSalary: deriveGrossFromEarnings(basicSalary, hra, specialAllowance),
      basicSalary,
      hra,
      specialAllowance,
      employerEsicContribution: calculateEmployeeEsic(basicSalary),
      employeePfContribution: calculateEmployeePf(basicSalary),
      foodAllowance: MONTHLY_FOOD_ALLOWANCE_AMOUNT,
      comments: '',
    };
  }

  protected override handleSubmit(): void {
    const salaryStructureId = this.activatedRoute.snapshot.params[
      'salaryStructureId'
    ] as string;
    if (!salaryStructureId) {
      this.logger.error(PAYROLL_MESSAGES.ERROR.NO_SALARY_STRUCTURE_ID);
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    const formData = this.prepareFormData();
    this.executeEditSalary(formData, salaryStructureId);
  }

  private prepareFormData(): ISalaryEditFormDto {
    return omitGrossSalaryFromFormData(
      this.form.getRawData()
    ) as ISalaryEditFormDto;
  }

  private executeEditSalary(
    formData: ISalaryEditFormDto,
    salaryStructureId: string
  ): void {
    this.loadingService.show({
      title: PAYROLL_MESSAGES.LOADING.EDIT_SALARY,
      message: PAYROLL_MESSAGES.LOADING_MESSAGES.EDIT_SALARY,
    });
    this.form.disable();

    this.payrollService
      .editSalary(formData, salaryStructureId)
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
            PAYROLL_MESSAGES.SUCCESS.EDIT_SALARY
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.PAYROLL,
            ROUTES.PAYROLL.STRUCTURE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error(PAYROLL_MESSAGES.ERROR.EDIT_SALARY);
        },
      });
  }

  private getSummaryCalculationFields(): ISalaryFields {
    const {
      basicSalary,
      hra,
      specialAllowance,
      employerEsicContribution,
      employeePfContribution,
    } = this.trackedSalaryFields.getValues();

    return {
      basic: Number(basicSalary ?? 0),
      hra: Number(hra ?? 0),
      specialAllowance: Number(specialAllowance ?? 0),
      esic: Number(employerEsicContribution ?? 0),
      employeePf: Number(employeePfContribution ?? 0),
    };
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialSalaryData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: PAYROLL_MESSAGES.PAGE_HEADER.EDIT_SALARY_TITLE,
      subtitle: PAYROLL_MESSAGES.PAGE_HEADER.EDIT_SALARY_SUBTITLE,
    };
  }
}
