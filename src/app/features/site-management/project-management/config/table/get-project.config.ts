import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IProject } from '../../types/project.interface';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

const normalizeProjectStatusKey = (status: unknown): string =>
  typeof status === 'string'
    ? status
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '')
    : '';

const isOngoingProjectStatus = (status: unknown): boolean =>
  normalizeProjectStatusKey(status) === 'ongoing';

const isCompletedProjectStatus = (status: unknown): boolean => {
  const key = normalizeProjectStatusKey(status);
  return key === 'completed' || key === 'workcompleted';
};

const getProjectStatus = (row: IProject): unknown => {
  const record = row as IProject & { status?: string };
  return record.originalRawData?.status ?? record.status;
};

const PROJECT_DISABLED_TOOLTIP = {
  deleteWhileOngoing:
    'Cannot delete a project while its status is Ongoing. Change status first.',
  assignVendorWhileComplete:
    'Cannot assign vendor while the project is complete.',
} as const;

const PROJECT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No project record found.',
};

const PROJECT_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'projectName',
    header: 'Project Name',
    customTemplateKey: 'projectNameCell',
    columnStyleClass: 'cell-allow-wrap project-name-col',
    showSort: false,
  },
  {
    field: 'stakeholders',
    header: 'Stakeholders',
    customTemplateKey: 'projectStakeholders',
    showSort: false,
  },
  {
    field: 'projectStatus',
    header: 'Project Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'projectStatus',
    },
    showSort: false,
  },
  {
    field: 'documentStatus',
    header: 'Document Status',
    customTemplateKey: 'projectDocumentStatus',
    columnStyleClass: 'project-doc-status-col',
    showSort: false,
    permission: [APP_PERMISSION.UI.PROJECT.DOCUMENT_STATUS],
  },
  {
    field: 'timeLine',
    header: 'Time Line',
    bodyTemplate: EDataType.RANGE,
    dataType: EDataType.DATE,
    dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
    showSort: false,
  },
  {
    field: 'workTypes',
    header: 'Work Type',
    customTemplateKey: 'projectWorkTypes',
    showSort: false,
  },
];

function isNotAllocatedProjectManager(
  row: IProject,
  loggedInUserId: string | null | undefined
): boolean {
  if (!loggedInUserId) {
    return false;
  }

  const record = row as IProject & {
    allocatedEmployees?: IProject['stakeholders']['allocatedEmployees'];
  };
  const employees =
    record.originalRawData?.allocatedEmployees ??
    record.stakeholders?.allocatedEmployees ??
    record.allocatedEmployees ??
    [];

  return !employees.some(
    employee =>
      employee.id === loggedInUserId &&
      employee.role.replace(/[\s_-]/g, '').toLowerCase() === 'projectmanager'
  );
}

function buildProjectTableRowActionsConfig(
  loggedInUserId: string | null | undefined
): Partial<ITableActionConfig<IProject>>[] {
  return [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: 'View Project Details',
      permission: [APP_PERMISSION.PROJECT.VIEW_DETAIL],
    },
    {
      id: EButtonActionType.WORKSPACE,
      tooltip: 'View Project Workspace',
      permission: [APP_PERMISSION.PROJECT.WORKSPACE],
    },
    {
      ...COMMON_ROW_ACTIONS.EDIT,
      tooltip: 'Edit Project',
      permission: [APP_PERMISSION.PROJECT.EDIT],
    },
    {
      id: EButtonActionType.ASSIGN_VENDOR,
      tooltip: 'Assign Vendor',
      hideWhen: row => isNotAllocatedProjectManager(row, loggedInUserId),
      disableWhen: row => isCompletedProjectStatus(getProjectStatus(row)),
      disableReason: () => PROJECT_DISABLED_TOOLTIP.assignVendorWhileComplete,
    },
    {
      id: EButtonActionType.CHANGE_STATUS,
      tooltip: 'Change Project Status',
      permission: [APP_PERMISSION.PROJECT.CHANGE_STATUS],
    },
    {
      ...COMMON_ROW_ACTIONS.DELETE,
      tooltip: 'Delete Project',
      permission: [APP_PERMISSION.PROJECT.DELETE],
      disableWhen: record =>
        isOngoingProjectStatus(record?.originalRawData?.status),
      disableReason: () => PROJECT_DISABLED_TOOLTIP.deleteWhileOngoing,
    },
  ];
}

const PROJECT_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IProject>
>[] = [
    {
      ...COMMON_BULK_ACTIONS.DELETE,
      tooltip: 'Delete Selected Project',
      permission: [APP_PERMISSION.PROJECT.DELETE],
      disableWhen: record =>
        isOngoingProjectStatus(record?.originalRawData?.status),
      disableReason: () => PROJECT_DISABLED_TOOLTIP.deleteWhileOngoing,
    },
  ];

export function createProjectTableEnhancedConfig(
  loggedInUserId: string | null | undefined
): IEnhancedTableConfig<IProject> {
  return {
    tableConfig: PROJECT_TABLE_CONFIG,
    headers: PROJECT_TABLE_HEADER_CONFIG,
    rowActions: buildProjectTableRowActionsConfig(loggedInUserId),
    bulkActions: PROJECT_TABLE_BULK_ACTIONS_CONFIG,
  };
}
