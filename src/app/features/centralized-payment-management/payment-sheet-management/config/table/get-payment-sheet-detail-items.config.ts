import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';
import { APP_PERMISSION } from '@core/constants';

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
      field: 'itemAmounts',
      header: 'Amount',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'itemAmountsCell',
      columnStyleClass: 'cell-allow-wrap',
      showSort: false,
    },
    {
      field: 'itemPayment',
      header: 'Payment',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'itemPaymentCell',
      columnStyleClass: 'cell-allow-wrap',
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

export const PAYMENT_SHEET_DETAIL_ITEMS_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPaymentSheetDetailItemRow>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_REMOVE],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    icon: ICONS.FLEET.PUC,
    tooltip: 'Verify',
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_VERIFY],
  },
  {
    id: EButtonActionType.UNVERIFY,
    icon: ICONS.COMMON.SYNC,
    tooltip: 'Unverify',
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_UNVERIFY],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject',
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_REJECT],
  },
  {
    id: EButtonActionType.PAID,
    tooltip: 'Record Payment',
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_PAY],
  },
];

export const PAYMENT_SHEET_DETAIL_ITEMS_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPaymentSheetDetailItemRow>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    label: 'Verify',
    icon: ICONS.FLEET.PUC,
    tooltip: 'Verify Selected',
  },
  {
    id: EButtonActionType.UNVERIFY,
    label: 'Unverify',
    icon: ICONS.COMMON.SYNC,
    tooltip: 'Unverify Selected',
  },
];

export const PAYMENT_SHEET_DETAIL_ITEMS_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IPaymentSheetDetailItemRow> =
  {
    tableConfig: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_CONFIG,
    headers: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_HEADER_CONFIG,
    rowActions: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_BULK_ACTIONS_CONFIG,
  };
