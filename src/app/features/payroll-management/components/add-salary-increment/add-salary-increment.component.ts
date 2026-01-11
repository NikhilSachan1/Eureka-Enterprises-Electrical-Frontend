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
  ISalaryIncrementAddRequestDto,
  ISalaryStructureGetRequestInputDto,
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
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { transformDateFormat } from '@shared/utility';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SalarySummaryComponent } from '@features/payroll-management/shared/components/salary-summary/salary-summary.component';
import { ISalaryFields } from '@features/payroll-management/types/payroll.interface';
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

  protected form!: IEnhancedForm;
  protected readonly initialSalaryIncrementData = signal<Record<
    string,
    unknown
  > | null>(null);

  private trackedSalaryFields: ReturnType<
    typeof this.formService.trackMultipleFieldChanges
  > | null = null;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly salaryFields = computed(() => this.getSalaryFields());
  protected readonly isSubmitting = signal(false);

  constructor() {
    effect(() => {
      const employeeName = this.trackedSalaryFields?.['employeeName']?.();
      if (employeeName) {
        this.onChangeEmployeeName(employeeName);
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm(ADD_SALARY_INCREMENT_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialSalaryIncrementData(),
    });

    this.trackedSalaryFields = this.formService.trackMultipleFieldChanges(
      this.form.formGroup,
      [
        'basicSalary',
        'hra',
        'tds',
        'esicContribution',
        'pfContribution',
        'employeeName',
      ],
      this.destroyRef
    );
  }

  private onChangeEmployeeName(userId: string): void {
    this.loadEmployeeSalaryDetail(userId);
  }

  private loadEmployeeSalaryDetail(userId: string): void {
    this.loadingService.show({
      title: 'Loading Employee Salary Detail',
      message: 'Please wait while we load the employee salary detail...',
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
  ): ISalaryStructureGetRequestInputDto {
    return {
      employeeName: userId,
    };
  }

  private preparePrefilledSalaryDetailData(
    salaryDetail: ISalaryStructureGetResponseDto['records'],
    userId: string
  ): Record<string, unknown> {
    const salaryDetailData = salaryDetail[0];
    return {
      employeeName: userId,
      basicSalary: salaryDetailData.basic,
      hra: salaryDetailData.hra,
      tds: salaryDetailData.tds,
      esicContribution: salaryDetailData.esic,
      pfContribution: salaryDetailData.employeePf,
      foodAllowance: salaryDetailData.foodAllowance,
    };
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeAddSalaryIncrement(formData);
  }

  private prepareFormData(): ISalaryIncrementAddRequestDto {
    const {
      employeeName,
      basicSalary,
      hra,
      tds,
      esicContribution,
      pfContribution,
      foodAllowance,
    } = this.form.getData() as {
      employeeName: string;
      basicSalary: number;
      hra: number;
      foodAllowance: number;
      tds: number;
      esicContribution: number;
      pfContribution: number;
    };

    return {
      userId: employeeName,
      basic: basicSalary,
      hra,
      tds,
      esic: esicContribution,
      employeePf: pfContribution,
      foodAllowance,
      remark: '',
      effectiveFrom: transformDateFormat(new Date()),
      employerPf: pfContribution,
    };
  }

  private executeAddSalaryIncrement(
    formData: ISalaryIncrementAddRequestDto
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

  private getSalaryFields(): ISalaryFields {
    const { basicSalary, hra, tds, esicContribution, pfContribution } =
      this.trackedSalaryFields?.getValues() as {
        basicSalary: string;
        hra: string;
        tds: string;
        esicContribution: string;
        pfContribution: string;
      };

    return {
      basic: basicSalary,
      hra,
      tds,
      esic: esicContribution,
      employeePf: pfContribution,
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
      this.form.reset(this.initialSalaryIncrementData() ?? {});
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
