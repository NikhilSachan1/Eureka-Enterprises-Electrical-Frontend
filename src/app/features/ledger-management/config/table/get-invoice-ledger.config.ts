import { APP_CONFIG } from '@core/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import {
  IInvoiceLedgerSideConfig,
  IInvoiceLedgerTableRow,
} from '../../types/invoice-ledger.interface';

const INVOICE_LEDGER_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No invoice found for the selected filters.',
};

/**
 * Section colour of a column (header tinted, cells lightly tinted — see the page's SCSS), so the
 * bill, GST, deduction, received and outstanding columns read as groups without an extra header row.
 */
const SECTION = {
  BILL: 'ledger-col ledger-col--bill',
  GST: 'ledger-col ledger-col--gst',
  DEDUCTION: 'ledger-col ledger-col--deduction',
  RECEIVED: 'ledger-col ledger-col--received',
  OUTSTANDING: 'ledger-col ledger-col--outstanding',
} as const;

/**
 * Colour of each amount column when its value is above zero (Tailwind, like the shared table's
 * credit / debit amounts), matching the section colour of the column.
 */
export const INVOICE_LEDGER_AMOUNT_TONES: Partial<Record<string, string>> = {
  taxableAmount: 'text-teal-600',
  grossAmount: 'text-teal-600',
  cgstAmount: 'text-amber-600',
  sgstAmount: 'text-amber-600',
  igstAmount: 'text-amber-600',
  gstAmount: 'text-amber-600',
  tdsAmount: 'text-indigo-600',
  advanceAdjusted: 'text-sky-600',
  paidAmount: 'text-green-600',
  outstandingAmount: 'text-red-600',
};

/**
 * Money column, drawn by the page's `ledgerAmount` cell: the shared currency format in the
 * column's tone, plus the row's `<field>Note` in brackets when it has one (e.g. GST hold, TDS %).
 */
const amountColumn = (
  field: string,
  header: string,
  options: { section?: string; sortField?: string } = {}
): Partial<IDataTableHeaderConfig> => ({
  field,
  header,
  columnStyleClass: options.section,
  bodyTemplate: EDataType.CURRENCY,
  dataType: EDataType.NUMBER,
  currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
  customTemplateKey: 'ledgerAmount',
  showSort: !!options.sortField,
  ...(options.sortField
    ? { serverSideFilterAndSortConfig: { sortField: options.sortField } }
    : {}),
});

function buildInvoiceLedgerHeaders(
  sideConfig: IInvoiceLedgerSideConfig
): Partial<IDataTableHeaderConfig>[] {
  return [
    {
      // Party first, shown the same way as on the Contractor / Vendor lists.
      field: 'partyName',
      header: `${sideConfig.partyLabel} Name`,
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      showImage: true,
      dummyImageField: 'partyName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      // Same client / project cell as the other financial tables (party has its own column).
      field: 'docWorkspaceContext',
      header: 'Workspace overview',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'docWorkspaceContext',
      showSort: false,
    },
    {
      field: 'invoiceNumber',
      header: 'Invoice No.',
      primaryFieldHighlight: true,
      showSort: true,
      serverSideFilterAndSortConfig: { sortField: 'invoiceNumber' },
    },
    {
      field: 'invoiceDate',
      header: 'Invoice date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: true,
      serverSideFilterAndSortConfig: { sortField: 'invoiceDate' },
    },
    {
      field: 'periodLabel',
      header: 'FY / Quarter',
      showSort: false,
    },
    {
      field: 'poNumber',
      header: 'PO No.',
      showSort: false,
    },
    amountColumn('taxableAmount', 'Basic value', {
      section: SECTION.BILL,
      sortField: 'taxableAmount',
    }),
    amountColumn('cgstAmount', 'CGST', { section: SECTION.GST }),
    amountColumn('sgstAmount', 'SGST', { section: SECTION.GST }),
    amountColumn('igstAmount', 'IGST', { section: SECTION.GST }),
    amountColumn('gstAmount', 'Total GST', { section: SECTION.GST }),
    amountColumn('grossAmount', 'Gross bill', {
      section: SECTION.BILL,
      sortField: 'grossAmount',
    }),
    amountColumn('tdsAmount', 'TDS', {
      section: SECTION.DEDUCTION,
      sortField: 'tdsAmount',
    }),
    ...(sideConfig.showAdvance
      ? [
          amountColumn('advanceAdjusted', 'Advance', {
            section: SECTION.DEDUCTION,
          }),
        ]
      : []),
    amountColumn('paidAmount', sideConfig.paidLabel, {
      section: SECTION.RECEIVED,
      sortField: 'paidAmount',
    }),
    {
      // Every transfer that paid the invoice: date and amount, right in the row.
      field: 'payments',
      header: 'Payment dates',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'ledgerPayments',
      columnStyleClass: SECTION.RECEIVED,
      showSort: false,
    },
    amountColumn('outstandingAmount', 'Outstanding', {
      section: SECTION.OUTSTANDING,
      sortField: 'outstandingAmount',
    }),
    {
      field: 'paymentStatusLabel',
      header: 'Status',
      // Colour comes from the shared status map: paid / partial / unpaid.
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
  ];
}

export function createInvoiceLedgerTableEnhancedConfig(
  sideConfig: IInvoiceLedgerSideConfig
): IEnhancedTableConfig<IInvoiceLedgerTableRow> {
  return {
    tableConfig: INVOICE_LEDGER_TABLE_CONFIG,
    headers: buildInvoiceLedgerHeaders(sideConfig),
    rowActions: [],
    bulkActions: [],
  };
}
