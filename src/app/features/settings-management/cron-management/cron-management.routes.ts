import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

export const GET_CRON_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SETTINGS.CRON.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.SETTINGS.CONFIGURATION.LIST,
    loadComponent: () =>
      import('./components/get-cron/get-cron.component').then(
        m => m.GetCronComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.CRON.TABLE_VIEW],
    },
  },
];
