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
}

export interface IDataTableServerSideFilterAndSortConfig {
  sortField?: string;
  filterField?: string;
}

export type IDataTableHeaderFilterConfig = Partial<IFilterConfig>;

export interface IDataTableHeaderConfig {
  field: string;
  header: string;
  bodyTemplate?: EDataType;
  dataType?: EDataType;
  dateFormat?: string;
  currencyFormat?: string;
  numberFormat?: string;
  textWithSubtitleAndImageConfig?: ITextWithSubtitleAndImageConfig;
  readMoreConfig?: Partial<IReadMoreConfig>;
  statusConfig?: IStatusConfig;
  customTemplateKey?: string;
  showFilter: boolean;
  clientSideFilterConfig?: IDataTableHeaderFilterConfig;
  showSort: boolean;
  showColumn?: boolean; // If false, column will be hidden but can still be used for filtering
  serverSideFilterAndSortConfig?: IDataTableServerSideFilterAndSortConfig;
  permission?: string[];
}

export interface ITextWithSubtitleAndImageConfig {
  secondaryField?: string;
  showImage?: boolean;
  dummyImageField?: string;
  primaryFieldHighlight?: boolean;
  primaryFieldLabel?: string;
  secondaryFieldLabel?: string;
  dataType?: EDataType;
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

export type ITableSearchFilterInputFieldsConfig = Record<
  string,
  ITableSearchFilterFieldConfig
>;

export interface ITableSearchFilterFormConfig {
  fields: ITableSearchFilterInputFieldsConfig;
  buttons?: IFormButtonConfig;
}
