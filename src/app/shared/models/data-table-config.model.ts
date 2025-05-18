export interface IDataTableConfig {
    rowHover: boolean;
    tableUniqueId: string;
    displayRows: number;
    rowsPerPageOptions: number[];
    showPaginator: boolean;
    globalFilterFields: string[];
    showCheckbox: boolean;
}

export interface IDataTableHeaderConfig {
    field: string;
    header: string;
    bodyTemplate?: 'text' | 'textWithSubtitleAndImage' | 'status';
    dataType?: 'text' | 'number' | 'date' | 'boolean';
    dateFormat?: string;
    textWithSubtitleAndImageConfig?: ITextWithSubtitleAndImageConfig;
    statusConfig?: IStatusConfig;
    showFilter: boolean;
    filterConfig?: Partial<IFilterConfig>;
    showSort: boolean;
}

export interface ITextWithSubtitleAndImageConfig {
    secondaryField?: string;
    showImage?: boolean;
    dummyImageField?: string;
    primaryFieldHighlight?: boolean;
    primaryFieldLabel?: string;
    secondaryFieldLabel?: string;
    dataType?: 'text' | 'number' | 'date' | 'boolean';
}

export interface IStatusConfig {
    rounded: boolean;
}

export interface IFilterConfig {
    filterField: string;
    searchInputType: 'text' | 'dropdown';
    filterDropdownOptions?: string[];
    displayType: 'menu' | 'chip';
    showMatchModes: boolean;
    defaultMatchMode: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'any';
    matchModeOptions?: IMatchModeOption[];
    showOperator: boolean;
    defaultOperator: 'and' | 'or';
    showClearButton: boolean;
    showApplyButton: boolean;
    showAddButton: boolean;
    hideOnClear: boolean;
    placeholder?: string;
    maxAddRuleConstraints?: number;
    numberFormatting?: boolean;
}

export interface IMatchModeOption {
    label: string;
    value: string;
}

export interface IRowActionConfig {
    id: string;
    icon?: string;
    tooltip?: string;
    styleClass?: string;
    outlined?: boolean;
    severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
}

export interface IBulkActionConfig {
    id: string;
    label: string;
    icon?: string;
    styleClass?: string;
    outlined?: boolean;
    severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
}
