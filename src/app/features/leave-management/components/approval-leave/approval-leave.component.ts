import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { LoggerService } from '@core/services';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { getApprovalActionLeaveFormConfig } from '@features/leave-management/config';
import { LeaveService } from '@features/leave-management/services/leave.service';
import {
  ILeaveActionRequestDto,
  ILeaveActionResponseDto,
  ILeaveGetBaseResponseDto,
} from '@features/leave-management/types/leave.dto';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import {
  EApprovalStatus,
  EButtonActionType,
  ETableActionTypeValue,
  IEnhancedForm,
} from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-approval-leave',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approval-leave.component.html',
  styleUrl: './approval-leave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalLeaveComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly leaveService = inject(LeaveService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<ILeaveGetBaseResponseDto[]>();
  protected readonly dialogActionType = input<EButtonActionType>();
  protected readonly onSuccess = input<() => void>();

  protected form!: IEnhancedForm;
  protected readonly EButtonActionTypeEnum = EButtonActionType;

  protected readonly isSubmitting = signal(false);

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

    const actionType = this.dialogActionType() as EButtonActionType;
    const { fromDate: fromDateString } = record[0];
    const fromDate = new Date(fromDateString);

    this.form = this.formService.createForm(
      getApprovalActionLeaveFormConfig(actionType, fromDate)
    );
  }

  onDialogAccept(): void {
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: ILeaveGetBaseResponseDto[]): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeLeaveApprovalAction(formData);
  }

  private prepareFormData(
    record: ILeaveGetBaseResponseDto[]
  ): ILeaveActionRequestDto {
    const { comment, attendanceStatus } = this.form.getData() as {
      comment: string;
      attendanceStatus: EAttendanceStatus;
    };

    let actionTypeValue: ETableActionTypeValue;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      actionTypeValue = ETableActionTypeValue.APPROVED;
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      actionTypeValue = ETableActionTypeValue.REJECTED;
    } else if (this.dialogActionType() === EButtonActionType.CANCEL) {
      actionTypeValue = ETableActionTypeValue.CANCELLED;
    }

    return {
      approvals: record.map((row: ILeaveGetBaseResponseDto) => ({
        leaveApplicationId: row.id,
        approvalStatus: actionTypeValue as unknown as EApprovalStatus,
        approvalComment: comment,
        attendanceStatus,
      })),
    };
  }

  private executeLeaveApprovalAction(formData: ILeaveActionRequestDto): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Leave',
        message: 'Please wait while we approve the leave...',
      };
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Leave',
        message: 'Please wait while we reject the leave...',
      };
    } else if (this.dialogActionType() === EButtonActionType.CANCEL) {
      loadingMessage = {
        title: 'Cancelling Leave',
        message: 'Please wait while we cancel the leave...',
      };
    }
    this.isSubmitting.set(true);
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

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Approval leave form validation failed');
      return false;
    }
    return true;
  }
}
