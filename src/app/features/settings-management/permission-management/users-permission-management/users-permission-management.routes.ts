import { Routes } from '@angular/router';
import { ROUTES } from '../../../../shared/constants';

export const USERS_PERMISSION_MANAGEMENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/users-permission-list/users-permission-list.component')
            .then(m => m.UsersPermissionListComponent)
    },
    {
        path: ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.LIST,
        loadComponent: () => import('./components/users-permission-list/users-permission-list.component')
            .then(m => m.UsersPermissionListComponent)
    }
];