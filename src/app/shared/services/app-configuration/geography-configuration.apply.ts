import { WritableSignal } from '@angular/core';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import { toTitleCase } from '@shared/utility';
import { sortDropdownByLabel } from './configuration-dropdown.utils';

export interface GeographyConfigurationSignals {
  states: WritableSignal<IOptionDropdown[]>;
  cities: WritableSignal<IOptionDropdown[]>;
  stateCityMap: WritableSignal<Record<string, string[]>>;
}

/** Applies geography `location` config into states / cities / state→city map. */
export function applyGeographyLocationConfig(
  moduleConfigMap: Record<string, Record<string, unknown>>,
  signals: GeographyConfigurationSignals
): void {
  const locationConfig = moduleConfigMap[MODULE_NAMES.GEOGRAPHY]?.[
    CONFIGURATION_KEYS.GEOGRAPHY.LOCATION
  ] as Record<string, string[]> | undefined;

  if (!locationConfig || typeof locationConfig !== 'object') {
    return;
  }

  signals.stateCityMap.set(locationConfig);

  const stateOptions: IOptionDropdown[] = Object.keys(locationConfig)
    .sort()
    .map(stateName => ({
      label: toTitleCase(stateName),
      value: stateName,
    }));

  signals.states.set(stateOptions);

  const allCities: IOptionDropdown[] = Object.values(locationConfig)
    .flat()
    .sort()
    .filter((city, index, self) => self.indexOf(city) === index)
    .map(city => ({
      label: toTitleCase(city),
      value: city,
    }));

  signals.cities.set(allCities);
}

export function resetGeographyConfigurationSignals(
  signals: GeographyConfigurationSignals
): void {
  signals.states.set([]);
  signals.cities.set([]);
  signals.stateCityMap.set({});
}

/** Resolve cities for a selected state from the location map (or cities list fallback). */
export function resolveCitiesByState(
  stateValue: string,
  stateCityMap: Record<string, string[]>,
  allCities: IOptionDropdown[]
): IOptionDropdown[] {
  if (!stateValue) {
    return [];
  }

  const dynamicCities = stateCityMap[stateValue];
  if (dynamicCities && Array.isArray(dynamicCities)) {
    return dynamicCities
      .map(city => ({
        label: toTitleCase(city),
        value: city,
      }))
      .sort(sortDropdownByLabel);
  }

  return allCities.filter(city => city.value === stateValue);
}
