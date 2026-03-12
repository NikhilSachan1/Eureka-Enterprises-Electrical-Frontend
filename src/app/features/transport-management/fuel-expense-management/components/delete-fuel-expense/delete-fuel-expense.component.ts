import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { ConfirmationDialogService } from '@shared/services';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import {
  IFuelExpenseDeleteFormDto,
  IFuelExpenseDeleteResponseDto,
  IFuelExpenseGetBaseResponseDto,
} from '../../types/fuel-expense.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-fuel-expense',
  imports: [],
  templateUrl: './delete-fuel-expense.component.html',
  styleUrl: './delete-fuel-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteFuelExpenseComponent
  extends FormBase<IFuelExpenseDeleteFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IFuelExpenseGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeFuelExpenseDeleteAction(formData);
  }

  private prepareFormData(
    record: IFuelExpenseGetBaseResponseDto[]
  ): IFuelExpenseDeleteFormDto {
    return {
      fuelExpenseIds: record.map(
        (row: IFuelExpenseGetBaseResponseDto) => row.id
      ),
    };
  }

  private executeFuelExpenseDeleteAction(
    formData: IFuelExpenseDeleteFormDto
  ): void {
    const loadingMessage = {
      title: 'Deleting Fuel Expense',
      message: 'Please wait while we delete the fuel expense...',
    };
    this.loadingService.show(loadingMessage);

    this.fuelExpenseService
      .deleteFuelExpense(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IFuelExpenseDeleteResponseDto) => {
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'fuel expense',
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
