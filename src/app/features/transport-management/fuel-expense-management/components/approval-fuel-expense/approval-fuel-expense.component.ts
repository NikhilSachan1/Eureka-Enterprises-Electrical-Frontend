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
        message: 'Please wait while we approve the fuel expense...',
      };
    } else if (this.dialogActionType() === EButtonActionType.REJECT) {
      loadingMessage = {
        title: 'Rejecting Fuel Expense',
        message: 'Please wait while we reject the fuel expense...',
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
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'fuel expense',
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
