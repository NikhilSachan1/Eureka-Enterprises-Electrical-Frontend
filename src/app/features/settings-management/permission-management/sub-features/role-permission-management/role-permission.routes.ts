import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { RolePermissionResolver } from '../role-permission-management/resolvers/role-permission.resolver';
import { canDeactivateGuard } from '@core/guards';

export const ROLE_PERMISSION_ROUTES: Routes = [
  {
    path: `${ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET_PERMISSIONS}/:roleId`,
    loadComponent: () =>
      import(
        './components/set-role-permission/set-role-permission.component'
      ).then(m => m.SetRolePermissionComponent),
    resolve: {
      rolePermissionData: RolePermissionResolver,
    },
    canDeactivate: [canDeactivateGuard],
  },
];
