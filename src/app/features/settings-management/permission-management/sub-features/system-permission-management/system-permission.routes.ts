import { Routes } from '@angular/router';
import { ROUTES } from '@app/shared/constants';

export const SYSTEM_PERMISSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './components/get-system-permission/get-system-permission.component'
      ).then(m => m.GetSystemPermissionComponent),
  },
];

export const SYSTEM_PERMISSION_OUTSIDE_TAB_ROUTES: Routes = [
  {
    path: ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD,
    loadComponent: () =>
      import(
        './components/add-system-permission/add-system-permission.component'
      ).then(m => m.AddSystemPermissionComponent),
  },
  {
    path: `${ROUTES.SETTINGS.PERMISSION.SYSTEM.EDIT}/:permissionId`,
    loadComponent: () =>
      import(
        './components/edit-system-permission/edit-system-permission.component'
      ).then(m => m.EditSystemPermissionComponent),
  },
];
