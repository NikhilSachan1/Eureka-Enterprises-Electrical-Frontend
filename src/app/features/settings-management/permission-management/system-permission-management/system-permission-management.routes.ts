import { Routes } from '@angular/router';
import { ROUTES } from '../../../../shared/constants';

export const SYSTEM_PERMISSION_MANAGEMENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/system-permission-list/system-permission-list.component')
            .then(m => m.SystemPermissionListComponent)
    },
    {
        path: ROUTES.SETTINGS.PERMISSION.SYSTEM_PERMISSION.LIST,
        loadComponent: () => import('./components/system-permission-list/system-permission-list.component')
            .then(m => m.SystemPermissionListComponent)
    },
    {
        path: ROUTES.SETTINGS.PERMISSION.SYSTEM_PERMISSION.ADD,
        loadComponent: () => import('./components/add-system-permission/add-system-permission.component')
            .then(m => m.AddSystemPermissionComponent)
    }
];