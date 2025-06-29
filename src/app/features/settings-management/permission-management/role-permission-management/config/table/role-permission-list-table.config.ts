import { IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig, IEnhancedTableConfig } from "../../../../../../shared/models";
import { ERowActionType, ETableBodyTemplate, EButtonSeverity } from "../../../../../../shared/types";
import { ICONS } from "../../../../../../shared/constants";

export const ROLE_PERMISSION_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  showCheckbox: false,
  globalFilterFields: [
    'name',
    'description',
  ],
  emptyMessage: 'No roles found.',
};

export const ROLE_PERMISSION_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Role Details',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'description',
      primaryFieldHighlight: true,
      showImage: false,
    },
    filterConfig: {
      filterField: 'name',
      placeholder: 'Search Role Name',
    },
  },
  {
    field: 'permissionCount',
    header: 'Permission Count',
    showSort: false,
    showFilter: false,
  },
];


export const ROLE_PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
    tooltip: 'Edit Role',
    severity: EButtonSeverity.WARNING,
  },
  {
    id: ERowActionType.EDIT_PERMISSIONS,
    icon: ICONS.SETTINGS.COG,
    tooltip: 'Edit Permissions',
    severity: EButtonSeverity.INFO,
  },
];

export const ROLE_PERMISSION_LIST_ENHANCED_TABLE_CONFIG: IEnhancedTableConfig = {
  tableConfig: ROLE_PERMISSION_LIST_TABLE_CONFIG,
  headers: ROLE_PERMISSION_LIST_TABLE_HEADER,
  rowActions: ROLE_PERMISSION_LIST_ROW_ACTIONS_CONFIG,
}; 