import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { IInputFieldsConfig } from '../../../shared/models/input-fields-config.model';
import { InputFieldConfigService } from '../../../shared/services/input-field-config.service';
import { LoggerService } from '../../../core/services/logger.service';
import { ROUTES } from '../../../shared/constants';
import { FORGOT_PASSWORD_INPUT_FIELDS_CONFIG } from './forgot-password-form.config';
import { AuthLayoutComponent } from '../shared/auth-layout.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    InputFieldComponent,
    AuthLayoutComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ForgotPasswordComponent implements OnInit {

  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

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
      const configs = this.inputFieldConfigService.initializeFieldConfigs(FORGOT_PASSWORD_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(FORGOT_PASSWORD_INPUT_FIELDS_CONFIG, this.fb);
    } catch (error) {
      this.logger.error('Error initializing form', error);
    }
  }

  onSubmit(): void {
    try {
      this.formSubmitted.set(true);
      
      if (this.formGroup.valid && !this.loading()) {
        this.loading.set(true);
        
        const formData = this.formGroup.value;
        this.logger.logUserAction('Submit Forgot Password Form', { 
          email: formData.email
        });
        
        // TODO: Replace with proper password reset logic using authService
        setTimeout(() => {
          this.logger.info('Forgot password form submitted successfully');
          this.loading.set(false);
          
          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password reset link sent to your email!',
            life: 5000
          });
          
          // Navigate back to login after a delay
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
          
        }, 1500);
        
      } else {
        this.logger.warn('Form submission failed - form invalid or already submitting');
        this.formGroup.markAllAsTouched();
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please check your email and try again.',
          life: 5000
        });
      }
    } catch (error) {
      this.logger.error('Error submitting form', error);
      this.loading.set(false);
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred. Please try again.',
        life: 5000
      });
    }
  }

  protected onBackToLogin(): void {
    try {
      this.logger.logUserAction('Navigate back to Login');
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.logger.error('Error navigating back to login', error);
    }
  }
}
