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

const PROJECT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No project record found.',
};

const PROJECT_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'projectName',
    header: 'Project Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    showImage: true,
    dummyImageField: 'projectName',
    primaryFieldHighlight: true,
    subtitle: { field: 'projectLocation' },
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
    bodyTemplate: EDataType.DATE_RANGE,
    dataType: EDataType.DATE_RANGE,
    dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
    showSort: false,
  },
  {
    field: 'estimatedBudget',
    header: 'Budget',
    bodyTemplate: EDataType.CURRENCY,
    dataType: EDataType.NUMBER,
    showSort: false,
  },
];

const PROJECT_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IProjectGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Project Details',
  },
  {
    id: EButtonActionType.ANALYZE,
    tooltip: 'Analyze Project',
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Project',
  },
  {
    id: EButtonActionType.CHANGE_STATUS,
    tooltip: 'Change Project Status',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Project',
  },
];

const PROJECT_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IProjectGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Project',
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
