import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

export const SYSTEM_PERMISSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './components/get-system-permission/get-system-permission.component'
      ).then(m => m.GetSystemPermissionComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.SYSTEM_PERMISSION.TABLE_VIEW],
    },
  },
];

export const SYSTEM_PERMISSION_OUTSIDE_TAB_ROUTES: Routes = [
  {
    path: ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD,
    loadComponent: () =>
      import(
        './components/add-system-permission/add-system-permission.component'
      ).then(m => m.AddSystemPermissionComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.SYSTEM_PERMISSION.ADD],
    },
  },
  {
    path: `${ROUTES.SETTINGS.PERMISSION.SYSTEM.EDIT}/:systemPermissionId`,
    loadComponent: () =>
      import(
        './components/edit-system-permission/edit-system-permission.component'
      ).then(m => m.EditSystemPermissionComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.SYSTEM_PERMISSION.EDIT],
    },
  },
];
