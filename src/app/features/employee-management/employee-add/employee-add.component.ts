import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { IInputFieldsConfig } from '../../../shared/models/input-fields-config.model';
import { InputFieldConfigService } from '../../../shared/services/input-field-config.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Router } from '@angular/router';
import { ADD_EMPLOYEE_INPUT_FIELDS_CONFIG } from './employee-add.config';

@Component({
  selector: 'app-employee-add',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputFieldComponent
  ],
  templateUrl: './employee-add.component.html',
  styleUrl: './employee-add.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeAddComponent implements OnInit {

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
      const configs = this.inputFieldConfigService.initializeFieldConfigs(ADD_EMPLOYEE_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    const validators = this.getFormValidators();
    this.formGroup = this.fb.group({
      fname: ['', validators['fname']],
      aadharNumber: ['', validators['aadharNumber']],
      role: ['', validators['role']],
      workOn: ['', validators['workOn']],
      dob: ['', validators['dob']],
      password: ['', validators['password']],
      checkboxInput: ['', validators['checkboxInput']],
      radioInput: ['', validators['radioInput']],
      fileInput: ['', validators['fileInput']],
    });
  }

  onSubmit(): void {
    try {
      this.formSubmitted.set(true);
      
      if (this.formGroup.valid && !this.loading()) {
        this.loading.set(true);
        
        const formData = this.formGroup.value;
        this.logger.logUserAction('Submit Employee Form', { hasFormData: !!formData });
        
        // TODO: Replace with proper employee creation logic using employeeService
        setTimeout(() => {
          this.logger.info('Employee form submitted successfully');
          this.loading.set(false);
          this.router.navigate(['/employee/list']);
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

  protected onCancel(): void {
    try {
      this.logger.logUserAction('Cancel Employee Creation');
      this.router.navigate(['/employee/list']);
    } catch (error) {
      this.logger.error('Error navigating back to employee list', error);
    }
  }

  resetForm(): void {
    this.formGroup.reset();
    this.formSubmitted.set(false);
    this.logger.debug('Form reset');
  }

  private getFormValidators(): Record<string, ValidatorFn[]> {
    const configs = this.fieldConfigs();
    return Object.keys(configs).reduce((acc, key) => {
      acc[key] = configs[key].validators || [];
      return acc;
    }, {} as Record<string, ValidatorFn[]>);
  }
}
