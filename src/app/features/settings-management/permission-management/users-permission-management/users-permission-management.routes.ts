import { Routes } from '@angular/router';

export const USERS_PERMISSION_MANAGEMENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/users-permission-list/users-permission-list.component')
            .then(m => m.UsersPermissionListComponent)
    }
];