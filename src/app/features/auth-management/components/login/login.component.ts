import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ROUTE_BASE_PATHS, ROUTES, ICONS } from '@shared/constants';
import { LOGIN_FORM_CONFIG } from '../../config/form/login.config';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { CriticalStartupStateService } from '@core/services';
import { ROLE_SELECTION_BUTTON_CONFIG, AUTH_MESSAGES } from '../../constants';
import { finalize, switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { ILoginFormDto, ILoginResponseDto } from '../../types/auth.dto';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { FormBase } from '@shared/base/form.base';
import { LOGIN_PREFILLED_DATA } from '@shared/mock-data/auth.mock-data';

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
export class LoginComponent extends FormBase<ILoginFormDto> implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly criticalStartupState = inject(CriticalStartupStateService);

  // Role selection state
  protected readonly showRoleSelection = signal(false);
  protected readonly availableRoles = signal<string[]>([]);
  protected readonly selectedRole = signal<string | null>(null);
  protected readonly userName = signal('');
  private pendingLoginResponse: ILoginResponseDto | null = null;
  private rememberMe = false;

  protected readonly ALL_ICONS = ICONS;
  protected readonly ROLE_SELECTION_BUTTON_CONFIG =
    ROLE_SELECTION_BUTTON_CONFIG;

  ngOnInit(): void {
    this.form = this.formService.createForm<ILoginFormDto>(LOGIN_FORM_CONFIG, {
      destroyRef: this.destroyRef,
    });

    this.loadMockData(LOGIN_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeLogin(formData);
  }

  private prepareFormData(): ILoginFormDto {
    let formData = this.form.getData();
    formData = {
      ...formData,
      rememberMe: formData.rememberMe ?? false,
    };
    return formData;
  }

  private executeLogin(formData: ILoginFormDto): void {
    this.loadingService.show({
      title: AUTH_MESSAGES.LOADING.LOGIN,
      message: AUTH_MESSAGES.LOADING_MESSAGES.LOGIN,
    });
    this.form.disable();
    this.authService
      .login(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.form.enable();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ILoginResponseDto) => {
          this.handleLoginResponse(response);
        },
        error: error => {
          this.logger.error(AUTH_MESSAGES.ERROR.LOGIN, error);
        },
      });
  }

  private handleLoginResponse(loginResponse: ILoginResponseDto): void {
    const { roles, firstName } = loginResponse;
    const { rememberMe } = this.form.getData();

    this.pendingLoginResponse = loginResponse;
    this.rememberMe = rememberMe ?? false;

    if (roles.length > 1) {
      this.availableRoles.set(roles);
      this.userName.set(firstName);
      this.showRoleSelection.set(true);
    } else {
      this.completeLogin(loginResponse, rememberMe);
    }
  }

  protected selectRole(role: string): void {
    this.selectedRole.set(role);
  }

  protected isRoleSelected(role: string): boolean {
    return this.selectedRole() === role;
  }

  protected formatRoleName(roleId: string): string {
    const roleName = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.roleList(),
      roleId
    );
    return roleName;
  }

  protected continueWithRole(): void {
    const role = this.selectedRole();
    if (!role || !this.pendingLoginResponse) {
      return;
    }

    const loginResponse: ILoginResponseDto = {
      ...this.pendingLoginResponse,
      activeRole: role,
    };

    this.completeLogin(loginResponse, this.rememberMe, role);
  }

  protected goBackToLogin(): void {
    this.showRoleSelection.set(false);
    this.selectedRole.set(null);
    this.availableRoles.set([]);
    this.pendingLoginResponse = null;
  }

  private completeLogin(
    loginResponse: ILoginResponseDto,
    rememberMe: boolean,
    selectedRoleName?: string
  ): void {
    this.authService.setAuthState(loginResponse, rememberMe);
    this.appConfigurationService.invalidateAppConfigurationCaches();

    this.loadingService.show({
      title: AUTH_MESSAGES.LOADING.SETUP_WORKSPACE,
      message: AUTH_MESSAGES.LOADING_MESSAGES.SETUP_WORKSPACE,
    });

    this.appConfigurationService
      .loadCriticalAppData()
      .pipe(
        switchMap(() => {
          this.criticalStartupState.clearCriticalLoadFailure();
          this.appConfigurationService.prefetchReferenceListsInBackground();
          if (selectedRoleName) {
            this.notificationService.success(
              AUTH_MESSAGES.SUCCESS.LOGIN_WITH_ROLE(
                this.formatRoleName(selectedRoleName)
              )
            );
          }
          return from(this.navigateAfterLoginAsync());
        }),
        finalize(() => {
          this.loadingService.hide();
          this.clearPendingLoginData();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        error: error => {
          this.criticalStartupState.markCriticalLoadFailed('configuration');
          this.loadingService.forceHideAll();
          this.logger.error(AUTH_MESSAGES.ERROR.LOAD_APP_DATA, error);
        },
      });
  }

  private clearPendingLoginData(): void {
    sessionStorage.removeItem('pending_login_data');
    sessionStorage.removeItem('pending_remember_me');
  }

  private navigateAfterLoginAsync(): Promise<boolean> {
    const redirectUrl = sessionStorage.getItem('auth_redirect_url');

    if (redirectUrl) {
      this.logger.info(`Redirecting to stored URL: ${redirectUrl}`);
      sessionStorage.removeItem('auth_redirect_url');
      return this.routerNavigationService.navigateByUrl(redirectUrl);
    }

    this.logger.info('Navigating to dashboard');
    return this.routerNavigationService.navigateToRoute([
      ROUTE_BASE_PATHS.DASHBOARD,
    ]);
  }

  protected onForgotPassword(): void {
    try {
      this.logger.logUserAction('Navigate to Forgot Password');
      const routeSegments = [
        ROUTE_BASE_PATHS.AUTH,
        ROUTES.AUTH.FORGOT_PASSWORD,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
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
