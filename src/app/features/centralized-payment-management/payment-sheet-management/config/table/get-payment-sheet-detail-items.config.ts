import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { EPaymentSheetDetailAction } from '../../types/payment-sheet.enum';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';
import { IPaymentSheetWorkflowRow } from '../../types/payment-sheet.interface';
import {
  getPaymentSheetItemUnverifyDisableReason,
  getPaymentSheetItemVerifyDisableReason,
  isPaymentSheetItemUnverifyAllowed,
  isPaymentSheetItemVerifyAllowed,
} from '../../utils/payment-sheet-item-status.util';
import {
  getPaymentSheetDetailActionDisableReason,
  isPaymentSheetDetailActionDisabled,
} from '../../utils/payment-sheet-status.util';

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
      field: 'itemStatus',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
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

interface IPaymentSheetDetailItemWorkflowActionHelpers {
  isDisabled: (action: EPaymentSheetDetailAction) => boolean;
  disableReason: (action: EPaymentSheetDetailAction) => string | undefined;
  verifyDisableWhen: (row: IPaymentSheetDetailItemRow) => boolean;
  verifyDisableReason: (row: IPaymentSheetDetailItemRow) => string | undefined;
  unverifyDisableWhen: (row: IPaymentSheetDetailItemRow) => boolean;
  unverifyDisableReason: (
    row: IPaymentSheetDetailItemRow
  ) => string | undefined;
}

function buildDetailItemWorkflowActionHelpers(
  getWorkflowRow: () => IPaymentSheetWorkflowRow
): IPaymentSheetDetailItemWorkflowActionHelpers {
  const isDisabled = (action: EPaymentSheetDetailAction): boolean =>
    isPaymentSheetDetailActionDisabled(getWorkflowRow(), action);

  const disableReason = (
    action: EPaymentSheetDetailAction
  ): string | undefined =>
    getPaymentSheetDetailActionDisableReason(getWorkflowRow(), action);

  return {
    isDisabled,
    disableReason,
    verifyDisableWhen: (row: IPaymentSheetDetailItemRow): boolean =>
      isDisabled(EPaymentSheetDetailAction.VERIFY_ITEM) ||
      !isPaymentSheetItemVerifyAllowed(row.itemStatusCode),
    verifyDisableReason: (
      row: IPaymentSheetDetailItemRow
    ): string | undefined =>
      isDisabled(EPaymentSheetDetailAction.VERIFY_ITEM)
        ? disableReason(EPaymentSheetDetailAction.VERIFY_ITEM)
        : getPaymentSheetItemVerifyDisableReason(row.itemStatusCode),
    unverifyDisableWhen: (row: IPaymentSheetDetailItemRow): boolean =>
      isDisabled(EPaymentSheetDetailAction.UNVERIFY_ITEM) ||
      !isPaymentSheetItemUnverifyAllowed(row.itemStatusCode),
    unverifyDisableReason: (
      row: IPaymentSheetDetailItemRow
    ): string | undefined =>
      isDisabled(EPaymentSheetDetailAction.UNVERIFY_ITEM)
        ? disableReason(EPaymentSheetDetailAction.UNVERIFY_ITEM)
        : getPaymentSheetItemUnverifyDisableReason(row.itemStatusCode),
  };
}

function buildPaymentSheetDetailItemsRowActionsConfig(
  getWorkflowRow: () => IPaymentSheetWorkflowRow,
  options: { includeEdit?: boolean } = {}
): Partial<ITableActionConfig<IPaymentSheetDetailItemRow>>[] {
  const { includeEdit = true } = options;
  const {
    isDisabled,
    disableReason,
    verifyDisableWhen,
    verifyDisableReason,
    unverifyDisableWhen,
    unverifyDisableReason,
  } = buildDetailItemWorkflowActionHelpers(getWorkflowRow);

  const rowActions: Partial<ITableActionConfig<IPaymentSheetDetailItemRow>>[] =
    [];

  if (includeEdit) {
    rowActions.push({
      ...COMMON_ROW_ACTIONS.EDIT,
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_EDIT],
      disableWhen: () => isDisabled(EPaymentSheetDetailAction.EDIT_ITEM),
      disableReason: () => disableReason(EPaymentSheetDetailAction.EDIT_ITEM),
    });
  }

  rowActions.push(
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_REMOVE],
      disableWhen: () => isDisabled(EPaymentSheetDetailAction.DELETE_ITEM),
      disableReason: () => disableReason(EPaymentSheetDetailAction.DELETE_ITEM),
    },
    {
      ...COMMON_ROW_ACTIONS.APPROVE,
      icon: ICONS.FLEET.PUC,
      tooltip: 'Verify',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_VERIFY],
      disableWhen: verifyDisableWhen,
      disableReason: verifyDisableReason,
    },
    {
      id: EButtonActionType.UNVERIFY,
      icon: ICONS.COMMON.SYNC,
      tooltip: 'Unverify',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_UNVERIFY],
      disableWhen: unverifyDisableWhen,
      disableReason: unverifyDisableReason,
    },
    {
      ...COMMON_ROW_ACTIONS.REJECT,
      tooltip: 'Reject',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_REJECT],
      disableWhen: () => isDisabled(EPaymentSheetDetailAction.REJECT_ITEM),
      disableReason: () => disableReason(EPaymentSheetDetailAction.REJECT_ITEM),
    },
    {
      id: EButtonActionType.PAID,
      tooltip: 'Record Payment',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_PAY],
      disableWhen: () => isDisabled(EPaymentSheetDetailAction.RECORD_PAYMENT),
      disableReason: () =>
        disableReason(EPaymentSheetDetailAction.RECORD_PAYMENT),
    }
  );

  return rowActions;
}

function buildPaymentSheetDetailItemsBulkActionsConfig(
  getWorkflowRow: () => IPaymentSheetWorkflowRow
): Partial<ITableActionConfig<IPaymentSheetDetailItemRow>>[] {
  const {
    verifyDisableWhen,
    verifyDisableReason,
    unverifyDisableWhen,
    unverifyDisableReason,
  } = buildDetailItemWorkflowActionHelpers(getWorkflowRow);

  return [
    {
      ...COMMON_BULK_ACTIONS.APPROVE,
      label: 'Verify',
      icon: ICONS.FLEET.PUC,
      tooltip: 'Verify Selected',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_VERIFY],
      disableWhen: verifyDisableWhen,
      disableReason: verifyDisableReason,
    },
    {
      id: EButtonActionType.UNVERIFY,
      label: 'Unverify',
      icon: ICONS.COMMON.SYNC,
      tooltip: 'Unverify Selected',
      permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_UNVERIFY],
      disableWhen: unverifyDisableWhen,
      disableReason: unverifyDisableReason,
    },
  ];
}

export function createPaymentSheetDetailItemsTableEnhancedConfig(
  getWorkflowRow: () => IPaymentSheetWorkflowRow,
  options: { includeEdit?: boolean } = {}
): IEnhancedTableConfig<IPaymentSheetDetailItemRow> {
  return {
    tableConfig: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_CONFIG,
    headers: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_HEADER_CONFIG,
    rowActions: buildPaymentSheetDetailItemsRowActionsConfig(
      getWorkflowRow,
      options
    ),
    bulkActions: buildPaymentSheetDetailItemsBulkActionsConfig(getWorkflowRow),
  };
}
