import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants';
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
import { IPaymentSheet } from '../../types/payment-sheet.interface';
import {
  getPaymentSheetRejectDisableReason,
  getPaymentSheetReturnDisableReason,
  isPaymentSheetRejectDisabled,
  isPaymentSheetReturnDisabled,
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

export const createPaymentSheetTableRowActionsConfig = (
  activeRole: string | null | undefined
): Partial<ITableActionConfig<IPaymentSheet>>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    permission: [APP_PERMISSION.PAYMENT_SHEET.VIEW_DETAIL],
  },
  {
    id: EButtonActionType.CANCEL,
    tooltip: 'Return Sheet',
    icon: ICONS.COMMON.ARROW_LEFT,
    severity: EButtonSeverity.WARNING,
    permission: [APP_PERMISSION.PAYMENT_SHEET.RETURN],
    disableWhen: (row: IPaymentSheetGetBaseResponseDto) =>
      isPaymentSheetReturnDisabled(row, activeRole),
    disableReason: (row: IPaymentSheetGetBaseResponseDto) =>
      getPaymentSheetReturnDisableReason(row, activeRole),
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Sheet',
    permission: [APP_PERMISSION.PAYMENT_SHEET.REJECT],
    disableWhen: (row: IPaymentSheetGetBaseResponseDto) =>
      isPaymentSheetRejectDisabled(row, activeRole),
    disableReason: (row: IPaymentSheetGetBaseResponseDto) =>
      getPaymentSheetRejectDisableReason(row, activeRole),
  },
];

export const getPaymentSheetTableEnhancedConfig = (
  activeRole: string | null | undefined
): IEnhancedTableConfig<IPaymentSheet> => ({
  tableConfig: PAYMENT_SHEET_TABLE_CONFIG,
  headers: PAYMENT_SHEET_TABLE_HEADER_CONFIG,
  rowActions: createPaymentSheetTableRowActionsConfig(activeRole),
  bulkActions: [],
});
