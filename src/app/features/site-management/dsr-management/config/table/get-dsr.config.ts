import { APP_PERMISSION } from '@core/constants/app-permission.constant';
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
import { IDsrGetResponseDto } from '@features/site-management/dsr-management/types/dsr.dto';

export const DSR_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No DSR record found.',
};

export const DSR_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'docWorkspaceContext',
    header: 'Workspace overview',
    bodyTemplate: EDataType.TEXT,
    customTemplateKey: 'docWorkspaceContext',
    showSort: false,
  },
  {
    field: 'createdByUser.fullName',
    header: 'Employee Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'createdByUser.employeeId' },
    showImage: true,
    dummyImageField: 'createdByUser.fullName',
    primaryFieldHighlight: true,
    permission: [APP_PERMISSION.UI.DSR.TABLE_EMPLOYEE_NAME],
    serverSideFilterAndSortConfig: {
      sortField: 'userName',
      filterField: 'employeeName',
    },
  },
  {
    field: 'reportDate',
    header: 'Status Date',
    bodyTemplate: EDataType.DATE,
    dataType: EDataType.DATE,
    serverSideFilterAndSortConfig: {
      sortField: 'statusDate',
      filterField: 'statusDate',
    },
  },
  {
    field: 'workTypes',
    header: 'Work types',
    customTemplateKey: 'projectWorkTypes',
    showSort: false,
  },
  {
    field: 'reportingEngineerName',
    header: 'Reporting Engineer',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    showImage: true,
    dummyImageField: 'reportingEngineerName',
    primaryFieldHighlight: true,
    subtitle: { field: 'reportingEngineerContact' },
    showSort: false,
  },
  {
    field: 'remarks',
    header: 'Notes',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
  },
  {
    field: 'dsrDocuments',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
  },
];

const buildDsrTableRowActionsConfig = (
  loggedInUserId: string | undefined | null
): Partial<ITableActionConfig<IDsrGetResponseDto['records'][number]>>[] => [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View DSR Details',
    permission: [APP_PERMISSION.DSR.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit DSR',
    permission: [APP_PERMISSION.DSR.EDIT],
    disableWhen: row =>
      isNotRecordCreator(row.createdByUser?.id, loggedInUserId),
    disableReason: row =>
      recordCreatorDisableReason('DSR', row.createdByUser?.id, loggedInUserId),
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete DSR',
    permission: [APP_PERMISSION.DSR.DELETE],
    disableWhen: row =>
      isNotRecordCreator(row.createdByUser?.id, loggedInUserId),
    disableReason: row =>
      recordCreatorDisableReason('DSR', row.createdByUser?.id, loggedInUserId),
  },
];

export function createDsrTableEnhancedConfig(
  loggedInUserId: string | undefined | null
): IEnhancedTableConfig<IDsrGetResponseDto['records'][number]> {
  return {
    tableConfig: DSR_TABLE_CONFIG,
    headers: DSR_TABLE_HEADER_CONFIG,
    rowActions: buildDsrTableRowActionsConfig(loggedInUserId),
  };
}
