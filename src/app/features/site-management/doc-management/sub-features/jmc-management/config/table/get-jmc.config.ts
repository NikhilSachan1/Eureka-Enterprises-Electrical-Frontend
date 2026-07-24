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
import {
  IJmcGetBaseResponseDto,
  IJmcGetResponseDto,
} from '../../types/jmc.dto';
import {
  jmcApproveDisableReason,
  jmcEditDisableReason,
  jmcDeleteDisableReason,
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
    field: 'jmcDocKeys',
    header: 'JMC DOC',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
    showFilter: false,
    enableAttachmentGallery: false,
  },
  {
    field: 'fileKeys',
    header: 'Signed copy',
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

const buildJmcTableRowActionsConfig = (
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IJmcGetResponseDto['records'][number]>>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View JMC Details',
    permission: [APP_PERMISSION.JMC_DOC.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit JMC',
    disableWhen: (row: IJmcGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId) ||
      shouldDisableJmcEditOrDelete(row),
    disableReason: (row: IJmcGetBaseResponseDto) =>
      recordCreatorDisableReason('JMC', row.createdBy, loggedInUserId) ??
      jmcEditDisableReason(row),
    permission: [APP_PERMISSION.JMC_DOC.EDIT],
  },
  {
    id: EButtonActionType.UPLOAD,
    tooltip: 'Upload signed copy',
    hideWhen: (row: IJmcGetBaseResponseDto) => !row.isSystemGenerated,
    disableWhen: (row: IJmcGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId) ||
      shouldDisableJmcEditOrDelete(row),
    disableReason: (row: IJmcGetBaseResponseDto) =>
      recordCreatorDisableReason('JMC', row.createdBy, loggedInUserId) ??
      jmcEditDisableReason(row),
    permission: [APP_PERMISSION.JMC_DOC.UPLOAD_SIGNED_COPY],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete JMC',
    disableWhen: (row: IJmcGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId) ||
      shouldDisableJmcEditOrDelete(row),
    disableReason: (row: IJmcGetBaseResponseDto) =>
      recordCreatorDisableReason('JMC', row.createdBy, loggedInUserId) ??
      jmcDeleteDisableReason(row),
    permission: [APP_PERMISSION.JMC_DOC.DELETE],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve JMC',
    disableWhen: shouldDisableJmcApprove,
    disableReason: jmcApproveDisableReason,
    permission: [APP_PERMISSION.JMC_DOC.APPROVE],
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject JMC',
    disableWhen: shouldDisableJmcReject,
    disableReason: jmcRejectDisableReason,
    permission: [APP_PERMISSION.JMC_DOC.REJECT],
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST,
    tooltip: 'Request unlock JMC',
    disableWhen: shouldDisableJmcUnlockRequest,
    disableReason: jmcUnlockRequestDisableReason,
    permission: [APP_PERMISSION.JMC_DOC.UNLOCK],
  },
  {
    id: EButtonActionType.UNLOCK_GRANT,
    tooltip: 'Grant unlock JMC',
    disableWhen: shouldDisableJmcUnlockGrant,
    disableReason: jmcUnlockGrantDisableReason,
    permission: [APP_PERMISSION.JMC_DOC.UNLOCK_GRANT],
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST_REJECT,
    tooltip: 'Reject unlock request',
    disableWhen: shouldDisableJmcUnlockRequestReject,
    disableReason: jmcUnlockRequestRejectDisableReason,
    permission: [APP_PERMISSION.JMC_DOC.UNLOCK_REQUEST_REJECT],
  },
];

export function createJmcTableEnhancedConfig(
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IJmcGetResponseDto['records'][number]> {
  return {
    tableConfig: JMC_TABLE_CONFIG,
    headers: JMC_TABLE_HEADERS_CONFIG,
    rowActions: buildJmcTableRowActionsConfig(loggedInUserId),
  };
}
