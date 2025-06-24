import { Injectable, inject, signal } from '@angular/core';
import { DataTableConfigService } from './data-table-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig, IEnhancedTable, IEnhancedTableConfig } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private readonly dataTableConfigService = inject(DataTableConfigService);

  createTable(tableConfig: IEnhancedTableConfig): IEnhancedTable {
    const tableConfigData = this.dataTableConfigService.getTableConfig(tableConfig.tableConfig);
    const tableHeaders = this.dataTableConfigService.getTableHeaderConfig(tableConfig.headers);
    const bulkActions = this.dataTableConfigService.getBulkActionsConfig(tableConfig.bulkActions);
    const rowActions = this.dataTableConfigService.getRowActionsConfig(tableConfig.rowActions);
    
    return this.createEnhancedTable(tableConfigData, tableHeaders, bulkActions, rowActions);
  }

  private createEnhancedTable(
    tableConfig: IDataTableConfig,
    headers: IDataTableHeaderConfig[],
    bulkActions: IBulkActionConfig[],
    rowActions: IRowActionConfig[]
  ): IEnhancedTable {
    // Create writable signals
    const tableConfigSignal = signal(tableConfig);
    const headersSignal = signal(headers);
    const bulkActionsSignal = signal(bulkActions);
    const rowActionsSignal = signal(rowActions);
    const dataSignal = signal<any[]>([]);
    const loadingSignal = signal<boolean>(false);
    
    return {
      tableConfig: tableConfigSignal,
      headers: headersSignal,
      bulkActions: bulkActionsSignal,
      rowActions: rowActionsSignal,
      data: dataSignal,
      loading: loadingSignal,
      
      setData: (data: any[]) => {
        dataSignal.set(data);
        return dataSignal;
      },
      
      setLoading: (loading: boolean) => {
        loadingSignal.set(loading);
        return loadingSignal;
      },
      
      updateTableConfig: (config: Partial<IDataTableConfig>) => {
        const updatedConfig = { ...tableConfigSignal(), ...config };
        tableConfigSignal.set(updatedConfig);
        return tableConfigSignal;
      },
      
      updateHeaders: (headers: IDataTableHeaderConfig[]) => {
        headersSignal.set(headers);
        return headersSignal;
      },
      
      updateBulkActions: (actions: IBulkActionConfig[]) => {
        bulkActionsSignal.set(actions);
        return bulkActionsSignal;
      },
      
      updateRowActions: (actions: IRowActionConfig[]) => {
        rowActionsSignal.set(actions);
        return rowActionsSignal;
      },
      
      getTableData: () => dataSignal(),
      getTableConfig: () => tableConfigSignal(),
      getHeaders: () => headersSignal(),
      getBulkActions: () => bulkActionsSignal(),
      getRowActions: () => rowActionsSignal(),
    };
  }
} 