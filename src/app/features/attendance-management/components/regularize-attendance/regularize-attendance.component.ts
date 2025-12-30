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
  AppConfigurationService,
  ConfirmationDialogService,
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { LoggerService } from '@core/services';
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
  private readonly loadingService = inject(LoadingService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<IAttendanceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  protected form!: IEnhancedForm;

  protected readonly isSubmitting = signal(false);
  protected readonly initialFormData = signal<Record<string, unknown> | null>(
    null
  );

  ngOnInit(): void {
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

    this.loadRegularizeAttendanceDataFromSelectedRecord();
    this.form = this.formService.createForm(REGULARIZE_ATTENDANCE_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialFormData(),
    });
  }

  private loadRegularizeAttendanceDataFromSelectedRecord(): void {
    const [record] = this.selectedRecord();
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
      this.appConfigurationService.attendanceStatus(),
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
    this.onSubmit(this.selectedRecord());
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
          this.onSuccess()();
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
