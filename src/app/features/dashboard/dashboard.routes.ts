import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from '@shared/constants';

export const DASHBOARD_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTE_BASE_PATHS.DASHBOARD,
    pathMatch: 'full',
  },
  {
    path: ROUTE_BASE_PATHS.DASHBOARD,
    loadComponent: () =>
      import('./dashboard.component').then(m => m.DashboardComponent),
  },
];
