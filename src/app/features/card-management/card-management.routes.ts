import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';
export const CARD_MANAGEMENT_ROUTES: Routes = [

  {
    path: ROUTES.CARD.LIST,
    loadComponent: () => import('./card-list/card-list.component')
      .then(m => m.CardListComponent)
  },
  {
    path: ROUTES.CARD.ADD,
    loadComponent: () => import('./add-edit-card/add-edit-card.component')
      .then(m => m.AddEditCardComponent)
  },
  {
    path: ROUTES.CARD.EDIT,
    loadComponent: () => import('./add-edit-card/add-edit-card.component')
      .then(m => m.AddEditCardComponent)
  }

]; 