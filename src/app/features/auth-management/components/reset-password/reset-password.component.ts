import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ToastModule } from 'primeng/toast';
import { IEnhancedForm } from '@shared/types';
import { FormService, NotificationService } from '@shared/services';
import { LoggerService } from '@core/services';
import { RESET_PASSWORD_INPUT_FIELDS_CONFIG } from '../../config/reset-password-form.config';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';
import {
  ROUTE_BASE_PATHS,
  ROUTES,
  FORM_VALIDATION_MESSAGES,
} from '@shared/constants';

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
  private readonly destroyRef = inject(DestroyRef);

  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(
      RESET_PASSWORD_INPUT_FIELDS_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
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
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Reset password form validation failed');
      return false;
    }
    return true;
  }

  private executeResetPassword(formData: {
    password: string;
    confirmPassword: string;
  }): void {
    this.logger.info('Reset password form submitted', formData);
    this.isSubmitting.set(true);
    this.form.disable();

    // TODO: Replace with proper password reset logic using authService
    setTimeout(() => {
      this.logger.info('Reset password form submitted successfully');
      this.notificationService.success(
        'Password reset successfully! Redirecting to login...'
      );

      // Navigate to login after a delay
      setTimeout(() => {
        void this.router.navigate([
          `/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`,
        ]);
      }, 2000);

      this.isSubmitting.set(false);
      this.form.enable();
    }, 1500);
  }

  protected onBackToLogin(): void {
    try {
      this.logger.logUserAction('Navigate back to Login');
      void this.router.navigate([
        `${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`,
      ]);
    } catch (error) {
      this.logger.error('Error navigating back to login', error);
    }
  }

  private prepareFormData(): { password: string; confirmPassword: string } {
    const { password, confirmPassword } = this.form.getData();
    return {
      password: password as string,
      confirmPassword: confirmPassword as string,
    };
  }
}
