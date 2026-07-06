import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';
import { GetPaymentSheetDetailResolver } from './resolvers/get-payment-sheet-detail.resolver';

export const PAYMENT_SHEET_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/get-payment-sheet/get-payment-sheet.component').then(
        m => m.GetPaymentSheetComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PAYMENT_SHEET.VIEW_LIST],
    },
  },
  {
    path: ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEET_DETAIL,
    loadComponent: () =>
      import(
        './components/get-payment-sheet-detail/get-payment-sheet-detail.component'
      ).then(m => m.GetPaymentSheetDetailComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PAYMENT_SHEET.VIEW_DETAIL],
    },
    resolve: {
      paymentSheetDetail: GetPaymentSheetDetailResolver,
    },
  },
];
