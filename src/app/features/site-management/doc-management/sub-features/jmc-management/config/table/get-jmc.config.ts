import { COMMON_ROW_ACTIONS } from '@shared/config';
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

export const JMC_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'docWorkspaceContext',
    header: 'Workspace overview',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'docWorkspaceContext',
    showSort: false,
  },
  {
    field: 'jmcNumber',
    header: 'JMC Number',
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
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete JMC',
    disableWhen: shouldDisableJmcEditOrDelete,
    disableReason: () => JMC_ROW_ACTION_DISABLE_REASON.lockedNoDelete,
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

export const JMC_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IJmcGetResponseDto['records'][number]
> = {
  tableConfig: JMC_TABLE_CONFIG,
  headers: JMC_TABLE_HEADERS_CONFIG,
  rowActions: JMC_TABLE_ROW_ACTIONS_CONFIG,
};
