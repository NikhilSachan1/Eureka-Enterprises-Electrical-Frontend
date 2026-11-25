import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';
import { EInvoiceLedgerSide } from './types/invoice-ledger.enum';

/** Contractor (SALE) and vendor (PURCHASE) ledgers share one page; the route picks the side. */
export const LEDGER_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.LEDGER.CONTRACTOR,
    pathMatch: 'full',
  },
  {
    path: ROUTES.LEDGER.CONTRACTOR,
    loadComponent: () =>
      import(
        './components/get-invoice-ledger/get-invoice-ledger.component'
      ).then(m => m.GetInvoiceLedgerComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.LEDGER.CONTRACTOR_VIEW],
      ledgerSide: EInvoiceLedgerSide.CONTRACTOR,
    },
  },
  {
    path: ROUTES.LEDGER.VENDOR,
    loadComponent: () =>
      import(
        './components/get-invoice-ledger/get-invoice-ledger.component'
      ).then(m => m.GetInvoiceLedgerComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.LEDGER.VENDOR_VIEW],
      ledgerSide: EInvoiceLedgerSide.VENDOR,
    },
  },
];
