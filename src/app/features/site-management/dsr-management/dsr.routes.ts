import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

export const DSR_MANAGEMENT_DAILY_PROGRESS_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.DAILY_PROGRESS,
    loadComponent: () =>
      import('./components/get-dsr/get-dsr.component').then(
        m => m.GetDsrComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.DSR.TABLE_VIEW],
    },
  },
];
