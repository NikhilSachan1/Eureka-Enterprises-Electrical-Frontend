import { Routes } from '@angular/router';
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
  },
];
