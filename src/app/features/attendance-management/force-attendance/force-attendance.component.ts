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
import { FORCE_ATTENDANCE_INPUT_FIELDS_CONFIG } from '../config/form/force-attendance-form.config';

@Component({
  selector: 'app-force-attendance',
  imports: [
    PageHeaderComponent,
    ReactiveFormsModule,
    ButtonModule,
    InputFieldComponent
  ],
  templateUrl: './force-attendance.component.html',
  styleUrl: './force-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceAttendanceComponent implements OnInit {

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
      const configs = this.inputFieldConfigService.initializeFieldConfigs(FORCE_ATTENDANCE_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(FORCE_ATTENDANCE_INPUT_FIELDS_CONFIG, this.fb);
    } catch (error) {
      this.logger.error('Error initializing form', error);
    }
  }

  protected resetForm(): void {
    try {
      this.formGroup.reset();
      this.formSubmitted.set(false);
      this.logger.logUserAction('Reset Force Attendance Form');
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
        this.logger.logUserAction('Submit Force Attendance Form', { hasFormData: !!formData });
        
        // TODO: Replace with proper force attendance logic using attendanceService
        setTimeout(() => {
          this.logger.info('Force attendance form submitted successfully', {
            employeeNames: formData.employeeNames,
            attendanceDate: formData.attendanceDate,
            attendanceStatus: formData.attendanceStatus,
            comment: formData.comment
          });
          this.loading.set(false);
          this.router.navigate(['/attendance']);
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
