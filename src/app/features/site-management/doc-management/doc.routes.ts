import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';
import { EDocContext } from './types/doc.enum';

const { WORKSPACE_DOC } = ROUTES.SITE.PROJECT;
const {
  PO_DOC,
  JMC_DOC,
  REPORT_DOC,
  INVOICE_DOC,
  BOOK_PAYMENT_DOC,
  BANK_TRANSFER_DOC,
} = APP_PERMISSION;

/** Sales (contractor): PO, JMC, Report, Invoice, Bank Transfer. */
const DOC_WORKSPACE_SALES_CHILDREN: Routes = [
  {
    path: WORKSPACE_DOC.PO,
    loadComponent: () =>
      import(
        './sub-features/po-management/components/get-po/get-po.component'
      ).then(m => m.GetPoComponent),
    canActivate: [permissionGuard],
    data: { permissions: [PO_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.JMC,
    loadComponent: () =>
      import(
        './sub-features/jmc-management/components/get-jmc/get-jmc.component'
      ).then(m => m.GetJmcComponent),
    canActivate: [permissionGuard],
    data: { permissions: [JMC_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.REPORT,
    loadComponent: () =>
      import(
        './sub-features/report-management/components/get-report/get-report.component'
      ).then(m => m.GetReportComponent),
    canActivate: [permissionGuard],
    data: { permissions: [REPORT_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.INVOICE,
    loadComponent: () =>
      import(
        './sub-features/invoice-management/components/get-invoice/get-invoice.component'
      ).then(m => m.GetInvoiceComponent),
    canActivate: [permissionGuard],
    data: { permissions: [INVOICE_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.BANK_TRANSFER,
    loadComponent: () =>
      import(
        './sub-features/bank-transfer-management/components/get-bank-transfer/get-bank-transfer.component'
      ).then(m => m.GetBankTransferComponent),
    canActivate: [permissionGuard],
    data: { permissions: [BANK_TRANSFER_DOC.TABLE_VIEW] },
  },
];

/** Purchase (vendor): same as sales + Book Payment. */
const DOC_WORKSPACE_PURCHASE_CHILDREN: Routes = [
  {
    path: WORKSPACE_DOC.PO,
    loadComponent: () =>
      import(
        './sub-features/po-management/components/get-po/get-po.component'
      ).then(m => m.GetPoComponent),
    canActivate: [permissionGuard],
    data: { permissions: [PO_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.JMC,
    loadComponent: () =>
      import(
        './sub-features/jmc-management/components/get-jmc/get-jmc.component'
      ).then(m => m.GetJmcComponent),
    canActivate: [permissionGuard],
    data: { permissions: [JMC_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.REPORT,
    loadComponent: () =>
      import(
        './sub-features/report-management/components/get-report/get-report.component'
      ).then(m => m.GetReportComponent),
    canActivate: [permissionGuard],
    data: { permissions: [REPORT_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.INVOICE,
    loadComponent: () =>
      import(
        './sub-features/invoice-management/components/get-invoice/get-invoice.component'
      ).then(m => m.GetInvoiceComponent),
    canActivate: [permissionGuard],
    data: { permissions: [INVOICE_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.BOOK_PAYMENT,
    loadComponent: () =>
      import(
        './sub-features/book-payment-management/components/get-book-payment/get-book-payment.component'
      ).then(m => m.GetBookPaymentComponent),
    canActivate: [permissionGuard],
    data: { permissions: [BOOK_PAYMENT_DOC.TABLE_VIEW] },
  },
  {
    path: WORKSPACE_DOC.BANK_TRANSFER,
    loadComponent: () =>
      import(
        './sub-features/bank-transfer-management/components/get-bank-transfer/get-bank-transfer.component'
      ).then(m => m.GetBankTransferComponent),
    canActivate: [permissionGuard],
    data: { permissions: [BANK_TRANSFER_DOC.TABLE_VIEW] },
  },
];

/** Project workspace: contractor (sales) documents. */
export const DOC_MANAGEMENT_CONTRACTOR_DOC_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.CONTRACTOR_DOC,
    loadComponent: () =>
      import('./components/doc-integration/doc-integration.component').then(
        m => m.DocIntegrationComponent
      ),
    data: { docContext: EDocContext.SALES },
    children: DOC_WORKSPACE_SALES_CHILDREN,
  },
];

/** Project workspace: vendor (purchase) documents. */
export const DOC_MANAGEMENT_VENDOR_DOC_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.VENDOR_DOC,
    loadComponent: () =>
      import('./components/doc-integration/doc-integration.component').then(
        m => m.DocIntegrationComponent
      ),
    data: { docContext: EDocContext.PURCHASE },
    children: DOC_WORKSPACE_PURCHASE_CHILDREN,
  },
];
