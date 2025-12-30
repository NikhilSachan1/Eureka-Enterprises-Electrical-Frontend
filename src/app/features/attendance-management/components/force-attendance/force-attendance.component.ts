import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { LoggerService, EnvironmentService } from '@core/services';
import { AttendanceService } from '../../services/attendance.service';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { FORCE_ATTENDANCE_FORM_CONFIG } from '../../config';
import { IAttendanceForceRequestDto } from '@features/attendance-management/types/attendance.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { FORCE_ATTENDANCE_PREFILLED_DATA } from '@shared/mock-data/force-attendance.mock-data';
import { transformDateFormat } from '@shared/utility';

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
export class ForceAttendanceComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly environmentService = inject(EnvironmentService);

  protected form!: IEnhancedForm;
  protected readonly initialAttendanceData = signal<Record<
    string,
    unknown
  > | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadMockData();
    this.form = this.formService.createForm(FORCE_ATTENDANCE_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialAttendanceData(),
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeForceAttendance(formData);
  }

  private prepareFormData(): IAttendanceForceRequestDto {
    const {
      date,
      forceReason,
      clientName,
      location,
      attendanceStatus,
      employeeName,
    } = this.form.getData() as {
      date: Date;
      forceReason: string;
      clientName: string;
      location: string;
      attendanceStatus: EAttendanceStatus;
      employeeName: string[];
    };

    return {
      userIds: employeeName,
      attendanceDate: transformDateFormat(date),
      notes: `${location} - ${clientName}`,
      reason: forceReason,
      status: attendanceStatus,
    };
  }

  private executeForceAttendance(formData: IAttendanceForceRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Force Attendance',
      message: 'Please wait while we force attendance...',
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
          this.notificationService.success('Attendance forced successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.ATTENDANCE,
            ROUTES.ATTENDANCE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to force attendance');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Force attendance form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Force Attendance Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Attendance',
      subtitle: 'Force attendance on behalf of an employee',
    };
  }

  private loadMockData(): void {
    if (this.environmentService.isTestDataEnabled) {
      this.initialAttendanceData.set(FORCE_ATTENDANCE_PREFILLED_DATA);
    }
  }
}
