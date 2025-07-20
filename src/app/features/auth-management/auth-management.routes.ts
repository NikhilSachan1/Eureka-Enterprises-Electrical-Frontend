import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

export const AUTH_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.AUTH.LOGIN,
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(
        m => m.ForgotPasswordComponent
      ),
  },
  {
    path: ROUTES.AUTH.RESET_PASSWORD,
    loadComponent: () =>
      import('./components/reset-password/reset-password.component').then(
        m => m.ResetPasswordComponent
      ),
  },
  {
    path: '**',
    redirectTo: ROUTES.AUTH.LOGIN,
    pathMatch: 'full',
  },
];
