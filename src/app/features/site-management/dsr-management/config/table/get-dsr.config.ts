import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IDsrGetResponseDto } from '@features/site-management/dsr-management/types/dsr.dto';

export const DSR_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No DSR record found.',
};

export const DSR_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
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
