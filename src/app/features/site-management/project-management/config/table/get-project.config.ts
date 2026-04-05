import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import {
  EButtonActionType,
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IProjectGetResponseDto } from '../../types/project.dto';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { ICONS } from '@shared/constants/icon.constants';

const PROJECT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No project record found.',
};

const PROJECT_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'projectName',
    header: 'Project Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    icon: ICONS.SITE.BUILDING,
    dummyImageField: 'projectName',
    primaryFieldHighlight: true,
    subtitle: { field: 'projectLocation' },
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
    field: 'timeLine',
    header: 'Time Line',
    bodyTemplate: EDataType.RANGE,
    dataType: EDataType.DATE,
    dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
    showSort: false,
  },
  {
    field: 'workTypes',
    header: 'Work types',
    customTemplateKey: 'projectWorkTypes',
    showSort: false,
  },
  // {
  //   field: 'estimatedBudget',
  //   header: 'Budget',
  //   customTemplateKey: 'projectBudget',
  //   showSort: false,
  // },
];

const PROJECT_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IProjectGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Project Details',
    permission: [APP_PERMISSION.PROJECT.VIEW_DETAIL],
  },
  {
    id: EButtonActionType.ANALYZE,
    tooltip: 'Analyze Project',
    permission: [APP_PERMISSION.PROJECT.ANALYSIS],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Project',
    permission: [APP_PERMISSION.PROJECT.EDIT],
  },
  {
    id: EButtonActionType.ALLOCATE_DEALLOCATE_EMPLOYEE,
    tooltip: 'Allocate/Deallocate Employee',
    // permission: [APP_PERMISSION.PROJECT.ALLOCATE_DEALLOCATE_EMPLOYEE],
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
  },
];

const PROJECT_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IProjectGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Project',
    permission: [APP_PERMISSION.PROJECT.DELETE],
  },
];

export const PROJECT_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IProjectGetResponseDto['records'][number]
> = {
  tableConfig: PROJECT_TABLE_CONFIG,
  headers: PROJECT_TABLE_HEADER_CONFIG,
  rowActions: PROJECT_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: PROJECT_TABLE_BULK_ACTIONS_CONFIG,
};
