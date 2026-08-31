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
import { AttendanceAssignmentFieldsComponent } from '@features/attendance-management/components/attendance-assignment-fields/attendance-assignment-fields.component';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceApplyFormDto,
  IAttendanceApplyUIFormDto,
  IAttendanceCurrentStatusGetResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { IAttendanceAssignmentSubmitPayload } from '@features/attendance-management/types/attendance.interface';
import { APPLY_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/apply-attendance.config';
import {
  getAssignmentFormValues,
  isBlankAssignmentId,
  NULL_ASSIGNMENT_FORM_VALUES,
} from '@features/attendance-management/utility/attendance-assignment.util';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EUserRole, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { ICONS } from '@shared/constants/icon.constants';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
  IButtonConfig,
  IPageHeaderConfig,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { AuthService } from '@features/auth-management/services/auth.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { APP_CONFIG } from '@core/config';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

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
    AttendanceAssignmentFieldsComponent,
  ],
  templateUrl: './apply-attendance.component.html',
  styleUrl: './apply-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyAttendanceComponent
  extends FormBase<IAttendanceApplyUIFormDto>
  implements OnInit {
  protected readonly attendanceService = inject(AttendanceService);
  private readonly authService = inject(AuthService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  private readonly formContext = {
    isEmployee: false,
    isDriver: false,
  };

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected assignmentHeaderButtonConfig = computed(() =>
    this.getAssignmentHeaderButtonConfig()
  );

  protected readonly initialAttendanceData =
    signal<IAttendanceApplyUIFormDto | null>(null);
  protected readonly currentStatusData =
    signal<IAttendanceCurrentStatusGetResponseDto | null>(null);
  protected readonly isEditingAssignment = signal(false);
  protected readonly assignmentSubmitPayload =
    signal<IAttendanceAssignmentSubmitPayload>(NULL_ASSIGNMENT_FORM_VALUES);

  protected readonly todayDate = new Date();
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
    this.currentStatusData.set(currentStatusFromResolver);
    this.initialAttendanceData.set({
      ...getAssignmentFormValues(currentStatusFromResolver, {
        includeSiteFields: !this.isDriverUser,
      }),
      remark: null,
    });
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeApplyAttendance(formData);
  }

  private prepareFormData(): IAttendanceApplyFormDto {
    const formData = this.form.getData();

    return {
      ...formData,
      remark: formData.remark?.trim() ? formData.remark.trim() : null,
      ...(this.assignmentSubmitPayload() ?? NULL_ASSIGNMENT_FORM_VALUES),
    } satisfies IAttendanceApplyFormDto;
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
    if (this.isDriverUser && this.isEditingAssignment()) {
      const assignedEngineerId = this.form.formGroup.get('assignedEngineer')
        ?.value as string | null;
      if (isBlankAssignmentId(assignedEngineerId)) {
        const engineerControl = this.form.formGroup.get('assignedEngineer');
        engineerControl?.markAsTouched();
        engineerControl?.updateValueAndValidity();
        return;
      }
    }

    this.isEditingAssignment.update(isEditing => !isEditing);
  }

  protected onResetAssignmentForm(): void {
    this.onResetSingleForm(this.initialAttendanceData() ?? undefined);
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
