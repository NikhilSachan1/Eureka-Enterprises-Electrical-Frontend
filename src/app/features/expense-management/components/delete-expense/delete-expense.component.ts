import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import {
  IExpenseDeleteFormDto,
  IExpenseDeleteResponseDto,
  IExpenseGetBaseResponseDto,
} from '@features/expense-management/types/expense.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-expense',
  imports: [],
  templateUrl: './delete-expense.component.html',
  styleUrl: './delete-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteExpenseComponent
  extends FormBase<IExpenseDeleteFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly expenseService = inject(ExpenseService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IExpenseGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete expense but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeExpenseDeleteAction(formData);
  }

  private prepareFormData(
    record: IExpenseGetBaseResponseDto[]
  ): IExpenseDeleteFormDto {
    return {
      expenseIds: record.map((row: IExpenseGetBaseResponseDto) => row.id),
    };
  }

  private executeExpenseDeleteAction(formData: IExpenseDeleteFormDto): void {
    const loadingMessage = {
      title: 'Deleting Expense',
      message: "We're removing the expense. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.expenseService
      .deleteExpense(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IExpenseDeleteResponseDto) => {
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'expense',
            actionLabel: EButtonActionType.DELETE,
            errors,
            result,
          });

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
