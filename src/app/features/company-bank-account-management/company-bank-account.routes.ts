import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const COMPANY_BANK_ACCOUNT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.COMPANY_BANK_ACCOUNT.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.COMPANY_BANK_ACCOUNT.LIST,
    loadComponent: () =>
      import(
        './components/get-company-bank-account/get-company-bank-account.component'
      ).then(m => m.GetCompanyBankAccountComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.COMPANY_BANK_ACCOUNT.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.COMPANY_BANK_ACCOUNT.ADD,
    loadComponent: () =>
      import(
        './components/add-company-bank-account/add-company-bank-account.component'
      ).then(m => m.AddCompanyBankAccountComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.COMPANY_BANK_ACCOUNT.ADD],
    },
  },
  {
    path: `${ROUTES.COMPANY_BANK_ACCOUNT.EDIT}/:companyBankAccountId`,
    loadComponent: () =>
      import(
        './components/edit-company-bank-account/edit-company-bank-account.component'
      ).then(m => m.EditCompanyBankAccountComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.COMPANY_BANK_ACCOUNT.EDIT],
    },
  },
];
