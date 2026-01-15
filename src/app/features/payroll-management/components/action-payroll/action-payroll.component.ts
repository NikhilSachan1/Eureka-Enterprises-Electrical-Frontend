import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { ACTION_PAYROLL_FORM_CONFIG } from '@features/payroll-management/config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  IActionPayrollFormDto,
  IActionPayrollResponseDto,
  IPayslipGetBaseResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import { EPayslipStatus } from '@features/payroll-management/types/payroll.enum';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import {
  EButtonActionType,
  IDialogActionHandler,
  IEnhancedForm,
  IFormConfig,
} from '@shared/types';
import { finalize, Observable } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-action-payroll',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-payroll.component.html',
  styleUrl: './action-payroll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionPayrollComponent implements OnInit, IDialogActionHandler {
  private readonly formService = inject(FormService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly payrollService = inject(PayrollService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IPayslipGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected form!: IEnhancedForm<IActionPayrollFormDto>;
  protected readonly EButtonActionTypeEnum = EButtonActionType;

  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to approve/cancell/paid payroll but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IActionPayrollFormDto>(
      ACTION_PAYROLL_FORM_CONFIG as IFormConfig<IActionPayrollFormDto>,
      {
        destroyRef: this.destroyRef,
        defaultValues: null,
        context: {
          actionType,
        },
      }
    );
  }

  onDialogAccept(): void {
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: IPayslipGetBaseResponseDto[]): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executePayrollAction(formData);
  }

  private prepareFormData(
    record: IPayslipGetBaseResponseDto[]
  ): IActionPayrollFormDto {
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
        title: 'Marking as Paid',
        message: 'Please wait while we mark the payslip as paid...',
      };
    } else if (this.dialogActionType() === EButtonActionType.CANCEL) {
      loadingMessage = {
        title: 'Cancelling Payslip',
        message: 'Please wait while we cancel the payslip...',
      };
    } else if (this.dialogActionType() === EButtonActionType.APPROVE) {
      loadingMessage = {
        title: 'Approving Payslip',
        message: 'Please wait while we approve the payslip...',
      };
    }
    this.isSubmitting.set(true);
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
            entityLabel: 'payroll',
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Action payroll form validation failed');
      return false;
    }
    return true;
  }
}
