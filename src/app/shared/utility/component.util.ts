import { APP_CONFIG } from '@core/config';
import { IFilterMapping, ITableSortingAndPaginationData } from '@shared/models';
import { FilterMetadata } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

export const buildPaginationData = (
  rows?: number,
  first?: number
): Partial<ITableSortingAndPaginationData> => {
  return {
    pageSize: rows ?? APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE, // Default as per FilterSchema (APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE)
    page: first && rows ? Math.floor(first / rows) + 1 : 1, // Default as per FilterSchema
  };
};

export const buildSortingData = (
  mapping: IFilterMapping,
  sortField?: string | string[],
  sortOrder?: number
): Partial<ITableSortingAndPaginationData> => {
  if (!sortField) {
    return {
      sortOrder: 'DESC',
    };
  }

  const fieldMapping = mapping[sortField as string];
  if (!fieldMapping?.sortField) {
    return {
      sortOrder: 'DESC',
    };
  }

  return {
    sortField: fieldMapping.sortField,
    sortOrder: sortOrder === 1 ? 'ASC' : 'DESC',
  };
};

export const buildFilterData = <T extends Record<string, unknown>>(
  mapping: IFilterMapping,
  filters?: Record<string, unknown>
): Partial<T> => {
  if (!filters) {
    return {} as Partial<T>;
  }

  const result: Record<string, unknown> = {};

  /* eslint-disable no-continue */
  for (const key in filters) {
    const filterValue = filters[key];

    if (key === 'global') {
      const globalValue = (
        Array.isArray(filterValue) ? filterValue[0] : filterValue
      ) as FilterMetadata;
      if (globalValue?.value) {
        result['search'] = globalValue.value;
      }
      continue;
    }

    if (!filterValue) {
      continue;
    }

    const filterMetadata = (
      Array.isArray(filterValue) ? filterValue[0] : filterValue
    ) as FilterMetadata;
    const rawValue = filterMetadata?.value;

    if (!rawValue) {
      continue;
    }

    const fieldMapping = mapping[key];
    if (!fieldMapping?.filterField) {
      continue;
    }

    const { filterField, transform, distribute } = fieldMapping;
    let processedValue: unknown = rawValue;

    if (Array.isArray(rawValue)) {
      const filtered = rawValue.filter(Boolean);
      if (!filtered.length) {
        continue;
      }
      processedValue = filtered;
    }

    if (transform) {
      processedValue = transform(processedValue);
    }

    if (
      processedValue !== null &&
      processedValue !== undefined &&
      processedValue !== ''
    ) {
      if (
        distribute &&
        typeof processedValue === 'object' &&
        processedValue !== null
      ) {
        const objectValue = processedValue as Record<string, unknown>;
        // Distribute each configured property
        Object.entries(distribute).forEach(([sourceKey, targetField]) => {
          const value = objectValue[sourceKey];
          if (value !== null && value !== undefined && value !== '') {
            result[targetField] = value;
          }
        });
      } else {
        // Normal field assignment
        result[filterField] = processedValue;
      }
    }
  }
  /* eslint-enable no-continue */

  return result as Partial<T>;
};

export const buildTableDataWithUnifiedMapping = <
  T extends Record<string, unknown>,
>(
  { rows, first, sortOrder, sortField, filters }: TableLazyLoadEvent,
  mapping: IFilterMapping
): Partial<ITableSortingAndPaginationData> & Partial<T> => {
  const paginationData = buildPaginationData(
    rows ?? undefined,
    first ?? undefined
  );
  const sortingData = buildSortingData(
    mapping,
    sortField ?? undefined,
    sortOrder === null ? undefined : sortOrder
  );
  const filterData = buildFilterData<T>(mapping, filters);

  return {
    ...paginationData,
    ...sortingData,
    ...filterData,
  } as Partial<ITableSortingAndPaginationData> & Partial<T>;
};
