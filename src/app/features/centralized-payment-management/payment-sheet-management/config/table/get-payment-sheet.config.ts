import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonSeverity,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IPaymentSheetGetBaseResponseDto } from '../../types/payment-sheet.dto';
import {
  IPaymentSheet,
  IPaymentSheetWorkflowPermissions,
} from '../../types/payment-sheet.interface';
import {
  getPaymentSheetRejectDisableReason,
  getPaymentSheetReturnDisableReason,
  isPaymentSheetRejectDisabled,
  isPaymentSheetReturnDisabled,
  PAYMENT_SHEET_REJECT_VISIBLE_PERMISSIONS,
  PAYMENT_SHEET_RETURN_VISIBLE_PERMISSIONS,
} from '../../utils/payment-sheet-status.util';

export const PAYMENT_SHEET_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No payment sheet found.',
  emptyMessageDescription: 'There are no payment sheets to display yet.',
};

export const PAYMENT_SHEET_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'sheetNumber',
      header: 'Payment Sheet #',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'title' },
      primaryFieldHighlight: true,
      showSort: false,
    },
    {
      field: 'createdAt',
      header: 'Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
      showSort: false,
    },
    {
      field: 'paymentSheetAmounts',
      header: 'Amount',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'paymentSheetAmounts',
      columnStyleClass: 'cell-allow-wrap',
      showSort: false,
    },
    {
      field: 'status',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
      serverSideFilterAndSortConfig: {
        filterField: 'status',
      },
      showSort: false,
    },
    {
      field: 'currentStage',
      header: 'Current Stage',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
  ];

export function buildPaymentSheetTableRowActionsConfig(
  workflowPermissions: IPaymentSheetWorkflowPermissions
): Partial<ITableActionConfig<IPaymentSheet>>[] {
  return [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      permission: [APP_PERMISSION.PAYMENT_SHEET.TABLE_VIEW],
    },
    {
      id: EButtonActionType.CANCEL,
      tooltip: 'Return Sheet',
      icon: ICONS.COMMON.ARROW_LEFT,
      severity: EButtonSeverity.WARNING,
      permission: [...PAYMENT_SHEET_RETURN_VISIBLE_PERMISSIONS],
      disableWhen: (row: IPaymentSheetGetBaseResponseDto) =>
        isPaymentSheetReturnDisabled(row, workflowPermissions),
      disableReason: (row: IPaymentSheetGetBaseResponseDto) =>
        getPaymentSheetReturnDisableReason(row, workflowPermissions),
    },
    {
      ...COMMON_ROW_ACTIONS.REJECT,
      tooltip: 'Reject Sheet',
      permission: [...PAYMENT_SHEET_REJECT_VISIBLE_PERMISSIONS],
      disableWhen: (row: IPaymentSheetGetBaseResponseDto) =>
        isPaymentSheetRejectDisabled(row, workflowPermissions),
      disableReason: (row: IPaymentSheetGetBaseResponseDto) =>
        getPaymentSheetRejectDisableReason(row, workflowPermissions),
    },
  ];
}

export function buildPaymentSheetTableEnhancedConfig(
  workflowPermissions: IPaymentSheetWorkflowPermissions
): IEnhancedTableConfig<IPaymentSheet> {
  return {
    tableConfig: PAYMENT_SHEET_TABLE_CONFIG,
    headers: PAYMENT_SHEET_TABLE_HEADER_CONFIG,
    rowActions: buildPaymentSheetTableRowActionsConfig(workflowPermissions),
    bulkActions: [],
  };
}
