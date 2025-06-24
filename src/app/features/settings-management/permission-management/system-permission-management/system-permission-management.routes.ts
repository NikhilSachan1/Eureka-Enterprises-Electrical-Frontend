import { Routes } from '@angular/router';

export const SYSTEM_PERMISSION_MANAGEMENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/system-permission-list/system-permission-list.component')
            .then(m => m.SystemPermissionListComponent)
    }
];