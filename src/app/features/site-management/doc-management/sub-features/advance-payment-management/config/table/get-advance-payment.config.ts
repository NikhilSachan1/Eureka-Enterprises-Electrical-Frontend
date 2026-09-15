import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { IAdvancePaymentGetBaseResponseDto } from '../../types/advance-payment.dto';
import {
  advancePaymentApproveDisableReason,
  advancePaymentDeleteDisableReason,
  advancePaymentEditDisableReason,
  advancePaymentRejectDisableReason,
  shouldDisableAdvancePaymentApprove,
  shouldDisableAdvancePaymentDelete,
  shouldDisableAdvancePaymentEdit,
  shouldDisableAdvancePaymentReject,
} from '../../utils/advance-payment-table-row.util';

export const ADVANCE_PAYMENT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No advance payment record found.',
};

export const ADVANCE_PAYMENT_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'docWorkspaceContext',
      header: 'Workspace overview',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'docWorkspaceContext',
      showSort: false,
    },
    {
      field: 'advanceNumber',
      header: 'Advance No.',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
    {
      field: 'poDoc',
      header: 'PO',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'advancePaymentPo',
      showSort: false,
    },
    {
      field: 'amount',
      header: 'Amounts',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'advancePaymentAmounts',
      showSort: false,
    },
    {
      field: 'fileKeys',
      header: 'Attachment',
      bodyTemplate: EDataType.ATTACHMENTS,
      showSort: false,
    },
    {
      field: 'approvalStatus',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
      statusConfig: { rounded: true },
      showSort: false,
    },
  ];

const ADVANCE_PAYMENT_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAdvancePaymentGetBaseResponseDto>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Advance Payment Details',
    permission: [APP_PERMISSION.ADVANCE_PAYMENT_DOC.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Advance Payment',
    disableWhen: shouldDisableAdvancePaymentEdit,
    disableReason: advancePaymentEditDisableReason,
    permission: [APP_PERMISSION.ADVANCE_PAYMENT_DOC.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Advance Payment',
    disableWhen: shouldDisableAdvancePaymentDelete,
    disableReason: advancePaymentDeleteDisableReason,
    permission: [APP_PERMISSION.ADVANCE_PAYMENT_DOC.DELETE],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Advance Payment',
    disableWhen: shouldDisableAdvancePaymentApprove,
    disableReason: advancePaymentApproveDisableReason,
    permission: [APP_PERMISSION.ADVANCE_PAYMENT_DOC.APPROVE],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Advance Payment',
    disableWhen: shouldDisableAdvancePaymentReject,
    disableReason: advancePaymentRejectDisableReason,
    permission: [APP_PERMISSION.ADVANCE_PAYMENT_DOC.REJECT],
  },
];

export function createAdvancePaymentTableEnhancedConfig(): IEnhancedTableConfig<IAdvancePaymentGetBaseResponseDto> {
  return {
    tableConfig: ADVANCE_PAYMENT_TABLE_CONFIG,
    headers: ADVANCE_PAYMENT_TABLE_HEADERS_CONFIG,
    rowActions: ADVANCE_PAYMENT_TABLE_ROW_ACTIONS_CONFIG,
  };
}
