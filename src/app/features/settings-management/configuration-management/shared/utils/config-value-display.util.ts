export type ConfigurationValueKind =
  | 'nullish'
  | 'primitive'
  | 'array'
  | 'object';

export type ConfigScalarTone = 'text' | 'number' | 'boolean' | 'muted';

export type ConfigView =
  | { kind: 'empty' }
  | { kind: 'scalar'; text: string; tone: ConfigScalarTone }
  | { kind: 'chips'; items: string[] }
  | { kind: 'table'; columns: string[]; rows: ConfigView[][] }
  | { kind: 'fields'; entries: { key: string; value: ConfigView }[] }
  | { kind: 'list'; items: ConfigView[] };

const MAX_VIEW_DEPTH = 8;

export function classifyConfigurationValue(
  value: unknown
): ConfigurationValueKind {
  if (value === null || value === undefined) {
    return 'nullish';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return 'primitive';
    }
    return 'object';
  }
  return 'primitive';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getConfigObjectEntries(value: unknown): [string, unknown][] {
  if (!isPlainObject(value)) {
    return [];
  }
  return Object.keys(value)
    .sort((a, b) => a.localeCompare(b))
    .map(key => [key, value[key]]);
}

export function getConfigArrayItems(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function trimDisplayKey(key: string): string {
  return key.trim();
}

export function trimmedContext(key: string | null | undefined): string {
  if (key === null || typeof key !== 'string') {
    return '';
  }
  return key.trim();
}

export function formatConfigPrimitive(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return '—';
    }
    return trimmed.length > 2000 ? `${trimmed.slice(0, 2000)}…` : trimmed;
  }
  return String(value).trim() || '—';
}

function isDisplayPrimitive(value: unknown): boolean {
  const kind = classifyConfigurationValue(value);
  return kind === 'primitive' || kind === 'nullish';
}

function uniqueSortedKeys(objects: Record<string, unknown>[]): string[] {
  const keys = new Set<string>();
  objects.forEach(object => {
    Object.keys(object).forEach(key => keys.add(key));
  });
  return [...keys].sort((a, b) => a.localeCompare(b));
}

function scalarView(value: unknown): ConfigView {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return { kind: 'empty' };
  }

  let tone: ConfigScalarTone = 'text';
  if (typeof value === 'boolean') {
    tone = 'boolean';
  } else if (typeof value === 'number' || typeof value === 'bigint') {
    tone = 'number';
  }

  return { kind: 'scalar', text: formatConfigPrimitive(value), tone };
}

/** Turns API JSON into a small view model: scalar, chips, table, or fields. */
export function toConfigView(value: unknown, depth = 0): ConfigView {
  if (depth >= MAX_VIEW_DEPTH) {
    return { kind: 'scalar', text: '…', tone: 'muted' };
  }

  const kind = classifyConfigurationValue(value);
  if (kind === 'nullish') {
    return { kind: 'empty' };
  }
  if (kind === 'primitive') {
    return scalarView(value);
  }

  if (kind === 'array') {
    const items = getConfigArrayItems(value);
    if (items.length === 0) {
      return { kind: 'empty' };
    }
    if (items.every(isDisplayPrimitive)) {
      return {
        kind: 'chips',
        items: items.map(item => formatConfigPrimitive(item)),
      };
    }
    if (items.every(isPlainObject)) {
      const objects = items as Record<string, unknown>[];
      const columns = uniqueSortedKeys(objects);
      const singleColumn = columns[0];
      if (
        columns.length === 1 &&
        singleColumn &&
        objects.every(object => isDisplayPrimitive(object[singleColumn]))
      ) {
        return {
          kind: 'chips',
          items: objects.map(object =>
            formatConfigPrimitive(object[singleColumn])
          ),
        };
      }
      return {
        kind: 'table',
        columns,
        rows: objects.map(object =>
          columns.map(column => toConfigView(object[column], depth + 1))
        ),
      };
    }
    return {
      kind: 'list',
      items: items.map(item => toConfigView(item, depth + 1)),
    };
  }

  const entries = getConfigObjectEntries(value);
  if (entries.length === 0) {
    return { kind: 'empty' };
  }
  return {
    kind: 'fields',
    entries: entries.map(([key, nested]) => ({
      key: trimDisplayKey(key),
      value: toConfigView(nested, depth + 1),
    })),
  };
}

function summarizeConfigValue(value: unknown): string {
  const view = toConfigView(value);
  switch (view.kind) {
    case 'empty':
      return 'Empty';
    case 'scalar':
      return view.text;
    case 'chips':
      return view.items.join(', ') || 'Empty';
    case 'table':
      return `${view.rows.length} ${view.rows.length === 1 ? 'row' : 'rows'}`;
    case 'fields':
      return `${view.entries.length} ${view.entries.length === 1 ? 'field' : 'fields'}`;
    case 'list':
      return `${view.items.length} ${view.items.length === 1 ? 'item' : 'items'}`;
  }
}

export function summarizeConfiguration(configuration: {
  configSettings: Array<{ isActive: boolean; value: unknown }>;
}): string {
  const setting =
    configuration.configSettings.find(item => item.isActive) ??
    configuration.configSettings[0];
  return setting ? summarizeConfigValue(setting.value) : 'No value';
}
