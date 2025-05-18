import { IDataTableConfig, IDataTableHeaderConfig, IFilterConfig, IStatusConfig, ITextWithSubtitleAndImageConfig, IMatchModeOption, IBulkActionConfig, IRowActionConfig } from "../models/data-table-config.model";

// Default table config
export const DEFAULT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  rowHover: true,
  tableUniqueId: 'id',
  displayRows: 5,
  rowsPerPageOptions: [5, 10, 25, 50],
  showPaginator: true,
  showCheckbox: true,
};

// default table header config
export const MATCH_MODE_OPTIONS = {
  text: [
    { label: 'Equals', value: 'equals' },
    { label: 'Contains', value: 'contains' },
    { label: 'Starts With', value: 'startsWith' },
    { label: 'Ends With', value: 'endsWith' },
  ] as IMatchModeOption[],
  number: [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Less Than or Equal', value: 'lessThanOrEqual' },
    { label: 'Greater Than or Equal', value: 'greaterThanOrEqual' },
  ] as IMatchModeOption[],
  date: [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'Before', value: 'before' },
    { label: 'After', value: 'after' },
    { label: 'Between', value: 'between' },
  ] as IMatchModeOption[],
  dropdown: [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'In', value: 'in' },
  ] as IMatchModeOption[],
};

export const DEFAULT_TABLE_FILTER_CONFIG: Partial<IFilterConfig> = {
  searchInputType: 'text',
  displayType: 'menu',
  showMatchModes: true,
  defaultMatchMode: 'contains',
  matchModeOptions: MATCH_MODE_OPTIONS.text,
  filterDropdownOptions: [],
  showOperator: true,
  defaultOperator: 'and',
  showClearButton: true,
  showApplyButton: true,
  showAddButton: true,
  hideOnClear: false,
  placeholder: 'Search',
  maxAddRuleConstraints: 2,
  numberFormatting: false,
}

export const STATUS_CONFIG: IStatusConfig = {
  rounded: false,
}

export const TEXT_WITH_SUBTITLE_AND_IMAGE_CONFIG: Partial<ITextWithSubtitleAndImageConfig> = {
  dataType: 'text',
}

export const DEFAULT_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig> = {
  bodyTemplate: 'text',
  dataType: 'text',
  dateFormat: 'dd-MM-yyyy',
  textWithSubtitleAndImageConfig: TEXT_WITH_SUBTITLE_AND_IMAGE_CONFIG,
  statusConfig: STATUS_CONFIG,
  showFilter: true,
  showSort: true,
  filterConfig: DEFAULT_TABLE_FILTER_CONFIG,
}

// default bulk action config

export const DEFAULT_BULK_ACTION_CONFIG: Partial<IBulkActionConfig> = {
  styleClass: 'p-button-sm',
  outlined: true,
  severity: 'primary',
}

// default row action config
export const DEFAULT_ROW_ACTION_CONFIG: Partial<IRowActionConfig> = {
  styleClass: 'p-button-text p-button-sm',
  outlined: false,
  severity: 'primary',
}

