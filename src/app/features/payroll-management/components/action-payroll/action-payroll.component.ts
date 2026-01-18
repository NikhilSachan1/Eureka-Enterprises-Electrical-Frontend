import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ACTION_PAYROLL_FORM_CONFIG } from '@features/payroll-management/config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  IActionPayrollFormDto,
  IActionPayrollResponseDto,
  IActionPayrollUIFormDto,
  IPayslipGetBaseResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import { EPayslipStatus } from '@features/payroll-management/types/payroll.enum';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { PAYROLL_MESSAGES } from '@features/payroll-management/constants';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import { finalize, Observable } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-action-payroll',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-payroll.component.html',
  styleUrl: './action-payroll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionPayrollComponent
  extends FormBase<IActionPayrollUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly payrollService = inject(PayrollService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IPayslipGetBaseResponseDto[]>();
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
        PAYROLL_MESSAGES.VALIDATION.ACTION_PAYROLL_RECORD_REQUIRED
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IActionPayrollUIFormDto>(
      ACTION_PAYROLL_FORM_CONFIG,
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
    this.executePayrollAction(formData);
  }

  private prepareFormData(): IActionPayrollFormDto {
    const record = this.selectedRecord();

    const formData = this.form.getData();
    let actionTypeValue!: EPayslipStatus;

    if (this.dialogActionType() === EButtonActionType.PAID) {
      actionTypeValue = EPayslipStatus.PAID;
    } else if (this.dialogActionType() === EButtonActionType.CANCEL) {
      actionTypeValue = EPayslipStatus.CANCELLED;
    } else if (this.dialogActionType() === EButtonActionType.APPROVE) {
      actionTypeValue = EPayslipStatus.APPROVED;
    }

    return {
      ...formData,
      payrollIds: record.map((row: IPayslipGetBaseResponseDto) => row.id),
      actionName:
        this.dialogActionType() !== EButtonActionType.CANCEL
          ? actionTypeValue
          : null,
    };
  }

  private executePayrollAction(formData: IActionPayrollFormDto): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.PAID) {
      loadingMessage = {
        title: PAYROLL_MESSAGES.LOADING.PAID,
        message: PAYROLL_MESSAGES.LOADING_MESSAGES.PAID,
      };
    } else if (this.dialogActionType() === EButtonActionType.CANCEL) {
      loadingMessage = {
        title: PAYROLL_MESSAGES.LOADING.CANCEL,
        message: PAYROLL_MESSAGES.LOADING_MESSAGES.CANCEL,
      };
    } else if (this.dialogActionType() === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: PAYROLL_MESSAGES.LOADING.APPROVE,
        message: PAYROLL_MESSAGES.LOADING_MESSAGES.APPROVE,
      };
    }
    this.loadingService.show(loadingMessage);
    this.form.disable();

    let action$: Observable<IActionPayrollResponseDto>;
    if (this.dialogActionType() === EButtonActionType.CANCEL) {
      action$ = this.payrollService.cancelPayroll(formData);
    } else {
      action$ = this.payrollService.actionPayroll(formData);
    }

    action$
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IActionPayrollResponseDto) => {
          const { errors, success, failed } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: PAYROLL_MESSAGES.ENTITY.LABEL_PAYROLL,
            actionLabel: this.dialogActionType() as string,
            errors,
            result: [],
            success,
            failed,
          });

          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
