import { MATCH_MODE_OPTIONS } from "../../../../shared/config/data-table.config";
import { IBulkActionConfig, IRowActionConfig, IDataTableConfig, IDataTableHeaderConfig } from "../../../../shared/models";
import { EBulkActionType, ESeverity, ERowActionType, ETableBodyTemplate, ETableDataType, ETableFilterMatchMode, ETableSearchInputType } from "../../../../shared/types";

export const FUEL_EXPENSE_LIST_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] = [
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

export const FUEL_EXPENSE_LIST_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] = [
    {
        id: ERowActionType.VIEW,
        icon: 'pi pi-eye',
        tooltip: 'View Details',
        severity: ESeverity.INFO,
    },
    {
        id: ERowActionType.DELETE,
        icon: 'pi pi-trash',
        tooltip: 'Delete Fuel Expense',
        severity: ESeverity.DANGER,
    },
    {
        id: ERowActionType.EDIT,
        icon: 'pi pi-pencil',
        tooltip: 'Edit Fuel Expense',
        severity: ESeverity.WARNING,
    },
    {
        id: ERowActionType.APPROVE,
        icon: 'pi pi-check',
        tooltip: 'Approve Fuel Expense',
        severity: ESeverity.SUCCESS,
    },
    {
        id: ERowActionType.REJECT,
        icon: 'pi pi-times',
        tooltip: 'Reject Fuel Expense',
        severity: ESeverity.DANGER,
    },
];

export const FUEL_EXPENSE_LIST_TABLE_CONFIG: Partial<IDataTableConfig> = {
    globalFilterFields: [
        'fuelFilledDate',
        'fuelType',
        'vehicleNumber',
        'paymentMode',
        'approvalStatus',
    ],
};

export const FUEL_EXPENSE_LIST_TABLE_HEADER: Partial<IDataTableHeaderConfig>[] = [
    {
        field: 'fuelFilledDate',
        header: 'Date',
        bodyTemplate: ETableBodyTemplate.DATE,
        dataType: ETableDataType.DATE,
        showFilter: true,
        showSort: true,
        filterConfig: {
            filterField: 'fuelFilledDate',
            placeholder: 'Search By Date',
            matchModeOptions: MATCH_MODE_OPTIONS.date,
            defaultMatchMode: ETableFilterMatchMode.EQUALS,
        },
    },
    {
        field: 'fuelType',
        header: 'Fuel Type',
        filterConfig: {
            filterField: 'fuelType',
            placeholder: 'Search By Fuel Type',
            searchInputType: ETableSearchInputType.DROPDOWN,
            filterDropdownOptions: ['Petrol', 'Diesel', 'CNG', 'Electric'],
        },
        showFilter: false,
        showSort: false,
    },
    {
        field: 'amount',
        header: 'Amount',
        bodyTemplate: ETableBodyTemplate.CURRENCY,
        dataType: ETableDataType.NUMBER,
        showFilter: false,
        showSort: false,
        filterConfig: {
            filterField: 'amount',
            placeholder: 'Search By Amount',
        },
    },
    {
        field: 'paymentMode',
        header: 'Payment Mode',
        filterConfig: {
            filterField: 'paymentMode',
            placeholder: 'Search By Payment Mode',
            searchInputType: ETableSearchInputType.DROPDOWN,
            filterDropdownOptions: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'],
        },
    },
    {
        field: 'vehicleNumber',
        header: 'Vehicle & Quantity',
        bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
        textWithSubtitleAndImageConfig: {
            secondaryField: 'fuelFilledQty',
            primaryFieldLabel: 'Vehicle No.',
            secondaryFieldLabel: 'Qty (L)',
            dataType: ETableDataType.NUMBER,
        },
        showFilter: true,
        showSort: true,
        filterConfig: {
            filterField: 'vehicleNumber',
            placeholder: 'Search By Vehicle Number',
        },
    },
    {
        field: 'fuelFilledAtKms',
        header: 'Odometer & Efficiency',
        bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
        dataType: ETableDataType.NUMBER,
        textWithSubtitleAndImageConfig: {
            secondaryField: 'vehicleAvg',
            primaryFieldLabel: 'Odometer (KM)',
            secondaryFieldLabel: 'Efficiency (KM/L)',
            dataType: ETableDataType.NUMBER,
        },
        showFilter: false,
        showSort: false,
        filterConfig: {
            filterField: 'fuelFilledAtKms',
            placeholder: 'Search By KMs',
        },
    },
    {
        field: 'fuelFilledReceipt',
        header: 'View Proof',
        bodyTemplate: ETableBodyTemplate.FILE_LINK,
        showFilter: false,
        showSort: false,
    },
    {
        field: 'approvalStatus',
        header: 'Status',
        bodyTemplate: ETableBodyTemplate.STATUS,
        filterConfig: {
            filterField: 'approvalStatus',
            searchInputType: ETableSearchInputType.DROPDOWN,
            filterDropdownOptions: ['Pending', 'Approved', 'Rejected'],
            placeholder: 'Search By Status',
            matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
            defaultMatchMode: ETableFilterMatchMode.EQUALS,
        },
    },
]; 