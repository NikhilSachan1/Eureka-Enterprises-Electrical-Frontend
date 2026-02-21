import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from '@shared/constants';

export const PERMISSION_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sub-features/permission-list/permission-list.component').then(
        m => m.PermissionListComponent
      ),
    children: [
      {
        path: '',
        redirectTo: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
        pathMatch: 'full',
      },
      {
        path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
        loadChildren: () =>
          import(
            './sub-features/system-permission-management/system-permission.routes'
          ).then(m => m.SYSTEM_PERMISSION_ROUTES),
      },
      {
        path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
        loadChildren: () =>
          import('./sub-features/user-management/user.routes').then(
            m => m.USER_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
        loadChildren: () =>
          import('./sub-features/role-management/role.routes').then(
            m => m.ROLE_ROUTES
          ),
      },
    ],
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
    loadChildren: () =>
      import(
        './sub-features/system-permission-management/system-permission.routes'
      ).then(m => m.SYSTEM_PERMISSION_OUTSIDE_TAB_ROUTES),
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
    loadChildren: () =>
      import('./sub-features/role-management/role.routes').then(
        m => m.ROLE_OUTSIDE_TAB_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE_PERMISSION,
    loadChildren: () =>
      import(
        './sub-features/role-permission-management/role-permission.routes'
      ).then(m => m.ROLE_PERMISSION_ROUTES),
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER_PERMISSION,
    loadChildren: () =>
      import(
        './sub-features/user-permission-management/user-permission.routes'
      ).then(m => m.USER_PERMISSION_ROUTES),
  },
];
