import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { LoggerService } from '../../../core/services/logger.service';
import {
  ROUTE_BASE_PATHS,
  ROUTES,
  FORM_VALIDATION_MESSAGES,
} from '../../../shared/constants';
import { LOGIN_INPUT_FIELDS_CONFIG } from '../config/login-form.config';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { FormService } from '../../../shared/services/form.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ToastModule } from 'primeng/toast';
import { IEnhancedForm } from '../../../shared/models/form.model';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';
import { ILoginRequestDto } from '../models/auth-api.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DividerModule,
    InputFieldComponent,
    AuthLayoutComponent,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(LOGIN_INPUT_FIELDS_CONFIG, {
      email: 'akhil.sachan@coditas.com',
      password: 'Admin@123',
    });
  }

  onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const loginData = this.prepareFormData();
    this.executeLogin(loginData);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(FORM_VALIDATION_MESSAGES.FORM_INVALID);
      this.logger.warn('Login form validation failed');
      return false;
    }
    return true;
  }

  private executeLogin(loginData: ILoginRequestDto): void {
    this.isSubmitting.set(true);
    this.form.disable();

    const rememberMe = this.form.getData()['rememberMe'];

    this.authService.login(loginData, rememberMe)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {},
        error: (error) => {}
      });
  }

  protected onForgotPassword(): void {
    try {
      this.logger.logUserAction('Navigate to Forgot Password');
      this.router.navigate([
        `/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.FORGOT_PASSWORD}`,
      ]);
    } catch (error) {
      this.logger.error('Error navigating to forgot password', error);
    }
  }

  protected onContactAdmin(): void {
    try {
      this.logger.logUserAction('Navigate to Contact Admin');
      this.notificationService.info(
        'Please contact your system administrator for account assistance.',
        'Contact Admin',
      );
    } catch (error) {
      this.logger.error('Error in contact admin action', error);
    }
  }

  private prepareFormData(): ILoginRequestDto {
    const formData = this.form.getData();
    return {
      email: formData['email'],
      password: formData['password'],
    };
  }
}
