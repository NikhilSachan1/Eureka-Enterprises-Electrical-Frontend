import { Routes } from '@angular/router';
import { ROUTES } from '../../../../shared/constants';

export const ROLE_PERMISSION_MANAGEMENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/role-permission-list/role-permission-list.component')
            .then(m => m.RolePermissionListComponent)
    },
    {
        path: ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.LIST,
        loadComponent: () => import('./components/role-permission-list/role-permission-list.component')
            .then(m => m.RolePermissionListComponent)
    }
];