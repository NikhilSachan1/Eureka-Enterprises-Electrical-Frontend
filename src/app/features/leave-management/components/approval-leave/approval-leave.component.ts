import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { APPROVAL_ACTION_LEAVE_FORM_CONFIG } from '@features/leave-management/config';
import { LeaveService } from '@features/leave-management/services/leave.service';
import {
  isLeaveStartOnOrBeforeToday,
  shouldShowAttendanceStatusField,
} from '@features/leave-management/utils/leave.util';
import {
  ILeaveActionFormDto,
  ILeaveActionResponseDto,
  ILeaveActionUIFormDto,
  ILeaveGetBaseResponseDto,
} from '@features/leave-management/types/leave.dto';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import {
  EApprovalStatus,
  EButtonActionType,
  ETableActionTypeValue,
} from '@shared/types';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-approval-leave',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approval-leave.component.html',
  styleUrl: './approval-leave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalLeaveComponent
  extends FormBase<ILeaveActionUIFormDto>
  implements OnInit
{
  private readonly leaveService = inject(LeaveService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<ILeaveGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

  protected readonly shouldShowAttendanceStatus = computed(() => {
    const { fromDate } = this.selectedRecord()[0];
    return shouldShowAttendanceStatusField(
      this.dialogActionType(),
      new Date(fromDate)
    );
  });

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to approve/reject leave but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    const { fromDate: fromDateString } = record[0];
    const fromDate = new Date(fromDateString);

    this.form = this.formService.createForm<ILeaveActionUIFormDto>(
      APPROVAL_ACTION_LEAVE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          actionType,
          fromDate,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeLeaveApprovalAction(formData);
  }

  private prepareFormData(): ILeaveActionFormDto {
    const record = this.selectedRecord();
    const formData = this.form.getData();
    const [{ fromDate: fromDateRaw }] = record;
    const fromDate = new Date(fromDateRaw);

    let actionTypeValue!: ETableActionTypeValue;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      actionTypeValue = ETableActionTypeValue.APPROVED;
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      actionTypeValue = ETableActionTypeValue.REJECTED;
    } else if (this.dialogActionType() === EButtonActionType.CANCEL) {
      actionTypeValue = ETableActionTypeValue.CANCELLED;
    }

    const isApprove = this.dialogActionType() === EButtonActionType.APPROVE;
    // Future leave: do not send attendance — API rejects attendance when the period has not started.
    const attendanceStatus = isApprove
      ? isLeaveStartOnOrBeforeToday(fromDate)
        ? EAttendanceStatus.LEAVE
        : undefined
      : formData.attendanceStatus;

    return {
      ...formData,
      attendanceStatus,
      leaveIds: record.map((row: ILeaveGetBaseResponseDto) => row.id),
      approvalStatus: actionTypeValue as unknown as EApprovalStatus,
    };
  }

  private executeLeaveApprovalAction(formData: ILeaveActionFormDto): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Leave',
        message: "We're approving the leave. This will just take a moment.",
      };
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Leave',
        message: "We're rejecting the leave. This will just take a moment.",
      };
    } else if (this.dialogActionType() === EButtonActionType.CANCEL) {
      loadingMessage = {
        title: 'Cancelling Leave',
        message: "We're cancelling the leave. This will just take a moment.",
      };
    }
    this.loadingService.show(loadingMessage);
    this.form.disable();

    this.leaveService
      .actionLeave(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ILeaveActionResponseDto) => {
          const dialogType = this.dialogActionType();
          const isApprove = dialogType === EButtonActionType.APPROVE;
          const isReject = dialogType === EButtonActionType.REJECT;

          this.notificationService.bulkOperationFromResponse(response, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) => {
                if (isApprove) {
                  return count === 1
                    ? 'Leave approved successfully.'
                    : `Successfully approved leave for ${count} records.`;
                }
                if (isReject) {
                  return count === 1
                    ? 'Leave rejected successfully.'
                    : `Successfully rejected leave for ${count} records.`;
                }
                return count === 1
                  ? 'Leave cancelled successfully.'
                  : `Successfully cancelled leave for ${count} records.`;
              },
              error: isApprove
                ? 'Failed to approve leave.'
                : isReject
                  ? 'Failed to reject leave.'
                  : 'Failed to cancel leave.',
              empty: isApprove
                ? 'Failed to approve leave.'
                : isReject
                  ? 'Failed to reject leave.'
                  : 'Failed to cancel leave.',
            },
          });

          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          const dialogType = this.dialogActionType();
          const isApprove = dialogType === EButtonActionType.APPROVE;
          const isReject = dialogType === EButtonActionType.REJECT;
          const msg = isApprove
            ? 'Failed to approve leave.'
            : isReject
              ? 'Failed to reject leave.'
              : 'Failed to cancel leave.';
          this.logger.error(
            isApprove
              ? 'Failed to approve leave'
              : isReject
                ? 'Failed to reject leave'
                : 'Failed to cancel leave',
            error
          );
          this.notificationService.error(msg);
        },
      });
  }
}
