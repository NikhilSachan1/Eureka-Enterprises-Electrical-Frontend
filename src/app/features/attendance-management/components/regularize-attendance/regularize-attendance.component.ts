import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  Signal,
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
  IAttendanceGetBaseResponseDto,
  IAttendanceRegularizedRequestDto,
  IAttendanceRegularizedResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { SHIFT_DATA } from '@shared/config';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EAttendanceStatus } from '../../types/attendance.enum';
import { filterOptionsByIncludeExclude, stringToArray } from '@shared/utility';
import { ATTENDANCE_STATUS_DATA } from '@shared/config/static-data.config';

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

  protected readonly selectedRecord = input<IAttendanceGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected form!: IEnhancedForm;

  protected readonly isSubmitting = signal(false);
  protected readonly initialFormData = signal<Record<string, unknown> | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected trackFields!: Record<string, Signal<any>>;

  ngOnInit(): void {
    this.loadRegularizeAttendanceDataFromSelectedRecord();
    this.form = this.formService.createForm(
      REGULARIZE_ATTENDANCE_FORM_CONFIG,
      this.initialFormData()
    );

    this.trackFields = this.formService.trackMultipleFieldChanges(
      this.form.formGroup,
      ['attendanceStatus'],
      this.destroyRef
    );
  }

  private loadRegularizeAttendanceDataFromSelectedRecord(): void {
    const records = this.selectedRecord();
    if (!records || records.length === 0) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to regularize attendance but was not provided'
      );
      return;
    }

    const [record] = records;
    const prefilledAttendanceData = this.preparePrefilledFormData(record);
    this.initialFormData.set(prefilledAttendanceData);
  }

  private preparePrefilledFormData(
    attendanceRecord: IAttendanceGetBaseResponseDto
  ): Record<string, unknown> {
    const [clientName, location] = stringToArray(
      attendanceRecord.notes ?? '',
      '-'
    );

    let normalizedStatus = (attendanceRecord.status || '').toLowerCase() as
      | EAttendanceStatus
      | '';

    const validAttendanceStatuses = filterOptionsByIncludeExclude(
      ATTENDANCE_STATUS_DATA,
      [],
      [EAttendanceStatus.CHECKED_IN, EAttendanceStatus.CHECKED_OUT]
    );

    if (
      !validAttendanceStatuses.some(status => status.value === normalizedStatus)
    ) {
      normalizedStatus = '';
    }

    return {
      attendanceStatus: normalizedStatus,
      clientName,
      locationName: location,
      associateEngineerName: '', // TODO: Add associate employee name once we have the associate employee name functionality
      associatedVehicle: '', // TODO: Add associated vehicle once we have the associated vehicle functionality
    };
  }

  onDialogAccept(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to regularize attendance but was not provided'
      );
      return;
    }
    this.onSubmit(record);
  }

  protected onSubmit(record: IAttendanceGetBaseResponseDto[]): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }
    const formData = this.prepareFormData(record[0]);
    this.executeRegularizeAttendance(formData, record[0]);
  }

  private prepareFormData(
    record: IAttendanceGetBaseResponseDto
  ): IAttendanceRegularizedRequestDto {
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
      userId: record.user.id,
      timezone: this.timezoneService.timezone,
    };
  }

  private executeRegularizeAttendance(
    formData: IAttendanceRegularizedRequestDto,
    record: IAttendanceGetBaseResponseDto
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Regularize Attendance',
      message: 'Please wait while we regularize the attendance...',
    });
    this.form.disable();

    this.attendanceService
      .regularizedAttendance(formData, record.id)
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
          const successCallback = this.onSuccess();
          successCallback?.();
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

  protected showClientNameAndLocationFields(): boolean {
    return this.trackFields['attendanceStatus']() === EAttendanceStatus.PRESENT;
  }
}
