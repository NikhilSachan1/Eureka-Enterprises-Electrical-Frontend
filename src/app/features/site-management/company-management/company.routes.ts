import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetCompanyDetailResolver } from './resolvers/get-company-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

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
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.COMPANY.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.SITE.COMPANY.ADD,
    loadComponent: () =>
      import('./components/add-company/add-company.component').then(
        m => m.AddCompanyComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.COMPANY.ADD],
    },
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
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.COMPANY.EDIT],
    },
  },
];
