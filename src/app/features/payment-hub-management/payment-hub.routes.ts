import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

export const PAYMENT_HUB_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.PAYMENT_HUB.OUTSTANDING_BALANCES,
    pathMatch: 'full',
  },
  {
    path: ROUTES.PAYMENT_HUB.OUTSTANDING_BALANCES,
    loadComponent: () =>
      import(
        './components/get-payment-outstanding/get-payment-outstanding.component'
      ).then(m => m.GetPaymentOutstandingComponent),
  },
];
