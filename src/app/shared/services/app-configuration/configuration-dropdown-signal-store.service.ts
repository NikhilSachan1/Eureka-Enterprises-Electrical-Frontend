import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import {
  CONFIGURATION_TYPE_DATA,
  SITE_ALLOCATION_STATUS_DATA,
} from '@shared/config/static-data.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';

import { buildPassingYearDropdownOptions } from './configuration-dropdown.utils';
import {
  resetGeographyConfigurationSignals,
  type GeographyConfigurationSignals,
} from './geography-configuration.apply';
import {
  resetModulesConfigurationSignals,
  type ModulesConfigurationSignals,
} from './modules-configuration.apply';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationDropdownSignalStore {
  private readonly _genders = signal<IOptionDropdown[]>([]);
  private readonly _employmentTypes = signal<IOptionDropdown[]>([]);
  private readonly _degrees = signal<IOptionDropdown[]>([]);
  private readonly _branches = signal<IOptionDropdown[]>([]);
  private readonly _designations = signal<IOptionDropdown[]>([]);
  private readonly _bloodGroups = signal<IOptionDropdown[]>([]);
  private readonly _passingYears = signal<IOptionDropdown[]>(
    buildPassingYearDropdownOptions()
  );
  private readonly _bankNames = signal<IOptionDropdown[]>([]);
  private readonly _states = signal<IOptionDropdown[]>([]);
  private readonly _cities = signal<IOptionDropdown[]>([]);
  private readonly _stateCityMap = signal<Record<string, string[]>>({});
  private readonly _employeeStatus = signal<IOptionDropdown[]>([]);
  private readonly _expenseCategories = signal<IOptionDropdown[]>([]);
  private readonly _expensePaymentMethods = signal<IOptionDropdown[]>([]);
  private readonly _fuelExpensePaymentMethods = signal<IOptionDropdown[]>([]);
  private readonly _attendanceStatus = signal<IOptionDropdown[]>([]);
  private readonly _approvalStatus = signal<IOptionDropdown[]>([]);
  private readonly _projectDocumentApprovalStatuses = signal<IOptionDropdown[]>(
    []
  );
  private readonly _partyTypes = signal<IOptionDropdown[]>([]);
  private readonly _assetCategories = signal<IOptionDropdown[]>([]);
  private readonly _assetTypes = signal<IOptionDropdown[]>([]);
  private readonly _assetStatuses = signal<IOptionDropdown[]>([]);
  private readonly _assetCalibrationSources = signal<IOptionDropdown[]>([]);
  private readonly _assetCalibrationStatuses = signal<IOptionDropdown[]>([]);
  private readonly _assetWarrantyStatuses = signal<IOptionDropdown[]>([]);
  private readonly _assetCalibrationFrequencies = signal<IOptionDropdown[]>([]);
  private readonly _assetEventStatuses = signal<IOptionDropdown[]>([]);
  private readonly _petroCardStatus = signal<IOptionDropdown[]>([]);
  private readonly _vehicleFuelTypes = signal<IOptionDropdown[]>([]);
  private readonly _vehicleStatuses = signal<IOptionDropdown[]>([]);
  private readonly _vehicleDocumentStatuses = signal<IOptionDropdown[]>([]);
  private readonly _vehicleServiceStatuses = signal<IOptionDropdown[]>([]);
  private readonly _vehicleEventStatuses = signal<IOptionDropdown[]>([]);
  private readonly _vehicleServiceTypes = signal<IOptionDropdown[]>([]);
  private readonly _vehicleServiceStatus = signal<IOptionDropdown[]>([]);
  private readonly _payrollStatus = signal<IOptionDropdown[]>([]);
  private readonly _companyStatus = signal<IOptionDropdown[]>([]);
  private readonly _contractorStatus = signal<IOptionDropdown[]>([]);
  private readonly _vendorTypes = signal<IOptionDropdown[]>([]);
  private readonly _projectSiteTypes = signal<IOptionDropdown[]>([]);
  private readonly _projectStatus = signal<IOptionDropdown[]>([]);
  private readonly _projectAllocationStatuses = signal<IOptionDropdown[]>(
    SITE_ALLOCATION_STATUS_DATA
  );
  private readonly _siteRoles = signal<IOptionDropdown[]>([]);
  private readonly _poGstTypes = signal<IOptionDropdown[]>([]);
  private readonly _poTypes = signal<IOptionDropdown[]>([]);
  private readonly _units = signal<IOptionDropdown[]>([]);
  private readonly _projectWorkTypes = signal<IOptionDropdown[]>([]);
  private readonly _projectDocumentTypes = signal<IOptionDropdown[]>([]);
  private readonly _moduleNames = signal<IOptionDropdown[]>([]);
  private readonly _modulesConfig = signal<
    Record<string, { label: string; actions: IOptionDropdown[] }>
  >({});
  private readonly _announcementStatuses = signal<IOptionDropdown[]>([]);
  private readonly _paymentSheetStatuses = signal<IOptionDropdown[]>([]);
  private readonly _paymentSheetStages = signal<IOptionDropdown[]>([]);
  private readonly _paymentSheetItemStatuses = signal<IOptionDropdown[]>([]);
  private readonly _configurationTypes = signal<IOptionDropdown[]>([]);

  /** Writable signals for cache lazyConfigSignal wrappers. */
  readonly gendersSignal = this._genders;
  readonly employmentTypesSignal = this._employmentTypes;
  readonly degreesSignal = this._degrees;
  readonly branchesSignal = this._branches;
  readonly designationsSignal = this._designations;
  readonly bloodGroupsSignal = this._bloodGroups;
  readonly passingYearsSignal = this._passingYears;
  readonly bankNamesSignal = this._bankNames;
  readonly statesSignal = this._states;
  readonly citiesSignal = this._cities;
  readonly stateCityMapSignal = this._stateCityMap;
  readonly employeeStatusSignal = this._employeeStatus;
  readonly expenseCategoriesSignal = this._expenseCategories;
  readonly expensePaymentMethodsSignal = this._expensePaymentMethods;
  readonly fuelExpensePaymentMethodsSignal = this._fuelExpensePaymentMethods;
  readonly attendanceStatusSignal = this._attendanceStatus;
  readonly approvalStatusSignal = this._approvalStatus;
  readonly projectDocumentApprovalStatusesSignal =
    this._projectDocumentApprovalStatuses;
  readonly partyTypesSignal = this._partyTypes;
  readonly assetCategoriesSignal = this._assetCategories;
  readonly assetTypesSignal = this._assetTypes;
  readonly assetStatusesSignal = this._assetStatuses;
  readonly assetCalibrationSourcesSignal = this._assetCalibrationSources;
  readonly assetCalibrationStatusesSignal = this._assetCalibrationStatuses;
  readonly assetWarrantyStatusesSignal = this._assetWarrantyStatuses;
  readonly assetCalibrationFrequenciesSignal =
    this._assetCalibrationFrequencies;
  readonly assetEventStatusesSignal = this._assetEventStatuses;
  readonly petroCardStatusSignal = this._petroCardStatus;
  readonly vehicleFuelTypesSignal = this._vehicleFuelTypes;
  readonly vehicleStatusesSignal = this._vehicleStatuses;
  readonly vehicleDocumentStatusesSignal = this._vehicleDocumentStatuses;
  readonly vehicleServiceStatusesSignal = this._vehicleServiceStatuses;
  readonly vehicleEventStatusesSignal = this._vehicleEventStatuses;
  readonly vehicleServiceTypesSignal = this._vehicleServiceTypes;
  readonly vehicleServiceStatusSignal = this._vehicleServiceStatus;
  readonly payrollStatusSignal = this._payrollStatus;
  readonly companyStatusSignal = this._companyStatus;
  readonly contractorStatusSignal = this._contractorStatus;
  readonly vendorTypesSignal = this._vendorTypes;
  readonly projectSiteTypesSignal = this._projectSiteTypes;
  readonly projectStatusSignal = this._projectStatus;
  readonly projectAllocationStatusesSignal = this._projectAllocationStatuses;
  readonly siteRolesSignal = this._siteRoles;
  readonly poGstTypesSignal = this._poGstTypes;
  readonly poTypesSignal = this._poTypes;
  readonly unitsSignal = this._units;
  readonly projectWorkTypesSignal = this._projectWorkTypes;
  readonly projectDocumentTypesSignal = this._projectDocumentTypes;
  readonly moduleNamesSignal = this._moduleNames;
  readonly modulesConfigSignal = this._modulesConfig;
  readonly announcementStatusesSignal = this._announcementStatuses;
  readonly paymentSheetStatusesSignal = this._paymentSheetStatuses;
  readonly paymentSheetStagesSignal = this._paymentSheetStages;
  readonly paymentSheetItemStatusesSignal = this._paymentSheetItemStatuses;
  readonly configurationTypesSignal = this._configurationTypes;

  readonly geographySignals: GeographyConfigurationSignals = {
    states: this._states,
    cities: this._cities,
    stateCityMap: this._stateCityMap,
  };

  readonly modulesSignals: ModulesConfigurationSignals = {
    moduleNames: this._moduleNames,
    modulesConfig: this._modulesConfig,
  };

  private readonly STATIC_FALLBACK_DATA: Record<
    string,
    Record<string, IOptionDropdown[]>
  > = {
    [MODULE_NAMES.CONFIGURATION]: {
      [CONFIGURATION_KEYS.CONFIGURATION.CONFIGURATION_TYPE_DROPDOWN]:
        CONFIGURATION_TYPE_DATA,
    },
    [MODULE_NAMES.PROJECT]: {
      [CONFIGURATION_KEYS.PROJECT.ALLOCATION_STATUS]:
        SITE_ALLOCATION_STATUS_DATA,
    },
  };

  private readonly MODULE_DROPDOWN_REGISTRY: Record<
    string,
    readonly { key: string; signal: WritableSignal<IOptionDropdown[]> }[]
  > = {
    [MODULE_NAMES.EMPLOYEE]: [
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.GENDERS,
        signal: this._genders,
      },
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYMENT_TYPES,
        signal: this._employmentTypes,
      },
      { key: CONFIGURATION_KEYS.EMPLOYEE.DEGREES, signal: this._degrees },
      { key: CONFIGURATION_KEYS.EMPLOYEE.BRANCHES, signal: this._branches },
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.DESIGNATIONS,
        signal: this._designations,
      },
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.BLOOD_GROUPS,
        signal: this._bloodGroups,
      },
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS,
        signal: this._passingYears,
      },
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.BANK_NAMES,
        signal: this._bankNames,
      },
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_STATUS,
        signal: this._employeeStatus,
      },
    ],
    [MODULE_NAMES.EXPENSE]: [
      {
        key: CONFIGURATION_KEYS.EXPENSE.CATEGORIES,
        signal: this._expenseCategories,
      },
      {
        key: CONFIGURATION_KEYS.EXPENSE.PAYMENT_METHODS,
        signal: this._expensePaymentMethods,
      },
    ],
    [MODULE_NAMES.FUEL_EXPENSE]: [
      {
        key: CONFIGURATION_KEYS.FUEL_EXPENSE.PAYMENT_METHODS,
        signal: this._fuelExpensePaymentMethods,
      },
    ],
    [MODULE_NAMES.ATTENDANCE]: [
      {
        key: CONFIGURATION_KEYS.ATTENDANCE.STATUS,
        signal: this._attendanceStatus,
      },
    ],
    [MODULE_NAMES.COMMON]: [
      {
        key: CONFIGURATION_KEYS.COMMON.APPROVAL_STATUS,
        signal: this._approvalStatus,
      },
      {
        key: CONFIGURATION_KEYS.COMMON.STATES,
        signal: this._states,
      },
      {
        key: CONFIGURATION_KEYS.COMMON.CITIES,
        signal: this._cities,
      },
    ],
    [MODULE_NAMES.VEHICLE]: [
      {
        key: CONFIGURATION_KEYS.VEHICLE.FUEL_TYPE_LIST,
        signal: this._vehicleFuelTypes,
      },
      {
        key: CONFIGURATION_KEYS.VEHICLE.STATUS_LIST,
        signal: this._vehicleStatuses,
      },
      {
        key: CONFIGURATION_KEYS.VEHICLE.DOCUMENT_STATUS_LIST,
        signal: this._vehicleDocumentStatuses,
      },
      {
        key: CONFIGURATION_KEYS.VEHICLE.SERVICE_ALERT_STATUS_LIST,
        signal: this._vehicleServiceStatuses,
      },
      {
        key: CONFIGURATION_KEYS.VEHICLE.EVENT_STATUS_LIST,
        signal: this._vehicleEventStatuses,
      },
      {
        key: CONFIGURATION_KEYS.VEHICLE.SERVICE_TYPE_LIST,
        signal: this._vehicleServiceTypes,
      },
      {
        key: CONFIGURATION_KEYS.VEHICLE.SERVICE_STATUS,
        signal: this._vehicleServiceStatus,
      },
    ],
    [MODULE_NAMES.ASSET]: [
      {
        key: CONFIGURATION_KEYS.ASSET.CATEGORY_LIST,
        signal: this._assetCategories,
      },
      {
        key: CONFIGURATION_KEYS.ASSET.TYPE_LIST,
        signal: this._assetTypes,
      },
      {
        key: CONFIGURATION_KEYS.ASSET.STATUS_LIST,
        signal: this._assetStatuses,
      },
      {
        key: CONFIGURATION_KEYS.ASSET.CALIBRATION_SOURCE_LIST,
        signal: this._assetCalibrationSources,
      },
      {
        key: CONFIGURATION_KEYS.ASSET.CALIBRATION_STATUS_LIST,
        signal: this._assetCalibrationStatuses,
      },
      {
        key: CONFIGURATION_KEYS.ASSET.WARRANTY_STATUS_LIST,
        signal: this._assetWarrantyStatuses,
      },
      {
        key: CONFIGURATION_KEYS.ASSET.CALIBRATION_FREQUENCY_LIST,
        signal: this._assetCalibrationFrequencies,
      },
      {
        key: CONFIGURATION_KEYS.ASSET.EVENT_STATUS_LIST,
        signal: this._assetEventStatuses,
      },
    ],
    [MODULE_NAMES.PETRO_CARD]: [
      {
        key: CONFIGURATION_KEYS.PETRO_CARD.STATUS,
        signal: this._petroCardStatus,
      },
    ],
    [MODULE_NAMES.PAYROLL]: [
      {
        key: CONFIGURATION_KEYS.PAYROLL.STATUS,
        signal: this._payrollStatus,
      },
    ],
    [MODULE_NAMES.COMPANY]: [
      {
        key: CONFIGURATION_KEYS.COMPANY.COMPANY_STATUS,
        signal: this._companyStatus,
      },
    ],
    [MODULE_NAMES.CONTRACTOR]: [
      {
        key: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_STATUS,
        signal: this._contractorStatus,
      },
    ],
    [MODULE_NAMES.VENDOR]: [
      {
        key: CONFIGURATION_KEYS.VENDOR.VENDOR_TYPES,
        signal: this._vendorTypes,
      },
    ],
    [MODULE_NAMES.PROJECT]: [
      {
        key: CONFIGURATION_KEYS.PROJECT.PROJECT_TYPES,
        signal: this._projectSiteTypes,
      },
      {
        key: CONFIGURATION_KEYS.PROJECT.PROJECT_STATUS,
        signal: this._projectStatus,
      },
      {
        key: CONFIGURATION_KEYS.PROJECT.ALLOCATION_STATUS,
        signal: this._projectAllocationStatuses,
      },
      {
        key: CONFIGURATION_KEYS.PROJECT.SITE_ROLES,
        signal: this._siteRoles,
      },
      {
        key: CONFIGURATION_KEYS.PROJECT.PROJECT_WORK_TYPES,
        signal: this._projectWorkTypes,
      },
      {
        key: CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_TYPES,
        signal: this._projectDocumentTypes,
      },
    ],
    [MODULE_NAMES.FINANCIAL]: [
      {
        key: CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_APPROVAL_STATUSES,
        signal: this._projectDocumentApprovalStatuses,
      },
      {
        key: CONFIGURATION_KEYS.PROJECT.PARTY_TYPES,
        signal: this._partyTypes,
      },
    ],
    [MODULE_NAMES.PURCHASE_ORDER]: [
      {
        key: CONFIGURATION_KEYS.PURCHASE_ORDER.GST_TYPES,
        signal: this._poGstTypes,
      },
      {
        key: CONFIGURATION_KEYS.PURCHASE_ORDER.PO_TYPES,
        signal: this._poTypes,
      },
      {
        key: CONFIGURATION_KEYS.PURCHASE_ORDER.UNITS,
        signal: this._units,
      },
    ],
    [MODULE_NAMES.PERMISSION]: [
      {
        key: CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN,
        signal: this._moduleNames,
      },
    ],
    [MODULE_NAMES.ANNOUNCEMENT]: [
      {
        key: CONFIGURATION_KEYS.ANNOUNCEMENT.ANNOUNCEMENT_STATUS,
        signal: this._announcementStatuses,
      },
    ],
    [MODULE_NAMES.PAYMENTS]: [
      {
        key: CONFIGURATION_KEYS.PAYMENTS.SHEET_STATUSES,
        signal: this._paymentSheetStatuses,
      },
      {
        key: CONFIGURATION_KEYS.PAYMENTS.SHEET_STAGES,
        signal: this._paymentSheetStages,
      },
      {
        key: CONFIGURATION_KEYS.PAYMENTS.ITEM_STATUSES,
        signal: this._paymentSheetItemStatuses,
      },
    ],
    [MODULE_NAMES.CONFIGURATION]: [
      {
        key: CONFIGURATION_KEYS.CONFIGURATION.CONFIGURATION_TYPE_DROPDOWN,
        signal: this._configurationTypes,
      },
    ],
  };

  get registry(): typeof this.MODULE_DROPDOWN_REGISTRY {
    return this.MODULE_DROPDOWN_REGISTRY;
  }

  get staticFallbackData(): typeof this.STATIC_FALLBACK_DATA {
    return this.STATIC_FALLBACK_DATA;
  }

  getRegistrySignal(
    module: string,
    key: string
  ): Signal<IOptionDropdown[]> | null {
    const entry = this.MODULE_DROPDOWN_REGISTRY[module]?.find(
      dropdown => dropdown.key === key
    );
    return entry ? entry.signal.asReadonly() : null;
  }

  applyMappedDropdown(
    module: string,
    key: string,
    nextValue: IOptionDropdown[]
  ): void {
    const entry = this.MODULE_DROPDOWN_REGISTRY[module]?.find(
      dropdown => dropdown.key === key
    );
    if (!entry) {
      return;
    }
    if (entry.signal() !== nextValue) {
      entry.signal.set(nextValue);
    }
  }

  resetAllConfigurationSignals(): void {
    Object.entries(this.MODULE_DROPDOWN_REGISTRY).forEach(
      ([moduleName, dropdowns]) => {
        dropdowns.forEach(dropdown => {
          if (dropdown.key === CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS) {
            dropdown.signal.set(buildPassingYearDropdownOptions());
            return;
          }
          const fallback =
            this.STATIC_FALLBACK_DATA[moduleName]?.[dropdown.key];
          dropdown.signal.set(fallback ? [...fallback] : []);
        });
      }
    );
    this._stateCityMap.set({});
    this._modulesConfig.set({});
  }

  resetSignalsForConfigurationKey(configurationKey: string): void {
    if (configurationKey === CONFIGURATION_KEYS.GEOGRAPHY.LOCATION) {
      resetGeographyConfigurationSignals(this.geographySignals);
      return;
    }

    if (
      configurationKey === CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    ) {
      resetModulesConfigurationSignals(this.modulesSignals);
      return;
    }

    if (configurationKey === CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS) {
      this._passingYears.set(buildPassingYearDropdownOptions());
      return;
    }

    Object.entries(this.MODULE_DROPDOWN_REGISTRY).forEach(
      ([moduleName, dropdowns]) => {
        dropdowns.forEach(dropdown => {
          if (dropdown.key !== configurationKey) {
            return;
          }
          const fallback =
            this.STATIC_FALLBACK_DATA[moduleName]?.[dropdown.key];
          dropdown.signal.set(fallback ? [...fallback] : []);
        });
      }
    );
  }
}
