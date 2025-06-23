import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const SETTING_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.PERMISSION.LIST,
    pathMatch: 'full'
  },
  {
    path: ROUTES.PERMISSION.LIST,
    loadComponent: () => import('./permission-list/permission-list.component')
      .then(m => m.PermissionListComponent)
  },
  {
    path: ROUTES.PERMISSION.MANAGE,
    loadComponent: () => import('./permission-management/permission-management.component')
      .then(m => m.PermissionManagementComponent)
  },
  {
    path: ROUTES.PERMISSION.ADD,
    loadComponent: () => import('./add-permission/add-permission.component')
      .then(m => m.AddPermissionComponent)
  }
];