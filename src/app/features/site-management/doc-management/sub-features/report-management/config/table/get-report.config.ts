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
import { IReportGetBaseResponseDto } from '../../types/report.dto';
import {
  REPORT_ROW_ACTION_DISABLE_REASON,
  reportUnlockGrantDisableReason,
  reportUnlockRequestDisableReason,
  reportUnlockRequestRejectDisableReason,
  shouldDisableReportEditOrDelete,
  shouldDisableReportUnlockGrant,
  shouldDisableReportUnlockRequest,
  shouldDisableReportUnlockRequestReject,
} from '../../utils/report-table-row.util';

export const REPORT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No report record found.',
};

export const REPORT_TABLE_HEADERS_CONFIG: Partial<IDataTableHeaderConfig>[] = [
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
    customTemplateKey: 'documentReferenceChain',
    showSort: false,
  },
  {
    field: 'reportDate',
    header: 'Report Date',
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
    field: 'isLocked',
    header: 'Lock status',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'reportLockStatus',
    showSort: false,
  },
];

const buildReportTableRowActionsConfig = (
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IReportGetBaseResponseDto>>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View report details',
    permission: [APP_PERMISSION.REPORT_DOC.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit report',
    disableWhen: (row: IReportGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId) ||
      shouldDisableReportEditOrDelete(row),
    disableReason: (row: IReportGetBaseResponseDto) =>
      recordCreatorDisableReason('report', row.createdBy, loggedInUserId) ??
      (shouldDisableReportEditOrDelete(row)
        ? REPORT_ROW_ACTION_DISABLE_REASON.lockedNoEdit
        : undefined),
    permission: [APP_PERMISSION.REPORT_DOC.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete report',
    disableWhen: (row: IReportGetBaseResponseDto) =>
      isNotRecordCreator(row.createdBy, loggedInUserId) ||
      shouldDisableReportEditOrDelete(row),
    disableReason: (row: IReportGetBaseResponseDto) =>
      recordCreatorDisableReason('report', row.createdBy, loggedInUserId) ??
      (shouldDisableReportEditOrDelete(row)
        ? REPORT_ROW_ACTION_DISABLE_REASON.lockedNoDelete
        : undefined),
    permission: [APP_PERMISSION.REPORT_DOC.DELETE],
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST,
    tooltip: 'Request unlock Report',
    disableWhen: shouldDisableReportUnlockRequest,
    disableReason: reportUnlockRequestDisableReason,
    permission: [APP_PERMISSION.REPORT_DOC.UNLOCK],
  },
  {
    id: EButtonActionType.UNLOCK_GRANT,
    tooltip: 'Grant unlock Report',
    disableWhen: shouldDisableReportUnlockGrant,
    disableReason: reportUnlockGrantDisableReason,
    permission: [APP_PERMISSION.REPORT_DOC.UNLOCK_GRANT],
  },
  {
    id: EButtonActionType.UNLOCK_REQUEST_REJECT,
    tooltip: 'Reject unlock request',
    disableWhen: shouldDisableReportUnlockRequestReject,
    disableReason: reportUnlockRequestRejectDisableReason,
    permission: [APP_PERMISSION.REPORT_DOC.UNLOCK_REQUEST_REJECT],
  },
];

export function createReportTableEnhancedConfig(
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IReportGetBaseResponseDto> {
  return {
    tableConfig: REPORT_TABLE_CONFIG,
    headers: REPORT_TABLE_HEADERS_CONFIG,
    rowActions: buildReportTableRowActionsConfig(loggedInUserId),
  };
}
