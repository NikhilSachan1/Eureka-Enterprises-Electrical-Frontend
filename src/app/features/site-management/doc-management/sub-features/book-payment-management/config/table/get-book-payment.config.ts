import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
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

const shouldDisableBookPaymentEditOrDelete = (
  row: IBookPaymentGetBaseResponseDto
): boolean => row.hasTransfer === true;

const BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON = {
  paymentDoneNoEdit: 'Payment is already done. Edit is not allowed.',
  paymentDoneNoDelete: 'Payment is already done. Delete is not allowed.',
} as const;

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
      header: 'Amounts',
      bodyTemplate: EDataType.TEXT,
      customTemplateKey: 'bookPaymentAmountBreakdown',
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
      ) ??
      (shouldDisableBookPaymentEditOrDelete(row)
        ? BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.paymentDoneNoEdit
        : undefined),
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
      ) ??
      (shouldDisableBookPaymentEditOrDelete(row)
        ? BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.paymentDoneNoDelete
        : undefined),
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.DELETE],
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
