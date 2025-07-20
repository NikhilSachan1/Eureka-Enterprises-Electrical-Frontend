import {
  EPrimeNGSeverity,
  ETableBodyTemplate,
  ETableDataType,
  ETableFilterDisplayType,
  ETableFilterMatchMode,
  ETableFilterOperator,
  ETableSearchInputType,
} from '@shared/types';
import { IButtonConfig } from '@shared/models/button.model';

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
}

export interface IDataTableHeaderConfig {
  field: string;
  header: string;
  bodyTemplate?: ETableBodyTemplate;
  dataType?: ETableDataType;
  dateFormat?: string;
  currencyFormat?: string;
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
  dataType?: ETableDataType;
}

export interface IStatusConfig {
  rounded?: boolean;
  customSeverityMap?: Record<string, EPrimeNGSeverity>;
}

export interface IFilterConfig {
  filterField: string;
  searchInputType: ETableSearchInputType;
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

export interface IRowActionConfig<T = Record<string, unknown>>
  extends IButtonConfig {
  disabledCondition?: (rowData: T) => boolean;
}
export interface IBulkActionConfig<T = Record<string, unknown>>
  extends IButtonConfig {
  disabledCondition?: (selectedRows: T[]) => boolean;
}

export interface IRowActionClickEvent {
  actionType: string;
  rowData: Record<string, unknown>;
}

export interface IBulkActionClickEvent {
  actionType: string;
  selectedRows: Record<string, unknown>[];
}

export type ITableData = Record<string, unknown>;
