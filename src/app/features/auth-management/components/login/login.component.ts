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
import {
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { ToastModule } from 'primeng/toast';
import { IEnhancedForm } from '@shared/types';
import { AuthService } from '../../services/auth.service';
import { finalize, switchMap, tap } from 'rxjs/operators';
import {
  ILoginRequestDto,
  ILoginResponseDto,
} from '../../models/auth-api.model';
import { UserPermissionService } from '../../../settings-management/permission-management/sub-features/user-permission-management/services/user-permission.service';

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
  private readonly userPermissionService = inject(UserPermissionService);
  private readonly loadingService = inject(LoadingService);

  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    const defaultData = {
      email: 'akhil.sachan@coditas.com',
      password: 'Admin@123',
    };
    this.form = this.formService.createForm(LOGIN_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: defaultData,
    });
  }

  onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const loginData = this.prepareLoginFormData();
    this.executeLogin(loginData);
  }

  private prepareLoginFormData(): ILoginRequestDto {
    const { email, password } = this.form.getData() as Record<string, string>;
    return {
      email,
      password,
    };
  }

  private executeLogin(loginData: ILoginRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Logging In',
      message: 'Please wait while we log you in...',
    });
    this.form.disable();

    this.logger.info('Login form submitted', loginData);

    this.authService
      .login(loginData)
      .pipe(
        tap((loginResponse: ILoginResponseDto) => {
          this.logger.logUserAction('Login successful', loginResponse);
          const { rememberMe } = this.form.getData() as Record<string, boolean>;
          this.authService.setAuthState(loginResponse, rememberMe);
        }),
        switchMap(() => {
          return this.userPermissionService.fetchAndStoreLoggedInUserPermissions();
        }),
        finalize(() => {
          this.loadingService.hide();
          this.form.enable();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.navigateAfterLogin();
        },
        error: error => {
          this.logger.error('Login failed', error);
        },
      });
  }

  private navigateAfterLogin(): void {
    try {
      const redirectUrl = sessionStorage.getItem('auth_redirect_url');

      if (redirectUrl) {
        this.logger.info(`Redirecting to stored URL: ${redirectUrl}`);
        sessionStorage.removeItem('auth_redirect_url');
        void this.router.navigateByUrl(redirectUrl);
      } else {
        this.logger.info(
          'No valid redirect URL found, navigating to dashboard'
        );
        void this.router.navigate([`/${ROUTE_BASE_PATHS.DASHBOARD}`]);
      }
    } catch (error) {
      this.logger.error('Error during post-login navigation', error);
      void this.router.navigate([`/${ROUTE_BASE_PATHS.DASHBOARD}`]);
    }
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
}
