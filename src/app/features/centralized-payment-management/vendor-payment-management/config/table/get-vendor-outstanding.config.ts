import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/types';
import {
  IVendorBookPaymentTableRow,
  IVendorOutstandingInvoiceListRow,
  IVendorOutstandingVendorTableRow,
} from '../../types/vendor-outstanding.interface';

export const VENDOR_OUTSTANDING_EMPTY = {
  title: 'No vendor outstanding record found.',
  description: 'There are no pending vendor payments to be paid.',
} as const;

export const VENDOR_OUTSTANDING_VENDOR_TABLE_CONFIG: Partial<IDataTableConfig> =
  {
    emptyMessage: VENDOR_OUTSTANDING_EMPTY.title,
    emptyMessageDescription: VENDOR_OUTSTANDING_EMPTY.description,
    showCheckbox: false,
    showViewModeToggle: false,
  };

export const VENDOR_OUTSTANDING_VENDOR_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'vendorName',
      header: 'Vendor',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'location' },
      showImage: true,
      dummyImageField: 'vendorName',
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'invoiceCount',
      header: 'Documents',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'vendorDocumentCounts',
      showSort: false,
    },
    {
      field: 'toBeBooked',
      header: 'Amounts',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'vendorAmountSummary',
      showSort: false,
    },
  ];

export const VENDOR_OUTSTANDING_INVOICE_TABLE_CONFIG: Partial<IDataTableConfig> =
  {
    emptyMessage: 'No invoices found for this vendor.',
    emptyMessageDescription: 'There are no outstanding invoices to review.',
    showCheckbox: false,
    showPaginator: false,
    showViewModeToggle: false,
    enableServerSide: false,
  };

export const VENDOR_OUTSTANDING_INVOICE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'docWorkspaceContext',
      header: 'Company / Project',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'docWorkspaceContext',
      showSort: false,
    },
    {
      field: 'documentReferenceHierarchy',
      header: 'Document reference',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'documentReferenceChain',
      showSort: false,
    },
    {
      field: 'invoiceNumber',
      header: 'Invoice Number',
      bodyTemplate: EDataType.TEXT,
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'invoiceDate',
      header: 'Invoice Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
    {
      field: 'totalAmount',
      header: 'Amounts',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'invoiceAmountBreakdown',
      showSort: false,
    },
    {
      field: 'bookedTotal',
      header: 'Booked & paid',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'invoiceBookedPaidSummary',
      showSort: false,
    },
  ];

export const VENDOR_OUTSTANDING_OPS_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No bookings found for this invoice.',
  emptyMessageDescription:
    'Booked payment entries for this invoice will appear here.',
  showCheckbox: true,
  showPaginator: false,
  showViewModeToggle: false,
  enableServerSide: false,
};

export const VENDOR_OUTSTANDING_OPS_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'bookingDate',
      header: 'Booking Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
    {
      field: 'pendingAmount',
      header: 'Pending Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.NUMBER,
      currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      showSort: false,
    },
  ];

export const VENDOR_OUTSTANDING_VENDOR_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IVendorOutstandingVendorTableRow> =
  {
    tableConfig: VENDOR_OUTSTANDING_VENDOR_TABLE_CONFIG,
    headers: VENDOR_OUTSTANDING_VENDOR_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };

export const VENDOR_OUTSTANDING_INVOICE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IVendorOutstandingInvoiceListRow> =
  {
    tableConfig: VENDOR_OUTSTANDING_INVOICE_TABLE_CONFIG,
    headers: VENDOR_OUTSTANDING_INVOICE_TABLE_HEADER_CONFIG,
    rowActions: [
      {
        id: EButtonActionType.ADD,
        label: 'Book Payment',
        tooltip: 'Book Payment',
        permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.ADD],
        hideWhen: row => !row.canBookPayment,
      },
    ],
    bulkActions: [],
  };

export const VENDOR_OUTSTANDING_BOOKINGS_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IVendorBookPaymentTableRow> =
  {
    tableConfig: VENDOR_OUTSTANDING_OPS_TABLE_CONFIG,
    headers: VENDOR_OUTSTANDING_OPS_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };
