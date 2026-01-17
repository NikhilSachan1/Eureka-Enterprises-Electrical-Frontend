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
import { finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import { AuthService } from '@features/auth-management/services/auth.service';
import { RouterNavigationService } from '@shared/services';
import {
  EDIT_EMPLOYEE_FORM_CONFIG,
  EDIT_EMPLOYEE_STEPPER_CONFIG,
} from '@features/employee-management/configs';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { EMPLOYEE_MESSAGES, EMPLOYEE_FORM_STEPS } from '../../constants';
import {
  IEmployeeEditFormDto,
  IEmployeeEditResponseDto,
} from '@features/employee-management/types/employee.dto';
import { IEmployeeDetailResolverResponse } from '@features/employee-management/types/employee.interface';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StepperComponent } from '@shared/components/stepper/stepper.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FormBase } from '@shared/base/form.base';

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
export class EditEmployeeComponent
  extends FormBase<IEmployeeEditFormDto>
  implements OnInit
{
  private readonly employeeService = inject(EmployeeService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialEmployeeData = signal<Record<
    string,
    Partial<IEmployeeEditFormDto>
  > | null>(null);
  private readonly originalEmail = signal<string>('');

  ngOnInit(): void {
    this.loadEmployeeDataFromRoute();

    this.stepperConfig = EDIT_EMPLOYEE_STEPPER_CONFIG;
    this.multiStepForm =
      this.formService.createMultiStepForm<IEmployeeEditFormDto>(
        EDIT_EMPLOYEE_FORM_CONFIG,
        this.destroyRef,
        this.initialEmployeeData()
      );
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

    this.originalEmail.set(employeeDetailFromResolver.email);

    const prefilledEmployeeData = this.preparePrefilledFormData(
      employeeDetailFromResolver
    );
    this.initialEmployeeData.set(prefilledEmployeeData);
  }

  private preparePrefilledFormData(
    employeeDetailFromResolver: IEmployeeDetailResolverResponse
  ): Record<string, Partial<IEmployeeEditFormDto>> {
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
      [EMPLOYEE_FORM_STEPS.PERSONAL_INFO]: {
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
      [EMPLOYEE_FORM_STEPS.EMPLOYMENT_INFO]: {
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
      [EMPLOYEE_FORM_STEPS.EDUCATION]: {
        degree,
        branch,
        passingYear: passoutYear?.toString(),
        degreeDocument: preloadedFiles?.DEGREE,
      },
      [EMPLOYEE_FORM_STEPS.BANK_INFO]: {
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName: bankHolderName,
      },
      [EMPLOYEE_FORM_STEPS.DOCUMENTS]: {
        aadharNumber,
        panNumber,
        drivingLicenseNumber: dlNumber,
        passportNumber,
        panDocument: preloadedFiles?.PAN,
        aadharDocument: preloadedFiles?.AADHAR,
        drivingLicenseDocument: preloadedFiles?.DRIVING_LICENSE,
        passportDocument: preloadedFiles?.PASSPORT,
      },
    };
  }

  protected override handleSubmit(): void {
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

  private prepareFormData(): IEmployeeEditFormDto {
    const formData = this.multiStepForm.getData();
    return formData;
  }

  private executeEditEmployee(
    formData: IEmployeeEditFormDto,
    employeeId: string
  ): void {
    this.loadingService.show({
      title: EMPLOYEE_MESSAGES.LOADING.EDIT,
      message: EMPLOYEE_MESSAGES.LOADING_MESSAGES.EDIT,
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
        next: (response: IEmployeeEditResponseDto) => {
          this.notificationService.success(EMPLOYEE_MESSAGES.SUCCESS.EDIT);
          this.handlePostEditNavigation(response);
        },
        error: error => {
          this.logger.error(EMPLOYEE_MESSAGES.ERROR.EDIT, error);
          this.notificationService.error(EMPLOYEE_MESSAGES.ERROR.EDIT);
        },
      });
  }

  private handlePostEditNavigation(response: IEmployeeEditResponseDto): void {
    const { email: loggedInUserEmail } = this.authService.user() ?? {};
    const originalEmail = this.originalEmail();
    const newEmail = response.email;

    const isEditingOwnProfile = loggedInUserEmail === originalEmail;

    if (isEditingOwnProfile) {
      const hasEmailChanged = originalEmail !== newEmail;

      if (hasEmailChanged) {
        this.logoutAndNavigateToLogin();
      } else {
        this.authService.updateUserDetails({
          firstName: response.firstName,
          lastName: response.lastName,
          designation: response.designation,
          profilePicture: response.profilePicture,
        });
        this.navigateToEmployeeList();
      }
    } else {
      this.navigateToEmployeeList();
    }
  }

  private navigateToEmployeeList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.EMPLOYEE, ROUTES.EMPLOYEE.LIST];
    void this.routerNavigationService.navigateToRoute(routeSegments);
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
              EMPLOYEE_MESSAGES.SUCCESS.EMAIL_UPDATED_LOGOUT
            );
            const routeSegments = [ROUTE_BASE_PATHS.AUTH, ROUTES.AUTH.LOGIN];
            void this.routerNavigationService.navigateToRoute(routeSegments);
          },
          error: error => {
            this.logger.error('Error during logout', error);
            this.notificationService.error('Error during logout');
          },
        });
    }, 100);
  }

  protected onReset(): void {
    this.onResetMultiStepForm(this.initialEmployeeData() ?? {});
  }

  protected override onResetParticularForm(
    initialData?: Partial<IEmployeeEditFormDto>
  ): void {
    const stepInitialData =
      initialData ?? this.initialEmployeeData()?.[this.activeStep().toString()];
    super.onResetParticularForm(stepInitialData);
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Employee',
      subtitle: 'Edit an employee',
    };
  }
}
