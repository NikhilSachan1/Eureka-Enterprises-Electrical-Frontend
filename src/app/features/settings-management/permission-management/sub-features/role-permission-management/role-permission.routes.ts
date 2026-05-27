import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const ROLE_PERMISSION_ROUTES: Routes = [
  {
    path: ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET_PERMISSIONS,
    loadComponent: () =>
      import(
        './components/set-role-permission/set-role-permission.component'
      ).then(m => m.SetRolePermissionComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ROLE_PERMISSION.SET],
    },
  },
  {
    path: `${ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET_PERMISSIONS}/:roleId`,
    redirectTo: ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET_PERMISSIONS,
    pathMatch: 'full',
  },
];
