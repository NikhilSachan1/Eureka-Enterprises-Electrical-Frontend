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
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoggerService } from '@core/services';
import {
  ROUTE_BASE_PATHS,
  ROUTES,
  FORM_VALIDATION_MESSAGES,
} from '@shared/constants';
import { LOGIN_FORM_CONFIG } from '../../config/login-form.config';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';
import { FormService, NotificationService } from '@shared/services';
import { ToastModule } from 'primeng/toast';
import { IEnhancedForm } from '@shared/models';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { ILoginRequestDto } from '../../models/auth-api.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
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
    this.form = this.formService.createForm(LOGIN_FORM_CONFIG, {
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
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Login form validation failed');
      return false;
    }
    return true;
  }

  private executeLogin(loginData: ILoginRequestDto): void {
    this.isSubmitting.set(true);
    this.form.disable();

    const { rememberMe } = this.form.getData();
    this.logger.info('Login form submitted', loginData);

    this.authService
      .login(loginData, rememberMe as boolean)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.logger.logUserAction('Login successful');
        },
        error: error => {
          this.logger.error('Login failed', error);
        },
      });
  }

  protected onForgotPassword(): void {
    try {
      this.logger.logUserAction('Navigate to Forgot Password');
      void this.router.navigate([
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
        'Contact Admin'
      );
    } catch (error) {
      this.logger.error('Error in contact admin action', error);
    }
  }

  private prepareFormData(): ILoginRequestDto {
    const { email, password } = this.form.getData();
    return {
      email: email as string,
      password: password as string,
    };
  }
}
