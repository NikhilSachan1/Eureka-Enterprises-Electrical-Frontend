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
import {
  disablePaymentSheetDelete,
  disablePaymentSheetEdit,
  disablePaymentSheetRecordPayment,
  disablePaymentSheetRejectItem,
  disablePaymentSheetUnverify,
  disablePaymentSheetVerify,
  paymentSheetDeleteDisableReason,
  paymentSheetEditDisableReason,
  paymentSheetRecordPaymentDisableReason,
  paymentSheetRejectItemDisableReason,
  paymentSheetUnverifyDisableReason,
  paymentSheetVerifyDisableReason,
} from '../../utils/payment-sheet-table-row.util';

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
      field: 'bankDetails',
      header: 'Bank Details',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'bankDetailsCell',
      columnStyleClass: 'cell-allow-wrap',
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
      field: 'itemStatus',
      header: 'Verification & Payment',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'itemStatusCell',
      columnStyleClass: 'cell-allow-wrap',
      showSort: false,
    },
  ];
};

export const createPaymentSheetDetailItemsTableRowActionsConfig = (
  sourceType: EPaymentSheetSourceType,
  activeRole: string | null | undefined
): Partial<ITableActionConfig<IPaymentSheetDetailItemRow>>[] => {
  const isVendor = sourceType === EPaymentSheetSourceType.VENDOR_PAYMENT;

  return [
    {
      id: EButtonActionType.EVENT_HISTORY,
      icon: ICONS.COMMON.HISTORY,
      tooltip: 'Activity History',
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_EDIT],
      hideWhen: () => isVendor,
      disableWhen: (row: IPaymentSheetDetailItemRow) =>
        disablePaymentSheetEdit(row, activeRole),
      disableReason: (row: IPaymentSheetDetailItemRow) =>
        paymentSheetEditDisableReason(row, activeRole),
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_REMOVE],
      disableWhen: (row: IPaymentSheetDetailItemRow) =>
        disablePaymentSheetDelete(row, activeRole),
      disableReason: (row: IPaymentSheetDetailItemRow) =>
        paymentSheetDeleteDisableReason(row, activeRole),
    },
    {
      ...COMMON_ROW_ACTIONS.APPROVE,
      icon: ICONS.FLEET.PUC,
      tooltip: 'Verify',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_VERIFY],
      disableWhen: (row: IPaymentSheetDetailItemRow) =>
        disablePaymentSheetVerify(row, activeRole),
      disableReason: (row: IPaymentSheetDetailItemRow) =>
        paymentSheetVerifyDisableReason(row, activeRole),
    },
    {
      id: EButtonActionType.UNVERIFY,
      icon: ICONS.COMMON.SYNC,
      tooltip: 'Unverify',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_UNVERIFY],
      disableWhen: (row: IPaymentSheetDetailItemRow) =>
        disablePaymentSheetUnverify(row, activeRole),
      disableReason: (row: IPaymentSheetDetailItemRow) =>
        paymentSheetUnverifyDisableReason(row, activeRole),
    },
    {
      ...COMMON_ROW_ACTIONS.REJECT,
      tooltip: 'Reject',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_REJECT],
      disableWhen: (row: IPaymentSheetDetailItemRow) =>
        disablePaymentSheetRejectItem(row, activeRole),
      disableReason: (row: IPaymentSheetDetailItemRow) =>
        paymentSheetRejectItemDisableReason(row, activeRole),
    },
    {
      id: EButtonActionType.PAID,
      tooltip: 'Record Payment',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_PAY],
      disableWhen: (row: IPaymentSheetDetailItemRow) =>
        disablePaymentSheetRecordPayment(row, activeRole),
      disableReason: (row: IPaymentSheetDetailItemRow) =>
        paymentSheetRecordPaymentDisableReason(row, activeRole),
    },
  ];
};

export const createPaymentSheetDetailItemsTableBulkActionsConfig = (
  activeRole: string | null | undefined
): Partial<ITableActionConfig<IPaymentSheetDetailItemRow>>[] => [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    label: 'Verify',
    icon: ICONS.FLEET.PUC,
    tooltip: 'Verify Selected',
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_VERIFY],
    disableWhen: (row: IPaymentSheetDetailItemRow) =>
      disablePaymentSheetVerify(row, activeRole),
    disableReason: (row: IPaymentSheetDetailItemRow) =>
      paymentSheetVerifyDisableReason(row, activeRole),
  },
  {
    id: EButtonActionType.UNVERIFY,
    label: 'Unverify',
    icon: ICONS.COMMON.SYNC,
    tooltip: 'Unverify Selected',
    permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_UNVERIFY],
    disableWhen: (row: IPaymentSheetDetailItemRow) =>
      disablePaymentSheetUnverify(row, activeRole),
    disableReason: (row: IPaymentSheetDetailItemRow) =>
      paymentSheetUnverifyDisableReason(row, activeRole),
  },
];

export const getPaymentSheetDetailItemsTableConfig = (
  sourceType: EPaymentSheetSourceType,
  activeRole: string | null | undefined
): IEnhancedTableConfig<IPaymentSheetDetailItemRow> => ({
  tableConfig: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_CONFIG,
  headers: createPaymentSheetDetailItemsTableHeadersConfig(sourceType),
  rowActions: createPaymentSheetDetailItemsTableRowActionsConfig(
    sourceType,
    activeRole
  ),
  bulkActions: createPaymentSheetDetailItemsTableBulkActionsConfig(activeRole),
});
