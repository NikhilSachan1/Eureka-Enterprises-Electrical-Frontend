import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from '@shared/constants';

export const SETTING_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
    pathMatch: 'full',
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
    loadChildren: () =>
      import('./permission-management/permission-management.routes').then(
        m => m.PERMISSION_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
    loadChildren: () =>
      import('./configuration-management/configuration-management.routes').then(
        m => m.CONFIGURATION_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.CRON.BASE,
    loadChildren: () =>
      import('./cron-management/cron-management.routes').then(
        m => m.GET_CRON_ROUTES
      ),
  },
];
