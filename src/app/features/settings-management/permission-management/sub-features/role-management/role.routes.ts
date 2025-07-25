import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { canDeactivateGuard } from '@core/guards';

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/get-role/get-role.component').then(
        m => m.RoleListComponent
      ),
  },
];

export const ROLE_OUTSIDE_TAB_ROUTES: Routes = [
  {
    path: ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
    loadComponent: () =>
      import('./components/add-role/add-role.component').then(
        m => m.AddRoleComponent
      ),
    canDeactivate: [canDeactivateGuard],
  },
  {
    path: `${ROUTES.SETTINGS.PERMISSION.ROLE.EDIT}/:roleId`,
    loadComponent: () =>
      import('./components/edit-role/edit-role.component').then(
        m => m.EditRoleComponent
      ),
    canDeactivate: [canDeactivateGuard],
  },
];
