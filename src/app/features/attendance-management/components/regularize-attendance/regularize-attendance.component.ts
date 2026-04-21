import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { REGULARIZE_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/regularize-attendance.config';
import { IDialogActionHandler } from '@shared/types';
import { ConfirmationDialogService } from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IAttendanceGetBaseResponseDto,
  IAttendanceRegularizedFormDto,
  IAttendanceRegularizedResponseDto,
  IAttendanceRegularizedUIFormDto,
} from '@features/attendance-management/types/attendance.dto';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';

@Component({
  selector: 'app-regularize-attendance',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './regularize-attendance.component.html',
  styleUrl: './regularize-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegularizeAttendanceComponent
  extends FormBase<IAttendanceRegularizedUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAttendanceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

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

    const allowedStatuses = [
      EAttendanceStatus.PRESENT,
      EAttendanceStatus.ABSENT,
      EAttendanceStatus.LEAVE,
      EAttendanceStatus.HOLIDAY,
    ];

    this.form = this.formService.createForm<IAttendanceRegularizedUIFormDto>(
      REGULARIZE_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          attendanceStatus: allowedStatuses.includes(
            record[0].status as EAttendanceStatus
          )
            ? record[0].status
            : undefined,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const {
      id: attendanceId,
      user: { id: userId },
    } = this.selectedRecord()[0];

    const formData = this.prepareFormData(userId);
    this.executeRegularizeAttendance(formData, attendanceId);
  }

  private prepareFormData(userId: string): IAttendanceRegularizedFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      employeeName: userId,
    };
  }

  private executeRegularizeAttendance(
    formData: IAttendanceRegularizedFormDto,
    attendanceId: string
  ): void {
    this.loadingService.show({
      title: 'Updating attendance',
      message:
        "We're updating attendance changes. This will just take a moment.",
    });
    this.form.disable();

    this.attendanceService
      .regularizedAttendance(formData, attendanceId)
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
}
