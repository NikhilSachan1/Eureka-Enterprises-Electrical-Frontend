import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';
import { UserPermissionResolver } from './resolvers/user-permission.resolver';

export const USER_PERMISSION_ROUTES: Routes = [
  {
    path: `${ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.SET_PERMISSIONS}/:userId`,
    loadComponent: () =>
      import(
        './components/set-user-permission/set-user-permission.component'
      ).then(m => m.SetUserPermissionComponent),
    canActivate: [permissionGuard],
    data: { permissions: [APP_PERMISSION.USER_PERMISSION.SET] },
    resolve: {
      userPermissionData: UserPermissionResolver,
    },
  },
];
