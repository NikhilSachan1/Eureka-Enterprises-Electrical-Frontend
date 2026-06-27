import { APP_CONFIG } from '@core/config';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';

export const PAYMENT_SHEET_DETAIL_ITEMS_TABLE_CONFIG: Partial<IDataTableConfig> =
  {
    emptyMessage: 'No beneficiaries on this payment sheet.',
    emptyMessageDescription:
      'This payment sheet does not contain any line items yet.',
    showPaginator: false,
    enableServerSide: false,
  };

export const PAYMENT_SHEET_DETAIL_ITEMS_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'beneficiaryName',
      header: 'Beneficiary',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'beneficiaryCode' },
      primaryFieldHighlight: true,
      showImage: true,
      dummyImageField: 'beneficiaryName',
      showSort: false,
    },
    {
      field: 'actualDue',
      header: 'Actual Due',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.CURRENCY,
      currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      showSort: false,
    },
    {
      field: 'payableAmount',
      header: 'Payable Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.CURRENCY,
      currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      showSort: false,
    },
    {
      field: 'itemStatus',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'bankDetails',
      header: 'Bank Details',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'bankDetailsCell',
      columnStyleClass: 'cell-allow-wrap',
      showSort: false,
    },
  ];

export const PAYMENT_SHEET_DETAIL_ITEMS_ROW_ACTIONS: Partial<
  ITableActionConfig<IPaymentSheetDetailItemRow>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
  },
];

export function createPaymentSheetDetailItemsTableConfig(): IEnhancedTableConfig<IPaymentSheetDetailItemRow> {
  return {
    tableConfig: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_CONFIG,
    headers: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_HEADER_CONFIG,
    rowActions: PAYMENT_SHEET_DETAIL_ITEMS_ROW_ACTIONS,
    bulkActions: [],
  };
}
