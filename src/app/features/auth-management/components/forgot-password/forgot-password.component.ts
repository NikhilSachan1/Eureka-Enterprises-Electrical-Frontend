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
import { FORGOT_PASSWORD_FORM_CONFIG } from '../../config/form/forgot-password.config';
import { AuthLayoutComponent } from '../../shared/auth-layout.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { FormBase } from '@shared/base/form.base';
import { AUTH_MESSAGES } from '../../constants';
import {
  IForgetPasswordFormDto,
  IForgetPasswordResponseDto,
} from '@features/auth-management/types/auth.dto';
import { AuthService } from '@features/auth-management/services/auth.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FORGOT_PASSWORD_PREFILLED_DATA } from '@shared/mock-data/auth.mock-data';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    InputFieldComponent,
    AuthLayoutComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent
  extends FormBase<IForgetPasswordFormDto>
  implements OnInit
{
  private readonly authService = inject(AuthService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  ngOnInit(): void {
    this.form = this.formService.createForm<IForgetPasswordFormDto>(
      FORGOT_PASSWORD_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(FORGOT_PASSWORD_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForgotPassword(formData);
  }

  private prepareFormData(): IForgetPasswordFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeForgotPassword(formData: IForgetPasswordFormDto): void {
    this.loadingService.show({
      title: AUTH_MESSAGES.LOADING.FORGOT_PASSWORD,
      message: AUTH_MESSAGES.LOADING_MESSAGES.FORGOT_PASSWORD,
    });
    this.form.disable();
    this.authService
      .forgetPassword(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.form.enable();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IForgetPasswordResponseDto) => {
          this.notificationService.success(response.message);
          const routeSegments = [ROUTE_BASE_PATHS.AUTH, ROUTES.AUTH.LOGIN];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: error => {
          this.logger.error(AUTH_MESSAGES.ERROR.FORGOT_PASSWORD, error);
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
