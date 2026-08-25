import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceDeleteResponseDto,
  IAttendanceGetBaseResponseDto,
} from '@features/attendance-management/types/attendance.dto';

@Component({
  selector: 'app-delete-attendance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-attendance.component.html',
  styleUrl: './delete-attendance.component.scss',
})
export class DeleteAttendanceComponent
  implements OnInit, IDialogActionHandler
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IAttendanceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private attendanceId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete attendance but was not provided'
      );
      return;
    }
    this.attendanceId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.attendanceId) {
      return;
    }
    this.executeAttendanceDeleteAction(this.attendanceId);
  }

  private executeAttendanceDeleteAction(attendanceId: string): void {
    this.loadingService.show({
      title: 'Deleting Attendance',
      message: "We're removing the attendance. This will just take a moment.",
    });

    this.attendanceService
      .deleteAttendance(attendanceId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceDeleteResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete attendance.', error);
          this.notificationService.error('Failed to delete attendance.');
        },
      });
  }
}
