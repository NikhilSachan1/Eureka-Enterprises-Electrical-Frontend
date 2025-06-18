import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const AUTH_MANAGEMENT_ROUTES: Routes = [
    {
        path: ROUTES.AUTH.LOGIN,
        loadComponent: () => import('./login/login.component')
            .then(m => m.LoginComponent)
    },
    {
        path: ROUTES.AUTH.FORGOT_PASSWORD,
        loadComponent: () => import('./forgot-password/forgot-password.component')
            .then(m => m.ForgotPasswordComponent)
    },
    {
        path: ROUTES.AUTH.RESET_PASSWORD,
        loadComponent: () => import('./reset-password/reset-password.component')
            .then(m => m.ResetPasswordComponent)
    },
    {
        path: '**',
        redirectTo: ROUTES.AUTH.LOGIN,
        pathMatch: 'full'
    }
]; 