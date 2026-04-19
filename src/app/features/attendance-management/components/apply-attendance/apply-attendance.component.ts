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

  ngOnInit(): void {
    this.loadCurrentStatusDataFromRoute();

    const currentUser = this.authService.getCurrentUser();
    const isDriverUser = currentUser?.activeRole === EUserRole.DRIVER;

    this.form = this.formService.createForm<IAttendanceApplyUIFormDto>(
      APPLY_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialAttendanceData(),
        context: {
          isDriver: isDriverUser,
        },
      }
    );

    const trackedFields: (keyof IAttendanceApplyUIFormDto)[] = [
      'company',
      'contractors',
      'vehicle',
      'assignedEngineer',
    ];
    this.trackedApplyAttendanceFields =
      this.formService.trackMultipleFieldChanges<IAttendanceApplyUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private getAssignmentDisplayLabels(): {
    companyName: string;
    companyCity: string;
    companyState: string;
    contractors: string;
    engineer: string;
    vehicle: string;
  } {
    const v = this.trackedApplyAttendanceFields?.getValues();
    const companyId = v?.company;
    const contractorIds = v?.contractors;
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

    let contractorsNames = '-';
    if (contractorIds?.length) {
      const contractorsData = contractorIds.map(
        id =>
          getMappedValueFromArrayOfObjects(
            this.appConfigurationService.contractorList(),
            id,
            'value',
            'data'
          ) as IContractorGetBaseResponseDto
      );
      contractorsNames = contractorsData.map(c => c.name).join(', ');
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
      contractors: contractorsNames,
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

  private preparePrefilledFormData(
    currentStatusFromResolver: IAttendanceCurrentStatusGetResponseDto
  ): IAttendanceApplyUIFormDto {
    const { company, contractors, vehicle, assignedEngineer } =
      currentStatusFromResolver;
    return {
      company: company?.id ?? null,
      contractors: contractors?.map(c => c?.id ?? '') ?? [],
      vehicle: vehicle?.id ?? null,
      assignedEngineer: assignedEngineer?.id ?? null,
      remark: null,
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeApplyAttendance(formData);
  }

  private prepareFormData(): IAttendanceApplyFormDto {
    const formData = this.form.getData();
    const companyId = formData.company;
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
      contractors: formData.contractors.map(c =>
        this.isBlankId(c)
          ? null
          : ((getMappedValueFromArrayOfObjects(
              this.appConfigurationService.contractorList(),
              c,
              'value',
              'data'
            ) as IContractorGetBaseResponseDto) ?? null)
      ),
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
    this.isEditingAssignment.update(isEditing => !isEditing);
  }

  protected onResetAssignmentForm(): void {
    const initial = this.initialAttendanceData();
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
