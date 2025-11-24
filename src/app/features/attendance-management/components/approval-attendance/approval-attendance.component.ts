import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/approval-action-attendance.config';
import { IEnhancedForm } from '@shared/models';
import {
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IAttendanceActionRequestDto,
  IAttendanceActionResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { IAttendance } from '@features/attendance-management/types/attendance.interface';
import { EButtonActionType, ETableActionTypeValue } from '@shared/types';
import { finalize } from 'rxjs';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';

@Component({
  selector: 'app-approval-attendance',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approval-attendance.component.html',
  styleUrl: './approval-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalAttendanceComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly attendanceService = inject(AttendanceService);

  protected form!: IEnhancedForm;

  ngOnInit(): void {
    this.form = this.formService.createForm(
      APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG
    );
  }

  protected onAttendanceApprovalAction(
    actionType: EButtonActionType,
    selectedRows: IAttendance[],
    dialogFormData?: Record<string, string>
  ): void {
    const formData = this.prepareAttendanceApprovalFormData(
      actionType,
      selectedRows,
      dialogFormData
    );

    this.executeAttendanceApprovalAction(formData, actionType);
  }

  private prepareAttendanceApprovalFormData(
    actionType: EButtonActionType,
    selectedRows: IAttendance[],
    dialogFormData?: Record<string, string>
  ): IAttendanceActionRequestDto {
    const { comment } = dialogFormData as { comment: string };
    let actionTypeValue = ETableActionTypeValue.APPROVED;

    if (actionType === EButtonActionType.APPROVE) {
      actionTypeValue = ETableActionTypeValue.APPROVED;
    } else if (actionType === EButtonActionType.REJECT) {
      actionTypeValue = ETableActionTypeValue.REJECTED;
    }

    return {
      approvals: selectedRows.map(row => ({
        attendanceId: row.id,
        approvalStatus: actionTypeValue,
        approvalComment: comment,
      })),
    };
  }

  private executeAttendanceApprovalAction(
    formData: IAttendanceActionRequestDto,
    actionType: EButtonActionType
  ): void {
    let loadingMessage;

    if (actionType === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Attendance',
        message: 'Please wait while we approve the attendance...',
      };
    } else if (actionType === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Attendance',
        message: 'Please wait while we reject the attendance...',
      };
    }

    this.loadingService.show(loadingMessage);

    this.attendanceService
      .actionAttendance(formData)
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceActionResponseDto) => {
          const { errors, result } = response;
          const hasErrors = errors.length > 0;
          const hasResult = result.length > 0;
          const errorCount = errors.length;
          const resultCount = result.length;
          const recordsCount = result.length + errors.length;

          if (hasErrors && hasResult) {
            if (recordsCount === 1) {
              this.notificationService.error(
                `Failed to ${actionType} attendance`
              );
            } else {
              this.notificationService.error(
                `Failed to ${actionType} attendance for ${errorCount} records and executed successfully for ${resultCount} records`
              );
            }
          } else if (hasErrors) {
            if (recordsCount === 1) {
              this.notificationService.error(
                `Failed to ${actionType} attendance`
              );
            } else {
              this.notificationService.error(
                `Failed to ${actionType} attendance for ${errorCount} records`
              );
            }
          } else if (hasResult) {
            if (recordsCount === 1) {
              this.notificationService.success(
                `Successfully ${actionType} attendance`
              );
            } else {
              this.notificationService.success(
                `Successfully ${actionType} attendance for ${resultCount} records`
              );
            }
          }
        },
      });
  }
}
