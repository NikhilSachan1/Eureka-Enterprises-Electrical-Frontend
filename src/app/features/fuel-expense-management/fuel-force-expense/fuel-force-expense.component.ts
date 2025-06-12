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
import { FUEL_FORCE_EXPENSE_INPUT_FIELDS_CONFIG } from '../config/form/fuel-force-expense-form.config';

@Component({
  selector: 'app-fuel-force-expense',
  imports: [
    PageHeaderComponent,
    ReactiveFormsModule,
    ButtonModule,
    InputFieldComponent
  ],
  templateUrl: './fuel-force-expense.component.html',
  styleUrl: './fuel-force-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuelForceExpenseComponent implements OnInit {

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
      const configs = this.inputFieldConfigService.initializeFieldConfigs(FUEL_FORCE_EXPENSE_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(FUEL_FORCE_EXPENSE_INPUT_FIELDS_CONFIG, this.fb);
    } catch (error) {
      this.logger.error('Error initializing form', error);
    }
  }

  protected resetForm(): void {
    try {
      this.formGroup.reset();
      this.formSubmitted.set(false);
      this.logger.logUserAction('Reset Force Fuel Expense Form');
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
        this.logger.logUserAction('Submit Force Fuel Expense Form', { hasFormData: !!formData });
        
        // TODO: Replace with proper force fuel expense logic using fuelExpenseService
        setTimeout(() => {
          this.logger.info('Force fuel expense form submitted successfully', {
            employeeNames: formData.employeeNames,
            selectVehicle: formData.selectVehicle,
            fuelType: formData.fuelType,
            fuelFilledDate: formData.fuelFilledDate,
            fuelFilledInKms: formData.fuelFilledInKms,
            fuelQuantityInLtr: formData.fuelQuantityInLtr,
            fuelFilledAmount: formData.fuelFilledAmount,
            paymentMode: formData.paymentMode,
            comment: formData.comment,
            hasVehicleMeterReadingProof: !!formData.vehicleMeterReadingProof,
            hasPumpMeterReadingProof: !!formData.pumpMeterReadingProof,
            hasFuelFilledReceiptProof: !!formData.fuelFilledReceiptProof
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
