import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/approval-action-attendance.config';
import {
  EButtonActionType,
  ETableActionTypeValue,
  EApprovalStatus,
  IDialogActionHandler,
} from '@shared/types';
import { ConfirmationDialogService } from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IAttendanceActionFormDto,
  IAttendanceActionResponseDto,
  IAttendanceActionUIFormDto,
  IAttendanceGetBaseResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { finalize } from 'rxjs';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-approval-attendance',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approval-attendance.component.html',
  styleUrl: './approval-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalAttendanceComponent
  extends FormBase<IAttendanceActionUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAttendanceGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to approve/reject attendance but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IAttendanceActionUIFormDto>(
      APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          actionType,
        },
      }
    );
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAttendanceApprovalAction(formData);
  }

  private prepareFormData(): IAttendanceActionFormDto {
    const record = this.selectedRecord();

    const formData = this.form.getData();

    let actionTypeValue!: ETableActionTypeValue;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      actionTypeValue = ETableActionTypeValue.APPROVED;
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      actionTypeValue = ETableActionTypeValue.REJECTED;
    }

    return {
      ...formData,
      attendanceIds: record.map((row: IAttendanceGetBaseResponseDto) => row.id),
      approvalStatus: actionTypeValue as unknown as EApprovalStatus,
    };
  }

  private executeAttendanceApprovalAction(
    formData: IAttendanceActionFormDto
  ): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Attendance',
        message: 'Please wait while we approve the attendance...',
      };
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Attendance',
        message: 'Please wait while we reject the attendance...',
      };
    }
    this.loadingService.show(loadingMessage);
    this.form.disable();

    this.attendanceService
      .actionAttendance(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceActionResponseDto) => {
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'attendance',
            actionLabel: this.dialogActionType() as string,
            errors,
            result,
          });

          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: () => {
          this.notificationService.error('Failed to approve/reject attendance');
        },
      });
  }
}
