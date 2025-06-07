import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from './shared/constants/index';

export const routes: Routes = [
  {
    path: ROUTE_BASE_PATHS.AUTH,
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.EMPLOYEE,
    loadChildren: () => import('./features/employee-management/employee-management.routes')
      .then(m => m.EMPLOYEE_MANAGEMENT_ROUTES)
  },
  {
    path: '',
    redirectTo: ROUTE_BASE_PATHS.AUTH,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ROUTE_BASE_PATHS.DASHBOARD
  }
];
