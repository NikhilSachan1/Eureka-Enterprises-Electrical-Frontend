import { MATCH_MODE_OPTIONS } from "../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";

export const REGULAR_EXPENSE_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] =
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
        {
            id: EBulkActionType.DELETE,
            label: 'Delete',
            icon: 'pi pi-trash',
            severity: ESeverity.DANGER,
        },
    ];

export const REGULAR_EXPENSE_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
    {
        id: ERowActionType.VIEW,
        icon: 'pi pi-eye',
        tooltip: 'View Details',
        severity: ESeverity.INFO,
    },
    {
        id: ERowActionType.DELETE,
        icon: 'pi pi-trash',
        tooltip: 'Delete Expense',
        severity: ESeverity.DANGER,
    },
    {
        id: ERowActionType.EDIT,
        icon: 'pi pi-pencil',
        tooltip: 'Edit Expense',
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

export const REGULAR_EXPENSE_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
    globalFilterFields: [
        'name',
        'attendanceDate',
        'siteLocation',
        'attendanceStatus',
        'approvalStatus',
    ],
};

export const REGULAR_EXPENSE_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
    {
        field: 'expenseDate',
        header: 'Expense Date',
        bodyTemplate: ETableBodyTemplate.DATE,
        dataType: ETableDataType.DATE,
        showFilter: true,
        showSort: true,
        filterConfig: {
            filterField: 'expenseDate',
            placeholder: 'Search By Expense Date',
            matchModeOptions: MATCH_MODE_OPTIONS.date,
            defaultMatchMode: ETableFilterMatchMode.EQUALS,
        },
    },
    {
        field: 'expenseType',
        header: 'Expense Type',
        filterConfig: {
            filterField: 'expenseType',
            placeholder: 'Search By Expense Type',
            searchInputType: ETableSearchInputType.DROPDOWN,
            filterDropdownOptions: ['Fuel', 'Maintenance', 'Repair', 'Other'],
        },
    },
    {
        field: 'expenseAmount',
        header: 'Expense Amount',
        bodyTemplate: ETableBodyTemplate.CURRENCY,
        dataType: ETableDataType.NUMBER,
        showFilter: false,
        showSort: false,
        filterConfig: {
            filterField: 'expenseAmount',
            placeholder: 'Search By Expense Amount',
        },
    },
    {
        field: 'paymentMode',
        header: 'Payment Mode',
        filterConfig: {
            filterField: 'paymentMode',
            placeholder: 'Search By Payment Mode',
            searchInputType: ETableSearchInputType.DROPDOWN,
            filterDropdownOptions: ['Cash', 'Bank', 'Cheque', 'Other'],
        },
    },
    {
        field: 'expenseProof',
        header: 'Expense Proof',
        bodyTemplate: ETableBodyTemplate.FILE_LINK,
        showFilter: false,
        showSort: false,
    },
    {
        field: 'comment',
        header: 'Comment',
        showFilter: false,
        showSort: false,
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