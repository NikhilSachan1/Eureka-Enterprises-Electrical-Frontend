import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const PETRO_CARD_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.PETRO_CARD.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.PETRO_CARD.LIST,
    loadComponent: () =>
      import('./components/get-petro-card/get-petro-card.component').then(
        m => m.GetPetroCardComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PETRO_CARD.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.PETRO_CARD.ADD,
    loadComponent: () =>
      import('./components/add-petro-card/add-petro-card.component').then(
        m => m.AddPetroCardComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PETRO_CARD.ADD],
    },
  },
  {
    path: `${ROUTES.PETRO_CARD.EDIT}/:petroCardId`,
    loadComponent: () =>
      import('./components/edit-petro-card/edit-petro-card.component').then(
        m => m.EditPetroCardComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PETRO_CARD.EDIT],
    },
  },
];
