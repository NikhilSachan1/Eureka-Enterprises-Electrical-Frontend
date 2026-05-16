import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IInvoiceGetResponseDto } from '../../types/invoice.dto';
import {
  INVOICE_ROW_ACTION_DISABLE_REASON,
  invoiceApproveDisableReason,
  invoiceRejectDisableReason,
  invoiceUnlockGrantDisableReason,
  invoiceUnlockRequestDisableReason,
  invoiceUnlockRequestRejectDisableReason,
  shouldDisableInvoiceApprove,
  shouldDisableInvoiceEditOrDelete,
  shouldDisableInvoiceReject,
  shouldDisableInvoiceUnlockGrant,
  shouldDisableInvoiceUnlockRequest,
  shouldDisableInvoiceUnlockRequestReject,
} from '../../utils/invoice-table-row.util';

export const INVOICE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No invoice record found.',
};

export const INVOICE_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] = [
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
    field: 'documentReferenceHierarchy',
    header: 'Document reference',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'documentReferenceChain',
    showSort: false,
  },
  {
    field: 'invoiceDate',
    header: 'Invoice Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    showSort: false,
  },
  {
    field: 'totalAmount',
    header: 'Amounts',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'invoiceAmountBreakdown',
    showSort: false,
  },
  {
    field: 'bookedTotal',
    header: 'Booked & paid',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'invoiceBookedPaidSummary',
    showSort: false,
  },
  {
    field: 'fileKeys',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
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
    customTemplateKey: 'invoiceLockStatus',
    showSort: false,
  },
];

const INVOICE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IInvoiceGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Invoice Details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Invoice',
    disableWhen: shouldDisableInvoiceEditOrDelete,
    disableReason: () => INVOICE_ROW_ACTION_DISABLE_REASON.lockedNoEdit,
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Invoice',
    disableWhen: shouldDisableInvoiceEditOrDelete,
    disableReason: () => INVOICE_ROW_ACTION_DISABLE_REASON.lockedNoDelete,
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Invoice',
    disableWhen: shouldDisableInvoiceApprove,
    disableReason: invoiceApproveDisableReason,
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Invoice',
    disableWhen: shouldDisableInvoiceReject,
    disableReason: invoiceRejectDisableReason,
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST,
    tooltip: 'Request unlock Invoice',
    disableWhen: shouldDisableInvoiceUnlockRequest,
    disableReason: invoiceUnlockRequestDisableReason,
  },
  {
    id: EButtonActionType.UNLOCK_GRANT,
    tooltip: 'Grant unlock Invoice',
    disableWhen: shouldDisableInvoiceUnlockGrant,
    disableReason: invoiceUnlockGrantDisableReason,
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST_REJECT,
    tooltip: 'Reject unlock request',
    disableWhen: shouldDisableInvoiceUnlockRequestReject,
    disableReason: invoiceUnlockRequestRejectDisableReason,
  },
];

export const INVOICE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IInvoiceGetResponseDto['records'][number]
> = {
  tableConfig: INVOICE_TABLE_CONFIG,
  headers: INVOICE_TABLE_HEADERS_CONFIG,
  rowActions: INVOICE_TABLE_ROW_ACTIONS_CONFIG,
};
