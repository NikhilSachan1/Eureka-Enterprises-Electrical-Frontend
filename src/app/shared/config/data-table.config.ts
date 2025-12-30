import { APP_CONFIG } from '@core/config';
import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IFilterConfig,
  IStatusConfig,
  ITextWithSubtitleAndImageConfig,
  IMatchModeOption,
  ITableActionConfig,
  EButtonSeverity,
  EButtonVariant,
  ETableFilterDisplayType,
  ETableFilterMatchMode,
  ETableFilterOperator,
  IReadMoreConfig,
  EDataType,
} from '@shared/types';
import { DEFAULT_READ_MORE_CONFIG } from './read-more.config';
import { ICONS } from '@shared/constants';

// Default table config
export const DEFAULT_TABLE_CONFIG: Partial<IDataTableConfig> = {
  rowHover: true,
  tableUniqueId: 'id',
  displayRows: APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  rowsPerPageOptions:
    APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE_OPTIONS,
  showPaginator: true,
  showCheckbox: true,
  emptyMessage: 'No data found',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any data yet. Please add records first.",
  paginationTemplate: 'Showing {first} to {last} of {totalRecords} entries',
  enableServerSide: true,
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
  searchInputType: EDataType.TEXT,
  displayType: ETableFilterDisplayType.MENU,
  showMatchModes: true,
  defaultMatchMode: ETableFilterMatchMode.CONTAINS,
  matchModeOptions: MATCH_MODE_OPTIONS.text,
  filterDropdownOptions: [],
  showOperator: true,
  defaultOperator: ETableFilterOperator.AND,
  showClearButton: true,
  showApplyButton: true,
  showAddButton: true,
  hideOnClear: false,
  placeholder: 'Search',
  maxAddRuleConstraints: 2,
  numberFormatting: false,
};

export const STATUS_CONFIG: IStatusConfig = {
  rounded: false,
};

export const TEXT_WITH_SUBTITLE_AND_IMAGE_CONFIG: Partial<ITextWithSubtitleAndImageConfig> =
  {
    dataType: EDataType.TEXT,
  };

export const TEXT_WITH_READ_MORE_CONFIG: Partial<IReadMoreConfig> = {
  ...DEFAULT_READ_MORE_CONFIG,
};

export const DEFAULT_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig> = {
  bodyTemplate: EDataType.TEXT,
  dataType: EDataType.TEXT,
  dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
  currencyFormat: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
  textWithSubtitleAndImageConfig: TEXT_WITH_SUBTITLE_AND_IMAGE_CONFIG,
  readMoreConfig: TEXT_WITH_READ_MORE_CONFIG,
  statusConfig: STATUS_CONFIG,
  showFilter: false,
  showSort: true,
  showColumn: true, // Default to showing column
  clientSideFilterConfig: DEFAULT_TABLE_FILTER_CONFIG,
};

// default bulk action config

export const DEFAULT_BULK_ACTION_CONFIG: Partial<ITableActionConfig> = {
  severity: EButtonSeverity.DANGER,
};

// default row action config
export const DEFAULT_ROW_ACTION_CONFIG: Partial<ITableActionConfig> = {
  severity: EButtonSeverity.DANGER,
  variant: EButtonVariant.OUTLINED,
  rounded: true,
};
