import {
  EPrimeNGSeverity,
  EButtonActionType,
  ETableFilterDisplayType,
  ETableFilterMatchMode,
  ETableFilterOperator,
  IInputFieldsConfig,
  IReadMoreConfig,
  EDataType,
} from '@shared/types';
import { IButtonConfig } from '@shared/types/button/button.interface';
import { IFormButtonConfig } from '../form/form.interface';

export interface IDataTableConfig {
  rowHover: boolean;
  tableUniqueId: string;
  displayRows: number;
  rowsPerPageOptions: number[];
  showPaginator: boolean;
  globalFilterFields: string[];
  /** When true, always show selection checkbox. When false, always hide. Otherwise auto from bulk actions. */
  showCheckbox?: boolean;
  emptyMessage: string;
  emptyMessageIcon: string;
  emptyMessageDescription: string;
  paginationTemplate: string;
  totalRecords?: number;
  enableServerSide: boolean;
  showViewModeToggle?: boolean; // Show/hide list & card layout toggle (default: true)
  rowActionsLimit?: number;
  /** Enables PrimeNG scrollable table (required for frozen columns). */
  scrollable?: boolean;
  /** Scroll viewport height, e.g. '400px' or 'calc(100vh - 12rem)'. */
  scrollHeight?: string;
  /** Optional class applied to the underlying p-table. */
  tableStyleClass?: string;
  /** Freeze config for the bulk-selection checkbox column. */
  selectionColumn?: IDataTableFrozenColumnConfig;
  /** Freeze config for the row actions column. */
  actionsColumn?: IDataTableFrozenColumnConfig;
  /** When true, row checkbox selection is disabled for that row. */
  disableRowSelectionWhen?: (rowData: Record<string, unknown>) => boolean;
}

export interface IDataTableFrozenColumnConfig {
  frozen?: boolean;
  alignFrozen?: 'left' | 'right';
  columnWidth?: string;
}

export interface IDataTableServerSideFilterAndSortConfig {
  sortField?: string;
  filterField?: string;
}

export type IDataTableHeaderFilterConfig = Partial<IFilterConfig>;

export interface IDataTableHeaderConfig
  extends Partial<IDataTableFrozenColumnConfig> {
  field: string;
  header: string;
  bodyTemplate?: EDataType;
  dataType?: EDataType;
  dateFormat?: string;
  /** DatePipe locale override (defaults to APP_CONFIG.DATE_FORMATS.DISPLAY_LOCALE). */
  dateLocale?: string;
  currencyFormat?: string;
  numberFormat?: string;
  /** Text to show before the value (e.g., '$', 'Rs.', 'Start:'). */
  prefix?: string;
  /** Text to show after the value (e.g., 'KM', '%', 'units'). */
  suffix?: string;
  /** Show image (avatar) or icon placeholder for text-with-subtitle columns. */
  showImage?: boolean;
  /** Field used to resolve image/avatar (e.g. name for initials). Used when showImage is true and icon is not set. */
  dummyImageField?: string;
  /** Icon class (e.g. 'pi pi-car'). When set with showImage, renders icon with colored background instead of avatar. */
  icon?: string;
  /** Row field for per-row icon class (e.g. 'itemIcon'). Used with showImage instead of a static icon. */
  iconField?: string;
  /** Row field used to seed the icon background color. Defaults to field or dummyImageField. */
  backgroundSeedField?: string;
  /** Whether to highlight the primary field (bold). */
  primaryFieldHighlight?: boolean;
  /** Subtitle config (field, bodyTemplate, label). */
  subtitle?: Partial<IDataTableHeaderConfig>;
  primaryFieldLabel?: string;
  readMoreConfig?: Partial<IReadMoreConfig>;
  statusConfig?: IStatusConfig;
  customTemplateKey?: string;
  /** Optional class applied to header and body cells for this column. */
  columnStyleClass?: string;
  showFilter: boolean;
  clientSideFilterConfig?: IDataTableHeaderFilterConfig;
  showSort: boolean;
  showColumn?: boolean; // If false, column will be hidden but can still be used for filtering
  serverSideFilterAndSortConfig?: IDataTableServerSideFilterAndSortConfig;
  permission?: string[];
  enableAttachmentGallery?: boolean; // Flag to control attachment gallery opening for this column (default: true)
}

export interface IStatusConfig {
  rounded?: boolean;
  customSeverityMap?: Record<string, EPrimeNGSeverity>;
}

export interface IFilterConfig {
  filterField: string;
  searchInputType: EDataType;
  filterDropdownOptions?: string[];
  displayType: ETableFilterDisplayType;
  showMatchModes: boolean;
  defaultMatchMode: ETableFilterMatchMode;
  matchModeOptions?: IMatchModeOption[];
  showOperator: boolean;
  defaultOperator: ETableFilterOperator;
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

export interface ITableActionConfig<T = Record<string, unknown>>
  extends IButtonConfig {
  permission?: string[];
  hideWhen?: (rowData: T) => boolean;
  disableWhen?: (rowData: T) => boolean;
  disableReason?: (rowData: T) => string | undefined;
}

export interface ITableActionClickEvent<T = Record<string, unknown>> {
  actionType: EButtonActionType;
  selectedRows: T[];
}

export type ITableData = Record<string, unknown>;

export interface ITableSortingAndPaginationData {
  pageSize: number | null | undefined;
  page: number | undefined;
  sortField: string;
  sortOrder: 'ASC' | 'DESC' | undefined;
}

export interface ITableSearchFilterFieldConfig
  extends Partial<IInputFieldsConfig> {
  matchmode: ETableFilterMatchMode;
  permission?: string[];
}

export type ITableSearchFilterInputFieldsConfig<
  T extends Record<string, unknown> | object = Record<string, unknown>,
> = {
  [K in keyof T]: Partial<ITableSearchFilterFieldConfig>;
};

export interface ITableSearchFilterFormConfig<
  T extends Record<string, unknown> | object = Record<string, unknown>,
> {
  fields: ITableSearchFilterInputFieldsConfig<T>;
  buttons?: IFormButtonConfig;
}
