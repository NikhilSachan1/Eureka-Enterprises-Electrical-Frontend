import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

export const CENTRALIZED_PAYMENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.CENTRALIZED_PAYMENT.OUTSTANDING_BALANCES,
    pathMatch: 'full',
  },
  {
    path: ROUTES.CENTRALIZED_PAYMENT.OUTSTANDING_BALANCES,
    loadChildren: () =>
      import(
        './outstanding-balance-management/outstanding-balance.routes'
      ).then(m => m.OUTSTANDING_BALANCE_MANAGEMENT_ROUTES),
  },
  {
    path: ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEETS,
    loadChildren: () =>
      import('./payment-sheet-management/payment-sheet.routes').then(
        m => m.PAYMENT_SHEET_MANAGEMENT_ROUTES
      ),
  },
];
