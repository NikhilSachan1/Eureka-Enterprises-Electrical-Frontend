import { COMMON_ROW_ACTIONS, MATCH_MODE_OPTIONS } from '@shared/config';
import {
  ETableActionType,
  ETableBodyTemplate,
  ETableFilterMatchMode,
  ETableSearchInputType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import {
  ITableActionConfig,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
} from '@shared/models';
import { IUserGetBaseResponseDto } from '../../types/user.dto';
import {
  EMPLOYEE_STATUS_DATA,
  ROLE_NAME_DATA,
} from '@shared/config/static-data.config';
import { getDataFromArrayOfObjects } from '@shared/utility';

export const USER_TABLE_CONFIG: Partial<IDataTableConfig> = {
  showCheckbox: false,
  globalFilterFields: ['fullName', 'email', 'role', 'status'],
  emptyMessage: 'No users found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any users yet. Please add a user first.",
};

export const USER_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'fullName',
    header: 'User Details',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'email',
      primaryFieldHighlight: true,
      showImage: true,
      dummyImageField: 'fullName',
    },
    filterConfig: {
      filterField: 'fullName',
      placeholder: 'Search User Name',
    },
    showSort: true,
  },
  {
    field: 'role',
    header: 'Role',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'role',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: getDataFromArrayOfObjects(ROLE_NAME_DATA, 'label'),
      placeholder: 'Search By Role',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
    showSort: true,
  },
  {
    field: 'permissionCount',
    header: 'Permission Count',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'permissionCount',
      placeholder: 'Search Permission Count',
    },
    showSort: true,
  },
  {
    field: 'status',
    header: 'Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'status',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: getDataFromArrayOfObjects(
        EMPLOYEE_STATUS_DATA,
        'label'
      ),
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
    showSort: true,
  },
];

export const USER_TABLE_ROW_ACTIONS_CONFIG: Partial<ITableActionConfig>[] = [
  {
    id: ETableActionType.SET_PERMISSIONS,
    icon: ICONS.SETTINGS.COG,
    tooltip: 'Set User Permissions',
  },
  {
    ...COMMON_ROW_ACTIONS.DELETE,
    tooltip: 'Delete User Permissions',
  },
];

export const USER_TABLE_BULK_ACTIONS_CONFIG: Partial<ITableActionConfig>[] = [];

export const USER_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IUserGetBaseResponseDto> =
  {
    tableConfig: USER_TABLE_CONFIG,
    headers: USER_TABLE_HEADER_CONFIG,
    rowActions: USER_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: USER_TABLE_BULK_ACTIONS_CONFIG,
  };
