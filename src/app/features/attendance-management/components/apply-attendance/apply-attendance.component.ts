import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceApplyFormDto,
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
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import { RouterNavigationService } from '@shared/services';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { EApplyAttendanceAction } from '@features/attendance-management/types/attendance.enum';
import { APPLY_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/apply-attendance.config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { APP_CONFIG } from '@core/config';

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
  extends FormBase<IAttendanceApplyFormDto>
  implements OnInit
{
  protected readonly attendanceService = inject(AttendanceService);
  private readonly authService = inject(AuthService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected assignmentHeaderButtonConfig = computed(() =>
    this.getAssignmentHeaderButtonConfig()
  );

  protected readonly initialAttendanceData =
    signal<IAttendanceApplyFormDto | null>(null);
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

    this.form = this.formService.createForm<IAttendanceApplyFormDto>(
      APPLY_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialAttendanceData(),
        context: {
          isDriver: isDriverUser,
        },
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
    const prefilledAttendanceData = this.preparePrefilledFormData(
      currentStatusFromResolver
    );
    this.currentStatusData.set(currentStatusFromResolver);
    this.initialAttendanceData.set(prefilledAttendanceData);
  }

  private preparePrefilledFormData(
    currentStatusFromResolver: IAttendanceCurrentStatusGetResponseDto
  ): IAttendanceApplyFormDto {
    const { location, clientName, associateEmployeeName } =
      currentStatusFromResolver;
    return {
      locationName: location,
      clientName,
      associateEngineerName: associateEmployeeName ?? '',
      associatedVehicle: '',
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeApplyAttendance(formData);
  }

  private prepareFormData(): IAttendanceApplyFormDto {
    const formData = this.form.getData();
    return formData;
  }

  protected executeApplyAttendance(formData: IAttendanceApplyFormDto): void {
    this.loadingService.show({
      title: 'Apply Attendance',
      message: 'Please wait while we apply attendance...',
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

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Apply Attendance',
      subtitle: 'Check in or check out from your assigned location',
      showHeaderButton: false,
    };
  }
}
