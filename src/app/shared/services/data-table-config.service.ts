import { Injectable, signal, WritableSignal } from '@angular/core';
import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTable,
  IEnhancedTableConfig,
  ITableActionConfig,
  ITableData,
} from '@shared/models';
import {
  DEFAULT_BULK_ACTION_CONFIG,
  DEFAULT_ROW_ACTION_CONFIG,
  DEFAULT_TABLE_CONFIG,
  DEFAULT_TABLE_HEADER_CONFIG,
} from '@shared/config';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private readonly defaultTableConfig: Partial<IDataTableConfig> =
    DEFAULT_TABLE_CONFIG;
  private readonly defaultTableHeaderConfig: Partial<IDataTableHeaderConfig> =
    DEFAULT_TABLE_HEADER_CONFIG;
  private readonly defaultBulkActionConfig: Partial<ITableActionConfig> =
    DEFAULT_BULK_ACTION_CONFIG;
  private readonly defaultRowActionConfig: Partial<ITableActionConfig> =
    DEFAULT_ROW_ACTION_CONFIG;

  createTable(tableConfig: IEnhancedTableConfig): IEnhancedTable {
    const tableConfigData = this.getTableConfig(tableConfig.tableConfig);
    const tableHeaders = this.getTableHeaderConfig(tableConfig.headers);
    const bulkActions = this.getBulkActionsConfig(tableConfig.bulkActions);
    const rowActions = this.getRowActionsConfig(tableConfig.rowActions);

    return this.createEnhancedTable(
      tableConfigData,
      tableHeaders,
      bulkActions,
      rowActions
    );
  }

  private getTableConfig(
    options?: Partial<IDataTableConfig>
  ): IDataTableConfig {
    return {
      ...this.defaultTableConfig,
      ...options,
    } as IDataTableConfig;
  }

  private getTableHeaderConfig(
    options?: Partial<IDataTableHeaderConfig>[]
  ): IDataTableHeaderConfig[] {
    if (!options?.length) {
      return [];
    }
    return options.map(
      override =>
        ({
          ...this.defaultTableHeaderConfig,
          ...override,
          filterConfig: {
            ...this.defaultTableHeaderConfig.filterConfig,
            ...override.filterConfig,
          },
          textWithSubtitleAndImageConfig:
            override.textWithSubtitleAndImageConfig
              ? {
                  ...this.defaultTableHeaderConfig
                    .textWithSubtitleAndImageConfig,
                  ...override.textWithSubtitleAndImageConfig,
                }
              : undefined,
          statusConfig: override.statusConfig
            ? {
                ...this.defaultTableHeaderConfig.statusConfig,
                ...override.statusConfig,
              }
            : this.defaultTableHeaderConfig.statusConfig,
        }) as IDataTableHeaderConfig
    );
  }

  private getBulkActionsConfig(
    options?: Partial<ITableActionConfig>[]
  ): ITableActionConfig[] {
    if (!options?.length) {
      return [];
    }
    return options.map(
      override =>
        ({
          ...this.defaultBulkActionConfig,
          ...override,
        }) as ITableActionConfig
    );
  }

  private getRowActionsConfig(
    options?: Partial<ITableActionConfig>[]
  ): ITableActionConfig[] {
    if (!options?.length) {
      return [];
    }
    return options.map(
      override =>
        ({
          ...this.defaultRowActionConfig,
          ...override,
        }) as ITableActionConfig
    );
  }

  private createEnhancedTable(
    tableConfig: IDataTableConfig,
    headers: IDataTableHeaderConfig[],
    bulkActions: ITableActionConfig[],
    rowActions: ITableActionConfig[]
  ): IEnhancedTable {
    // Create writable signals
    const tableConfigSignal = signal(tableConfig);
    const headersSignal = signal(headers);
    const bulkActionsSignal = signal(bulkActions);
    const rowActionsSignal = signal(rowActions);
    const dataSignal = signal<ITableData[]>([]);
    const loadingSignal = signal<boolean>(false);

    return {
      tableConfig: tableConfigSignal,
      headers: headersSignal,
      bulkActions: bulkActionsSignal,
      rowActions: rowActionsSignal,
      data: dataSignal,
      loading: loadingSignal,

      setData: (data: ITableData[]): WritableSignal<ITableData[]> => {
        dataSignal.set(data);
        return dataSignal;
      },

      setLoading: (loading: boolean): WritableSignal<boolean> => {
        loadingSignal.set(loading);
        return loadingSignal;
      },

      updateTableConfig: (
        config: Partial<IDataTableConfig>
      ): WritableSignal<IDataTableConfig> => {
        const updatedConfig = { ...tableConfigSignal(), ...config };
        tableConfigSignal.set(updatedConfig);
        return tableConfigSignal;
      },

      updateHeaders: (
        updatedHeaders: IDataTableHeaderConfig[]
      ): WritableSignal<IDataTableHeaderConfig[]> => {
        headersSignal.set(updatedHeaders);
        return headersSignal;
      },

      updateBulkActions: (
        actions: ITableActionConfig[]
      ): WritableSignal<ITableActionConfig[]> => {
        bulkActionsSignal.set(actions);
        return bulkActionsSignal;
      },

      updateRowActions: (
        actions: ITableActionConfig[]
      ): WritableSignal<ITableActionConfig[]> => {
        rowActionsSignal.set(actions);
        return rowActionsSignal;
      },

      getTableData: (): ITableData[] => dataSignal(),
      getTableConfig: (): IDataTableConfig => tableConfigSignal(),
      getHeaders: (): IDataTableHeaderConfig[] => headersSignal(),
      getBulkActions: (): ITableActionConfig[] => bulkActionsSignal(),
      getRowActions: (): ITableActionConfig[] => rowActionsSignal(),
    };
  }
}
