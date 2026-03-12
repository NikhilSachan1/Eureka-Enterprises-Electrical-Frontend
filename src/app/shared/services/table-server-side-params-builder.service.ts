import { Injectable } from '@angular/core';
import { FilterMetadata } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IDataTableHeaderConfig,
  IDataTableServerSideFilterAndSortConfig,
} from '@shared/types';
import { APP_CONFIG } from '@core/config';

/**
 * Centralized service for building server-side query parameters from table events.
 * This service handles pagination, sorting, filtering, and search parameter construction
 * for any table component that uses server-side data operations.
 */
@Injectable({
  providedIn: 'root',
})
export class TableServerSideParamsBuilderService {
  /**
   * Builds complete query parameters from a table lazy load event.
   * This is the main entry point for converting UI table state to API parameters.
   *
   * @param filterData - The PrimeNG lazy load event containing pagination, sorting, and filters
   * @param headers - Table header configuration defining field mappings
   * @param defaultPageSize - Optional default page size if not specified in filterData
   * @param initialParams - Optional initial params to merge when filters are empty (first load)
   * @returns A record of query parameters ready for API consumption
   */
  buildQueryParams<T extends Record<string, unknown>>(
    filterData: TableLazyLoadEvent,
    headers: IDataTableHeaderConfig[],
    initialParams?: Partial<T>,
    defaultPageSize?: number
  ): T {
    const { page, pageSize } = this.resolvePagination(
      filterData,
      defaultPageSize
    );
    const { sortField, sortOrder } = this.resolveSorting(filterData, headers);
    const filterParams = this.mapFiltersToParams(filterData.filters, headers);
    const searchTerm =
      typeof filterData.globalFilter === 'string'
        ? filterData.globalFilter.trim()
        : undefined;

    const hasFilters =
      filterData.filters && Object.keys(filterData.filters).length > 0;

    const params: Record<string, unknown> = {
      ...(hasFilters ? {} : (initialParams ?? {})),
      page,
      pageSize,
      sortField,
      sortOrder,
      ...filterParams,
    };

    if (searchTerm) {
      params['search'] = searchTerm;
    }

    return params as T;
  }

  /**
   * Normalizes pagination data from the table event.
   * Converts first/rows format to page/pageSize format expected by most APIs.
   *
   * @param filterData - The table lazy load event
   * @param defaultPageSize - Optional default page size
   * @returns Object containing page number (1-based) and pageSize
   */
  resolvePagination(
    filterData: TableLazyLoadEvent,
    defaultPageSize?: number
  ): {
    page: number;
    pageSize: number;
  } {
    const fallbackRows =
      defaultPageSize ?? APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    const rows = filterData.rows ?? fallbackRows;
    const first = filterData.first ?? 0;

    // Convert zero-based offset to 1-based page number
    const page = rows > 0 ? Math.floor(first / rows) + 1 : 1;

    return {
      page,
      pageSize: rows,
    };
  }

  /**
   * Maps UI sort metadata to server-side field names and directions.
   * Translates PrimeNG sort order (1, -1) to string format (ASC, DESC).
   *
   * @param filterData - The table lazy load event
   * @param headers - Table header configuration for field mapping
   * @returns Object containing sortField and sortOrder
   */
  resolveSorting(
    filterData: TableLazyLoadEvent,
    headers: IDataTableHeaderConfig[]
  ): { sortField?: string; sortOrder: 'ASC' | 'DESC' } {
    // Convert PrimeNG sort order to string format
    const sortOrder =
      filterData.sortOrder === 1 && filterData.sortField
        ? 'ASC'
        : filterData.sortOrder === -1 && filterData.sortField
          ? 'DESC'
          : 'DESC'; // Default to DESC if not specified

    return {
      sortOrder,
      sortField: this.mapSortField(filterData.sortField, headers),
    };
  }

  /**
   * Extracts filter values from the table event and translates them to API parameters.
   * Handles both simple and complex filter structures with transformation and distribution.
   *
   * @param filters - The filters object from table lazy load event
   * @param headers - Table header configuration for filter mapping
   * @returns Record of API filter parameters
   */
  mapFiltersToParams(
    filters: TableLazyLoadEvent['filters'],
    headers: IDataTableHeaderConfig[]
  ): Record<string, unknown> {
    if (!filters) {
      return {};
    }

    return Object.entries(filters).reduce(
      (acc, [filterKey, filterMeta]) => {
        // Skip 'global' key as it's an internal PrimeNG property, not a filter
        if (filterKey === 'global' || !filterMeta) {
          return acc;
        }

        // Find the server-side configuration for this filter
        const header = this.findHeaderForFilterKey(filterKey, headers);
        const serverConfig = header?.serverSideFilterAndSortConfig;

        // Extract filter value
        const extractedValue = this.extractFilterValue(
          filterMeta as FilterMetadata
        );

        if (!serverConfig) {
          // If no mapper found, use filter key and value directly
          if (this.isValidFilterValue(extractedValue)) {
            acc[filterKey] = extractedValue;
          }
          return acc;
        }

        // Build the payload for this specific filter
        const payload = this.buildServerFilterPayload(
          extractedValue,
          serverConfig,
          filterKey // Pass filterKey as fallback
        );

        if (payload) {
          Object.assign(acc, payload);
        }

        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  /**
   * Finds the header configuration that owns a particular filter key.
   * Checks both the main field and clientSideFilterConfig.filterField.
   *
   * @param filterKey - The filter field name from the table event
   * @param headers - Array of table header configurations
   * @returns The matching header config or undefined
   */
  private findHeaderForFilterKey(
    filterKey: string | undefined,
    headers: IDataTableHeaderConfig[]
  ): IDataTableHeaderConfig | undefined {
    if (!filterKey) {
      return undefined;
    }

    return headers.find(header => {
      const clientFilterField = header.clientSideFilterConfig?.filterField;
      return header.field === filterKey || clientFilterField === filterKey;
    });
  }

  /**
   * Converts the UI sort field into the server-side field name.
   * Uses serverSideFilterAndSortConfig.sortField for the mapping.
   *
   * @param sortField - The field being sorted (from table event)
   * @param headers - Table header configuration
   * @returns The server-side sort field name or undefined
   */
  private mapSortField(
    sortField: string | string[] | null | undefined,
    headers: IDataTableHeaderConfig[]
  ): string | undefined {
    if (!sortField || Array.isArray(sortField)) {
      return undefined;
    }

    const header = this.findHeaderForFilterKey(sortField, headers);
    const serverConfig = header?.serverSideFilterAndSortConfig;
    return serverConfig?.sortField;
  }

  /**
   * Builds a record of API filter parameters for a single column.
   * Maps filter values to their server-side field names.
   *
   * @param rawValue - The raw filter value from the table
   * @param serverConfig - Server-side configuration defining field mappings
   * @param fallbackField - Fallback field name if filterField is not provided
   * @returns Record of API parameters or null if invalid
   */
  private buildServerFilterPayload(
    rawValue: unknown,
    serverConfig: IDataTableServerSideFilterAndSortConfig,
    fallbackField?: string
  ): Record<string, unknown> | null {
    if (!this.isValidFilterValue(rawValue)) {
      return null;
    }

    // If filterField is provided, use it; otherwise use fallback field name
    const fieldName = serverConfig.filterField ?? fallbackField;
    if (fieldName) {
      return { [fieldName]: rawValue };
    }

    return null;
  }

  /**
   * Get filter value from table filter data by key
   * @param tableFilterData - Table lazy load event data containing filters
   * @param filterKey - The key of the filter to extract
   * @returns The extracted filter value (component will decide the type based on usage)
   */
  public getFilterValueByKey(
    tableFilterData: TableLazyLoadEvent | undefined,
    filterKey: string
  ): unknown {
    if (!tableFilterData?.filters) {
      return undefined;
    }

    const filter = tableFilterData.filters[filterKey];
    if (!filter) {
      return undefined;
    }

    return this.extractFilterValue(filter);
  }

  /**
   * Safely extracts the value(s) from a filter metadata object.
   * Handles both single filters and arrays of filters with constraints.
   *
   * @param filterMeta - The filter metadata from PrimeNG
   * @returns The extracted filter value(s)
   */
  public extractFilterValue(
    filterMeta: FilterMetadata | FilterMetadata[]
  ): unknown {
    // Handle array of filter metadata
    if (Array.isArray(filterMeta)) {
      const extractedValues = filterMeta
        .map(meta => this.extractFilterValue(meta))
        .filter(value => value !== undefined);

      if (!extractedValues.length) {
        return undefined;
      }

      return extractedValues.length === 1
        ? extractedValues[0]
        : extractedValues;
    }

    // Handle filter metadata with constraints (e.g., date ranges, multi-filters)
    const metadataWithConstraints = filterMeta as FilterMetadata & {
      constraints?: FilterMetadata[];
    };

    if (
      metadataWithConstraints.constraints &&
      metadataWithConstraints.constraints.length > 0
    ) {
      const constraintValues = metadataWithConstraints.constraints
        .map(constraint => constraint.value)
        .filter(value => value !== undefined && value !== null);

      if (!constraintValues.length) {
        return undefined;
      }

      return constraintValues.length === 1
        ? constraintValues[0]
        : constraintValues;
    }

    // Simple filter with just a value
    return filterMeta.value;
  }

  /**
   * Guards against objects with nested data when distributing filter payloads.
   * Ensures we're working with a plain object, not an array or null.
   *
   * @param value - The value to check
   * @returns True if value is a plain object
   */
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
  }

  /**
   * Ensures that we only send meaningful filter values to the backend.
   * Filters out undefined, null, empty strings, empty arrays, and empty objects.
   *
   * @param value - The value to validate
   * @returns True if the value should be sent to the API
   */
  private isValidFilterValue(value: unknown): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (this.isPlainObject(value)) {
      return Object.values(value).some(innerValue =>
        this.isValidFilterValue(innerValue)
      );
    }

    return true;
  }
}
