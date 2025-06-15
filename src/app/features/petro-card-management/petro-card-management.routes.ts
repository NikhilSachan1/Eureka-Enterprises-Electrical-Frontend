import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const PETRO_CARD_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.CARD.LIST,
    pathMatch: 'full'
  },
  {
    path: ROUTES.CARD.LIST,
    loadComponent: () => import('./petro-card-list/petro-card-list.component')
      .then(m => m.PetroCardListComponent)
  },
  {
    path: ROUTES.CARD.ADD,
    loadComponent: () => import('./petro-add-card/petro-add-card.component')
      .then(m => m.PetroAddCardComponent)
  }
]; 