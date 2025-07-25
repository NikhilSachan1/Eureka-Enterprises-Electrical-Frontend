import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { UserPermissionResolver } from './resolvers/user-permission.resolver';
import { canDeactivateGuard } from '@core/guards';

export const USER_PERMISSION_ROUTES: Routes = [
  {
    path: `${ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.SET_PERMISSIONS}/:userId`,
    loadComponent: () =>
      import(
        './components/set-user-permission/set-user-permission.component'
      ).then(m => m.SetUserPermissionComponent),
    resolve: {
      userPermissionData: UserPermissionResolver,
    },
    canDeactivate: [canDeactivateGuard],
  },
];
