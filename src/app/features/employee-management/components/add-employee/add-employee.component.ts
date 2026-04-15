import {
  ChangeDetectionStrategy,
  Component,
  signal,
  OnInit,
  inject,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { StepperComponent } from '@shared/components/stepper/stepper.component';
import {
  ADD_EMPLOYEE_FORM_CONFIG,
  ADD_EMPLOYEE_STEPPER_CONFIG,
} from '@features/employee-management/configs';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { EMPLOYEE_MESSAGES, EMPLOYEE_FORM_STEPS } from '../../constants';
import {
  IEmployeeAddFormDto,
  IEmployeeGetNextEmployeeIdResponseDto,
} from '@features/employee-management/types/employee.dto';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import { ActivatedRoute } from '@angular/router';
import { ADD_EMPLOYEE_PREFILLED_DATA } from '@shared/mock-data/add-employee.mock-data';
import { SalarySummaryComponent } from '@features/payroll-management/shared/components/salary-summary/salary-summary.component';
import { ISalaryFields } from '@features/payroll-management/types/payroll.interface';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-add-employee',
  imports: [
    StepperComponent,
    ReactiveFormsModule,
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    SalarySummaryComponent,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEmployeeComponent
  extends FormBase<IEmployeeAddFormDto>
  implements OnInit
{
  private readonly employeeService = inject(EmployeeService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private trackedSalaryFields!: ITrackedFields<IEmployeeAddFormDto>;
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialEmployeeData = signal<Record<
    string,
    Partial<IEmployeeAddFormDto>
  > | null>(null);
  private readonly employeeId = signal<string>('');
  protected readonly salaryFields = computed(() => this.getSalaryFields());

  ngOnInit(): void {
    this.loadEmployeeDataFromRoute();

    this.stepperConfig = ADD_EMPLOYEE_STEPPER_CONFIG;
    this.multiStepForm =
      this.formService.createMultiStepForm<IEmployeeAddFormDto>(
        ADD_EMPLOYEE_FORM_CONFIG,
        this.destroyRef,
        this.initialEmployeeData()
      );

    this.loadMockData(ADD_EMPLOYEE_PREFILLED_DATA);

    const trackedFields: (keyof IEmployeeAddFormDto)[] = [
      'employerEsicContribution',
      'employeePfContribution',
      'tds',
      'basicSalary',
      'hra',
    ];
    this.trackedSalaryFields =
      this.formService.trackMultipleFieldChanges<IEmployeeAddFormDto>(
        this.multiStepForm.forms[EMPLOYEE_FORM_STEPS.SALARY.toString()]
          .formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private loadEmployeeDataFromRoute(): void {
    const nextEmployeeCodeFromResolver = this.activatedRoute.snapshot.data[
      'nextEmployeeCode'
    ] as IEmployeeGetNextEmployeeIdResponseDto;

    if (!nextEmployeeCodeFromResolver) {
      this.logger.logUserAction('No next employee code found in route');
      const routeSegments = [ROUTE_BASE_PATHS.EMPLOYEE, ROUTES.EMPLOYEE.LIST];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledEmployeeData = this.preparePrefilledFormData(
      nextEmployeeCodeFromResolver
    );
    this.initialEmployeeData.set(prefilledEmployeeData);
  }

  private preparePrefilledFormData(
    nextEmployeeCodeFromResolver: IEmployeeGetNextEmployeeIdResponseDto
  ): Record<string, Partial<IEmployeeAddFormDto>> {
    const employmentStep = EMPLOYEE_FORM_STEPS.EMPLOYMENT_INFO.toString();
    const { employeeId } = nextEmployeeCodeFromResolver.data;
    this.employeeId.set(employeeId);
    return {
      [employmentStep]: {
        employeeId,
      },
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddEmployee(formData);
  }

  private prepareFormData(): IEmployeeAddFormDto {
    let formData = this.multiStepForm.getData();
    formData = {
      ...formData,
      employeeId: this.employeeId(),
    };
    return formData;
  }

  private executeAddEmployee(formData: IEmployeeAddFormDto): void {
    this.loadingService.show({
      title: EMPLOYEE_MESSAGES.LOADING.ADD,
      message: EMPLOYEE_MESSAGES.LOADING_MESSAGES.ADD,
    });
    this.multiStepForm.disable();

    this.employeeService
      .addEmployee(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.multiStepForm.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success(EMPLOYEE_MESSAGES.SUCCESS.ADD);
          this.appConfigurationService.refreshEmployeeDropdowns();
          const routeSegments = [
            ROUTE_BASE_PATHS.EMPLOYEE,
            ROUTES.EMPLOYEE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: error => {
          this.logger.error(EMPLOYEE_MESSAGES.ERROR.ADD, error);
          this.notificationService.error(EMPLOYEE_MESSAGES.ERROR.ADD);
        },
      });
  }

  private getSalaryFields(): ISalaryFields {
    const {
      employerEsicContribution,
      employeePfContribution,
      tds,
      basicSalary,
      hra,
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
    this.onResetMultiStepForm(this.initialEmployeeData() ?? {});
  }

  protected override onResetParticularForm(
    initialData?: Partial<IEmployeeAddFormDto>
  ): void {
    const stepInitialData =
      initialData ?? this.initialEmployeeData()?.[this.activeStep().toString()];
    super.onResetParticularForm(stepInitialData);
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Employee',
      subtitle: 'Add a new employee',
    };
  }
}
