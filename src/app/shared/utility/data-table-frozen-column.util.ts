import type {
  IDataTableConfig,
  IDataTableFrozenColumnConfig,
  IDataTableHeaderConfig,
} from '@shared/types';

export function isDataTableColumnFrozen(
  scrollable: boolean | undefined,
  config?: Partial<IDataTableFrozenColumnConfig> | null
): boolean {
  return !!(scrollable && config?.frozen);
}

export function resolveFrozenAlign(
  config?: Partial<IDataTableFrozenColumnConfig> | null,
  fallback: 'left' | 'right' = 'left'
): 'left' | 'right' {
  return config?.alignFrozen ?? fallback;
}

export function resolveFrozenColumnWidth(
  config?: Partial<IDataTableFrozenColumnConfig> | null
): string | undefined {
  return config?.columnWidth;
}

export function resolveColumnWidth(
  scrollable: boolean | undefined,
  config?: Partial<
    IDataTableFrozenColumnConfig | IDataTableHeaderConfig
  > | null,
  defaultWhenFrozen?: Partial<IDataTableFrozenColumnConfig>
): string | undefined {
  const frozen = isDataTableColumnFrozen(scrollable, config);
  const isDataColumn =
    !!config && 'field' in config && typeof config.field === 'string';

  if (config?.columnWidth && (isDataColumn || frozen)) {
    return config.columnWidth;
  }

  if (frozen && defaultWhenFrozen?.columnWidth) {
    return defaultWhenFrozen.columnWidth;
  }

  return undefined;
}

export function hasAnyFrozenColumn(
  config: Partial<IDataTableConfig>,
  headers: IDataTableHeaderConfig[] = []
): boolean {
  if (config.selectionColumn?.frozen) {
    return true;
  }

  if (config.actionsColumn?.frozen) {
    return true;
  }

  return headers.some(header => header.showColumn !== false && header.frozen);
}

export function isDataTableScrollable(
  config: Partial<IDataTableConfig>,
  headers: IDataTableHeaderConfig[] = []
): boolean {
  if (config.scrollable) {
    return true;
  }

  return hasAnyFrozenColumn(config, headers);
}
