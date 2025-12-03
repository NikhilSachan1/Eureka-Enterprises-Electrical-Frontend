import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AppConfigService } from '@core/services/app-config.service';
import { LoggerService } from '@core/services/logger.service';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceApplyRequestDto,
  IAttendanceCurrentStatusGetResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { ICONS } from '@shared/constants/icon.constants';
import {
  EButtonActionType,
  EButtonVariant,
  IButtonConfig,
  IEnhancedForm,
  IPageHeaderConfig,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { EApplyAttendanceAction } from '@features/attendance-management/types/attendance.enum';
import { getApplyAttendanceFormConfig } from '@features/attendance-management/config/form/apply-attendance.config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class ApplyAttendanceComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly authService = inject(AuthService);
  protected readonly appConfig = inject(AppConfigService);
  protected readonly attendanceService = inject(AttendanceService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly logger = inject(LoggerService);
  protected readonly routerNavigationService = inject(RouterNavigationService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly destroyRef = inject(DestroyRef);

  protected readonly currentStatusData =
    signal<IAttendanceCurrentStatusGetResponseDto | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly isEditingAssignment = signal(false);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected assignmentHeaderButtonConfig = computed(() =>
    this.getAssignmentHeaderButtonConfig()
  );

  protected readonly todayDate = new Date();
  protected readonly ALL_APPLY_ATTENDANCE_ACTIONS = EApplyAttendanceAction;
  protected readonly ALL_ICONS = ICONS;
  protected form!: IEnhancedForm;

  ngOnInit(): void {
    // Determine if current user is a "driver" and build form config accordingly
    const currentUser = this.authService.getCurrentUser();
    const isDriverUser =
      (currentUser?.designation ?? '').toLowerCase() === 'driver';

    this.form = this.formService.createForm(
      getApplyAttendanceFormConfig(isDriverUser)
    );
    this.loadCurrentStatusDataFromRoute();
  }

  private loadCurrentStatusDataFromRoute(): void {
    const currentStatusDataFromRoute = this.activatedRoute.snapshot.data[
      'currentStatus'
    ] as IAttendanceCurrentStatusGetResponseDto;

    if (!currentStatusDataFromRoute) {
      this.logger.logUserAction('No current status data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.ATTENDANCE,
        ROUTES.ATTENDANCE.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }
    this.currentStatusData.set(currentStatusDataFromRoute);

    if (this.form) {
      this.form.patch({
        locationName: this.currentStatusData()?.location,
        clientName: this.currentStatusData()?.clientName,
        associateEmployeeName: this.currentStatusData()?.associateEmployeeName,
      });
    }
  }

  protected onSubmit(applyAttendanceStatus: EApplyAttendanceAction): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData(applyAttendanceStatus);
    this.executeForceApplyAttendance(formData, applyAttendanceStatus);
  }

  private prepareFormData(
    applyAttendanceStatus: EApplyAttendanceAction
  ): IAttendanceApplyRequestDto {
    //TODO: Add associate employee and associated vehicle name once we have the associate employee and associated vehicle name functionality

    const { clientName, locationName } = this.form.getData() as {
      clientName: string;
      locationName: string;
    };

    return {
      notes: `${clientName} - ${locationName}`,
      action: applyAttendanceStatus,
    };
  }

  protected executeForceApplyAttendance(
    formData: IAttendanceApplyRequestDto,
    applyAttendanceStatus: EApplyAttendanceAction
  ): void {
    this.isSubmitting.set(true);
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
          this.notificationService.success(
            `${applyAttendanceStatus} successfull`
          );
        },
        error: () => {
          this.notificationService.error('Failed to apply attendance');
        },
      });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Apply Attendance',
      subtitle: 'Check in or check out from your assigned location',
      showHeaderButton: false,
    };
  }

  private getAssignmentHeaderButtonConfig(): Partial<IButtonConfig> {
    if (this.isEditingAssignment()) {
      return {
        id: EButtonActionType.SUBMIT,
        icon: ICONS.ACTIONS.CHECK,
        variant: EButtonVariant.TEXT,
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Apply attendance form validation failed');
      return false;
    }
    return true;
  }
}
