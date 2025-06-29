import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../shared/constants';

export const PERMISSION_MANAGEMENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./permission-list/permission-list.component')
            .then(m => m.PermissionListComponent),
        children: [
            {
                path: '',
                redirectTo: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
                pathMatch: 'full'
            },
            {
                path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
                loadChildren: () => import('./system-permission-management/system-permission-management.routes')
                    .then(m => m.SYSTEM_PERMISSION_MANAGEMENT_ROUTES)
            },
            {
                path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
                loadChildren: () => import('./users-permission-management/users-permission-management.routes')
                    .then(m => m.USERS_PERMISSION_MANAGEMENT_ROUTES)
            },
            {
                path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
                loadChildren: () => import('./role-permission-management/role-permission-management.routes')
                    .then(m => m.ROLE_PERMISSION_MANAGEMENT_ROUTES)
            }
        ]
    },
    // Add/Edit routes as separate pages (outside tab container)
    {
        path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM}/${ROUTES.SETTINGS.PERMISSION.SYSTEM_PERMISSION.ADD}`,
        loadComponent: () => import('./system-permission-management/components/add-system-permission/add-system-permission.component')
            .then(m => m.AddSystemPermissionComponent)
    },
    {
        path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM}/${ROUTES.SETTINGS.PERMISSION.SYSTEM_PERMISSION.EDIT}/:id`,
        loadComponent: () => import('./system-permission-management/components/edit-system-permission/edit-system-permission.component')
            .then(m => m.EditSystemPermissionComponent)
    },
    {
        path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}/${ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.ADD}`,
        loadComponent: () => import('./role-permission-management/components/add-role-permission/add-role-permission.component')
            .then(m => m.AddRolePermissionComponent)
    },
    {
        path: `${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}/${ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.EDIT}`,
        loadComponent: () => import('./role-permission-management/components/add-role-permission/add-role-permission.component')
            .then(m => m.AddRolePermissionComponent)
    }
];