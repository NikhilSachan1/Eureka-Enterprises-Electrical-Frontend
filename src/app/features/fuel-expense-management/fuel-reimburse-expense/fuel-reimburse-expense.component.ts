import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { IInputFieldsConfig } from '../../../shared/models/input-fields-config.model';
import { InputFieldConfigService } from '../../../shared/services/input-field-config.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Router } from '@angular/router';
import { FUEL_REIMBURSE_EXPENSE_INPUT_FIELDS_CONFIG } from '../config/form/fuel-reimburse-expense-form.config';

@Component({
  selector: 'app-fuel-reimburse-expense',
  imports: [
    PageHeaderComponent,
    ReactiveFormsModule,
    ButtonModule,
    InputFieldComponent
  ],
  templateUrl: './fuel-reimburse-expense.component.html',
  styleUrl: './fuel-reimburse-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuelReimburseExpenseComponent implements OnInit {
  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly fieldConfigs = signal<Record<string, IInputFieldsConfig>>({});
  
  protected formGroup!: FormGroup;

  ngOnInit(): void {
    this.initializeFieldConfigs();
    this.initializeForm();
  }

  private initializeFieldConfigs(): void {
    try {
      const configs = this.inputFieldConfigService.initializeFieldConfigs(FUEL_REIMBURSE_EXPENSE_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(FUEL_REIMBURSE_EXPENSE_INPUT_FIELDS_CONFIG, this.fb);
    } catch (error) {
      this.logger.error('Error initializing form', error);
    }
  }

  protected resetForm(): void {
    try {
      this.formGroup.reset();
      this.formSubmitted.set(false);
      this.logger.logUserAction('Reset Reimburse Expense Form');
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  onSubmit(): void {
    try {
      this.formSubmitted.set(true);
      
      if (this.formGroup.valid && !this.loading()) {
        this.loading.set(true);
        
        const formData = this.formGroup.value;
        this.logger.logUserAction('Submit Reimburse Expense Form', { hasFormData: !!formData });
        
        // TODO: Replace with proper reimbursement submission logic using expenseService
        setTimeout(() => {
          this.logger.info('Reimburse expense form submitted successfully', {
            employeeName: formData.employeeName,
            paymentMode: formData.paymentMode,
            dateOfSettlement: formData.dateOfSettlement,
            creditAmount: formData.creditAmount,
            description: formData.description,
            hasTransactionScreenshot: !!formData.transactionScreenshot,
            transactionId: formData.transactionId
          });
          this.loading.set(false);
          this.router.navigate(['/fuel-expenses']);
        }, 1000);
        
      } else {
        this.logger.warn('Form submission failed - form invalid or already submitting');
        this.formGroup.markAllAsTouched();
      }
    } catch (error) {
      this.logger.error('Error submitting form', error);
      this.loading.set(false);
    }
  }
}
