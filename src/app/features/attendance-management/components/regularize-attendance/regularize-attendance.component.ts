import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { REGULARIZE_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/regularize-attendance.config';
import { IDialogActionHandler, IEnhancedForm } from '@shared/types';
import {
  ConfirmationDialogService,
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { LoggerService, TimezoneService } from '@core/services';
import {
  IAttendanceRegularizedRequestDto,
  IAttendanceRegularizedResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { SHIFT_DATA } from '@shared/config';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EAttendanceStatus } from '../../types/attendance.enum';

@Component({
  selector: 'app-regularize-attendance',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './regularize-attendance.component.html',
  styleUrl: './regularize-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegularizeAttendanceComponent
  implements OnInit, IDialogActionHandler
{
  protected readonly recordDetail = input();

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly timezoneService = inject(TimezoneService);
  private readonly loadingService = inject(LoadingService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly destroyRef = inject(DestroyRef);

  protected form!: IEnhancedForm;

  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(REGULARIZE_ATTENDANCE_FORM_CONFIG);
  }

  onDialogAccept(): void {
    this.onSubmit();
  }

  onDialogReject(): void {
    this.logger.info('Regularize attendance cancelled by user');
    this.form.reset();
    this.confirmationDialogService.closeDialog();
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeRegularizeAttendance(formData);
  }

  private prepareFormData(): IAttendanceRegularizedRequestDto {
    const { attendanceStatus, clientName, location } = this.form.getData() as {
      attendanceStatus: EAttendanceStatus;
      clientName: string;
      location: string;
    };

    return {
      checkInTime: SHIFT_DATA.START_TIME,
      checkOutTime: SHIFT_DATA.END_TIME,
      notes: `${clientName} - ${location}`,
      status: attendanceStatus,
      userId: 'l',
      timezone: this.timezoneService.timezone,
    };
  }

  private executeRegularizeAttendance(
    formData: IAttendanceRegularizedRequestDto
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Regularize Attendance',
      message: 'Please wait while we regularize the attendance...',
    });
    this.form.disable();

    this.attendanceService
      .regularizedAttendance(formData, 'attendanceId')
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceRegularizedResponseDto) => {
          const { message } = response;
          this.notificationService.success(message);
          this.confirmationDialogService.closeDialog();
        },
        error: () => {
          this.notificationService.error('Failed to regularize attendance');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Regularize attendance form validation failed');
      return false;
    }
    return true;
  }
}
