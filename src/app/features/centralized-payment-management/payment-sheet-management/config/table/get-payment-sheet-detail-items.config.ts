import { COMMON_ROW_ACTIONS } from '@shared/config';
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
import {
  IPaymentSheetWorkflowPermissions,
  IPaymentSheetWorkflowRow,
} from '../../types/payment-sheet.interface';
import {
  getPaymentSheetDetailActionDisableReason,
  isPaymentSheetDetailActionDisabled,
  PAYMENT_SHEET_DETAIL_ITEM_DELETE_PERMISSIONS,
  PAYMENT_SHEET_DETAIL_ITEM_EDIT_PERMISSIONS,
  PAYMENT_SHEET_DETAIL_ITEM_RECORD_PAYMENT_PERMISSIONS,
  PAYMENT_SHEET_DETAIL_ITEM_REJECT_PERMISSIONS,
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

export function buildPaymentSheetDetailItemsRowActionsConfig(
  workflowPermissions: IPaymentSheetWorkflowPermissions,
  getWorkflowRow: () => IPaymentSheetWorkflowRow,
  options: { includeEdit?: boolean } = {}
): Partial<ITableActionConfig<IPaymentSheetDetailItemRow>>[] {
  const { includeEdit = true } = options;
  const isDisabled = (action: EPaymentSheetDetailAction): boolean =>
    isPaymentSheetDetailActionDisabled(
      getWorkflowRow(),
      workflowPermissions,
      action
    );

  const disableReason = (
    action: EPaymentSheetDetailAction
  ): string | undefined =>
    getPaymentSheetDetailActionDisableReason(
      getWorkflowRow(),
      workflowPermissions,
      action
    );

  const rowActions: Partial<ITableActionConfig<IPaymentSheetDetailItemRow>>[] =
    [];

  if (includeEdit) {
    rowActions.push({
      ...COMMON_ROW_ACTIONS.EDIT,
      permission: [...PAYMENT_SHEET_DETAIL_ITEM_EDIT_PERMISSIONS],
      disableWhen: () => isDisabled(EPaymentSheetDetailAction.EDIT_ITEM),
      disableReason: () => disableReason(EPaymentSheetDetailAction.EDIT_ITEM),
    });
  }

  rowActions.push(
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      permission: [...PAYMENT_SHEET_DETAIL_ITEM_DELETE_PERMISSIONS],
      disableWhen: () => isDisabled(EPaymentSheetDetailAction.DELETE_ITEM),
      disableReason: () => disableReason(EPaymentSheetDetailAction.DELETE_ITEM),
    },
    {
      ...COMMON_ROW_ACTIONS.REJECT,
      tooltip: 'Reject',
      permission: [...PAYMENT_SHEET_DETAIL_ITEM_REJECT_PERMISSIONS],
      disableWhen: () => isDisabled(EPaymentSheetDetailAction.REJECT_ITEM),
      disableReason: () => disableReason(EPaymentSheetDetailAction.REJECT_ITEM),
    },
    {
      id: EButtonActionType.PAID,
      tooltip: 'Record Payment',
      permission: [...PAYMENT_SHEET_DETAIL_ITEM_RECORD_PAYMENT_PERMISSIONS],
      disableWhen: () => isDisabled(EPaymentSheetDetailAction.RECORD_PAYMENT),
      disableReason: () =>
        disableReason(EPaymentSheetDetailAction.RECORD_PAYMENT),
    }
  );

  return rowActions;
}

export function createPaymentSheetDetailItemsTableConfig(): IEnhancedTableConfig<IPaymentSheetDetailItemRow> {
  return {
    tableConfig: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_CONFIG,
    headers: PAYMENT_SHEET_DETAIL_ITEMS_TABLE_HEADER_CONFIG,
    rowActions: [],
    bulkActions: [],
  };
}
