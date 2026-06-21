import { Routes } from '@angular/router';

export const OUTSTANDING_BALANCE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './components/get-outstanding-balance/get-outstanding-balance.component'
      ).then(m => m.GetOutstandingBalanceComponent),
  },
];
