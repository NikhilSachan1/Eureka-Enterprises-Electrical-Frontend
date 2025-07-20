import { Routes } from '@angular/router';

export const ROLE_PERMISSION_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/role-list/role-list.component').then(
        m => m.RoleListComponent
      ),
  },
];
