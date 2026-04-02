import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IDsrGetResponseDto } from '../../types/project.dto';

export const DSR_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No DSR record found.',
};

export const DSR_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'employeeName',
    header: 'Employee Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'employeeCode' },
    showImage: true,
    dummyImageField: 'employeeName',
    primaryFieldHighlight: true,
    // permission: [APP_PERMISSION.UI.EXPENSE.TABLE_EMPLOYEE_NAME],
    serverSideFilterAndSortConfig: {
      sortField: 'userName',
      filterField: 'employeeName',
    },
  },
  {
    field: 'statusDate',
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
    field: 'projectManager',
    header: 'Project Manager',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    showImage: true,
    dummyImageField: 'projectManager',
    primaryFieldHighlight: true,
    subtitle: { field: 'projectManagerContact' },
    showSort: false,
  },
  {
    field: 'description',
    header: 'Notes',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
  },
  {
    field: 'fileKeys',
    header: 'Attachments',
    bodyTemplate: EDataType.ATTACHMENTS,
    showSort: false,
  },
];

export const DSR_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IDsrGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View DSR Details',
    permission: [APP_PERMISSION.PROJECT.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit DSR',
    permission: [APP_PERMISSION.PROJECT.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete DSR',
    permission: [APP_PERMISSION.PROJECT.DELETE],
  },
];

export const DSR_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IDsrGetResponseDto['records'][number]
> = {
  tableConfig: DSR_TABLE_CONFIG,
  headers: DSR_TABLE_HEADER_CONFIG,
  rowActions: DSR_TABLE_ROW_ACTIONS_CONFIG,
};
