import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from '../../../shared/constants';

export const PERMISSION_MANAGEMENT_ROUTES: Routes = [
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
];