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
import { IPoGetResponseDto } from '../../types/po.dto';
import {
  PO_ROW_ACTION_DISABLE_REASON,
  poApproveDisableReason,
  poRejectDisableReason,
  poUnlockGrantDisableReason,
  poUnlockRequestDisableReason,
  poUnlockRequestRejectDisableReason,
  shouldDisablePoApprove,
  shouldDisablePoEditOrDelete,
  shouldDisablePoReject,
  shouldDisablePoUnlockGrant,
  shouldDisablePoUnlockRequest,
  shouldDisablePoUnlockRequestReject,
} from '../../utils/po-table-row.util';

export const PO_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No PO record found.',
};

const PO_TABLE_PARTY_CONTRACTOR: Partial<IDataTableHeaderConfig> = {
  field: 'contractor.name',
  header: 'Contractor Name',
  dummyImageField: 'contractor.name',
  bodyTemplate: EDataType.TEXT,
  showImage: true,
  primaryFieldHighlight: true,
  showSort: false,
};

const PO_TABLE_PARTY_VENDOR: Partial<IDataTableHeaderConfig> = {
  ...PO_TABLE_PARTY_CONTRACTOR,
  field: 'vendor.name',
  header: 'Vendor Name',
  dummyImageField: 'vendor.name',
};

export const PO_TABLE_HEADERS_SHARED: Partial<IDataTableHeaderConfig>[] = [
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
    field: 'poNumber',
    header: 'PO Number',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'poDate',
    header: 'PO Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    showSort: false,
  },
  {
    field: 'totalAmount',
    header: 'Amounts',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'poAmountBreakdown',
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
    customTemplateKey: 'poLockStatus',
    showSort: false,
  },
  {
    field: 'invoicedTotal',
    header: 'Invoice & payment',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'poInvoicePaymentSummary',
    showSort: false,
  },
];

export const PO_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  PO_TABLE_PARTY_CONTRACTOR,
  ...PO_TABLE_HEADERS_SHARED,
];

const PO_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IPoGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View PO Details',
    // permission: [APP_PERMISSION.PO_DOC.TABLE_VIEW],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit PO',
    disableWhen: shouldDisablePoEditOrDelete,
    disableReason: () => PO_ROW_ACTION_DISABLE_REASON.lockedNoEdit,
    // permission: [APP_PERMISSION.PO_DOC.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete PO',
    disableWhen: shouldDisablePoEditOrDelete,
    disableReason: () => PO_ROW_ACTION_DISABLE_REASON.lockedNoDelete,
    // permission: [APP_PERMISSION.PO_DOC.DELETE],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve PO',
    disableWhen: shouldDisablePoApprove,
    disableReason: poApproveDisableReason,
    // permission: [APP_PERMISSION.PO_DOC.APPROVE],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject PO',
    disableWhen: shouldDisablePoReject,
    disableReason: poRejectDisableReason,
    // permission: [APP_PERMISSION.PO_DOC.REJECT],
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST,
    tooltip: 'Request unlock PO',
    disableWhen: shouldDisablePoUnlockRequest,
    disableReason: poUnlockRequestDisableReason,
    // permission: [APP_PERMISSION.PO_DOC.UNLOCK],
  },
  {
    id: EButtonActionType.UNLOCK_GRANT,
    tooltip: 'Grant unlock PO',
    disableWhen: shouldDisablePoUnlockGrant,
    disableReason: poUnlockGrantDisableReason,
    // permission: [APP_PERMISSION.PO_DOC.UNLOCK_GRANT],
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST_REJECT,
    tooltip: 'Reject unlock request',
    disableWhen: shouldDisablePoUnlockRequestReject,
    disableReason: poUnlockRequestRejectDisableReason,
    // permission: [APP_PERMISSION.PO_DOC.UNLOCK_REQUEST_REJECT],
  },
];

export const PO_TABLE_ENHANCED_CONFIG = (
  docContext?: EDocContext | null
): IEnhancedTableConfig<IPoGetResponseDto['records'][number]> => {
  const partyColumn =
    docContext === EDocContext.PURCHASE
      ? PO_TABLE_PARTY_VENDOR
      : PO_TABLE_PARTY_CONTRACTOR;

  return {
    tableConfig: PO_TABLE_CONFIG,
    headers: [partyColumn, ...PO_TABLE_HEADERS_SHARED],
    rowActions: PO_TABLE_ROW_ACTIONS_CONFIG,
  };
};
