import { Routes } from '@angular/router';

export const PAYMENT_SHEET_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/get-payment-sheet/get-payment-sheet.component').then(
        m => m.GetPaymentSheetComponent
      ),
  },
];
