import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/get-user/get-user.component').then(
        m => m.GetUserComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.USER_PERMISSION.TABLE_VIEW],
    },
  },
];
