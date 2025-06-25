import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { IInputFieldsConfig } from '../../../../shared/models';
import { InputFieldConfigService } from '../../../../shared/services/input-field-config.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { RESET_PASSWORD_INPUT_FIELDS_CONFIG } from '../../config/reset-password-form.config';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../../shared/constants';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    InputFieldComponent,
    AuthLayoutComponent,
    FormsModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ResetPasswordComponent implements OnInit {

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
      const configs = this.inputFieldConfigService.initializeFieldConfigs(RESET_PASSWORD_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(RESET_PASSWORD_INPUT_FIELDS_CONFIG, this.fb);
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
        this.logger.logUserAction('Submit Reset Password Form', { 
          password: '***',
          confirmPassword: '***'
        });
        
        // TODO: Replace with proper password reset logic using authService
        setTimeout(() => {
          this.logger.info('Reset password form submitted successfully');
          this.loading.set(false);
          
          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password reset successfully! Redirecting to login...',
            life: 5000
          });
          
          // Navigate to login after a delay
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
          detail: 'Please check your passwords and try again.',
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
      this.router.navigate([`${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`]);
    } catch (error) {
      this.logger.error('Error navigating back to login', error);
    }
  }
}
