import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/approval-action-attendance.config';
import {
  IEnhancedForm,
  EButtonActionType,
  ETableActionTypeValue,
  EApprovalStatus,
  IDialogActionHandler,
} from '@shared/types';
import {
  ConfirmationDialogService,
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
  IAttendanceGetBaseResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { finalize } from 'rxjs';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { LoggerService } from '@core/services';

@Component({
  selector: 'app-approval-attendance',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approval-attendance.component.html',
  styleUrl: './approval-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalAttendanceComponent
  implements OnInit, IDialogActionHandler
{
  private readonly formService = inject(FormService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord = input<IAttendanceGetBaseResponseDto[]>();
  protected readonly dialogActionType = input<EButtonActionType>();
  protected readonly onSuccess = input<() => void>();

  protected form!: IEnhancedForm;
  protected readonly EButtonActionTypeEnum = EButtonActionType;

  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(
      APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG
    );
  }

  onDialogAccept(): void {
    this.onSubmit();
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const record = this.selectedRecord();
    if (!record) {
      this.logger.error(
        'Selected record is required to approve/reject attendance but was not provided'
      );
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeAttendanceApprovalAction(formData);
  }

  private prepareFormData(
    record: IAttendanceGetBaseResponseDto[]
  ): IAttendanceActionRequestDto {
    const { approveReason, rejectReason } = this.form.getData() as {
      approveReason: string;
      rejectReason: string;
    };

    let actionTypeValue: ETableActionTypeValue;
    let approvalComment: string | null = null;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      actionTypeValue = ETableActionTypeValue.APPROVED;
      approvalComment = approveReason;
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      actionTypeValue = ETableActionTypeValue.REJECTED;
      approvalComment = rejectReason;
    }

    return {
      approvals: record.map((row: IAttendanceGetBaseResponseDto) => ({
        attendanceId: row.id,
        approvalStatus: actionTypeValue as unknown as EApprovalStatus,
        approvalComment,
      })),
    };
  }

  private executeAttendanceApprovalAction(
    formData: IAttendanceActionRequestDto
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
    this.isSubmitting.set(true);
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
      this.logger.warn('Approval attendance form validation failed');
      return false;
    }
    return true;
  }
}
