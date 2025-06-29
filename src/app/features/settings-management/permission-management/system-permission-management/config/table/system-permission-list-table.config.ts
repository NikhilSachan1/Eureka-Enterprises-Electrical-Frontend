import { MATCH_MODE_OPTIONS, MODULES_NAME_DATA } from "../../../../../../shared/config";
import { IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig, IEnhancedTableConfig } from "../../../../../../shared/models";
import { ERowActionType, ETableBodyTemplate, ETableFilterMatchMode, ETableSearchInputType, EButtonSeverity } from "../../../../../../shared/types";
import { ICONS } from "../../../../../../shared/constants";
import { getDataFromArrayOfObjects } from "../../../../../../shared/utility";

export const SYSTEM_PERMISSION_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  showCheckbox: false,
  globalFilterFields: [
    'label',
    'module',
    'description',
  ],
  emptyMessage: 'No system permissions found.',
};

export const SYSTEM_PERMISSION_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'label',
    header: 'Permission Details',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'description',
      primaryFieldHighlight: true,
      showImage: false,
    },
    filterConfig: {
      filterField: 'label',
      placeholder: 'Search Permission Name',
    },
  },
  {
    field: 'module',
    header: 'Module',
    bodyTemplate: ETableBodyTemplate.TEXT,
    filterConfig: {
      filterField: 'module',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: getDataFromArrayOfObjects(MODULES_NAME_DATA, 'label'),
      placeholder: 'Search By Module',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
    showSort: true,
  },
  {
    field: 'name',
    header: 'Permission Code',
    showSort: false,
    showFilter: false,
  },
];

export const SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
    tooltip: 'Edit Permission',
    severity: EButtonSeverity.WARNING,
  },
];

export const SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG : IEnhancedTableConfig = {
  tableConfig: SYSTEM_PERMISSION_LIST_TABLE_CONFIG,
  headers: SYSTEM_PERMISSION_LIST_TABLE_HEADER,
  rowActions: SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG,
}; 