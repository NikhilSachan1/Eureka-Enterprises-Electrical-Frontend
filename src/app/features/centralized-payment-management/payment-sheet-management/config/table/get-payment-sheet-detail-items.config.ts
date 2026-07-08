import { APP_CONFIG } from '@core/config';
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
import { EPaymentSheetSourceType } from '../../types/payment-sheet.enum';

export const PAYMENT_SHEET_DETAIL_ITEMS_TABLE_CONFIG: Partial<IDataTableConfig> =
  {
    emptyMessage: 'No beneficiaries on this payment sheet.',
    emptyMessageDescription:
      'This payment sheet does not contain any line items yet.',
    showPaginator: false,
    enableServerSide: false,
  };

export const createPaymentSheetDetailItemsTableHeadersConfig = (
  sourceType: EPaymentSheetSourceType
): Partial<IDataTableHeaderConfig>[] => {
  const isVendor = sourceType === EPaymentSheetSourceType.VENDOR_PAYMENT;

  return [
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
      field: 'companyProject',
      header: 'Company & Project',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'companyProjectCell',
      columnStyleClass: 'cell-allow-wrap',
      showSort: false,
      showColumn: isVendor,
    },
    {
      field: 'invoiceNumber',
      header: 'Invoice',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: {
        field: 'invoiceDate',
        bodyTemplate: EDataType.DATE,
        dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      showSort: false,
      showColumn: isVendor,
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
      field: 'itemVerification',
      header: 'Verification',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'itemVerificationCell',
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
};

export const createPaymentSheetDetailItemsTableRowActionsConfig = (
  sourceType: EPaymentSheetSourceType
): Partial<ITableActionConfig<IPaymentSheetDetailItemRow>>[] => {
  const isVendor = sourceType === EPaymentSheetSourceType.VENDOR_PAYMENT;

  return [
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_EDIT],
      hideWhen: () => isVendor,
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
};

export const PAYMENT_SHEET_DETAIL_ITEMS_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPaymentSheetDetailItemRow>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    label: 'Verify',
    icon: ICONS.FLEET.PUC,
    tooltip: 'Verify Selected',
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_VERIFY],
  },
  {
    id: EButtonActionType.UNVERIFY,
    label: 'Unverify',
    icon: ICONS.COMMON.SYNC,
    tooltip: 'Unverify Selected',
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_UNVERIFY],
  },
];

export const getPaymentSheetDetailItemsTableConfig = (
  sourceType: EPaymentSheetSourceType
): IEnhancedTableConfig<IPaymentSheetDetailItemRow> => ({
  tableConfig: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_CONFIG,
  headers: createPaymentSheetDetailItemsTableHeadersConfig(sourceType),
  rowActions: createPaymentSheetDetailItemsTableRowActionsConfig(sourceType),
  bulkActions: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_BULK_ACTIONS_CONFIG,
});
