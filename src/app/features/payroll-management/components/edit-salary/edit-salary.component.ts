import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EDIT_SALARY_FORM_CONFIG } from '@features/payroll-management/config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import { ISalaryEditFormDto } from '@features/payroll-management/types/payroll.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { PAYROLL_MESSAGES } from '@features/payroll-management/constants';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { finalize } from 'rxjs';
import { SalarySummaryComponent } from '@features/payroll-management/shared/components/salary-summary/salary-summary.component';
import {
  ISalaryDetailResolverResponse,
  ISalaryFields,
} from '@features/payroll-management/types/payroll.interface';
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
  extends FormBase<ISalaryEditFormDto>
  implements OnInit
{
  private readonly payrollService = inject(PayrollService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  private trackedSalaryFields!: ITrackedFields<ISalaryEditFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly summaryCalculationFields = computed(() =>
    this.getSummaryCalculationFields()
  );
  protected readonly initialSalaryData = signal<ISalaryEditFormDto | null>(
    null
  );

  ngOnInit(): void {
    this.loadSalaryDataFromRoute();

    this.form = this.formService.createForm<ISalaryEditFormDto>(
      EDIT_SALARY_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialSalaryData(),
      }
    );

    const trackedFields: (keyof ISalaryEditFormDto)[] = [
      'basicSalary',
      'hra',
      'tds',
      'employerEsicContribution',
      'employeePfContribution',
    ];
    this.trackedSalaryFields =
      this.formService.trackMultipleFieldChanges<ISalaryEditFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private loadSalaryDataFromRoute(): void {
    const salaryDetailFromResolver = this.activatedRoute.snapshot.data[
      'salaryDetail'
    ] as ISalaryDetailResolverResponse;

    if (!salaryDetailFromResolver) {
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
  ): ISalaryEditFormDto {
    return {
      basicSalary: Number(salaryDetailFromResolver.basicSalary),
      hra: Number(salaryDetailFromResolver.hra),
      tds: Number(salaryDetailFromResolver.tds),
      employerEsicContribution: Number(
        salaryDetailFromResolver.employerEsicContribution
      ),
      employeePfContribution: Number(
        salaryDetailFromResolver.employeePfContribution
      ),
      foodAllowance: Number(salaryDetailFromResolver.foodAllowance),
      comments: '',
    };
  }

  protected override handleSubmit(): void {
    const salaryStructureId = this.activatedRoute.snapshot.params[
      'salaryStructureId'
    ] as string;
    if (!salaryStructureId) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    const formData = this.prepareFormData();
    this.executeEditSalary(formData, salaryStructureId);
  }

  private prepareFormData(): ISalaryEditFormDto {
    const formData = this.form.getData();
    return formData;
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
    this.onResetSingleForm(this.initialSalaryData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: PAYROLL_MESSAGES.PAGE_HEADER.EDIT_SALARY_TITLE,
      subtitle: PAYROLL_MESSAGES.PAGE_HEADER.EDIT_SALARY_SUBTITLE,
    };
  }
}
