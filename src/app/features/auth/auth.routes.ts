import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const AUTH_ROUTES: Routes = [
  {
    path: ROUTES.AUTH.LOGIN,
    loadComponent: () => import('./login/login.component').then(c => c.LoginComponent),
    title: 'Login - Eureka Enterprises'
  },
  {
    path: '',
    redirectTo: ROUTES.AUTH.LOGIN,
    pathMatch: 'full'
  }
]; 