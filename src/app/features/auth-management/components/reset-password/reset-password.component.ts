import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ToastModule } from 'primeng/toast';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { IEnhancedForm } from '@shared/models';
import { FormService } from '@shared/services/form.service';
import { NotificationService } from '@shared/services/notification.service';
import { LoggerService } from '@core/services/logger.service';
import { RESET_PASSWORD_INPUT_FIELDS_CONFIG } from '@features/auth-management/config/reset-password-form.config';
import { AuthLayoutComponent } from '@features/auth-management/shared/auth-layout.component';
import { ROUTE_BASE_PATHS, ROUTES, FORM_VALIDATION_MESSAGES } from '@shared/constants';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    ToastModule,
    InputFieldComponent,
    AuthLayoutComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(RESET_PASSWORD_INPUT_FIELDS_CONFIG);
  }

  onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeResetPassword(formData);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(FORM_VALIDATION_MESSAGES.FORM_INVALID);
      this.logger.warn('Reset password form validation failed');
      return false;
    }
    return true;
  }

  private executeResetPassword(formData: { password: string; confirmPassword: string }): void {
    this.isSubmitting.set(true);
    this.form.disable();

    // TODO: Replace with proper password reset logic using authService
    setTimeout(() => {
      this.logger.info('Reset password form submitted successfully');
      this.notificationService.success('Password reset successfully! Redirecting to login...');
      
      // Navigate to login after a delay
      setTimeout(() => {
        this.router.navigate([`/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`]);
      }, 2000);
      
      this.isSubmitting.set(false);
      this.form.enable();
    }, 1500);
  }

  protected onBackToLogin(): void {
    try {
      this.logger.logUserAction('Navigate back to Login');
      this.router.navigate([`${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`]);
    } catch (error) {
      this.logger.error('Error navigating back to login', error);
    }
  }

  private prepareFormData(): { password: string; confirmPassword: string } {
    const formData = this.form.getData();
    return {
      password: formData['password'],
      confirmPassword: formData['confirmPassword'],
    };
  }
}
