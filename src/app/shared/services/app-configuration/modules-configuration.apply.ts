import { WritableSignal } from '@angular/core';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import { replaceTextWithSeparator, toTitleCase } from '@shared/utility';
import {
  normalizeDropdownData,
  sortDropdownByLabel,
} from './configuration-dropdown.utils';

export interface ModulesConfigurationSignals {
  moduleNames: WritableSignal<IOptionDropdown[]>;
  modulesConfig: WritableSignal<
    Record<string, { label: string; actions: IOptionDropdown[] }>
  >;
}

/** Applies permission module-config dropdown into moduleNames / modulesConfig. */
export function applyModulesConfigDropdown(
  moduleConfigMap: Record<string, Record<string, unknown>>,
  signals: ModulesConfigurationSignals
): void {
  const modulesValue =
    moduleConfigMap[MODULE_NAMES.PERMISSION]?.[
      CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    ];

  if (Array.isArray(modulesValue)) {
    const moduleNameOptions: IOptionDropdown[] = modulesValue
      .filter((item): item is string => typeof item === 'string')
      .map(moduleName => ({
        label: toTitleCase(replaceTextWithSeparator(moduleName, '_', ' ')),
        value: moduleName,
      }))
      .sort(sortDropdownByLabel);

    signals.moduleNames.set(moduleNameOptions);
    return;
  }

  const modulesConfig = modulesValue as
    | Record<string, { label: string; actions: IOptionDropdown[] }>
    | undefined;

  if (modulesConfig && typeof modulesConfig === 'object') {
    signals.modulesConfig.set(modulesConfig);

    const moduleNameOptions: IOptionDropdown[] = Object.entries(modulesConfig)
      .map(([key, config]) => ({
        label: toTitleCase(config.label),
        value: key,
      }))
      .sort(sortDropdownByLabel);

    signals.moduleNames.set(moduleNameOptions);
  }
}

export function resetModulesConfigurationSignals(
  signals: ModulesConfigurationSignals
): void {
  signals.moduleNames.set([]);
  signals.modulesConfig.set({});
}

export function resolveModuleActionsByModuleName(
  moduleName: string,
  modulesConfig: Record<string, { label: string; actions: IOptionDropdown[] }>
): IOptionDropdown[] {
  const moduleConfig = modulesConfig[moduleName];

  if (!moduleConfig?.actions || !Array.isArray(moduleConfig.actions)) {
    return [];
  }

  return normalizeDropdownData(moduleConfig.actions);
}
