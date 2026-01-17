import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { GENERATE_PAYROLL_FORM_CONFIG } from '@features/payroll-management/config/form/generate-payroll.config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  IGeneratePayrollFormDto,
  IGeneratePayrollResponseDto,
  IPayslipGetBaseResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { PAYROLL_MESSAGES } from '@features/payroll-management/constants';
import { EButtonActionType } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-generate-payroll',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './generate-payroll.component.html',
  styleUrl: './generate-payroll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneratePayrollComponent
  extends FormBase<IGeneratePayrollFormDto>
  implements OnInit
{
  private readonly payrollService = inject(PayrollService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord = input<IPayslipGetBaseResponseDto[]>();
  protected readonly dialogActionType = input<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

  protected readonly initialGeneratePayrollData =
    signal<IGeneratePayrollFormDto | null>(null);

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (this.dialogActionType() !== undefined && !record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        PAYROLL_MESSAGES.VALIDATION.GENERATE_PAYROLL_RECORD_REQUIRED
      );
      return;
    }

    if (record) {
      this.loadPrefilledFormData(record);
    }

    const actionType = this.dialogActionType();

    this.form = this.formService.createForm<IGeneratePayrollFormDto>(
      GENERATE_PAYROLL_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialGeneratePayrollData(),
        context: {
          actionType,
        },
      }
    );
  }

  private loadPrefilledFormData(record: IPayslipGetBaseResponseDto[]): void {
    const prefilledFormData = this.preparePrefilledFormData(record);
    this.initialGeneratePayrollData.set(prefilledFormData);
  }

  private preparePrefilledFormData(
    record: IPayslipGetBaseResponseDto[]
  ): IGeneratePayrollFormDto {
    const { userId, month, year } = record[0];
    return {
      employeeNames: [userId],
      monthYear: new Date(year, month - 1, 1),
    };
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeGeneratePayroll(formData);
  }

  private prepareFormData(): IGeneratePayrollFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeGeneratePayroll(formData: IGeneratePayrollFormDto): void {
    this.loadingService.show({
      title: PAYROLL_MESSAGES.LOADING.GENERATE_PAYROLL,
      message: PAYROLL_MESSAGES.LOADING_MESSAGES.GENERATE_PAYROLL,
    });
    this.form.disable();

    this.payrollService
      .generatePayroll(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IGeneratePayrollResponseDto) => {
          const { message } = response;

          this.notificationService.success(message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
