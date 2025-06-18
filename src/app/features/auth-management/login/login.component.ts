import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { IInputFieldsConfig } from '../../../shared/models/input-fields-config.model';
import { InputFieldConfigService } from '../../../shared/services/input-field-config.service';
import { LoggerService } from '../../../core/services/logger.service';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../shared/constants';
import { LOGIN_INPUT_FIELDS_CONFIG } from '../config/login-form.config';
import { AuthLayoutComponent } from '../shared/auth-layout.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DividerModule,
    ToastModule,
    InputFieldComponent,
    AuthLayoutComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class LoginComponent implements OnInit {

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
      const configs = this.inputFieldConfigService.initializeFieldConfigs(LOGIN_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(LOGIN_INPUT_FIELDS_CONFIG, this.fb);
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
        this.logger.logUserAction('Submit Login Form', { 
          username: formData.username,
          rememberMe: formData.rememberMe
        });
        
        // TODO: Replace with proper authentication logic using authService
        setTimeout(() => {
          this.logger.info('Login form submitted successfully');
          this.loading.set(false);
          
          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful! Redirecting to dashboard...',
            life: 3000
          });
          
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
          
        }, 1500);
        
      } else {
        this.logger.warn('Form submission failed - form invalid or already submitting');
        this.formGroup.markAllAsTouched();
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please check your credentials and try again.',
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

  protected onForgotPassword(): void {
    try {
      this.logger.logUserAction('Navigate to Forgot Password');
      this.router.navigate([`/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.FORGOT_PASSWORD}`]);
    } catch (error) {
      this.logger.error('Error navigating to forgot password', error);
    }
  }

  protected onContactAdmin(): void {
    try {
      alert('Contact Admin');
      this.logger.logUserAction('Navigate to Contact Admin');
    } catch (error) {
      this.logger.error('Error navigating to contact admin', error);
    }
  }
}
