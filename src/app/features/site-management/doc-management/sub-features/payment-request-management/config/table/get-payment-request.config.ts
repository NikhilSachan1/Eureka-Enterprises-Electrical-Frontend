import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { IPaymentRequestGetBaseResponseDto } from '../../types/payment-request.dto';
import {
  paymentRequestApproveDisableReason,
  paymentRequestDeleteDisableReason,
  paymentRequestEditDisableReason,
  paymentRequestRejectDisableReason,
  shouldDisablePaymentRequestApprove,
  shouldDisablePaymentRequestDelete,
  shouldDisablePaymentRequestEdit,
  shouldDisablePaymentRequestReject,
} from '../../utils/payment-request-table-row.util';

export const PAYMENT_REQUEST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No payment request record found.',
};

export const PAYMENT_REQUEST_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'docWorkspaceContext',
      header: 'Workspace overview',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'docWorkspaceContext',
      showSort: false,
    },
    {
      field: 'invoiceNumber',
      header: 'Invoice Number',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
    {
      field: 'requestedAmount',
      header: 'Amounts',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'paymentRequestAmounts',
      showSort: false,
    },
    {
      field: 'status',
      header: 'Status',
      bodyTemplate: EDataType.STATUS,
      statusConfig: { rounded: true },
      showSort: false,
    },
  ];

const PAYMENT_REQUEST_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPaymentRequestGetBaseResponseDto>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Payment Request Details',
    permission: [APP_PERMISSION.PAYMENT_REQUEST_DOC.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Payment Request',
    disableWhen: shouldDisablePaymentRequestEdit,
    disableReason: paymentRequestEditDisableReason,
    permission: [APP_PERMISSION.PAYMENT_REQUEST_DOC.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Payment Request',
    disableWhen: shouldDisablePaymentRequestDelete,
    disableReason: paymentRequestDeleteDisableReason,
    permission: [APP_PERMISSION.PAYMENT_REQUEST_DOC.DELETE],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Payment Request',
    disableWhen: shouldDisablePaymentRequestApprove,
    disableReason: paymentRequestApproveDisableReason,
    permission: [APP_PERMISSION.PAYMENT_REQUEST_DOC.APPROVE],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Payment Request',
    disableWhen: shouldDisablePaymentRequestReject,
    disableReason: paymentRequestRejectDisableReason,
    permission: [APP_PERMISSION.PAYMENT_REQUEST_DOC.REJECT],
  },
];

export function createPaymentRequestTableEnhancedConfig(): IEnhancedTableConfig<IPaymentRequestGetBaseResponseDto> {
  return {
    tableConfig: PAYMENT_REQUEST_TABLE_CONFIG,
    headers: PAYMENT_REQUEST_TABLE_HEADERS_CONFIG,
    rowActions: PAYMENT_REQUEST_TABLE_ROW_ACTIONS_CONFIG,
  };
}
