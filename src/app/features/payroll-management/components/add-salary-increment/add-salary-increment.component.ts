import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { ADD_SALARY_INCREMENT_FORM_CONFIG } from '@features/payroll-management/config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  ISalaryIncrementAddFormDto,
  ISalaryStructureGetFormDto,
  ISalaryStructureGetResponseDto,
} from '@features/payroll-management/types/payroll.dto';
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
import { ISalaryFields } from '@features/payroll-management/types/payroll.interface';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SalarySummaryComponent } from '@features/payroll-management/shared/components/salary-summary/salary-summary.component';
import { ButtonComponent } from '@shared/components/button/button.component';

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
export class AddSalaryIncrementComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly payrollService = inject(PayrollService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected form!: IEnhancedForm<ISalaryIncrementAddFormDto>;
  private trackedSalaryFields!: ITrackedFields<
    keyof ISalaryIncrementAddFormDto & string,
    ISalaryIncrementAddFormDto
  >;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly summaryCalculationFields = computed(() =>
    this.getSummaryCalculationFields()
  );
  protected readonly initialSalaryIncrementData =
    signal<Partial<ISalaryIncrementAddFormDto> | null>(null);
  protected readonly isSubmitting = signal(false);

  constructor() {
    effect(() => {
      const employeeName = this.trackedSalaryFields.employeeName() as string;
      if (employeeName) {
        this.onChangeEmployeeName(employeeName);
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<ISalaryIncrementAddFormDto>(
      ADD_SALARY_INCREMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialSalaryIncrementData(),
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

  private onChangeEmployeeName(userId: string): void {
    this.loadEmployeeSalaryDetail(userId);
  }

  private loadEmployeeSalaryDetail(userId: string): void {
    this.loadingService.show({
      title: 'Loading Employee Latest Salary Detail',
      message: 'Please wait while we load the employee latest salary detail...',
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
            const prefilledSalaryDetailData =
              this.preparePrefilledSalaryDetailData(records, userId);
            this.initialSalaryIncrementData.set(prefilledSalaryDetailData);
            this.form.patch(prefilledSalaryDetailData);
          }
        },
        error: error => {
          this.initialSalaryIncrementData.set(null);
          this.logger.logUserAction(
            'Failed to load employee salary detail',
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

  private preparePrefilledSalaryDetailData(
    salaryDetail: ISalaryStructureGetResponseDto['records'],
    userId: string
  ): Partial<ISalaryIncrementAddFormDto> {
    const salaryDetailData = salaryDetail[0];
    return {
      employeeName: userId,
      basicSalary: salaryDetailData.basic,
      hra: salaryDetailData.hra,
      tds: salaryDetailData.tds ?? '0',
      employerEsicContribution: salaryDetailData.esic ?? '0',
      employeePfContribution: salaryDetailData.employeePf ?? '0',
      foodAllowance: salaryDetailData.foodAllowance ?? '0',
    };
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeAddSalaryIncrement(formData);
  }

  private prepareFormData(): ISalaryIncrementAddFormDto {
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

  private executeAddSalaryIncrement(
    formData: ISalaryIncrementAddFormDto
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Add Salary Increment',
      message: 'Please wait while we add salary increment...',
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
            'Salary increment added successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.PAYROLL,
            ROUTES.PAYROLL.STRUCTURE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add salary increment');
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
      this.logger.warn('Add salary increment form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Salary Increment Form');
      this.form.reset(this.initialSalaryIncrementData());
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Salary Increment',
      subtitle: 'Add a new salary increment',
    };
  }
}
