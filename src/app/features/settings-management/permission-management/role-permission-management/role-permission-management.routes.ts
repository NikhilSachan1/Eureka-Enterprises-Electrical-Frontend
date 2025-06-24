import { Routes } from '@angular/router';

export const ROLE_PERMISSION_MANAGEMENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/role-permission-list/role-permission-list.component')
            .then(m => m.RolePermissionListComponent)
    }
];