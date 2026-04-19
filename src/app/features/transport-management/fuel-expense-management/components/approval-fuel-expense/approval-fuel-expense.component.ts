import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IFuelExpenseActionFormDto,
  IFuelExpenseActionResponseDto,
  IFuelExpenseActionUIFormDto,
  IFuelExpenseGetBaseResponseDto,
} from '../../types/fuel-expense.dto';
import {
  EApprovalStatus,
  EButtonActionType,
  ETableActionTypeValue,
  IDialogActionHandler,
} from '@shared/types';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { APPROVAL_ACTION_FUEL_EXPENSE_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-approval-fuel-expense',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approval-fuel-expense.component.html',
  styleUrl: './approval-fuel-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalFuelExpenseComponent
  extends FormBase<IFuelExpenseActionUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IFuelExpenseGetBaseResponseDto[]>();
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
        'Selected record is required to approve/reject fuel expense but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IFuelExpenseActionUIFormDto>(
      APPROVAL_ACTION_FUEL_EXPENSE_FORM_CONFIG,
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
    this.executeFuelExpenseApprovalAction(formData);
  }

  private prepareFormData(): IFuelExpenseActionFormDto {
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
      fuelExpenseIds: record.map(
        (row: IFuelExpenseGetBaseResponseDto) => row.id
      ),
      approvalStatus: actionTypeValue as unknown as EApprovalStatus,
    };
  }

  private executeFuelExpenseApprovalAction(
    formData: IFuelExpenseActionFormDto
  ): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Fuel Expense',
        message:
          "We're approving the fuel expense. This will just take a moment.",
      };
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Fuel Expense',
        message:
          "We're rejecting the fuel expense. This will just take a moment.",
      };
    }
    this.loadingService.show(loadingMessage);
    this.form.disable();

    this.fuelExpenseService
      .actionFuelExpense(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IFuelExpenseActionResponseDto) => {
          const isApprove =
            this.dialogActionType() === EButtonActionType.APPROVE;
          const enriched = {
            ...response,
            result: response.result.map(r => ({
              ...r,
              message: response.message,
            })),
          };

          this.notificationService.bulkOperationFromResponse(enriched, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) =>
                count === 1
                  ? isApprove
                    ? 'Fuel expense approved successfully.'
                    : 'Fuel expense rejected successfully.'
                  : isApprove
                    ? `Successfully approved fuel expense for ${count} records.`
                    : `Successfully rejected fuel expense for ${count} records.`,
              error: isApprove
                ? 'Failed to approve fuel expense.'
                : 'Failed to reject fuel expense.',
              empty: isApprove
                ? 'Failed to approve fuel expense.'
                : 'Failed to reject fuel expense.',
            },
          });

          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          const isApprove =
            this.dialogActionType() === EButtonActionType.APPROVE;
          this.logger.error(
            isApprove
              ? 'Failed to approve fuel expense'
              : 'Failed to reject fuel expense',
            error
          );
          this.notificationService.error(
            isApprove
              ? 'Failed to approve fuel expense.'
              : 'Failed to reject fuel expense.'
          );
        },
      });
  }
}
