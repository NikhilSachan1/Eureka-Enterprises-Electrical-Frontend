import { APP_PERMISSION } from '@core/constants';
import { EInvoiceLedgerSide } from '../types/invoice-ledger.enum';
import { IInvoiceLedgerSideConfig } from '../types/invoice-ledger.interface';

export const INVOICE_LEDGER_SIDE_CONFIG: Record<
  EInvoiceLedgerSide,
  IInvoiceLedgerSideConfig
> = {
  [EInvoiceLedgerSide.CONTRACTOR]: {
    side: EInvoiceLedgerSide.CONTRACTOR,
    title: 'Contractor Ledger',
    subtitle:
      'Sale invoices with GST, TDS, amount received and outstanding — invoice-wise',
    partyLabel: 'Contractor',
    paidLabel: 'Received',
    exportPermission: APP_PERMISSION.LEDGER.CONTRACTOR_EXPORT,
    // Sale invoices are never settled against advances.
    showAdvance: false,
  },
  [EInvoiceLedgerSide.VENDOR]: {
    side: EInvoiceLedgerSide.VENDOR,
    title: 'Vendor Ledger',
    subtitle:
      'Purchase invoices with GST, TDS, amount paid and outstanding — invoice-wise',
    partyLabel: 'Vendor',
    paidLabel: 'Paid',
    exportPermission: APP_PERMISSION.LEDGER.VENDOR_EXPORT,
    showAdvance: true,
  },
};
