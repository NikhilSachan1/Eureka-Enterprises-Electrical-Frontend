import { MATCH_MODE_OPTIONS } from "../../../../../../shared/config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../../../shared/models";
import { EBulkActionType, ERowActionType, ETableBodyTemplate, ETableFilterMatchMode, ETableSearchInputType, EButtonSeverity } from "../../../../../../shared/types";
import { ICONS } from "../../../../../../shared/constants";

export const ROLE_PERMISSION_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.APPROVE,
    label: 'Activate',
    icon: ICONS.ACTIONS.CHECK,
    severity: EButtonSeverity.SUCCESS,
  },
  {
    id: EBulkActionType.REJECT,
    label: 'Deactivate',
    icon: ICONS.ACTIONS.TIMES,
    severity: EButtonSeverity.WARNING,
  },
];

export const ROLE_PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.APPROVE,
    icon: ICONS.ACTIONS.CHECK,
    tooltip: 'Activate',
    severity: EButtonSeverity.SUCCESS,
  },
  {
    id: ERowActionType.REJECT,
    icon: ICONS.ACTIONS.TIMES,
    tooltip: 'Deactivate',
    severity: EButtonSeverity.DANGER,
  },
  {
    id: ERowActionType.EDIT,
    icon: ICONS.ACTIONS.EDIT,
    tooltip: 'Edit',
    severity: EButtonSeverity.WARNING,
  },
  {
    id: ERowActionType.VIEW,
    icon: ICONS.SETTINGS.COG,
    tooltip: 'Edit Permissions',
    severity: EButtonSeverity.INFO,
  },
];

export const ROLE_PERMISSION_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'name',
    'description',
    'status',
  ],
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
    showSort: true,
  },
  {
    field: 'status',
    header: 'Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'status',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: [
        'Active',
        'Inactive'
      ],
      placeholder: 'Search By Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
    showSort: true,
  },
]; 