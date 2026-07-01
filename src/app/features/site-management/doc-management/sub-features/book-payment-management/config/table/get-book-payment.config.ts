import { APP_CONFIG } from '@core/config';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import {
  isNotRecordCreator,
  recordCreatorDisableReason,
} from '@shared/utility';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { IBookPaymentGetBaseResponseDto } from '../../types/book-payment.dto';
import {
  bookPaymentApproveDisableReason,
  bookPaymentDeleteDisableReason,
  bookPaymentEditDisableReason,
  bookPaymentRejectDisableReason,
  bookPaymentUnlockGrantDisableReason,
  bookPaymentUnlockRequestDisableReason,
  bookPaymentUnlockRequestRejectDisableReason,
  shouldDisableBookPaymentApprove,
  shouldDisableBookPaymentEditOrDelete,
  shouldDisableBookPaymentReject,
  shouldDisableBookPaymentUnlockGrant,
  shouldDisableBookPaymentUnlockRequest,
  shouldDisableBookPaymentUnlockRequestReject,
} from '../../utils/book-payment-table-row.util';

export const BOOK_PAYMENT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No book payment record found.',
};

export const BOOK_PAYMENT_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'docWorkspaceContext',
      header: 'Workspace overview',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'docWorkspaceContext',
      showSort: false,
    },
    {
      field: 'documentReferenceHierarchy',
      header: 'Document reference',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'bookPaymentDocumentReference',
      showSort: false,
    },
    {
      field: 'bookingDate',
      header: 'Booking Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      showSort: false,
    },
    {
      field: 'paymentTotalAmount',
      header: 'Amount',
      bodyTemplate: EDataType.CURRENCY,
      dataType: EDataType.CURRENCY,
      currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      showSort: false,
    },
    {
      field: 'transferStatusLabel',
      header: 'Bank transfer',
      bodyTemplate: EDataType.STATUS,
      statusConfig: { rounded: true },
      showSort: false,
    },
    {
      field: 'paymentHoldReasonDisplay',
      header: 'Payment hold reason',
      bodyTemplate: EDataType.TEXT,
      showSort: false,
    },
    {
      field: 'approvalStatus',
      header: 'Approval Status',
      bodyTemplate: EDataType.STATUS,
      showSort: false,
    },
    {
      field: 'isLocked',
      header: 'Lock status',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'bookPaymentLockStatus',
      showSort: false,
    },
  ];

const buildBookPaymentTableRowActionsConfig = (
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IBookPaymentGetBaseResponseDto>>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View book payment details',
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit book payment',
    disableWhen: (row: IBookPaymentGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId) ||
      shouldDisableBookPaymentEditOrDelete(row),
    disableReason: (row: IBookPaymentGetBaseResponseDto) =>
      recordCreatorDisableReason(
        'book payment',
        row.createdBy,
        loggedInUserId
      ) ?? bookPaymentEditDisableReason(row),
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete book payment',
    disableWhen: (row: IBookPaymentGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId) ||
      shouldDisableBookPaymentEditOrDelete(row),
    disableReason: (row: IBookPaymentGetBaseResponseDto) =>
      recordCreatorDisableReason(
        'book payment',
        row.createdBy,
        loggedInUserId
      ) ?? bookPaymentDeleteDisableReason(row),
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.DELETE],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve book payment',
    disableWhen: shouldDisableBookPaymentApprove,
    disableReason: bookPaymentApproveDisableReason,
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.APPROVE],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject book payment',
    disableWhen: shouldDisableBookPaymentReject,
    disableReason: bookPaymentRejectDisableReason,
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.REJECT],
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST,
    tooltip: 'Request unlock book payment',
    disableWhen: shouldDisableBookPaymentUnlockRequest,
    disableReason: bookPaymentUnlockRequestDisableReason,
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.UNLOCK],
  },
  {
    id: EButtonActionType.UNLOCK_GRANT,
    tooltip: 'Grant unlock book payment',
    disableWhen: shouldDisableBookPaymentUnlockGrant,
    disableReason: bookPaymentUnlockGrantDisableReason,
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.UNLOCK_GRANT],
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST_REJECT,
    tooltip: 'Reject unlock request',
    disableWhen: shouldDisableBookPaymentUnlockRequestReject,
    disableReason: bookPaymentUnlockRequestRejectDisableReason,
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.UNLOCK_REQUEST_REJECT],
  },
];

export function createBookPaymentTableEnhancedConfig(
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IBookPaymentGetBaseResponseDto> {
  return {
    tableConfig: BOOK_PAYMENT_TABLE_CONFIG,
    headers: BOOK_PAYMENT_TABLE_HEADERS_CONFIG,
    rowActions: buildBookPaymentTableRowActionsConfig(loggedInUserId),
  };
}
