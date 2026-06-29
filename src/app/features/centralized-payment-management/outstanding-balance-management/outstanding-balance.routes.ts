import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';

export const OUTSTANDING_BALANCE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './components/get-outstanding-balance/get-outstanding-balance.component'
      ).then(m => m.GetOutstandingBalanceComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.OUTSTANDING_PAYMENT_SHEETS.TABLE_VIEW],
    },
  },
];
