import { Injectable } from '@angular/core';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../models/data-table-config.model';
import { DEFAULT_BULK_ACTION_CONFIG, DEFAULT_ROW_ACTION_CONFIG, DEFAULT_TABLE_CONFIG, DEFAULT_TABLE_HEADER_CONFIG } from '../config/data-table.config';

@Injectable({
  providedIn: 'root',
})
export class DataTableConfigService {
    private readonly defaultTableConfig: Partial<IDataTableConfig> = DEFAULT_TABLE_CONFIG;
    private readonly defaultTableHeaderConfig: Partial<IDataTableHeaderConfig> = DEFAULT_TABLE_HEADER_CONFIG;
    private readonly defaultBulkActionConfig: Partial<IBulkActionConfig> = DEFAULT_BULK_ACTION_CONFIG;
    private readonly defaultRowActionConfig: Partial<IRowActionConfig> = DEFAULT_ROW_ACTION_CONFIG;

  getTableConfig(options?: Partial<IDataTableConfig>) {
    return {
      ...this.defaultTableConfig,
      ...options,
    } as IDataTableConfig;
  }

  getTableHeaderConfig(options?: Partial<IDataTableHeaderConfig>[]): IDataTableHeaderConfig[] {
    if (!options?.length) {
      return [];
    }
    return options.map(override => ({
      ...this.defaultTableHeaderConfig,
      ...override,
      filterConfig: {
        ...this.defaultTableHeaderConfig.filterConfig,
        ...override.filterConfig,
      },
      textWithSubtitleAndImageConfig: override.textWithSubtitleAndImageConfig ? {
        ...this.defaultTableHeaderConfig.textWithSubtitleAndImageConfig,
        ...override.textWithSubtitleAndImageConfig,
      } : undefined,
      statusConfig: override.statusConfig ? {
        ...this.defaultTableHeaderConfig.statusConfig,
        ...override.statusConfig,
      }: this.defaultTableHeaderConfig.statusConfig,
    } as IDataTableHeaderConfig)) as IDataTableHeaderConfig[];
  }

  getBulkActionConfig(options?: Partial<IBulkActionConfig>): IBulkActionConfig {
    return {
      ...this.defaultBulkActionConfig,
      ...options,
    } as IBulkActionConfig;
  }

  getBulkActionsConfig(options?: Partial<IBulkActionConfig>[]): IBulkActionConfig[] {
    if (!options?.length) {
      return [];
    }
    return options.map(override => ({
      ...this.defaultBulkActionConfig,
      ...override,
    } as IBulkActionConfig));
  }

  getRowActionsConfig(options?: Partial<IRowActionConfig>[]): IRowActionConfig[] {
    if (!options?.length) {
      return [];
    }
    return options.map(override => ({
      ...this.defaultRowActionConfig,
      ...override,
    } as IRowActionConfig));
  }
  
}
