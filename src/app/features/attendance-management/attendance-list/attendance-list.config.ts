import {
    IBulkActionConfig,
    IDataTableConfig,
    IDataTableHeaderConfig,
    IRowActionConfig,
} from '../../../shared/models/data-table-config.model';
import { MATCH_MODE_OPTIONS } from '../../../shared/config/data-table.config';
import {
    EBulkActionType,
    ERowActionType,
    ESeverity,
    ETableBodyTemplate,
    ETableDataType,
    ETableFilterMatchMode,
    ETableSearchInputType,
} from '../../../shared/types';
import { IConfirmationDialogConfig } from '../../../shared/models/confirmation-dialog.model';

export const ATTENDANCE_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
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
        id: ERowActionType.EDIT,
        icon: 'pi pi-pencil',
        tooltip: 'Edit Attendance',
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
    globalFilterFields: ['name', 'attendanceDate', 'siteLocation', 'attendanceStatus', 'approvalStatus'],
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
            filterDropdownOptions: ['Absent', 'Present', 'On Leave', 'Holiday', 'Checked In', 'Checked Out', 'Not Checked In', 'Not Checked Out'],
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
    }
];

export const APPROVE_ATTENDANCE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> =
{
    inputProps: [
        {
            label: 'Comment',
            type: 'text',
            placeholder: 'Enter comment',
        },
    ],
};

export const REJECT_ATTENDANCE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> =
{
    inputProps: [
        {
            label: 'Comment',
            type: 'text',
            placeholder: 'Enter comment',
        },
    ],
};
