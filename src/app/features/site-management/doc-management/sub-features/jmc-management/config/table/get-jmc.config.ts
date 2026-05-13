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
import { IJmcGetResponseDto } from '../../types/jmc.dto';
import {
  JMC_ROW_ACTION_DISABLE_REASON,
  jmcApproveDisableReason,
  jmcRejectDisableReason,
  jmcUnlockGrantDisableReason,
  jmcUnlockRequestDisableReason,
  jmcUnlockRequestRejectDisableReason,
  shouldDisableJmcApprove,
  shouldDisableJmcEditOrDelete,
  shouldDisableJmcReject,
  shouldDisableJmcUnlockGrant,
  shouldDisableJmcUnlockRequest,
  shouldDisableJmcUnlockRequestReject,
} from '../../utils/jmc-table-row.util';

export const JMC_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No JMC record found.',
};

const JMC_TABLE_PARTY_CONTRACTOR: Partial<IDataTableHeaderConfig> = {
  field: 'contractor.name',
  header: 'Contractor Name',
  dummyImageField: 'contractor.name',
  bodyTemplate: EDataType.TEXT,
  showImage: true,
  primaryFieldHighlight: true,
  showSort: false,
};

const JMC_TABLE_PARTY_VENDOR: Partial<IDataTableHeaderConfig> = {
  ...JMC_TABLE_PARTY_CONTRACTOR,
  field: 'vendor.name',
  header: 'Vendor Name',
  dummyImageField: 'vendor.name',
};

export const JMC_TABLE_HEADERS_SHARED: Partial<IDataTableHeaderConfig>[] = [
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
    field: 'jmcNumber',
    header: 'JMC Number',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'documentReferenceChain',
    header: 'Document reference',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'documentReferenceChain',
    showSort: false,
  },
  {
    field: 'jmcDate',
    header: 'JMC Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
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
    customTemplateKey: 'jmcLockStatus',
    showSort: false,
  },
];

export const JMC_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  JMC_TABLE_PARTY_CONTRACTOR,
  ...JMC_TABLE_HEADERS_SHARED,
];

const JMC_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IJmcGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View JMC Details',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit JMC',
    disableWhen: shouldDisableJmcEditOrDelete,
    disableReason: () => JMC_ROW_ACTION_DISABLE_REASON.lockedNoEdit,
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve JMC',
    disableWhen: shouldDisableJmcApprove,
    disableReason: jmcApproveDisableReason,
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject JMC',
    disableWhen: shouldDisableJmcReject,
    disableReason: jmcRejectDisableReason,
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST,
    tooltip: 'Request unlock JMC',
    disableWhen: shouldDisableJmcUnlockRequest,
    disableReason: jmcUnlockRequestDisableReason,
  },
  {
    id: EButtonActionType.UNLOCK_GRANT,
    tooltip: 'Grant unlock JMC',
    disableWhen: shouldDisableJmcUnlockGrant,
    disableReason: jmcUnlockGrantDisableReason,
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST_REJECT,
    tooltip: 'Reject unlock request',
    disableWhen: shouldDisableJmcUnlockRequestReject,
    disableReason: jmcUnlockRequestRejectDisableReason,
  },
];

export const JMC_TABLE_ENHANCED_CONFIG = (
  docContext?: EDocContext | null
): IEnhancedTableConfig<IJmcGetResponseDto['records'][number]> => {
  const partyColumn =
    docContext === EDocContext.PURCHASE
      ? JMC_TABLE_PARTY_VENDOR
      : JMC_TABLE_PARTY_CONTRACTOR;

  return {
    tableConfig: JMC_TABLE_CONFIG,
    headers: [partyColumn, ...JMC_TABLE_HEADERS_SHARED],
    rowActions: JMC_TABLE_ROW_ACTIONS_CONFIG,
  };
};
