import { Routes } from '@angular/router';
import { ROUTES } from '../../../shared/constants';

export const CONTRACTOR_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SITE.CONTRACTOR.LIST,
    pathMatch: 'full'
  },
  {
    path: ROUTES.SITE.CONTRACTOR.LIST,
    loadComponent: () => import('./contractor-list/contractor-list.component')
      .then(m => m.ContractorListComponent)
  },
  {
    path: ROUTES.SITE.CONTRACTOR.ADD,
    loadComponent: () => import('./contractor-add/contractor-add.component')
      .then(m => m.ContractorAddComponent)
  },
]; 