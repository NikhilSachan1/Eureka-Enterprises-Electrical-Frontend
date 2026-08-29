import { ParamMap } from '@angular/router';
import { APP_CONFIG } from '@core/config';
import {
  ECalendarView,
  EDataType,
  EDateSelectionMode,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { toLocalCalendarDate, transformDateFormat } from './date-time.util';

type SearchFilterFields = ITableSearchFilterFormConfig['fields'];
type SearchFilterFieldConfig = SearchFilterFields[string];
type QueryParamValue = string | string[] | null;

export const TABLE_PAGE_QUERY_KEY = 'page';
export const TABLE_PAGE_SIZE_QUERY_KEY = 'pageSize';

function getQueryParamKey(
  fieldName: string,
  config: SearchFilterFieldConfig
): string {
  return config.queryParamKey ?? fieldName;
}

function toQueryParamScalar(value: unknown): string {
  if (value == null || value === '') {
    return '';
  }

  if (value instanceof Date) {
    return '';
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const id = record['id'] ?? record['value'] ?? record['key'];
    return id == null ? '' : String(id).trim();
  }

  return String(value).trim();
}

function readNonEmptyParams(queryParamMap: ParamMap, key: string): string[] {
  return queryParamMap
    .getAll(key)
    .map(value => value.trim())
    .filter(Boolean);
}

function formatDateParam(value: Date): string {
  return transformDateFormat(value, APP_CONFIG.DATE_FORMATS.API);
}

function parseDateParam(value: string): Date | null {
  return toLocalCalendarDate(value);
}

function serializeDateValue(
  value: unknown,
  config: SearchFilterFieldConfig
): QueryParamValue {
  const calendarView = config.dateConfig?.calendarView;
  const selectionMode = config.dateConfig?.selectionMode;

  if (selectionMode === EDateSelectionMode.Range && Array.isArray(value)) {
    const start = value[0] instanceof Date ? formatDateParam(value[0]) : '';
    const end = value[1] instanceof Date ? formatDateParam(value[1]) : '';
    if (!start) {
      return null;
    }
    return end ? `${start},${end}` : start;
  }

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  if (calendarView === ECalendarView.Year) {
    return String(value.getFullYear());
  }

  if (calendarView === ECalendarView.Month) {
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${value.getFullYear()}-${month}`;
  }

  return formatDateParam(value);
}

function deserializeDateValue(
  raw: string,
  config: SearchFilterFieldConfig
): unknown {
  const calendarView = config.dateConfig?.calendarView;
  const selectionMode = config.dateConfig?.selectionMode;

  if (selectionMode === EDateSelectionMode.Range) {
    const [startRaw, endRaw] = raw.split(',');
    const start = parseDateParam(startRaw ?? '');
    const end = parseDateParam(endRaw ?? '');
    if (!start) {
      return undefined;
    }
    return [start, end];
  }

  if (calendarView === ECalendarView.Year) {
    const year = Number(raw);
    return Number.isInteger(year) ? new Date(year, 0, 1) : undefined;
  }

  if (calendarView === ECalendarView.Month) {
    const match = /^(\d{4})-(\d{2})$/.exec(raw.trim());
    if (!match) {
      return parseDateParam(raw) ?? undefined;
    }
    return new Date(Number(match[1]), Number(match[2]) - 1, 1);
  }

  return parseDateParam(raw) ?? undefined;
}

function serializeFieldValue(
  value: unknown,
  config: SearchFilterFieldConfig
): QueryParamValue {
  if (value == null || value === '') {
    return null;
  }

  if (config.fieldType === EDataType.MULTI_SELECT) {
    const values = (Array.isArray(value) ? value : [value])
      .map(item => toQueryParamScalar(item))
      .filter(Boolean);
    return values.length ? values : null;
  }

  if (config.fieldType === EDataType.DATE) {
    return serializeDateValue(value, config);
  }

  if (config.fieldType === EDataType.CHECKBOX) {
    return value === true ? 'true' : null;
  }

  if (Array.isArray(value)) {
    const values = value.map(item => toQueryParamScalar(item)).filter(Boolean);
    return values.length ? values : null;
  }

  const scalar = toQueryParamScalar(value);
  return scalar ? scalar : null;
}

function deserializeFieldValue(
  queryParamMap: ParamMap,
  sourceKey: string,
  config: SearchFilterFieldConfig
): unknown {
  if (config.fieldType === EDataType.MULTI_SELECT) {
    const selected = readNonEmptyParams(queryParamMap, sourceKey).flatMap(
      item => item.split(',')
    );
    const values = selected.map(item => item.trim()).filter(Boolean);
    return values.length ? values : undefined;
  }

  const raw = queryParamMap.get(sourceKey)?.trim();
  if (!raw) {
    return undefined;
  }

  if (config.fieldType === EDataType.DATE) {
    return deserializeDateValue(raw, config);
  }

  if (config.fieldType === EDataType.CHECKBOX) {
    return raw === 'true';
  }

  if (config.fieldType === EDataType.NUMBER) {
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return raw;
}

export function serializeSearchFilterQueryParams(
  data: Record<string, unknown>,
  fields: SearchFilterFields
): Record<string, QueryParamValue> {
  const params: Record<string, QueryParamValue> = {};

  for (const [fieldName, config] of Object.entries(fields)) {
    const paramKey = getQueryParamKey(fieldName, config);
    params[paramKey] = serializeFieldValue(data[fieldName], config);
    if (paramKey !== fieldName) {
      params[fieldName] = null;
    }
  }

  params[TABLE_PAGE_QUERY_KEY] = null;
  return params;
}

export function parseSearchFilterQueryParams(
  queryParamMap: ParamMap,
  fields: SearchFilterFields
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const [fieldName, config] of Object.entries(fields)) {
    const paramKey = getQueryParamKey(fieldName, config);
    const mappedValues = readNonEmptyParams(queryParamMap, paramKey);
    const sourceKey = mappedValues.length ? paramKey : fieldName;
    const hasValue =
      sourceKey === paramKey
        ? mappedValues.length > 0
        : readNonEmptyParams(queryParamMap, sourceKey).length > 0;

    if (!hasValue) {
      continue;
    }

    const parsed = deserializeFieldValue(queryParamMap, sourceKey, config);
    if (parsed !== undefined) {
      values[fieldName] = parsed;
    }
  }

  return values;
}

export function hasSearchFilterQueryParams(
  values: Record<string, unknown>
): boolean {
  return Object.keys(values).length > 0;
}

export function areSearchFilterQueryParamsUnchanged(
  current: ParamMap,
  next: Record<string, QueryParamValue>
): boolean {
  return Object.entries(next).every(([key, value]) => {
    if (value == null || value === '') {
      return !current.has(key);
    }

    if (Array.isArray(value)) {
      const existing = current.getAll(key);
      return (
        existing.length === value.length &&
        existing.every((item, index) => item === value[index])
      );
    }

    return current.get(key) === value;
  });
}

function parsePositiveIntParam(
  queryParamMap: ParamMap,
  key: string
): number | undefined {
  const raw = queryParamMap.get(key)?.trim();
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseTablePageQueryParam(queryParamMap: ParamMap): number {
  return parsePositiveIntParam(queryParamMap, TABLE_PAGE_QUERY_KEY) ?? 1;
}

export function parseTablePageSizeQueryParam(
  queryParamMap: ParamMap
): number | undefined {
  return parsePositiveIntParam(queryParamMap, TABLE_PAGE_SIZE_QUERY_KEY);
}

export function resolveTablePaginationFromQuery(
  queryParamMap: ParamMap,
  defaultRows: number,
  rowsPerPageOptions: number[] = []
): { first: number; rows: number } {
  const pageSize = parseTablePageSizeQueryParam(queryParamMap);
  const rows =
    pageSize &&
    (!rowsPerPageOptions.length || rowsPerPageOptions.includes(pageSize))
      ? pageSize
      : defaultRows;
  const page = parseTablePageQueryParam(queryParamMap);

  return {
    rows,
    first: Math.max(0, (page - 1) * rows),
  };
}

export function serializeTablePaginationQueryParams(
  first: number,
  rows: number,
  defaultRows: number
): Record<string, QueryParamValue> {
  const page = rows > 0 ? Math.floor(first / rows) + 1 : 1;

  return {
    [TABLE_PAGE_QUERY_KEY]: page > 1 ? String(page) : null,
    [TABLE_PAGE_SIZE_QUERY_KEY]:
      rows > 0 && rows !== defaultRows ? String(rows) : null,
  };
}
