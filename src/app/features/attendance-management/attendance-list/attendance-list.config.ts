import {
  IBulkActionConfig,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IRowActionConfig,
} from '../../../shared/models/data-table-config.model';
import { MATCH_MODE_OPTIONS } from '../../../shared/config/data-table.config';
import {
  EBulkActionType,
  EFieldType,
  ERowActionType,
  ESeverity,
  ETableBodyTemplate,
  ETableDataType,
  ETableFilterMatchMode,
  ETableSearchInputType,
} from '../../../shared/types';
import { IConfirmationDialogConfig } from '../../../shared/models/confirmation-dialog.model';
import { Validators } from '@angular/forms';

export const ATTENDANCE_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] =
  [
    {
      id: EBulkActionType.APPROVE,
      label: 'Approve',
      icon: 'pi pi-check',
      severity: ESeverity.SUCCESS,
    },
    {
      id: EBulkActionType.REJECT,
      label: 'Reject',
      icon: 'pi pi-times',
      severity: ESeverity.DANGER,
    },
  ];

export const ATTENDANCE_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
  {
    id: ERowActionType.VIEW,
    icon: 'pi pi-eye',
    tooltip: 'View Details',
    severity: ESeverity.INFO,
  },
  {
    id: ERowActionType.REGULARIZE,
    icon: 'pi pi-clock',
    tooltip: 'Regularize Attendance',
    severity: ESeverity.WARNING,
  },
  {
    id: ERowActionType.APPROVE,
    icon: 'pi pi-check',
    tooltip: 'Approve Attendance',
    severity: ESeverity.SUCCESS,
  },
  {
    id: ERowActionType.REJECT,
    icon: 'pi pi-times',
    tooltip: 'Reject Attendance',
    severity: ESeverity.DANGER,
  },
];

export const ATTENDANCE_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'name',
    'attendanceDate',
    'siteLocation',
    'attendanceStatus',
    'approvalStatus',
  ],
};

export const ATTENDANCE_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'name',
    header: 'Employee Name',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'employeeId',
      showImage: true,
      dummyImageField: 'name',
      primaryFieldHighlight: true,
    },
    filterConfig: {
      filterField: 'name',
      placeholder: 'Search Employee Name',
    },
  },
  {
    field: 'attendanceDate',
    header: 'Attendance Date',
    bodyTemplate: ETableBodyTemplate.DATE,
    dataType: ETableDataType.DATE,
    showFilter: true,
    showSort: true,
    filterConfig: {
      filterField: 'attendanceDate',
      placeholder: 'Search By Attendance Date',
      matchModeOptions: MATCH_MODE_OPTIONS.date,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'siteLocation',
    header: 'Site Location / Client Name',
    bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
    textWithSubtitleAndImageConfig: {
      secondaryField: 'clientName',
      primaryFieldLabel: 'Site Location',
      secondaryFieldLabel: 'Client Name',
    },
    filterConfig: {
      filterField: 'siteLocation',
      placeholder: 'Search By Site Location / Client Name',
    },
  },
  {
    field: 'attendanceStatus',
    header: 'Attendance Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'attendanceStatus',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: [
        'Absent',
        'Present',
        'On Leave',
        'Holiday',
        'Checked In',
        'Checked Out',
        'Not Checked In',
        'Not Checked Out',
      ],
      placeholder: 'Search By Attendance Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
  {
    field: 'approvalStatus',
    header: 'Approval Status',
    bodyTemplate: ETableBodyTemplate.STATUS,
    filterConfig: {
      filterField: 'approvalStatus',
      searchInputType: ETableSearchInputType.DROPDOWN,
      filterDropdownOptions: ['Pending', 'Approved', 'Rejected'],
      placeholder: 'Search By Approval Status',
      matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
      defaultMatchMode: ETableFilterMatchMode.EQUALS,
    },
  },
];

export const REGULARIZE_ATTENDANCE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> =
  {
    header: 'Regularize Attendance',
    message: 'Are you sure you want to regularize this attendance?',
    icon: 'pi pi-clock',
    iconContainerClass: 'bg-primary text-primary-contrast',
    inputFieldConfigs: [
      {
        fieldType: EFieldType.Select,
        fieldName: 'attendanceStatus',
        label: 'Attendance Status',
        selectConfig: {
          optionsDropdown: [
            { key: 'present', value: 'Present' },
            { key: 'absent', value: 'Absent' },
            { key: 'onLeave', value: 'On Leave' },
            { key: 'holiday', value: 'Holiday' },
            { key: 'checkedIn', value: 'Checked In' },
          ],
        },
      },
      {
        fieldType: EFieldType.TextArea,
        fieldName: 'comment',
        label: 'Comment (Required)',
        validators: [Validators.required, Validators.minLength(10)],
      },
    ],
  };
