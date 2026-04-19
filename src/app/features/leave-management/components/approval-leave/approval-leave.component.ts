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
import { APPROVAL_ACTION_LEAVE_FORM_CONFIG } from '@features/leave-management/config';
import { LeaveService } from '@features/leave-management/services/leave.service';
import { shouldShowAttendanceStatusField } from '@features/leave-management/utils/leave.util';
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

    let actionTypeValue!: ETableActionTypeValue;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      actionTypeValue = ETableActionTypeValue.APPROVED;
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      actionTypeValue = ETableActionTypeValue.REJECTED;
    } else if (this.dialogActionType() === EButtonActionType.CANCEL) {
      actionTypeValue = ETableActionTypeValue.CANCELLED;
    }

    return {
      ...formData,
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
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'leave',
            actionLabel: this.dialogActionType() as string,
            errors,
            result,
          });

          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
