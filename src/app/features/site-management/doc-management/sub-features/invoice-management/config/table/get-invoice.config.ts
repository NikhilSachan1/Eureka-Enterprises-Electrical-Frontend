import { COMMON_ROW_ACTIONS } from '@shared/config';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
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

const INVOICE_TABLE_PARTY_CONTRACTOR: Partial<IDataTableHeaderConfig> = {
  field: 'contractor.name',
  header: 'Contractor Name',
  dummyImageField: 'contractor.name',
  bodyTemplate: EDataType.TEXT,
  showImage: true,
  primaryFieldHighlight: true,
  showSort: false,
};

const INVOICE_TABLE_PARTY_VENDOR: Partial<IDataTableHeaderConfig> = {
  ...INVOICE_TABLE_PARTY_CONTRACTOR,
  field: 'vendor.name',
  header: 'Vendor Name',
  dummyImageField: 'vendor.name',
};

export const INVOICE_TABLE_HEADERS_SHARED: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'company.name',
    header: 'Company',
    dummyImageField: 'company.name',
    bodyTemplate: EDataType.TEXT,
    showImage: true,
    primaryFieldHighlight: true,
    showSort: false,
  },
  {
    field: 'site.name',
    header: 'Site',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    dataType: EDataType.TEXT,
    showImage: true,
    icon: 'pi pi-building',
    dummyImageField: 'site.name',
    primaryFieldHighlight: true,
    subtitle: {
      field: 'siteCityStateSubtitle',
      bodyTemplate: EDataType.TEXT,
    },
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

export const INVOICE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  INVOICE_TABLE_PARTY_CONTRACTOR,
  ...INVOICE_TABLE_HEADERS_SHARED,
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

export const INVOICE_TABLE_ENHANCED_CONFIG = (
  docContext?: EDocContext | null
): IEnhancedTableConfig<IInvoiceGetResponseDto['records'][number]> => {
  const partyColumn =
    docContext === EDocContext.PURCHASE
      ? INVOICE_TABLE_PARTY_VENDOR
      : INVOICE_TABLE_PARTY_CONTRACTOR;

  return {
    tableConfig: INVOICE_TABLE_CONFIG,
    headers: [partyColumn, ...INVOICE_TABLE_HEADERS_SHARED],
    rowActions: INVOICE_TABLE_ROW_ACTIONS_CONFIG,
  };
};
