import { Routes } from '@angular/router';
import { ROUTES } from '../../../shared/constants';

export const COMPANY_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SITE.COMPANY.LIST,
    pathMatch: 'full'
  },
  {
    path: ROUTES.SITE.COMPANY.LIST,
    loadComponent: () => import('./company-list/company-list.component')
      .then(m => m.CompanyListComponent)
  },
  {
    path: ROUTES.SITE.COMPANY.ADD,
    loadComponent: () => import('./company-add/company-add.component')
      .then(m => m.CompanyAddComponent)
  },
]; 