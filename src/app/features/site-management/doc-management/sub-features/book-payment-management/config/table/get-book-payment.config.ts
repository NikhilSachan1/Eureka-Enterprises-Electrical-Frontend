import { COMMON_ROW_ACTIONS } from '@shared/config';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IBookPayment } from '../../types/book-payment.interface';

export const BOOK_PAYMENT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No book payment record found.',
};

export const BOOK_PAYMENT_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'vendor.name',
      header: 'Vendor Name',
      dummyImageField: 'vendor.name',
      bodyTemplate: EDataType.TEXT,
      showImage: true,
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'company.name',
      header: 'Company',
      dummyImageField: 'company.name',
      bodyTemplate: EDataType.TEXT,
      showImage: true,
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'site.name',
      header: 'Site',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      dataType: EDataType.TEXT,
      showImage: true,
      icon: 'pi pi-building',
      dummyImageField: 'site.name',
      primaryFieldHighlight: true,
      subtitle: {
        field: 'siteCityStateSubtitle',
        bodyTemplate: EDataType.TEXT,
      },
      showSort: false,
    },
    {
      field: 'documentReferenceHierarchy',
      header: 'Document reference',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'bookPaymentDocumentReference',
      showSort: false,
    },
    {
      field: 'bookingDate',
      header: 'Booking Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
    {
      field: 'paymentTotalAmount',
      header: 'Amounts',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'bookPaymentAmountBreakdown',
      showSort: false,
    },
    {
      field: 'transferStatusLabel',
      header: 'Bank transfer',
      bodyTemplate: EDataType.STATUS,
      statusConfig: { rounded: true },
      showSort: false,
    },
    {
      field: 'paymentHoldReasonDisplay',
      header: 'Payment hold reason',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
  ];

const BOOK_PAYMENT_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IBookPayment>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View book payment details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit book payment',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete book payment',
  },
];

/** Purchase (vendor) only — table always shows vendor column. */
export const BOOK_PAYMENT_TABLE_ENHANCED_CONFIG = (
  _docContext?: EDocContext | null
): IEnhancedTableConfig<IBookPayment> => {
  return {
    tableConfig: BOOK_PAYMENT_TABLE_CONFIG,
    headers: BOOK_PAYMENT_TABLE_HEADERS_CONFIG,
    rowActions: BOOK_PAYMENT_TABLE_ROW_ACTIONS_CONFIG,
  };
};
