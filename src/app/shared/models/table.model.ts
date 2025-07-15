import { Signal } from '@angular/core';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '@shared/models';

export interface IEnhancedTableConfig {
  tableConfig?: Partial<IDataTableConfig>;
  headers?: Partial<IDataTableHeaderConfig>[];
  bulkActions?: Partial<IBulkActionConfig>[];
  rowActions?: Partial<IRowActionConfig>[];
}

export interface IEnhancedTable {
  tableConfig: Signal<IDataTableConfig>;
  headers: Signal<IDataTableHeaderConfig[]>;
  bulkActions: Signal<IBulkActionConfig[]>;
  rowActions: Signal<IRowActionConfig[]>;
  data: Signal<any[]>;
  loading: Signal<boolean>;
  
  setData(data: any[]): Signal<any[]>;
  setLoading(loading: boolean): Signal<boolean>;
  updateTableConfig(config: Partial<IDataTableConfig>): Signal<IDataTableConfig>;
  updateHeaders(headers: IDataTableHeaderConfig[]): Signal<IDataTableHeaderConfig[]>;
  updateBulkActions(actions: IBulkActionConfig[]): Signal<IBulkActionConfig[]>;
  updateRowActions(actions: IRowActionConfig[]): Signal<IRowActionConfig[]>;
  getTableData(): any[];
  getTableConfig(): IDataTableConfig;
  getHeaders(): IDataTableHeaderConfig[];
  getBulkActions(): IBulkActionConfig[];
  getRowActions(): IRowActionConfig[];
} 