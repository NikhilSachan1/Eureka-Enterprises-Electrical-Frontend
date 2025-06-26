import { Component, inject, OnInit, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ToastModule } from 'primeng/toast';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { IEnhancedForm } from '../../../../shared/models';
import { FormService } from '../../../../shared/services/form.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { FORGOT_PASSWORD_INPUT_FIELDS_CONFIG } from '../../config/forgot-password-form.config';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';
import { ROUTE_BASE_PATHS, ROUTES, FORM_VALIDATION_MESSAGES } from '../../../../shared/constants';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    ToastModule,
    InputFieldComponent,
    AuthLayoutComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit {

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(FORGOT_PASSWORD_INPUT_FIELDS_CONFIG);
  }

  onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeForgotPassword(formData);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(FORM_VALIDATION_MESSAGES.FORM_INVALID);
      this.logger.warn('Forgot password form validation failed');
      return false;
    }
    return true;
  }

  private executeForgotPassword(formData: { email: string }): void {
    this.isSubmitting.set(true);
    this.form.disable();

    // TODO: Replace with proper password reset logic using authService
    setTimeout(() => {
      this.logger.info('Forgot password form submitted successfully');
      this.notificationService.success('Password reset link sent to your email!');
      
      // Navigate back to login after a delay
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

  private prepareFormData(): { email: string } {
    const formData = this.form.getData();
    return {
      email: formData['email'],
    };
  }
}
