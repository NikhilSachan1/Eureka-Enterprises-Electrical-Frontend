import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import {
  IExpenseDeleteRequestDto,
  IExpenseDeleteResponseDto,
  IExpenseGetBaseResponseDto,
} from '@features/expense-management/types/expense.dto';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-expense',
  imports: [],
  templateUrl: './delete-expense.component.html',
  styleUrl: './delete-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteExpenseComponent implements IDialogActionHandler {
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly expenseService = inject(ExpenseService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord = input<IExpenseGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly isSubmitting = signal(false);

  onDialogAccept(): void {
    this.onSubmit();
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    const record = this.selectedRecord();
    if (!record) {
      this.logger.error(
        'Selected record is required to delete expense but was not provided'
      );
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeExpenseDeleteAction(formData);
  }

  private prepareFormData(
    record: IExpenseGetBaseResponseDto[]
  ): IExpenseDeleteRequestDto {
    return {
      expenseIds: record.map((row: IExpenseGetBaseResponseDto) => row.id),
    };
  }

  private executeExpenseDeleteAction(formData: IExpenseDeleteRequestDto): void {
    const loadingMessage = {
      title: 'Deleting Expense',
      message: 'Please wait while we delete the expense...',
    };
    this.isSubmitting.set(true);
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
