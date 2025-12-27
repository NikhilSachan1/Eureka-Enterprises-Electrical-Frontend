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
import { LoggerService } from '@core/services';
import { getApprovalActionExpenseFormConfig } from '@features/expense-management/config/form/approval-action-expense.config';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import {
  IExpenseActionRequestDto,
  IExpenseActionResponseDto,
  IExpenseGetBaseResponseDto,
} from '@features/expense-management/types/expense.dto';
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
  IDialogActionHandler,
  IEnhancedForm,
} from '@shared/types';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-approval-expense',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approval-expense.component.html',
  styleUrl: './approval-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalExpenseComponent implements OnInit, IDialogActionHandler {
  private readonly formService = inject(FormService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly expenseService = inject(ExpenseService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IExpenseGetBaseResponseDto[]>();
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
        'Selected record is required to approve/reject expense but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType() as EButtonActionType;
    this.form = this.formService.createForm(
      getApprovalActionExpenseFormConfig(actionType),
      this.destroyRef
    );
  }

  onDialogAccept(): void {
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: IExpenseGetBaseResponseDto[]): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeExpenseApprovalAction(formData);
  }

  private prepareFormData(
    record: IExpenseGetBaseResponseDto[]
  ): IExpenseActionRequestDto {
    const { comment } = this.form.getData() as {
      comment: string;
    };

    let actionTypeValue: ETableActionTypeValue;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      actionTypeValue = ETableActionTypeValue.APPROVED;
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      actionTypeValue = ETableActionTypeValue.REJECTED;
    }

    return {
      approvals: record.map((row: IExpenseGetBaseResponseDto) => ({
        expenseId: row.id,
        approvalStatus: actionTypeValue as unknown as EApprovalStatus,
        approvalComment: comment,
      })),
    };
  }

  private executeExpenseApprovalAction(
    formData: IExpenseActionRequestDto
  ): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Expense',
        message: 'Please wait while we approve the expense...',
      };
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Expense',
        message: 'Please wait while we reject the expense...',
      };
    }
    this.isSubmitting.set(true);
    this.loadingService.show(loadingMessage);
    this.form.disable();

    this.expenseService
      .actionExpense(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IExpenseActionResponseDto) => {
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'expense',
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
      this.logger.warn('Approval expense form validation failed');
      return false;
    }
    return true;
  }
}
