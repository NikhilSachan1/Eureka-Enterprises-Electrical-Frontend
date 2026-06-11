import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceDeleteFormDto,
  IAttendanceDeleteResponseDto,
  IAttendanceGetBaseResponseDto,
} from '@features/attendance-management/types/attendance.dto';

@Component({
  selector: 'app-delete-attendance',
  imports: [],
  templateUrl: './delete-attendance.component.html',
  styleUrl: './delete-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAttendanceComponent
  extends FormBase<IAttendanceDeleteFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAttendanceGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete attendance but was not provided'
      );
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeAttendanceDeleteAction(formData);
  }

  private prepareFormData(
    records: IAttendanceGetBaseResponseDto[]
  ): IAttendanceDeleteFormDto {
    return {
      attendanceIds: records.map(row => row.id),
    };
  }

  private executeAttendanceDeleteAction(
    formData: IAttendanceDeleteFormDto
  ): void {
    this.loadingService.show({
      title: 'Deleting Attendance',
      message: "We're removing the attendance. This will just take a moment.",
    });

    this.attendanceService
      .deleteAttendance(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceDeleteResponseDto) => {
          this.notificationService.bulkOperationFromResponse(response, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) =>
                count === 1
                  ? 'Attendance deleted successfully.'
                  : `Successfully deleted ${count} attendance records.`,
              error: 'Failed to delete attendance.',
              empty: 'Failed to delete attendance.',
            },
          });

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete attendance.', error);
          this.notificationService.error('Failed to delete attendance.');
        },
      });
  }
}
