import { MATCH_MODE_OPTIONS } from "../../../../../../shared/config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../../../shared/types";

export const USERS_PERMISSION_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
  {
    id: EBulkActionType.APPROVE,
    label: 'Activate',
    icon: 'pi pi-check',
    severity: ESeverity.SUCCESS,
  },
  {
    id: EBulkActionType.REJECT,
    label: 'Deactivate',
    icon: 'pi pi-times',
    severity: ESeverity.WARNING,
  },
];

export const USERS_PERMISSION_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-user-edit',
    tooltip: 'Change Role',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.EDIT,
    icon: 'pi pi-cog',
    tooltip: 'Edit Permissions',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.DELETE,
    icon: 'pi pi-trash',
    tooltip: 'Delete Permissions',
    severity: ESeverity.DANGER,
  },
];

export const USERS_PERMISSION_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'name',
    'email',
    'role',
    'status',
  ],
};

export const USERS_PERMISSION_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'User Details',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'email',
      primaryFieldHighlight: true,
      showImage: true,
      dummyImageField: 'name',
    },
    filterConfig: {
      filterField: 'name',
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
      filterDropdownOptions: [
        'Super Admin',
        'Project Manager',
        'Site Supervisor',
        'Field Worker',
        'HR Manager',
        'Finance Officer'
      ],
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