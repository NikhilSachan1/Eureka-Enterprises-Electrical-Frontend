import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EDataType,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/types';
import { IConfigurationGetResponseDto } from '../../types/configuration.dto';
import { APP_PERMISSION } from '@core/constants';

const CONFIGURATION_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No configuration record found.',
  emptyMessageDescription:
    "You don't have any configuration record yet. Please add a configuration record first.",
};

const CONFIGURATION_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'module',
    header: 'Module Name',
    bodyTemplate: EDataType.TEXT,
    icon: ICONS.SETTINGS.COG,
    showSort: false,
  },
  {
    field: 'label',
    header: 'Configuration',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'key' },
    showSort: false,
  },
  {
    field: 'valueType',
    header: 'Value Type',
    bodyTemplate: EDataType.TEXT,
    showSort: false,
  },
  {
    field: 'description',
    header: 'Description',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
  },
];

const CONFIGURATION_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IConfigurationGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Configuration',
    permission: [APP_PERMISSION.CONFIGURATION.TABLE_VIEW],
  },
  {
    ...COMMON_ROW_ACTIONS.EDIT,
    tooltip: 'Edit Configuration',
    permission: [APP_PERMISSION.CONFIGURATION.EDIT],
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete Configuration',
    permission: [APP_PERMISSION.CONFIGURATION.DELETE],
  },
];

const CONFIGURATION_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IConfigurationGetResponseDto['records'][number]>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.DELETE,
    tooltip: 'Delete Selected Configuration',
    permission: [APP_PERMISSION.CONFIGURATION.DELETE],
  },
];

export const CONFIGURATION_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<
  IConfigurationGetResponseDto['records'][number]
> = {
  tableConfig: CONFIGURATION_TABLE_CONFIG,
  headers: CONFIGURATION_TABLE_HEADER_CONFIG,
  rowActions: CONFIGURATION_TABLE_ROW_ACTIONS_CONFIG,
  bulkActions: CONFIGURATION_TABLE_BULK_ACTIONS_CONFIG,
};
