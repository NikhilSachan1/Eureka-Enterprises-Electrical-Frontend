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
  },
  {
    path: ROUTES.CARD.RECHARGE_HISTORY,
    loadComponent: () => import('./recharge-history/recharge-history.component')
      .then(m => m.RechargeHistoryComponent)
  },
  {
    path: ROUTES.CARD.ADD_RECHARGE,
    loadComponent: () => import('./add-recharge/add-recharge.component')
      .then(m => m.AddRechargeComponent)
  }
]; 