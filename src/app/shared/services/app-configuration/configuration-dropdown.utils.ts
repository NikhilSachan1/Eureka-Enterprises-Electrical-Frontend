import { applyIconsToDropdownOptions } from '@shared/config/dropdown-option-icons.config';
import { CONFIGURATION_KEYS } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import { toTitleCase } from '@shared/utility';
import type { IConfigurationGetResponseDto } from '@features/settings-management/configuration-management/types/configuration.dto';

export function sortDropdownByLabel(
  a: IOptionDropdown,
  b: IOptionDropdown
): number {
  return a.label.localeCompare(b.label);
}

export function isPurchaseOrderConfiguredDropdown(key: string): boolean {
  return (
    key === CONFIGURATION_KEYS.PURCHASE_ORDER.GST_TYPES ||
    key === CONFIGURATION_KEYS.PURCHASE_ORDER.PO_TYPES ||
    key === CONFIGURATION_KEYS.PURCHASE_ORDER.UNITS
  );
}

export function mapLabeledDropdownOptions(data: unknown[]): IOptionDropdown[] {
  return data
    .map(item => {
      const obj = item as { label?: string; value?: string; name?: string };
      const value = String(obj.value ?? obj.name ?? '').trim();
      const label = String(obj.label ?? value).trim();
      return { label, value };
    })
    .filter(option => option.value.length > 0);
}

export function normalizeDropdownData(data: unknown[]): IOptionDropdown[] {
  return data
    .map(item => {
      const obj = item as { label: string; value?: string; name?: string };
      const rawLabel = obj.label ?? '';
      // "N/A" ko as-is rakhna, toTitleCase se "Na" na bane
      const label =
        rawLabel.toUpperCase() === 'N/A' ? 'N/A' : toTitleCase(rawLabel);
      return {
        label,
        value: obj.value ?? obj.name ?? '',
      };
    })
    .sort(sortDropdownByLabel);
}

export function buildModuleConfigMap(
  response: IConfigurationGetResponseDto
): Record<string, Record<string, unknown>> {
  return response.records.reduce(
    (acc, record) => {
      const activeSetting = record.configSettings.find(
        setting => setting.isActive
      );

      if (!activeSetting) {
        return acc;
      }

      acc[record.module] ??= {};
      acc[record.module][record.key] = activeSetting.value;

      return acc;
    },
    {} as Record<string, Record<string, unknown>>
  );
}

export function buildPassingYearDropdownOptions(): IOptionDropdown[] {
  const PASSING_YEAR_START = 2016;
  const endYear = new Date().getFullYear();
  const options: IOptionDropdown[] = [];
  for (let year = PASSING_YEAR_START; year <= endYear; year++) {
    const y = String(year);
    options.push({ label: y, value: y });
  }
  return options;
}

export function mapApiDropdownValue(
  key: string,
  apiValue: unknown,
  staticFallback: IOptionDropdown[] | undefined
): IOptionDropdown[] | null {
  let nextValue: IOptionDropdown[] = [];

  if (Array.isArray(apiValue)) {
    nextValue = isPurchaseOrderConfiguredDropdown(key)
      ? mapLabeledDropdownOptions(apiValue)
      : normalizeDropdownData(apiValue);
  } else if (staticFallback) {
    nextValue = staticFallback;
  } else if (apiValue === undefined) {
    return null;
  }

  return applyIconsToDropdownOptions(key, nextValue);
}

export function mergeConfigurationListPages(
  responses: IConfigurationGetResponseDto[]
): IConfigurationGetResponseDto {
  const records = responses.flatMap(response => response.records);

  return {
    records,
    totalRecords: responses[0]?.totalRecords ?? records.length,
  };
}

/** Keys that are not loaded from configuration API records. */
export function configurationExcludedKeys(): Set<string> {
  return new Set<string>([
    CONFIGURATION_KEYS.COMMON.ROLE_LIST,
    CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS,
    CONFIGURATION_KEYS.PROJECT.ALLOCATION_STATUS,
    CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
    CONFIGURATION_KEYS.ASSET.ASSET_LIST,
    CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
    CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST,
    CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST,
    CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
    CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
    CONFIGURATION_KEYS.VENDOR.VENDOR_LIST,
    CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
  ]);
}

/**
 * States and cities come from the geography `location` key.
 * Entity lists and locally built options are not configuration records.
 */
export function resolveConfigurationKey(
  _moduleName: string,
  key: string
): string | null {
  if (configurationExcludedKeys().has(key)) {
    return null;
  }

  if (
    key === CONFIGURATION_KEYS.COMMON.STATES ||
    key === CONFIGURATION_KEYS.COMMON.CITIES
  ) {
    return CONFIGURATION_KEYS.GEOGRAPHY.LOCATION;
  }

  return key;
}

export function configurationLoadingKey(configurationKey: string): string {
  return `config-key:${configurationKey}`;
}
