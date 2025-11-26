import { Signal } from '@angular/core';
import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  ITableActionConfig,
} from '@shared/types';

export interface IEnhancedTableConfig<T = Record<string, unknown>> {
  tableConfig?: Partial<IDataTableConfig>;
  headers?: Partial<IDataTableHeaderConfig>[];
  bulkActions?: Partial<ITableActionConfig<T>>[];
  rowActions?: Partial<ITableActionConfig<T>>[];
}

export interface IEnhancedTable {
  tableConfig: Signal<IDataTableConfig>;
  headers: Signal<IDataTableHeaderConfig[]>;
  bulkActions: Signal<ITableActionConfig[]>;
  rowActions: Signal<ITableActionConfig[]>;
  data: Signal<Record<string, unknown>[]>;
  loading: Signal<boolean>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData(data: Record<string, any>[]): Signal<Record<string, unknown>[]>;
  setLoading(loading: boolean): Signal<boolean>;
  updateTableConfig(
    config: Partial<IDataTableConfig>
  ): Signal<IDataTableConfig>;
  updateHeaders(
    headers: IDataTableHeaderConfig[]
  ): Signal<IDataTableHeaderConfig[]>;
  updateBulkActions(
    actions: ITableActionConfig[]
  ): Signal<ITableActionConfig[]>;
  updateRowActions(actions: ITableActionConfig[]): Signal<ITableActionConfig[]>;
  getTableData(): Record<string, unknown>[];
  getTableConfig(): IDataTableConfig;
  getHeaders(): IDataTableHeaderConfig[];
  getBulkActions(): ITableActionConfig[];
  getRowActions(): ITableActionConfig[];
}
