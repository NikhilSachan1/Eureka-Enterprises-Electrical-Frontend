import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '@core/services';
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
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import {
  IEnhancedForm,
  IPageHeaderConfig,
  ITrackedFields,
} from '@shared/types';
import { finalize } from 'rxjs';
import { SalarySummaryComponent } from '@features/payroll-management/shared/components/salary-summary/salary-summary.component';
import {
  ISalaryDetailResolverResponse,
  ISalaryFields,
} from '@features/payroll-management/types/payroll.interface';

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
export class EditSalaryComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly payrollService = inject(PayrollService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected form!: IEnhancedForm<ISalaryEditFormDto>;
  private trackedSalaryFields!: ITrackedFields<
    keyof ISalaryEditFormDto & string,
    ISalaryEditFormDto
  >;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly summaryCalculationFields = computed(() =>
    this.getSummaryCalculationFields()
  );
  protected readonly isSubmitting = signal(false);
  protected readonly initialSalaryData =
    signal<Partial<ISalaryEditFormDto> | null>(null);

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
      'foodAllowance',
      'comments',
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
    ] as ISalaryDetailResolverResponse | null;

    if (!salaryDetailFromResolver) {
      this.logger.logUserAction('No salary data found in route');
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
  ): Partial<ISalaryEditFormDto> {
    return {
      basicSalary: salaryDetailFromResolver.basicSalary,
      hra: salaryDetailFromResolver.hra,
      tds: salaryDetailFromResolver.tds,
      employerEsicContribution:
        salaryDetailFromResolver.employerEsicContribution,
      employeePfContribution: salaryDetailFromResolver.employeePfContribution,
      foodAllowance: salaryDetailFromResolver.foodAllowance,
    };
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const salaryStructureId = this.activatedRoute.snapshot.params[
      'salaryStructureId'
    ] as string;
    if (!salaryStructureId) {
      this.logger.logUserAction('No salary structure id found in route');
      this.notificationService.error('Something went wrong');
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditSalary(formData, salaryStructureId);
  }

  private prepareFormData(): ISalaryEditFormDto {
    const formData = this.form.getData();
    const {
      basicSalary,
      hra,
      tds,
      employerEsicContribution,
      employeePfContribution,
      foodAllowance,
    } = formData;
    return {
      ...formData,
      basicSalary: String(basicSalary ?? 0),
      hra: String(hra ?? 0),
      tds: String(tds ?? 0),
      employerEsicContribution: String(employerEsicContribution ?? 0),
      employeePfContribution: String(employeePfContribution ?? 0),
      foodAllowance: String(foodAllowance ?? 0),
    };
  }

  private executeEditSalary(
    formData: ISalaryEditFormDto,
    salaryStructureId: string
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Edit Salary',
      message: 'Please wait while we edit salary...',
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
          this.notificationService.success('Salary updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.PAYROLL,
            ROUTES.PAYROLL.STRUCTURE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update salary');
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
      basic: basicSalary ?? '0',
      hra: hra ?? '0',
      tds: tds ?? '0',
      esic: employerEsicContribution ?? '0',
      employeePf: employeePfContribution ?? '0',
    };
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Edit salary form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit Salary Form');
      this.form.reset(this.initialSalaryData() ?? {});
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Salary',
      subtitle: 'Edit a salary',
    };
  }
}
