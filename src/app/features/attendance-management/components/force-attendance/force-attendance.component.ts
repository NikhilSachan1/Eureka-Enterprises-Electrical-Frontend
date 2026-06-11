import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { FORCE_ATTENDANCE_FORM_CONFIG } from '../../config';
import {
  IAttendanceCurrentStatusGetFormDto,
  IAttendanceCurrentStatusGetResponseDto,
  IAttendanceForceFormDto,
  IAttendanceForceUIFormDto,
} from '@features/attendance-management/types/attendance.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EUserRole, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import {
  getMappedValueFromArrayOfObjects,
  getSelectedEmployeeRole,
} from '@shared/utility';
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { IContractorGetBaseResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import { EmployeeBaseSchema } from '@features/employee-management/schemas/base-employee.schema';
import type { z } from 'zod';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import {
  isAttendanceAssignmentApplicable,
  NULL_ASSIGNMENT_FORM_VALUES,
} from '@features/attendance-management/utility/attendance-assignment.util';

type VehicleApplyValue = z.infer<typeof VehicleBaseSchema>;
type EmployeeApplyValue = z.infer<typeof EmployeeBaseSchema>;

@Component({
  selector: 'app-force-attendance',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './force-attendance.component.html',
  styleUrl: './force-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceAttendanceComponent
  extends FormBase<IAttendanceForceUIFormDto>
  implements OnInit
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  private trackedAttendanceFields!: ITrackedFields<IAttendanceForceUIFormDto>;
  private lastLoadedStatusUserId: string | null = null;
  private lastSelectedDriverEmployeeId: string | null = null;
  private cachedAssignmentResponse: IAttendanceCurrentStatusGetResponseDto | null =
    null;

  private readonly formContext = {
    isEmployee: false,
    isDriver: false,
    isAssignmentApplicable: false,
  };

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly showAssignmentFields = computed(() =>
    isAttendanceAssignmentApplicable(this.getSelectedAttendanceStatus())
  );
  protected readonly showRoleAssignmentFields = computed(() => {
    if (!this.showAssignmentFields()) {
      return false;
    }

    const roles = this.employeeRoles();
    return (
      roles.includes(EUserRole.EMPLOYEE) || roles.includes(EUserRole.DRIVER)
    );
  });
  protected readonly showDriverAssignmentFields = computed(
    () =>
      this.showAssignmentFields() &&
      this.employeeRoles().includes(EUserRole.DRIVER)
  );
  protected readonly employeeRoles = computed(() => {
    const employeeName = this.trackedAttendanceFields?.employeeName?.();
    if (employeeName && typeof employeeName === 'string') {
      return getSelectedEmployeeRole(
        employeeName,
        this.appConfigurationService.employeeList()
      );
    }
    return [];
  });

  constructor() {
    super();
    effect(() => {
      if (!this.trackedAttendanceFields?.employeeName) {
        return;
      }

      const employeeName = this.trackedAttendanceFields.employeeName();
      const roles = this.employeeRoles();

      if (typeof employeeName !== 'string') {
        this.lastLoadedStatusUserId = null;
        this.lastSelectedDriverEmployeeId = null;
        this.cachedAssignmentResponse = null;
        return;
      }

      if (
        roles.includes(EUserRole.EMPLOYEE) &&
        employeeName !== this.lastLoadedStatusUserId
      ) {
        this.lastLoadedStatusUserId = employeeName;
        this.loadCurrentStatusDetail(employeeName);
        return;
      }

      if (
        roles.includes(EUserRole.DRIVER) &&
        employeeName !== this.lastSelectedDriverEmployeeId
      ) {
        this.lastSelectedDriverEmployeeId = employeeName;
        this.lastLoadedStatusUserId = null;
        this.cachedAssignmentResponse = null;

        if (this.form) {
          this.form.patch({ ...NULL_ASSIGNMENT_FORM_VALUES });
        }
      }
    });

    effect(() => {
      if (!this.trackedAttendanceFields?.assignedEngineer) {
        return;
      }

      if (!this.employeeRoles().includes(EUserRole.DRIVER)) {
        return;
      }

      const assignedEngineer = this.trackedAttendanceFields.assignedEngineer();

      if (typeof assignedEngineer !== 'string' || !assignedEngineer.trim()) {
        this.lastLoadedStatusUserId = null;
        this.cachedAssignmentResponse = null;
        return;
      }

      if (assignedEngineer !== this.lastLoadedStatusUserId) {
        this.lastLoadedStatusUserId = assignedEngineer;
        this.loadCurrentStatusDetail(assignedEngineer);
      }
    });

    effect(() => {
      if (!this.trackedAttendanceFields) {
        return;
      }

      this.trackedAttendanceFields.employeeName?.();
      this.trackedAttendanceFields.attendanceStatus?.();

      const roles = this.employeeRoles();
      this.formContext.isEmployee = roles.includes(EUserRole.EMPLOYEE);
      this.formContext.isDriver = roles.includes(EUserRole.DRIVER);
      this.formContext.isAssignmentApplicable = this.showAssignmentFields();

      if (this.form) {
        this.formService.refreshConditionalValidators(
          this.form.formGroup,
          this.form.fieldConfigs,
          this.formContext
        );
      }

      if (this.showAssignmentFields() && this.cachedAssignmentResponse) {
        this.applyPrefilledAssignmentData(this.cachedAssignmentResponse);
      } else if (!this.showAssignmentFields()) {
        this.clearAssignmentFields();
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAttendanceForceUIFormDto>(
      FORCE_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: this.formContext,
      }
    );

    const trackedFields: (keyof IAttendanceForceUIFormDto)[] = [
      'employeeName',
      'attendanceStatus',
      'assignedEngineer',
    ];
    this.trackedAttendanceFields =
      this.formService.trackMultipleFieldChanges<IAttendanceForceUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private loadCurrentStatusDetail(userId: string): void {
    const isDriver = this.employeeRoles().includes(EUserRole.DRIVER);

    this.loadingService.show({
      title: isDriver
        ? 'Loading assigned engineer assignment'
        : 'Loading employee assignment',
      message: isDriver
        ? "We're loading the assigned engineer's assignment. This will just take a moment."
        : "We're loading the employee assignment. This will just take a moment.",
    });

    const paramData = this.prepareParamDataForCurrentStatusDetail(userId);

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
          this.cachedAssignmentResponse = response;

          if (!this.showAssignmentFields()) {
            return;
          }

          this.applyPrefilledAssignmentData(response);
        },
        error: error => {
          this.logger.error('Error loading current status detail', error);
        },
      });
  }

  private prepareParamDataForCurrentStatusDetail(
    userId: string
  ): IAttendanceCurrentStatusGetFormDto {
    return {
      employeeName: userId,
    };
  }

  private preparePrefilledFormData(
    response: IAttendanceCurrentStatusGetResponseDto
  ): Partial<IAttendanceForceUIFormDto> {
    return {
      company: response.company?.id ?? null,
      contractor: response.contractors?.[0]?.id ?? null,
      vehicle: response.vehicle?.id ?? null,
    };
  }

  private applyPrefilledAssignmentData(
    response: IAttendanceCurrentStatusGetResponseDto
  ): void {
    this.form.patch(this.preparePrefilledFormData(response));
  }

  private clearAssignmentFields(): void {
    this.form.patch({ ...NULL_ASSIGNMENT_FORM_VALUES });
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForceAttendance(formData);
  }

  private prepareFormData(): IAttendanceForceFormDto {
    const formData = this.form.getData();

    if (!isAttendanceAssignmentApplicable(formData.attendanceStatus)) {
      return {
        ...formData,
        remark: formData.remark?.trim() ? formData.remark.trim() : null,
        ...NULL_ASSIGNMENT_FORM_VALUES,
      } satisfies IAttendanceForceFormDto;
    }

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
    } satisfies IAttendanceForceFormDto;
  }

  private isBlankId(
    value: string | null | undefined
  ): value is null | undefined | '' {
    return value === null || value === undefined || value === '';
  }

  private executeForceAttendance(formData: IAttendanceForceFormDto): void {
    this.loadingService.show({
      title: 'Recording attendance',
      message: "We're recording attendance. This will just take a moment.",
    });
    this.form.disable();

    this.attendanceService
      .forceAttendance(formData)
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
            'Force attendance applied successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.ATTENDANCE,
            ROUTES.ATTENDANCE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to apply force attendance');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getSelectedAttendanceStatus(): EAttendanceStatus | null {
    const status = this.trackedAttendanceFields?.attendanceStatus?.();
    return typeof status === 'string' ? (status as EAttendanceStatus) : null;
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Attendance',
      subtitle: 'Force attendance on behalf of an employee',
    };
  }
}
