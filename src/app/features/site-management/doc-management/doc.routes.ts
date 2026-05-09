import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { EDocContext } from './types/doc.enum';

/** Sales (contractor): PO, JMC, Report, Invoice, Bank Transfer. */
const DOC_WORKSPACE_SALES_CHILDREN: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ROUTES.SITE.PROJECT.WORKSPACE_DOC.PO,
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.PO,
    loadComponent: () =>
      import(
        './sub-features/po-management/components/get-po/get-po.component'
      ).then(m => m.GetPoComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.JMC,
    loadComponent: () =>
      import(
        './sub-features/jmc-management/components/get-jmc/get-jmc.component'
      ).then(m => m.GetJmcComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.REPORT,
    loadComponent: () =>
      import(
        './sub-features/report-management/components/get-report/get-report.component'
      ).then(m => m.GetReportComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.INVOICE,
    loadComponent: () =>
      import(
        './sub-features/invoice-management/components/get-invoice/get-invoice.component'
      ).then(m => m.GetInvoiceComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.BANK_TRANSFER,
    loadComponent: () =>
      import(
        './sub-features/bank-transfer-management/components/get-bank-transfer/get-bank-transfer.component'
      ).then(m => m.GetBankTransferComponent),
  },
];

/** Purchase (vendor): same as sales + Book Payment + Payment Advice. */
const DOC_WORKSPACE_PURCHASE_CHILDREN: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ROUTES.SITE.PROJECT.WORKSPACE_DOC.PO,
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.PO,
    loadComponent: () =>
      import(
        './sub-features/po-management/components/get-po/get-po.component'
      ).then(m => m.GetPoComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.JMC,
    loadComponent: () =>
      import(
        './sub-features/jmc-management/components/get-jmc/get-jmc.component'
      ).then(m => m.GetJmcComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.REPORT,
    loadComponent: () =>
      import(
        './sub-features/report-management/components/get-report/get-report.component'
      ).then(m => m.GetReportComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.INVOICE,
    loadComponent: () =>
      import(
        './sub-features/invoice-management/components/get-invoice/get-invoice.component'
      ).then(m => m.GetInvoiceComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.BOOK_PAYMENT,
    loadComponent: () =>
      import(
        './sub-features/book-payment-management/components/get-book-payment/get-book-payment.component'
      ).then(m => m.GetBookPaymentComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.BANK_TRANSFER,
    loadComponent: () =>
      import(
        './sub-features/bank-transfer-management/components/get-bank-transfer/get-bank-transfer.component'
      ).then(m => m.GetBankTransferComponent),
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE_DOC.PAYMENT_ADVICE,
    loadComponent: () =>
      import(
        './sub-features/payment-advice-management/components/get-payment-advice/get-payment-advice.component'
      ).then(m => m.GetPaymentAdviceComponent),
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
