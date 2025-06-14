import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { IInputFieldsConfig } from '../../../shared/models/input-fields-config.model';
import { InputFieldConfigService } from '../../../shared/services/input-field-config.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Router } from '@angular/router';
import { ADD_LEAVE_PLANNER_INPUT_FIELDS_CONFIG } from '../config/form/add-leave-planner-form.config';

@Component({
  selector: 'app-add-leave-planner',
  imports: [
    PageHeaderComponent,
    ReactiveFormsModule,
    ButtonModule,
    InputFieldComponent
  ],
  templateUrl: './add-leave-planner.component.html',
  styleUrl: './add-leave-planner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLeavePlannerComponent implements OnInit {

  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly fieldConfigs = signal<Record<string, IInputFieldsConfig>>({});
  protected readonly showHolidayFields = signal<boolean>(false);
  
  protected formGroup!: FormGroup;

  ngOnInit(): void {
    this.initializeFieldConfigs();
    this.initializeForm();
    this.setupFormValueChanges();
  }

  private initializeFieldConfigs(): void {
    try {
      const configs = this.inputFieldConfigService.initializeFieldConfigs(ADD_LEAVE_PLANNER_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(ADD_LEAVE_PLANNER_INPUT_FIELDS_CONFIG, this.fb);
    } catch (error) {
      this.logger.error('Error initializing form', error);
    }
  }

  private setupFormValueChanges(): void {
    // Watch for optional leave count changes
    this.formGroup.get('optionalLeaveCount')?.valueChanges.subscribe(count => {
      this.showHolidayFields.set(count > 0);
      this.updateHolidayFormControls(count);
    });
  }

  private updateHolidayFormControls(count: number): void {
    // Remove existing holiday controls
    Object.keys(this.formGroup.controls).forEach(key => {
      if (key.startsWith('holiday') && (key.includes('Name') || key.includes('Date'))) {
        this.formGroup.removeControl(key);
      }
    });

    // Add new holiday controls and field configs based on count
    if (count > 0) {
      const updatedFieldConfigs = { ...this.fieldConfigs() };
      
      for (let i = 1; i <= count; i++) {
        const nameFieldKey = `holiday${i}Name`;
        const dateFieldKey = `holiday${i}Date`;
        
        // Add form controls
        this.formGroup.addControl(nameFieldKey, this.fb.control('', [Validators.required]));
        this.formGroup.addControl(dateFieldKey, this.fb.control('', [Validators.required]));
        
        // Create simplified field configurations using the service pattern
        const nameFieldConfig = this.inputFieldConfigService.initializeFieldConfigs({
          [nameFieldKey]: {
            fieldType: 'text',
            id: nameFieldKey,
            fieldName: nameFieldKey,
            label: `Holiday ${i} Name/Reason`,
            validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
          }
        });

        const dateFieldConfig = this.inputFieldConfigService.initializeFieldConfigs({
          [dateFieldKey]: {
            fieldType: 'date',
            id: dateFieldKey,
            fieldName: dateFieldKey,
            label: `Holiday ${i} Date`,
            validators: [Validators.required],
            dateConfig: {
              dateFormat: 'dd/mm/yy',
              showCalendarIcon: true,
              showButtonBar: true,
              minDate: new Date()
            }
          }
        });

        updatedFieldConfigs[nameFieldKey] = nameFieldConfig[nameFieldKey];
        updatedFieldConfigs[dateFieldKey] = dateFieldConfig[dateFieldKey];
      }
      
      this.fieldConfigs.set(updatedFieldConfigs);
    }
  }

  protected getHolidayCount(): number {
    return this.formGroup.get('optionalLeaveCount')?.value || 0;
  }

  protected getHolidayArray(): number[] {
    const count = this.getHolidayCount();
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  protected resetForm(): void {
    try {
      this.formGroup.reset();
      this.formSubmitted.set(false);
      this.showHolidayFields.set(false);
      this.logger.logUserAction('Reset Add Leave Planner Form');
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  protected onSubmit(): void {
    try {
      this.formSubmitted.set(true);
      
      if (this.formGroup.valid && !this.loading()) {
        this.loading.set(true);
        
        const formData = this.formGroup.value;
        this.logger.logUserAction('Submit Leave Policy Setup', { hasFormData: !!formData });
        
        // Extract holiday data
        const holidays: Array<{name: string, date: string}> = [];
        const holidayCount = formData.optionalLeaveCount;
        for (let i = 1; i <= holidayCount; i++) {
          const name = formData[`holiday${i}Name`];
          const date = formData[`holiday${i}Date`];
          if (name && date) {
            holidays.push({ name, date });
          }
        }

        // TODO: Replace with proper leave planner service logic
        setTimeout(() => {
          this.logger.info('Leave policy setup submitted successfully', {
            financialYear: formData.financialYear,
            casualLeaveCount: formData.casualLeaveCount,
            optionalLeaveCount: formData.optionalLeaveCount,
            holidays: holidays
          });
          
          this.loading.set(false);
          this.router.navigate(['/calendar']);
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
