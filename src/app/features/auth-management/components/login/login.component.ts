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
import { NgClass } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoggerService } from '@core/services';
import {
  ROUTE_BASE_PATHS,
  ROUTES,
  FORM_VALIDATION_MESSAGES,
  ICONS,
} from '@shared/constants';
import { LOGIN_FORM_CONFIG } from '../../config/login-form.config';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';
import {
  FormService,
  LoadingService,
  NotificationService,
  AppConfigurationService,
} from '@shared/services';
import { ToastModule } from 'primeng/toast';
import { IEnhancedForm, EButtonSeverity, EButtonSize } from '@shared/types';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';
import { ILoginRequestDto, ILoginResponseDto } from '../../types/auth.dto';
import { toTitleCase } from '@shared/utility';

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
    NgClass,
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
  private readonly loadingService = inject(LoadingService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  // Role selection state
  protected readonly showRoleSelection = signal(false);
  protected readonly availableRoles = signal<string[]>([]);
  protected readonly selectedRole = signal<string | null>(null);
  protected readonly userName = signal('');
  private pendingLoginResponse: ILoginResponseDto | null = null;
  private rememberMe = false;

  protected readonly ALL_ICONS = ICONS;

  // Continue button config for role selection
  protected readonly continueButtonConfig = {
    label: 'Continue',
    type: 'button' as const,
    size: EButtonSize.LARGE,
    severity: EButtonSeverity.PRIMARY,
    fluid: true,
  };

  // Back button config
  protected readonly backButtonConfig = {
    label: 'Back to Login',
    link: true,
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  };

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
      message: 'Please wait while we verify your credentials...',
    });
    this.form.disable();

    this.logger.info('Login form submitted', loginData);

    this.authService
      .login(loginData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.form.enable();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (loginResponse: ILoginResponseDto) => {
          this.logger.logUserAction(
            'Login credentials verified',
            loginResponse
          );
          this.handleLoginResponse(loginResponse);
        },
        error: error => {
          this.logger.error('Login failed', error);
        },
      });
  }

  /**
   * Handle login response - show role selection if multiple roles
   */
  private handleLoginResponse(loginResponse: ILoginResponseDto): void {
    const { roles, firstName } = loginResponse;
    const { rememberMe } = this.form.getData() as Record<string, boolean>;

    // Store for later use
    this.pendingLoginResponse = loginResponse;
    this.rememberMe = rememberMe;

    // If user has multiple roles, show role selection
    if (roles.length > 1) {
      this.availableRoles.set(roles);
      this.userName.set(firstName);
      this.showRoleSelection.set(true);
      this.logger.info('Multiple roles found, showing role selection');
    } else {
      // Single role - proceed directly
      this.completeLogin(loginResponse, rememberMe);
    }
  }

  // ==================== Role Selection Methods ====================

  /**
   * Select a role from the available roles
   */
  protected selectRole(role: string): void {
    this.selectedRole.set(role);
  }

  /**
   * Check if a role is currently selected
   */
  protected isRoleSelected(role: string): boolean {
    return this.selectedRole() === role;
  }

  /**
   * Format role name for display (e.g., SUPER_ADMIN -> Super Admin)
   */
  protected formatRoleName(roleId: string): string {
    return toTitleCase(roleId);
  }

  /**
   * Continue with the selected role
   */
  protected continueWithRole(): void {
    const role = this.selectedRole();
    if (!role || !this.pendingLoginResponse) {
      return;
    }

    // Create login response with selected role
    const loginResponse: ILoginResponseDto = {
      ...this.pendingLoginResponse,
      activeRole: role,
    };

    this.completeLogin(loginResponse, this.rememberMe, role);
  }

  /**
   * Go back to login form from role selection
   */
  protected goBackToLogin(): void {
    this.showRoleSelection.set(false);
    this.selectedRole.set(null);
    this.availableRoles.set([]);
    this.pendingLoginResponse = null;
    this.logger.info('Returning to login form');
  }

  /**
   * Complete the login process
   * @param loginResponse - Login response with user data
   * @param rememberMe - Whether to persist session
   * @param selectedRoleName - Optional role name for success message (when multiple roles)
   */
  private completeLogin(
    loginResponse: ILoginResponseDto,
    rememberMe: boolean,
    selectedRoleName?: string
  ): void {
    // Set auth state first
    this.authService.setAuthState(loginResponse, rememberMe);

    // Show loading state
    this.loadingService.show({
      title: 'Setting Up Your Workspace',
      message: 'Please wait while we set up your workspace...',
    });

    // Load all app data using common service method
    this.appConfigurationService
      .loadAllAppData()
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          // Clear any pending login data from sessionStorage
          this.clearPendingLoginData();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          // Show success notification if role was selected
          if (selectedRoleName) {
            this.notificationService.success(
              `Welcome! You're now logged in as ${this.formatRoleName(selectedRoleName)}`
            );
          }
          this.navigateAfterLogin();
        },
        error: error => {
          this.logger.error('Failed to load app data', error);
        },
      });
  }

  /**
   * Clear pending login data from sessionStorage
   */
  private clearPendingLoginData(): void {
    sessionStorage.removeItem('pending_login_data');
    sessionStorage.removeItem('pending_remember_me');
  }

  /**
   * Navigate to the appropriate page after login
   */
  private navigateAfterLogin(): void {
    const redirectUrl = sessionStorage.getItem('auth_redirect_url');

    if (redirectUrl) {
      this.logger.info(`Redirecting to stored URL: ${redirectUrl}`);
      sessionStorage.removeItem('auth_redirect_url');
      void this.router.navigateByUrl(redirectUrl);
    } else {
      this.logger.info('Navigating to dashboard');
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
