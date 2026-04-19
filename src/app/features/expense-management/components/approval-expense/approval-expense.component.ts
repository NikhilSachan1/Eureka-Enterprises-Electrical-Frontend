import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APPROVAL_ACTION_EXPENSE_FORM_CONFIG } from '@features/expense-management/config/form/approval-action-expense.config';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import {
  IExpenseActionFormDto,
  IExpenseActionResponseDto,
  IExpenseActionUIFormDto,
  IExpenseGetBaseResponseDto,
} from '@features/expense-management/types/expense.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import {
  EApprovalStatus,
  EButtonActionType,
  ETableActionTypeValue,
  IDialogActionHandler,
} from '@shared/types';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-approval-expense',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approval-expense.component.html',
  styleUrl: './approval-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalExpenseComponent
  extends FormBase<IExpenseActionUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly expenseService = inject(ExpenseService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IExpenseGetBaseResponseDto[]>();
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
        'Selected record is required to approve/reject expense but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IExpenseActionUIFormDto>(
      APPROVAL_ACTION_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          actionType,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeExpenseApprovalAction(formData);
  }

  private prepareFormData(): IExpenseActionFormDto {
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
      expenseIds: record.map((row: IExpenseGetBaseResponseDto) => row.id),
      approvalStatus: actionTypeValue as unknown as EApprovalStatus,
    };
  }

  private executeExpenseApprovalAction(formData: IExpenseActionFormDto): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Expense',
        message: "We're approving the expense. This will just take a moment.",
      };
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Expense',
        message: "We're rejecting the expense. This will just take a moment.",
      };
    }
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

          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
