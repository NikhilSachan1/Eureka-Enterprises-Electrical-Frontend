import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceApplyFormDto,
  IAttendanceApplyUIFormDto,
  IAttendanceCurrentStatusGetFormDto,
  IAttendanceCurrentStatusGetResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EUserRole, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { ICONS } from '@shared/constants/icon.constants';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
  IButtonConfig,
  IPageHeaderConfig,
  ITrackedFields,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { EApplyAttendanceAction } from '@features/attendance-management/types/attendance.enum';
import { APPLY_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/apply-attendance.config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { APP_CONFIG } from '@core/config';
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { IContractorGetBaseResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import { EmployeeBaseSchema } from '@features/employee-management/schemas/base-employee.schema';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import type { z } from 'zod';
import { IEmployeeGetBaseResponseDto } from '@features/employee-management/types/employee.dto';

type VehicleApplyValue = z.infer<typeof VehicleBaseSchema>;
type EmployeeApplyValue = z.infer<typeof EmployeeBaseSchema>;

const EMPTY_DRIVER_ASSIGNMENT_VALUES: Partial<IAttendanceApplyUIFormDto> = {
  company: null,
  contractor: null,
  vehicle: null,
};

@Component({
  selector: 'app-apply-attendance',
  imports: [
    PageHeaderComponent,
    DatePipe,
    SecondsToDhmsPipe,
    TextCasePipe,
    ButtonComponent,
    ReactiveFormsModule,
    InputFieldComponent,
  ],
  templateUrl: './apply-attendance.component.html',
  styleUrl: './apply-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyAttendanceComponent
  extends FormBase<IAttendanceApplyUIFormDto>
  implements OnInit
{
  protected readonly attendanceService = inject(AttendanceService);
  private readonly authService = inject(AuthService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  private trackedApplyAttendanceFields!: ITrackedFields<IAttendanceApplyUIFormDto>;
  private lastLoadedEngineerStatusId: string | null = null;

  private readonly formContext = {
    isEmployee: false,
    isDriver: false,
  };

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected assignmentHeaderButtonConfig = computed(() =>
    this.getAssignmentHeaderButtonConfig()
  );
  protected readonly assignmentDisplayLabels = computed(() =>
    this.getAssignmentDisplayLabels()
  );

  protected readonly initialAttendanceData =
    signal<IAttendanceApplyUIFormDto | null>(null);
  protected readonly currentStatusData =
    signal<IAttendanceCurrentStatusGetResponseDto | null>(null);
  protected readonly isEditingAssignment = signal(false);

  protected readonly todayDate = new Date();
  protected readonly ALL_APPLY_ATTENDANCE_ACTIONS = EApplyAttendanceAction;
  protected readonly ALL_ICONS = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;
  protected isEmployeeUser = false;
  protected isDriverUser = false;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isEmployeeUser = currentUser?.activeRole === EUserRole.EMPLOYEE;
    this.isDriverUser = currentUser?.activeRole === EUserRole.DRIVER;
    this.formContext.isEmployee = this.isEmployeeUser;
    this.formContext.isDriver = this.isDriverUser;

    this.loadCurrentStatusDataFromRoute();

    this.form = this.formService.createForm<IAttendanceApplyUIFormDto>(
      APPLY_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialAttendanceData(),
        context: this.formContext,
      }
    );

    const trackedFields: (keyof IAttendanceApplyUIFormDto)[] = [
      'company',
      'contractor',
      'vehicle',
      'assignedEngineer',
    ];
    this.trackedApplyAttendanceFields =
      this.formService.trackMultipleFieldChanges<IAttendanceApplyUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );

    this.restoreDriverAssignmentFromCurrentStatus();
  }

  /**
   * Driver attendance status (status, check-in/out, work duration) comes from the
   * driver's own current-status API via route resolver (`currentStatusData`).
   *
   * Assignment fields (company, contractor, vehicle) are loaded only from the
   * selected assigned engineer's current-status API.
   */
  private restoreDriverAssignmentFromCurrentStatus(): void {
    if (!this.isDriverUser) {
      return;
    }

    const assignedEngineerId = this.initialAttendanceData()?.assignedEngineer;

    if (this.isBlankId(assignedEngineerId)) {
      return;
    }

    this.loadAssignedEngineerCurrentStatus(assignedEngineerId);
  }

  private getAssignmentDisplayLabels(): {
    companyName: string;
    companyCity: string;
    companyState: string;
    contractorName: string;
    engineer: string;
    vehicle: string;
  } {
    const v = this.trackedApplyAttendanceFields?.getValues();
    const companyId = v?.company;
    const contractorId = v?.contractor;
    const vehicleId = v?.vehicle;
    const engineerId = v?.assignedEngineer;

    let companyName = '-';
    let companyCity = '-';
    let companyState = '-';

    if (companyId) {
      const companyData = getMappedValueFromArrayOfObjects(
        this.appConfigurationService.companyList(),
        companyId,
        'value',
        'data'
      ) as ICompanyGetBaseResponseDto;

      companyName = companyData?.name?.trim() ?? '-';
      companyCity =
        getMappedValueFromArrayOfObjects(
          this.appConfigurationService.cities(),
          companyData.city,
          'value',
          'label'
        ) ??
        companyData?.city?.trim() ??
        '-';
      companyState =
        this.appConfigurationService
          .states()
          .find(s => s.value === companyData?.state?.trim())?.label ??
        companyData?.state?.trim() ??
        '-';
    }

    let contractorName = '-';
    if (contractorId) {
      const contractorData = getMappedValueFromArrayOfObjects(
        this.appConfigurationService.contractorList(),
        contractorId,
        'value',
        'data'
      ) as IContractorGetBaseResponseDto;
      contractorName = contractorData?.name?.trim() ?? '-';
    }

    let engineer = '-';
    if (engineerId) {
      const emp = getMappedValueFromArrayOfObjects(
        this.appConfigurationService.employeeList(),
        engineerId,
        'value',
        'data'
      ) as IEmployeeGetBaseResponseDto;
      engineer =
        `${emp?.firstName?.trim()} ${emp?.lastName?.trim()}`.trim() ?? '-';
    }

    let vehicle = '-';
    if (vehicleId) {
      const vehicleData = getMappedValueFromArrayOfObjects(
        this.appConfigurationService.vehicleList(),
        vehicleId,
        'value',
        'data'
      ) as VehicleApplyValue;
      vehicle = vehicleData?.registrationNo?.trim() ?? '-';
    }
    return {
      companyName,
      companyCity,
      companyState,
      contractorName,
      engineer,
      vehicle,
    };
  }

  private loadCurrentStatusDataFromRoute(): void {
    const currentStatusFromResolver = this.activatedRoute.snapshot.data[
      'currentStatus'
    ] as IAttendanceCurrentStatusGetResponseDto;

    if (!currentStatusFromResolver) {
      this.logger.logUserAction('No current status data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.ATTENDANCE,
        ROUTES.ATTENDANCE.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }
    const prefilledAttendanceData = this.preparePrefilledFormData(
      currentStatusFromResolver
    );
    this.currentStatusData.set(currentStatusFromResolver);
    this.initialAttendanceData.set(prefilledAttendanceData);
  }

  private loadAssignedEngineerCurrentStatus(
    assignedEngineerId: string,
    onSuccess?: () => void
  ): void {
    this.loadingService.show({
      title: 'Loading assigned engineer assignment',
      message:
        "We're loading the assigned engineer's assignment. This will just take a moment.",
    });

    const paramData: IAttendanceCurrentStatusGetFormDto = {
      employeeName: assignedEngineerId,
    };

    this.attendanceService
      .getAttendanceCurrentStatus(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceCurrentStatusGetResponseDto) => {
          this.form.patch(this.preparePrefilledAssignmentData(response));
          this.lastLoadedEngineerStatusId = assignedEngineerId;
          onSuccess?.();
        },
        error: error => {
          this.logger.error(
            'Error loading assigned engineer current status',
            error
          );
          this.notificationService.error(
            'Failed to load assigned engineer assignment'
          );
        },
      });
  }

  private preparePrefilledFormData(
    currentStatusFromResolver: IAttendanceCurrentStatusGetResponseDto
  ): IAttendanceApplyUIFormDto {
    if (this.isDriverUser) {
      return {
        ...EMPTY_DRIVER_ASSIGNMENT_VALUES,
        assignedEngineer:
          currentStatusFromResolver.assignedEngineer?.id ?? null,
        remark: null,
      } as IAttendanceApplyUIFormDto;
    }

    const { company, contractors, vehicle, assignedEngineer } =
      currentStatusFromResolver;
    return {
      company: company?.id ?? null,
      contractor: contractors?.[0]?.id ?? null,
      vehicle: vehicle?.id ?? null,
      assignedEngineer: assignedEngineer?.id ?? null,
      remark: null,
    };
  }

  private preparePrefilledAssignmentData(
    response: IAttendanceCurrentStatusGetResponseDto
  ): Partial<IAttendanceApplyUIFormDto> {
    // Assigned engineer is chosen by the driver; only load assignment details
    // from the engineer's current-status response.
    return {
      company: response.company?.id ?? null,
      contractor: response.contractors?.[0]?.id ?? null,
      vehicle: response.vehicle?.id ?? null,
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeApplyAttendance(formData);
  }

  private prepareFormData(): IAttendanceApplyFormDto {
    const formData = this.form.getData();
    const companyId = formData.company;
    const contractorId = formData.contractor;
    const vehicleId = formData.vehicle;
    const engineerId = formData.assignedEngineer;

    return {
      ...formData,
      remark: formData.remark?.trim() ? formData.remark.trim() : null,
      company: this.isBlankId(companyId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
            this.appConfigurationService.companyList(),
            companyId,
            'value',
            'data'
          ) as ICompanyGetBaseResponseDto) ?? null),
      contractor: this.isBlankId(contractorId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
            this.appConfigurationService.contractorList(),
            contractorId,
            'value',
            'data'
          ) as IContractorGetBaseResponseDto) ?? null),
      vehicle: this.isBlankId(vehicleId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
            this.appConfigurationService.vehicleList(),
            vehicleId,
            'value',
            'data'
          ) as VehicleApplyValue) ?? null),
      assignedEngineer: this.isBlankId(engineerId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
            this.appConfigurationService.employeeList(),
            engineerId,
            'value',
            'data'
          ) as EmployeeApplyValue) ?? null),
    } satisfies IAttendanceApplyFormDto;
  }

  private isBlankId(
    value: string | null | undefined
  ): value is null | undefined | '' {
    return value === null || value === undefined || value === '';
  }

  protected executeApplyAttendance(formData: IAttendanceApplyFormDto): void {
    this.loadingService.show({
      title: 'Apply Attendance',
      message: "We're submitting attendance. This will just take a moment.",
    });

    this.attendanceService
      .applyAttendance(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          const routeSegments = [
            ROUTE_BASE_PATHS.ATTENDANCE,
            ROUTES.ATTENDANCE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
          this.notificationService.success('Attendance applied successfully');
        },
        error: () => {
          this.notificationService.error('Failed to apply attendance');
        },
      });
  }

  private getAssignmentHeaderButtonConfig(): Partial<IButtonConfig> {
    if (this.isEditingAssignment()) {
      return {
        id: EButtonActionType.SUBMIT,
        icon: ICONS.ACTIONS.CHECK,
        variant: EButtonVariant.TEXT,
        severity: EButtonSeverity.SUCCESS,
      };
    }

    return {
      id: EButtonActionType.EDIT,
      icon: ICONS.ACTIONS.EDIT,
      variant: EButtonVariant.TEXT,
    };
  }

  protected toggleAssignmentEditing(): void {
    if (this.isDriverUser) {
      this.toggleDriverAssignmentEditing();
      return;
    }

    this.isEditingAssignment.update(isEditing => !isEditing);
  }

  private toggleDriverAssignmentEditing(): void {
    if (this.isEditingAssignment()) {
      const assignedEngineerId = this.form.formGroup.get('assignedEngineer')
        ?.value as string | null;

      if (this.isBlankId(assignedEngineerId)) {
        const engineerControl = this.form.formGroup.get('assignedEngineer');
        engineerControl?.markAsTouched();
        engineerControl?.updateValueAndValidity();
        return;
      }

      if (assignedEngineerId === this.lastLoadedEngineerStatusId) {
        this.isEditingAssignment.set(false);
        return;
      }

      this.loadAssignedEngineerCurrentStatus(assignedEngineerId, () => {
        this.isEditingAssignment.set(false);
      });
      return;
    }

    this.isEditingAssignment.set(true);
  }

  protected onResetAssignmentForm(): void {
    const initial = this.initialAttendanceData();
    this.lastLoadedEngineerStatusId = null;
    this.onResetSingleForm(initial ?? undefined);
  }

  protected getAttendanceStatusLabel(
    status: string | null | undefined
  ): string {
    const raw = status?.trim() ?? '';
    if (!raw) {
      return 'Not checked in yet';
    }
    const label = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.attendanceStatus(),
      raw
    );
    const display = String(label ?? '').trim();
    return display || 'Not checked in yet';
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Apply Attendance',
      subtitle: 'Check in or check out from your assigned location',
      showHeaderButton: false,
    };
  }
}
