import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RolePermissionResolver } from '@features/settings-management/permission-management/role-management/resolvers/role-permission.resolver';

export const PERMISSION_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./permission-list/permission-list.component').then(
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
            './system-permission-management/system-permission-management.routes'
          ).then(m => m.SYSTEM_PERMISSION_MANAGEMENT_ROUTES),
      },
      {
        path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
        loadChildren: () =>
          import(
            './users-permission-management/users-permission-management.routes'
          ).then(m => m.USERS_PERMISSION_MANAGEMENT_ROUTES),
      },
      {
        path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
        loadChildren: () =>
          import('./role-management/role-management.routes').then(
            m => m.ROLE_PERMISSION_MANAGEMENT_ROUTES
          ),
      },
    ],
  },
  // Add/Edit routes as separate pages (outside tab container)
  {
    path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM}/${ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD}`,
    loadComponent: () =>
      import(
        './system-permission-management/components/add-system-permission/add-system-permission.component'
      ).then(m => m.AddSystemPermissionComponent),
  },
  {
    path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM}/${ROUTES.SETTINGS.PERMISSION.SYSTEM.EDIT}/:permissionId`,
    loadComponent: () =>
      import(
        './system-permission-management/components/edit-system-permission/edit-system-permission.component'
      ).then(m => m.EditSystemPermissionComponent),
  },
  {
    path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}/${ROUTES.SETTINGS.PERMISSION.ROLE.ADD}`,
    loadComponent: () =>
      import('./role-management/components/add-role/add-role.component').then(
        m => m.AddRoleComponent
      ),
  },
  {
    path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}/${ROUTES.SETTINGS.PERMISSION.ROLE.EDIT}/:roleId`,
    loadComponent: () =>
      import('./role-management/components/edit-role/edit-role.component').then(
        m => m.EditRoleComponent
      ),
  },
  {
    path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}/${ROUTES.SETTINGS.PERMISSION.ROLE.SET_PERMISSIONS}/:roleId`,
    loadComponent: () =>
      import(
        './role-management/components/set-role-permission/set-role-permission.component'
      ).then(m => m.SetRolePermissionComponent),
    resolve: {
      rolePermissionData: RolePermissionResolver,
    },
  },
];
