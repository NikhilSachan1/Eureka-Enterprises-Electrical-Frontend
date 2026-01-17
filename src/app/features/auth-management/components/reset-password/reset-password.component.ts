import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { RouterNavigationService } from '@shared/services';
import { RESET_PASSWORD_FORM_CONFIG } from '../../config/form/reset-password.config';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { FormBase } from '@shared/base/form.base';
import { AUTH_MESSAGES } from '../../constants';
import {
  IResetPasswordFormDto,
  IResetPasswordResponseDto,
} from '@features/auth-management/types/auth.dto';
import { AuthService } from '@features/auth-management/services/auth.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RESET_PASSWORD_PREFILLED_DATA } from '@shared/mock-data/auth.mock-data';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    InputFieldComponent,
    AuthLayoutComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent
  extends FormBase<IResetPasswordFormDto>
  implements OnInit
{
  private readonly authService = inject(AuthService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private token!: string;

  ngOnInit(): void {
    const token = this.routerNavigationService.getRouteQueryParam('resetToken');

    if (!token) {
      this.logger.error('Token not found in query parameters');
      this.notificationService.error(
        'Invalid reset password link. Please try again.'
      );
      const routeSegments = [ROUTE_BASE_PATHS.AUTH, ROUTES.AUTH.LOGIN];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    this.token = token;

    this.form = this.formService.createForm<IResetPasswordFormDto>(
      RESET_PASSWORD_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(RESET_PASSWORD_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeResetPassword(formData);
  }

  private prepareFormData(): IResetPasswordFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeResetPassword(formData: IResetPasswordFormDto): void {
    this.loadingService.show({
      title: AUTH_MESSAGES.LOADING.RESET_PASSWORD,
      message: AUTH_MESSAGES.LOADING_MESSAGES.RESET_PASSWORD,
    });
    this.form.disable();
    this.authService
      .resetPassword(formData, this.token)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.form.enable();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IResetPasswordResponseDto) => {
          this.notificationService.success(response.message);
          const routeSegments = [ROUTE_BASE_PATHS.AUTH, ROUTES.AUTH.LOGIN];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: error => {
          this.logger.error(AUTH_MESSAGES.ERROR.RESET_PASSWORD, error);
        },
      });
  }

  protected onBackToLogin(): void {
    try {
      this.logger.logUserAction('Navigate back to Login');
      const routeSegments = [ROUTE_BASE_PATHS.AUTH, ROUTES.AUTH.LOGIN];
      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.error('Error navigating back to login', error);
    }
  }
}
