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
    }
];