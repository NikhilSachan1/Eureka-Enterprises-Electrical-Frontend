import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
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
import { AttendanceAssignmentFieldsComponent } from '@features/attendance-management/components/attendance-assignment-fields/attendance-assignment-fields.component';
import { getSelectedEmployeeRole } from '@shared/utility';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { IAttendanceAssignmentSubmitPayload } from '@features/attendance-management/types/attendance.interface';
import {
  getAssignmentFormValues,
  isAttendanceAssignmentApplicable,
  NULL_ASSIGNMENT_FORM_VALUES,
} from '@features/attendance-management/utility/attendance-assignment.util';

@Component({
  selector: 'app-force-attendance',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    AttendanceAssignmentFieldsComponent,
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
  protected readonly showAssignedDriverFields = computed(
    () =>
      this.showAssignmentFields() &&
      this.employeeRoles().includes(EUserRole.EMPLOYEE) &&
      !this.employeeRoles().includes(EUserRole.DRIVER)
  );
  protected readonly assignmentSubmitPayload =
    signal<IAttendanceAssignmentSubmitPayload>(NULL_ASSIGNMENT_FORM_VALUES);
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
      if (!this.showRoleAssignmentFields()) {
        this.assignmentSubmitPayload.set(NULL_ASSIGNMENT_FORM_VALUES);
      }
    });
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

      if (
        this.showAssignmentFields() &&
        this.formContext.isEmployee &&
        this.cachedAssignmentResponse
      ) {
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
      'company',
      'contractor',
      'vehicle',
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
    return getAssignmentFormValues(response);
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
    const assignment = isAttendanceAssignmentApplicable(
      formData.attendanceStatus
    )
      ? this.assignmentSubmitPayload()
      : NULL_ASSIGNMENT_FORM_VALUES;

    return {
      ...formData,
      remark: formData.remark?.trim() ? formData.remark.trim() : null,
      ...assignment,
    } satisfies IAttendanceForceFormDto;
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
