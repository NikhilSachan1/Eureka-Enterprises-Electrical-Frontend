import { Signal } from '@angular/core';
import {
  IBulkActionConfig,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IRowActionConfig,
} from '@shared/models';

export interface IEnhancedTableConfig<T = Record<string, unknown>> {
  tableConfig?: Partial<IDataTableConfig>;
  headers?: Partial<IDataTableHeaderConfig>[];
  bulkActions?: Partial<IBulkActionConfig<T>>[];
  rowActions?: Partial<IRowActionConfig<T>>[];
}

export interface IEnhancedTable {
  tableConfig: Signal<IDataTableConfig>;
  headers: Signal<IDataTableHeaderConfig[]>;
  bulkActions: Signal<IBulkActionConfig[]>;
  rowActions: Signal<IRowActionConfig[]>;
  data: Signal<Record<string, unknown>[]>;
  loading: Signal<boolean>;

  setData(data: Record<string, unknown>[]): Signal<Record<string, unknown>[]>;
  setLoading(loading: boolean): Signal<boolean>;
  updateTableConfig(
    config: Partial<IDataTableConfig>
  ): Signal<IDataTableConfig>;
  updateHeaders(
    headers: IDataTableHeaderConfig[]
  ): Signal<IDataTableHeaderConfig[]>;
  updateBulkActions(actions: IBulkActionConfig[]): Signal<IBulkActionConfig[]>;
  updateRowActions(actions: IRowActionConfig[]): Signal<IRowActionConfig[]>;
  getTableData(): Record<string, unknown>[];
  getTableConfig(): IDataTableConfig;
  getHeaders(): IDataTableHeaderConfig[];
  getBulkActions(): IBulkActionConfig[];
  getRowActions(): IRowActionConfig[];
}
