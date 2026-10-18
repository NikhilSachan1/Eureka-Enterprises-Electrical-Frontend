import { Routes } from '@angular/router';

import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

export const DELEGATION_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SETTINGS.DELEGATION.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.SETTINGS.DELEGATION.LIST,
    loadComponent: () =>
      import('./components/get-user-delegation/get-user-delegation.component').then(
        m => m.GetUserDelegationComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.USER_DELEGATION.TABLE_VIEW],
    },
  },
];
