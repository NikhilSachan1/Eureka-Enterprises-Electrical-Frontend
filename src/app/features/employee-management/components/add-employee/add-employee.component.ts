import {
  ChangeDetectionStrategy,
  Component,
  signal,
  OnInit,
  inject,
  computed,
  DestroyRef,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { finalize } from 'rxjs';
import { StepperComponent } from '@shared/components/stepper/stepper.component';
import { IStepperConfig } from '@shared/types/stepper/stepper.interface';
import {
  ADD_EMPLOYEE_FORM_CONFIG,
  ADD_EMPLOYEE_STEPPER_CONFIG,
} from '@features/employee-management/configs';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import {
  IPageHeaderConfig,
  IEnhancedMultiStepForm,
  ITrackedFields,
  ITrackedForm,
} from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EnvironmentService, LoggerService } from '@core/services';
import {
  EUserRole,
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import {
  IEmployeeAddRequestDto,
  IEmployeeGetNextEmployeeIdResponseDto,
} from '@features/employee-management/types/employee.dto';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import { ActivatedRoute } from '@angular/router';
import { transformDateFormat } from '@shared/utility';
import { ADD_EMPLOYEE_PREFILLED_DATA } from '@shared/mock-data/add-employee.mock-data';
import { IEmployeeSalarySummaryItem } from '@features/employee-management/types/employee.interface';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-add-employee',
  imports: [
    StepperComponent,
    ReactiveFormsModule,
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    CurrencyPipe,
    CardModule,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEmployeeComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadingService = inject(LoadingService);
  private readonly employeeService = inject(EmployeeService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly environmentService = inject(EnvironmentService);

  protected stepperConfig!: IStepperConfig;
  protected multiStepForm!: IEnhancedMultiStepForm;
  protected currencyFormat = APP_CONFIG.CURRENCY_CONFIG.DEFAULT;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected trackFields: Record<string, ITrackedFields<any>> = {};
  protected trackForms: Record<string, ITrackedForm> = {};

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);
  protected readonly activeStep = signal<number>(1);
  protected readonly initialEmployeeData = signal<Record<
    string,
    Record<string, unknown>
  > | null>(null);
  protected readonly stepErrors = signal<Record<number, boolean>>({});
  protected readonly stepValid = signal<Record<number, boolean>>({});
  private readonly attemptedSteps = signal<Set<number>>(new Set());
  private readonly employeeId = signal<string>('');
  protected readonly grossSalary = signal<number>(0);
  protected readonly totalDeductions = signal<number>(0);
  protected readonly inHandSalary = signal<number>(0);
  protected readonly totalEmployerBenefits = signal<number>(0);
  protected readonly totalCTC = signal<number>(0);
  protected readonly salarySummaryItems = computed(() =>
    this.getSalarySummaryItems()
  );

  constructor() {
    effect(() => {
      const salaryForm = this.trackFields['6'];
      if (salaryForm) {
        this.setupSalaryCalculations();
      }
    });

    effect(() => {
      this.attemptedSteps();
      Object.values(this.trackForms).forEach(trackedForm => {
        trackedForm.isValid();
        trackedForm.isInvalid();
      });
      this.updateValidationStates();
    });
  }

  ngOnInit(): void {
    this.loadEmployeeDataFromRoute();
    this.loadTestData();

    this.stepperConfig = ADD_EMPLOYEE_STEPPER_CONFIG;
    this.multiStepForm = this.formService.createMultiStepForm(
      ADD_EMPLOYEE_FORM_CONFIG,
      this.destroyRef,
      this.initialEmployeeData()
    );

    this.trackFields['6'] = this.formService.trackMultipleFieldChanges(
      this.multiStepForm.forms['6'].formGroup,
      ['esicContribution', 'pfContribution', 'tds', 'basicSalary', 'hra'],
      this.destroyRef
    );

    Object.keys(this.multiStepForm.forms).forEach(stepKey => {
      const { formGroup } = this.multiStepForm.forms[stepKey];
      this.trackForms[stepKey] = this.formService.trackFormChanges(
        formGroup,
        this.destroyRef
      );
    });
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
  ): Record<string, Record<string, unknown>> {
    const employmentStep = '2';
    const { employeeId } = nextEmployeeCodeFromResolver.data;
    this.employeeId.set(employeeId);
    return {
      [employmentStep]: {
        employeeId,
      },
    };
  }

  protected onSubmit(): void {
    this.markAllStepsAsAttempted();

    if (this.isSubmitting() || !this.validateForm()) {
      const stepErrors = Object.keys(this.stepErrors()).filter(
        key => this.stepErrors()[Number(key)]
      );
      if (stepErrors.length > 0) {
        this.activeStep.set(Number(stepErrors[0]));
      }

      return;
    }

    const formData = this.prepareFormData();
    this.executeAddEmployee(formData);
  }

  private prepareFormData(): IEmployeeAddRequestDto {
    const {
      firstName,
      lastName,
      fatherName,
      email,
      contactNumber,
      emergencyContactNumber,
      gender,
      dateOfBirth,
      bloodGroup,
      houseNumber,
      streetName,
      landmark,
      state,
      city,
      pinCode,
      profilePicture,
      previousExperience,
      dateOfJoining,
      employmentType,
      designation,
      degree,
      branch,
      passingYear,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      aadharNumber,
      aadharDocument,
      pancardNumber,
      pancardDocument,
      drivingLicenseNumber,
      drivingLicenseDocument,
      esicNumber,
      esicDocument,
      uanNumber,
      passportNumber,
      degreeDocument,
      uanDocument,
      passportDocument,
      basicSalary,
      hra,
      foodAllowance,
      tds,
      esicContribution,
      pfContribution,
    } = this.multiStepForm.getData() as {
      firstName: string;
      lastName: string;
      fatherName: string;
      email: string;
      contactNumber: string;
      emergencyContactNumber: string;
      gender: string;
      dateOfBirth: string;
      bloodGroup: string;
      houseNumber: string;
      streetName: string;
      landmark: string;
      state: string;
      city: string;
      pinCode: string;
      profilePicture: File[];
      previousExperience: string;
      dateOfJoining: string;
      employmentType: string;
      designation: string;
      degree: string;
      branch: string;
      passingYear: string;
      degreeDocument: File[];
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
      aadharNumber: string;
      aadharDocument: File[];
      pancardNumber: string;
      pancardDocument: File[];
      drivingLicenseNumber: string;
      drivingLicenseDocument: File[];
      esicNumber: string;
      esicDocument: File[];
      uanNumber: string;
      uanDocument: File[];
      passportNumber: string;
      panNumber: string;
      dlNumber: string;
      passportDocument: File[];
      basicSalary: number;
      hra: number;
      foodAllowance: number;
      tds: number;
      esicContribution: number;
      pfContribution: number;
    };

    return {
      firstName,
      lastName,
      email,
      contactNumber,
      roles: this.getRolesByDesignation(designation),
      fatherName,
      emergencyContactNumber,
      gender,
      dateOfBirth: transformDateFormat(dateOfBirth),
      bloodGroup,
      houseNumber,
      streetName,
      landmark,
      state,
      city,
      pincode: pinCode,
      employeeId: this.employeeId(),
      dateOfJoining: transformDateFormat(dateOfJoining),
      previousExperience,
      employeeType: employmentType,
      designation,
      degree,
      branch,
      passoutYear: passingYear,
      bankHolderName: accountHolderName,
      accountNumber,
      bankName,
      ifscCode,
      esicNumber,
      uanNumber,
      aadharNumber,
      panNumber: pancardNumber,
      passportNumber,
      dlNumber: drivingLicenseNumber,
      profilePicture: profilePicture[0],
      esicDoc: esicDocument[0],
      aadharDoc: aadharDocument[0],
      panDoc: pancardDocument[0],
      dlDoc: drivingLicenseDocument[0],
      degreeDoc: degreeDocument[0],
      uanDoc: uanDocument[0],
      passportDoc: passportDocument[0],
      salary: {
        basic: basicSalary,
        hra,
        foodAllowance,
        tds,
        esic: esicContribution,
        employeePf: pfContribution,
        employerPf: pfContribution,
      },
    };
  }

  private getRolesByDesignation(designation: string): string[] {
    if (designation === EUserRole.DRIVER) {
      return [EUserRole.DRIVER];
    }
    return [EUserRole.SUPER_ADMIN];
  }

  private executeAddEmployee(formData: IEmployeeAddRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Add Employee',
      message: 'Please wait while we add employee...',
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
          this.notificationService.success('Employee added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.EMPLOYEE,
            ROUTES.EMPLOYEE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add employee');
        },
      });
  }

  private setupSalaryCalculations(): void {
    const salaryForm = this.trackFields['6'];
    if (!salaryForm?.getValues) {
      return;
    }

    const { esicContribution, pfContribution, tds, basicSalary, hra } =
      salaryForm.getValues() as {
        esicContribution: string;
        pfContribution: string;
        tds: string;
        basicSalary: string;
        hra: string;
      };

    const employeePF = parseFloat(pfContribution) || 0;
    const employerPF = employeePF;
    const employerESIC = parseFloat(esicContribution) || 0;
    const tdsValue = parseFloat(tds) || 0;
    const basicValue = parseFloat(basicSalary) || 0;
    const hraValue = parseFloat(hra) || 0;

    const gross = basicValue + hraValue;
    const deductions = tdsValue + employeePF;
    const totalEmployerBenefits = employerPF + employerESIC;
    const ctc = gross + totalEmployerBenefits;
    const inHandSalary = gross - deductions;

    this.grossSalary.set(gross);
    this.totalDeductions.set(deductions);
    this.inHandSalary.set(inHandSalary);
    this.totalEmployerBenefits.set(totalEmployerBenefits);
    this.totalCTC.set(ctc);
  }

  private getSalarySummaryItems(): IEmployeeSalarySummaryItem[] {
    return [
      {
        label: 'Gross Salary',
        value: this.grossSalary(),
        description: 'Basic + HRA',
      },
      {
        label: 'Deductions',
        value: this.totalDeductions(),
        description: 'TDS + PF (Employee)',
      },
      {
        label: 'In-Hand Salary',
        value: this.inHandSalary(),
        description: 'Gross - Deductions',
      },
      {
        label: 'Employer Benefits',
        value: this.totalEmployerBenefits(),
        description: 'Employer PF + Employer ESIC',
      },
    ];
  }

  protected onStepperNextRequested(): void {
    const currentStep = this.activeStep();
    const totalSteps = this.stepperConfig.steps.length;
    const isLastStep = currentStep === totalSteps;
    this.attemptedSteps.update(steps => new Set(steps).add(currentStep));
    this.validateParticularForm();
    this.activeStep.set(isLastStep ? 1 : currentStep + 1);
  }

  protected onStepperPreviousRequested(): void {
    const currentStep = this.activeStep();
    this.attemptedSteps.update(steps => new Set(steps).add(currentStep));
    this.validateParticularForm();
    this.activeStep.set(currentStep - 1);
  }

  protected onStepperResetRequested(): void {
    this.onResetParticularForm();
  }

  private markAllStepsAsAttempted(): void {
    if (this.multiStepForm?.forms) {
      const allStepNumbers = Object.keys(this.multiStepForm.forms)
        .map(stepKey => Number(stepKey))
        .filter(stepNumber => !isNaN(stepNumber));

      this.attemptedSteps.update(steps => {
        const newSet = new Set(steps);
        allStepNumbers.forEach(stepNumber => newSet.add(stepNumber));
        return newSet;
      });
      this.updateValidationStates();
    }
  }

  private updateValidationStates(): void {
    if (this.isSubmitting()) {
      return;
    }
    const errors: Record<number, boolean> = {};
    const valid: Record<number, boolean> = {};
    const attempted = this.attemptedSteps();

    Object.keys(this.trackForms).forEach(stepKey => {
      const stepNumber = Number(stepKey);
      if (!isNaN(stepNumber) && attempted.has(stepNumber)) {
        const trackedForm = this.trackForms[stepKey];
        errors[stepNumber] = trackedForm.isInvalid();
        valid[stepNumber] = trackedForm.isValid();
      }
    });

    this.stepErrors.set(errors);
    this.stepValid.set(valid);
  }

  private validateForm(): boolean {
    if (!this.multiStepForm.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Add employee form validation failed');
      return false;
    }
    return true;
  }

  private validateParticularForm(): boolean {
    const form = this.multiStepForm.forms[this.activeStep()];
    if (!form.validateAndMarkTouched()) {
      this.logger.warn(`Form validation failed for '${this.activeStep()}'`);
      return false;
    }

    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Employee Form');
      this.multiStepForm.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private onResetParticularForm(): void {
    try {
      this.logger.logUserAction(
        `Reset Add Employee Form for step ${this.activeStep()}`
      );
      const form = this.multiStepForm.forms[this.activeStep()];
      form.reset();
    } catch (error) {
      this.logger.error(
        `Error resetting form for step ${this.activeStep()}`,
        error
      );
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Employee',
      subtitle: 'Add a new employee',
    };
  }

  private loadTestData(): void {
    if (this.environmentService.isTestDataEnabled) {
      this.initialEmployeeData.update(existingData => ({
        ...ADD_EMPLOYEE_PREFILLED_DATA,
        ...existingData,
        ...Object.fromEntries(
          Object.keys(ADD_EMPLOYEE_PREFILLED_DATA).map(stepKey => [
            stepKey,
            {
              ...ADD_EMPLOYEE_PREFILLED_DATA[stepKey],
              ...existingData?.[stepKey],
            },
          ])
        ),
      }));
    }
  }
}
