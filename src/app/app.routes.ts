import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from './shared/constants/index';

export const routes: Routes = [
  {
    path: ROUTE_BASE_PATHS.EMPLOYEE,
    loadChildren: () => import('./features/employee-management/employee-management.routes')
      .then(m => m.EMPLOYEE_MANAGEMENT_ROUTES)
  },
  {
    path: '**',
    redirectTo: ROUTE_BASE_PATHS.DASHBOARD
  }
];
