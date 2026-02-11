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
  showCheckbox: boolean;
  emptyMessage: string;
  emptyMessageIcon: string;
  emptyMessageDescription: string;
  paginationTemplate: string;
  totalRecords?: number;
  enableServerSide: boolean;
  showViewModeToggle?: boolean; // Show/hide list & card layout toggle (default: true)
}

export interface IDataTableServerSideFilterAndSortConfig {
  sortField?: string;
  filterField?: string;
}

export type IDataTableHeaderFilterConfig = Partial<IFilterConfig>;

/** Subtitle config for TEXT_WITH_SUBTITLE columns. All subtitle-related options in one object. */
export interface ISubtitleConfig {
  /** Field key for subtitle value (e.g. 'parentCompanyName', 'employeeCode'). */
  field: string;
  /** Body template type for subtitle (date, currency, status, etc.). Defaults to TEXT. */
  bodyTemplate?: EDataType;
  /** Optional label shown before subtitle value. */
  label?: string;
}

export interface IDataTableHeaderConfig {
  field: string;
  header: string;
  bodyTemplate?: EDataType;
  dataType?: EDataType;
  dateFormat?: string;
  currencyFormat?: string;
  numberFormat?: string;
  /** Show image (avatar) for text-with-subtitle-and-image columns. Can be used with or without subtitle. */
  showImage?: boolean;
  /** Field used to resolve image/avatar (e.g. name for initials). Used when showImage is true. */
  dummyImageField?: string;
  /** Whether to highlight the primary field (bold). */
  primaryFieldHighlight?: boolean;
  /** Subtitle config (field, bodyTemplate, label). */
  subtitle?: ISubtitleConfig;
  primaryFieldLabel?: string;
  readMoreConfig?: Partial<IReadMoreConfig>;
  statusConfig?: IStatusConfig;
  customTemplateKey?: string;
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
