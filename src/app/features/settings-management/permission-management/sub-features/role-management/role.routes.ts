import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/get-role/get-role.component').then(
        m => m.GetRoleComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ROLE_PERMISSION.TABLE_VIEW],
    },
  },
];

export const ROLE_OUTSIDE_TAB_ROUTES: Routes = [
  {
    path: ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
    loadComponent: () =>
      import('./components/add-role/add-role.component').then(
        m => m.AddRoleComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ROLE_PERMISSION.ADD],
    },
  },
  {
    path: `${ROUTES.SETTINGS.PERMISSION.ROLE.EDIT}/:roleId`,
    loadComponent: () =>
      import('./components/edit-role/edit-role.component').then(
        m => m.EditRoleComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ROLE_PERMISSION.EDIT],
    },
  },
];
