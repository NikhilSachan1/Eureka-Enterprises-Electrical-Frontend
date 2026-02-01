import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetCompanyDetailResolver } from './resolvers/get-company-detail.resolver';

export const COMPANY_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SITE.COMPANY.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.SITE.COMPANY.LIST,
    loadComponent: () =>
      import('./components/get-company/get-company.component').then(
        m => m.GetCompanyComponent
      ),
  },
  {
    path: ROUTES.SITE.COMPANY.ADD,
    loadComponent: () =>
      import('./components/add-company/add-company.component').then(
        m => m.AddCompanyComponent
      ),
  },
  {
    path: `${ROUTES.SITE.COMPANY.EDIT}/:companyId`,
    loadComponent: () =>
      import('./components/edit-company/edit-company.component').then(
        m => m.EditCompanyComponent
      ),
    resolve: {
      companyDetail: GetCompanyDetailResolver,
    },
  },
];
