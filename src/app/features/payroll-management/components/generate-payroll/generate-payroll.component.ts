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
import { ReactiveFormsModule } from '@angular/forms';
import { LoggerService } from '@core/services';
import { GENERATE_PAYROLL_FORM_CONFIG } from '@features/payroll-management/config/form/generate-payroll.config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  IGeneratePayrollFormDto,
  IGeneratePayrollResponseDto,
  IPayslipGetBaseResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { EButtonActionType, IEnhancedForm } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-generate-payroll',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './generate-payroll.component.html',
  styleUrl: './generate-payroll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneratePayrollComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly payrollService = inject(PayrollService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord = input<IPayslipGetBaseResponseDto[]>();
  protected readonly dialogActionType = input<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();
  protected form!: IEnhancedForm<IGeneratePayrollFormDto>;
  protected readonly EButtonActionTypeEnum = EButtonActionType;

  protected readonly initialGeneratePayrollData =
    signal<IGeneratePayrollFormDto | null>(null);
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (this.dialogActionType() !== undefined && !record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to generate payroll but was not provided'
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
    this.onSubmit();
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeGeneratePayroll(formData);
  }

  private prepareFormData(): IGeneratePayrollFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeGeneratePayroll(formData: IGeneratePayrollFormDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Generate Payroll',
      message: 'Please wait while we generate payroll...',
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Generate payroll form validation failed');
      return false;
    }
    return true;
  }
}
