import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  OnInit,
  Signal,
} from '@angular/core';
import { LoggerService } from '@core/services';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { ActivatedRoute } from '@angular/router';
import {
  IEnhancedMultiStepForm,
  IPageHeaderConfig,
  IStepperConfig,
  ITrackedForm,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EDIT_EMPLOYEE_FORM_CONFIG,
  EDIT_EMPLOYEE_STEPPER_CONFIG,
} from '@features/employee-management/configs';
import { IEmployeeEditRequestDto } from '@features/employee-management/types/employee.dto';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { transformDateFormat } from '@shared/utility';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StepperComponent } from '@shared/components/stepper/stepper.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IEmployeeDetailResolverResponse } from '@features/employee-management/types/employee.interface';
import { AuthService } from '@features/auth-management/services/auth.service';

@Component({
  selector: 'app-edit-employee',
  imports: [
    PageHeaderComponent,
    StepperComponent,
    ButtonComponent,
    InputFieldComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEmployeeComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadingService = inject(LoadingService);
  private readonly employeeService = inject(EmployeeService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  protected stepperConfig!: IStepperConfig;
  protected multiStepForm!: IEnhancedMultiStepForm;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected trackFields!: Record<string, Signal<any>>;
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
  private readonly initialEmail = signal<string>('');

  constructor() {
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

    this.stepperConfig = EDIT_EMPLOYEE_STEPPER_CONFIG;
    this.multiStepForm = this.formService.createMultiStepForm(
      EDIT_EMPLOYEE_FORM_CONFIG,
      this.destroyRef,
      this.initialEmployeeData()
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
    const employeeDetailFromResolver = this.activatedRoute.snapshot.data[
      'employeeDetail'
    ] as IEmployeeDetailResolverResponse;

    if (!employeeDetailFromResolver) {
      this.logger.logUserAction('No employee detail found in route');
      const routeSegments = [ROUTE_BASE_PATHS.EMPLOYEE, ROUTES.EMPLOYEE.LIST];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    this.initialEmail.set(employeeDetailFromResolver.email);

    const prefilledEmployeeData = this.preparePrefilledFormData(
      employeeDetailFromResolver
    );
    this.initialEmployeeData.set(prefilledEmployeeData);
  }

  private preparePrefilledFormData(
    employeeDetailFromResolver: IEmployeeDetailResolverResponse
  ): Record<string, Record<string, unknown>> {
    const {
      firstName,
      lastName,
      contactNumber,
      email,
      fatherName,
      emergencyContactNumber,
      gender,
      dateOfBirth,
      bloodGroup,
      houseNumber,
      streetName,
      landmark,
      state,
      city,
      pincode,
      employeeId,
      previousExperience,
      dateOfJoining,
      employeeType,
      designation,
      esicNumber,
      uanNumber,
      degree,
      branch,
      passoutYear,
      bankName,
      accountNumber,
      bankHolderName,
      ifscCode,
      aadharNumber,
      panNumber,
      dlNumber,
      passportNumber,
      preloadedFiles,
    } = employeeDetailFromResolver;
    return {
      [1]: {
        firstName,
        lastName,
        contactNumber,
        email,
        fatherName,
        emergencyContactNumber,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        bloodGroup,
        houseNumber,
        streetName,
        landmark,
        state,
        city,
        pinCode: pincode,
        profilePicture: preloadedFiles?.PROFILE_PICTURE,
      },
      [2]: {
        employeeId,
        previousExperience,
        dateOfJoining: new Date(dateOfJoining),
        employmentType: employeeType,
        designation,
        esicNumber,
        uanNumber,
        esicDocument: preloadedFiles?.ESIC,
        uanDocument: preloadedFiles?.UAN,
      },
      [3]: {
        degree,
        branch,
        passingYear: passoutYear,
        degreeDocument: preloadedFiles?.DEGREE,
      },
      [4]: {
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName: bankHolderName,
      },
      [5]: {
        aadharNumber,
        pancardNumber: panNumber,
        drivingLicenseNumber: dlNumber,
        passportNumber,
        pancardDocument: preloadedFiles?.PAN,
        aadharDocument: preloadedFiles?.AADHAR,
        drivingLicenseDocument: preloadedFiles?.DRIVING_LICENSE,
        passportDocument: preloadedFiles?.PASSPORT,
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

    const employeeId = this.activatedRoute.snapshot.params[
      'employeeId'
    ] as string;
    if (!employeeId) {
      this.logger.logUserAction('No employee id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditEmployee(formData, employeeId);
  }

  private prepareFormData(): IEmployeeEditRequestDto {
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
      uanDocument,
      passportNumber,
      passportDocument,
      degreeDocument,
      employeeId,
    } = this.multiStepForm.getRawData() as {
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
      passportDocument: File[];
      panNumber: string;
      dlNumber: string;
      employeeId: string;
    };

    return {
      firstName,
      lastName,
      email,
      contactNumber,
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
      employeeId,
      dateOfJoining: transformDateFormat(dateOfJoining),
      previousExperience,
      employeeType: employmentType,
      designation,
      degree,
      branch,
      passoutYear: passingYear.toString(),
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
    };
  }

  private executeEditEmployee(
    formData: IEmployeeEditRequestDto,
    employeeId: string
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Edit Employee',
      message: 'Please wait while we edit employee...',
    });
    this.multiStepForm.disable();

    this.employeeService
      .editEmployee(formData, employeeId)
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
          this.notificationService.success('Employee updated successfully');

          const { email: loggedInUserEmail } = this.authService.user() ?? {};
          const {
            firstName,
            lastName,
            designation,
            email: updatedEmail,
          } = formData;

          if (loggedInUserEmail && updatedEmail === loggedInUserEmail) {
            const routeSegments = [
              ROUTE_BASE_PATHS.EMPLOYEE,
              ROUTES.EMPLOYEE.LIST,
            ];
            void this.routerNavigationService.navigateToRoute(routeSegments);

            this.authService.updateUserDetails({
              firstName,
              lastName,
              designation,
              profilePicture: '',
            });
            return;
          }

          const emailHasChanged = this.initialEmail() !== updatedEmail;

          if (emailHasChanged) {
            this.logoutAndNavigateToLogin();
          }
        },
        error: () => {
          this.notificationService.error('Failed to update employee');
        },
      });
  }

  private logoutAndNavigateToLogin(): void {
    setTimeout(() => {
      this.loadingService.show({
        title: 'Logging Out',
        message: 'Please wait while we log you out...',
      });

      this.authService
        .logout()
        .pipe(
          finalize(() => {
            this.loadingService.hide();
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => {
            this.notificationService.success(
              'Your email has been updated. Please log in again with your new email.'
            );
            const routeSegments = [ROUTE_BASE_PATHS.AUTH, ROUTES.AUTH.LOGIN];
            void this.routerNavigationService.navigateToRoute(routeSegments);
          },
          error: error => {
            this.logger.error('Error during logout', error);
          },
        });
    }, 100);
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
      this.logger.logUserAction('Reset Edit Employee Form');
      this.multiStepForm.reset(this.initialEmployeeData() ?? {});
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private onResetParticularForm(): void {
    try {
      this.logger.logUserAction(
        `Reset Edit Employee Form for step ${this.activeStep()}`
      );
      const form = this.multiStepForm.forms[this.activeStep()];
      const initialData = this.initialEmployeeData()?.[this.activeStep()];
      form.reset(initialData);
    } catch (error) {
      this.logger.error(
        `Error resetting form for step ${this.activeStep()}`,
        error
      );
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Employee',
      subtitle: 'Edit an employee',
    };
  }
}
