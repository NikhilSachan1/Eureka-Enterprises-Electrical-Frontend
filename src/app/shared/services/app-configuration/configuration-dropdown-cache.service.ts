import {
  computed,
  inject,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import {
  catchError,
  defer,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  take,
} from 'rxjs';

import { LoggerService } from '@core/services';
import { applyIconsToDropdownOptions } from '@shared/config/dropdown-option-icons.config';
import {
  CONFIGURATION_TYPE_DATA,
  SITE_ALLOCATION_STATUS_DATA,
} from '@shared/config/static-data.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import { replaceTextWithSeparator, toTitleCase } from '@shared/utility';
import { ConfigurationService } from '@features/settings-management/configuration-management/services/configuration.service';
import type { IConfigurationGetResponseDto } from '@features/settings-management/configuration-management/types/configuration.dto';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationDropdownCacheService {
  private static readonly CONFIGURATION_KEY_PAGE_SIZE = 20;
  private readonly logger = inject(LoggerService);
  private readonly configurationService = inject(ConfigurationService);

  private readonly configurationKeyCaches = new Map<
    string,
    Observable<IConfigurationGetResponseDto>
  >();
  private readonly loadedConfigurationKeys = new Set<string>();
  private readonly failedConfigurationKeys = new Set<string>();
  private readonly configurationKeyLoadScheduled = new Set<string>();
  private readonly pendingConfigurationKeys = new Set<string>();
  private configurationBatchScheduled = false;
  private readonly configurationKeyEmitters = new Map<
    string,
    ReplaySubject<IConfigurationGetResponseDto>
  >();
  /** Configuration keys touched while probing a one-shot table/detail mapper. */
  private configurationKeyCapture: Set<string> | null = null;
  private readonly _dropdownLoadingState = signal<Record<string, boolean>>({});

  private readonly _genders = signal<IOptionDropdown[]>([]);
  private readonly _employmentTypes = signal<IOptionDropdown[]>([]);
  private readonly _degrees = signal<IOptionDropdown[]>([]);
  private readonly _branches = signal<IOptionDropdown[]>([]);
  private readonly _designations = signal<IOptionDropdown[]>([]);
  private readonly _bloodGroups = signal<IOptionDropdown[]>([]);
  private readonly _passingYears = signal<IOptionDropdown[]>(
    this.buildPassingYearDropdownOptions()
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

  // Configuration-backed signals load their module on first read, then stay cached.
  readonly genders = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.GENDERS,
    this._genders
  );
  readonly employmentTypes = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.EMPLOYMENT_TYPES,
    this._employmentTypes
  );
  readonly degrees = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.DEGREES,
    this._degrees
  );
  readonly branches = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.BRANCHES,
    this._branches
  );
  readonly designations = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.DESIGNATIONS,
    this._designations
  );
  readonly bloodGroups = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.BLOOD_GROUPS,
    this._bloodGroups
  );
  readonly passingYears = this._passingYears.asReadonly();
  readonly bankNames = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.BANK_NAMES,
    this._bankNames
  );
  readonly states = this.lazyConfigSignal(
    MODULE_NAMES.COMMON,
    CONFIGURATION_KEYS.COMMON.STATES,
    this._states
  );
  readonly cities = this.lazyConfigSignal(
    MODULE_NAMES.COMMON,
    CONFIGURATION_KEYS.COMMON.CITIES,
    this._cities
  );
  readonly employeeStatus = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_STATUS,
    this._employeeStatus
  );
  readonly expenseCategories = this.lazyConfigSignal(
    MODULE_NAMES.EXPENSE,
    CONFIGURATION_KEYS.EXPENSE.CATEGORIES,
    this._expenseCategories
  );
  readonly expensePaymentMethods = this.lazyConfigSignal(
    MODULE_NAMES.EXPENSE,
    CONFIGURATION_KEYS.EXPENSE.PAYMENT_METHODS,
    this._expensePaymentMethods
  );
  readonly fuelExpensePaymentMethods = this.lazyConfigSignal(
    MODULE_NAMES.FUEL_EXPENSE,
    CONFIGURATION_KEYS.FUEL_EXPENSE.PAYMENT_METHODS,
    this._fuelExpensePaymentMethods
  );
  readonly attendanceStatus = this.lazyConfigSignal(
    MODULE_NAMES.ATTENDANCE,
    CONFIGURATION_KEYS.ATTENDANCE.STATUS,
    this._attendanceStatus
  );
  readonly approvalStatus = this.lazyConfigSignal(
    MODULE_NAMES.COMMON,
    CONFIGURATION_KEYS.COMMON.APPROVAL_STATUS,
    this._approvalStatus
  );
  readonly projectDocumentApprovalStatuses = this.lazyConfigSignal(
    MODULE_NAMES.FINANCIAL,
    CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_APPROVAL_STATUSES,
    this._projectDocumentApprovalStatuses
  );
  readonly partyTypes = this.lazyConfigSignal(
    MODULE_NAMES.FINANCIAL,
    CONFIGURATION_KEYS.PROJECT.PARTY_TYPES,
    this._partyTypes
  );
  readonly assetCategories = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.CATEGORY_LIST,
    this._assetCategories
  );
  readonly assetTypes = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.TYPE_LIST,
    this._assetTypes
  );
  readonly assetStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.STATUS_LIST,
    this._assetStatuses
  );
  readonly assetCalibrationSources = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.CALIBRATION_SOURCE_LIST,
    this._assetCalibrationSources
  );
  readonly assetCalibrationStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.CALIBRATION_STATUS_LIST,
    this._assetCalibrationStatuses
  );
  readonly assetWarrantyStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.WARRANTY_STATUS_LIST,
    this._assetWarrantyStatuses
  );
  readonly assetCalibrationFrequencies = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.CALIBRATION_FREQUENCY_LIST,
    this._assetCalibrationFrequencies
  );
  readonly assetEventStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.EVENT_STATUS_LIST,
    this._assetEventStatuses
  );
  readonly petroCardStatus = this.lazyConfigSignal(
    MODULE_NAMES.PETRO_CARD,
    CONFIGURATION_KEYS.PETRO_CARD.STATUS,
    this._petroCardStatus
  );
  readonly vehicleFuelTypes = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.FUEL_TYPE_LIST,
    this._vehicleFuelTypes
  );
  readonly vehicleStatuses = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.STATUS_LIST,
    this._vehicleStatuses
  );
  readonly vehicleDocumentStatuses = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.DOCUMENT_STATUS_LIST,
    this._vehicleDocumentStatuses
  );
  readonly vehicleServiceStatuses = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.SERVICE_ALERT_STATUS_LIST,
    this._vehicleServiceStatuses
  );
  readonly vehicleEventStatuses = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.EVENT_STATUS_LIST,
    this._vehicleEventStatuses
  );
  readonly vehicleServiceTypes = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.SERVICE_TYPE_LIST,
    this._vehicleServiceTypes
  );
  readonly vehicleServiceStatus = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.SERVICE_STATUS,
    this._vehicleServiceStatus
  );
  readonly payrollStatus = this.lazyConfigSignal(
    MODULE_NAMES.PAYROLL,
    CONFIGURATION_KEYS.PAYROLL.STATUS,
    this._payrollStatus
  );
  readonly companyStatus = this.lazyConfigSignal(
    MODULE_NAMES.COMPANY,
    CONFIGURATION_KEYS.COMPANY.COMPANY_STATUS,
    this._companyStatus
  );
  readonly contractorStatus = this.lazyConfigSignal(
    MODULE_NAMES.CONTRACTOR,
    CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_STATUS,
    this._contractorStatus
  );
  readonly vendorTypes = this.lazyConfigSignal(
    MODULE_NAMES.VENDOR,
    CONFIGURATION_KEYS.VENDOR.VENDOR_TYPES,
    this._vendorTypes
  );
  readonly projectSiteTypes = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.PROJECT_TYPES,
    this._projectSiteTypes
  );
  readonly projectStatus = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.PROJECT_STATUS,
    this._projectStatus
  );
  readonly projectAllocationStatuses =
    this._projectAllocationStatuses.asReadonly();
  readonly siteRoles = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.SITE_ROLES,
    this._siteRoles
  );
  readonly poGstTypes = this.lazyConfigSignal(
    MODULE_NAMES.PURCHASE_ORDER,
    CONFIGURATION_KEYS.PURCHASE_ORDER.GST_TYPES,
    this._poGstTypes
  );
  readonly poTypes = this.lazyConfigSignal(
    MODULE_NAMES.PURCHASE_ORDER,
    CONFIGURATION_KEYS.PURCHASE_ORDER.PO_TYPES,
    this._poTypes
  );
  readonly units = this.lazyConfigSignal(
    MODULE_NAMES.PURCHASE_ORDER,
    CONFIGURATION_KEYS.PURCHASE_ORDER.UNITS,
    this._units
  );
  readonly projectWorkTypes = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.PROJECT_WORK_TYPES,
    this._projectWorkTypes
  );
  readonly projectDocumentTypes = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_TYPES,
    this._projectDocumentTypes
  );
  readonly moduleNames = this.lazyConfigSignal(
    MODULE_NAMES.PERMISSION,
    CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN,
    this._moduleNames
  );
  readonly modulesConfig = computed(() => {
    this.ensureConfigurationForKey(
      MODULE_NAMES.PERMISSION,
      CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    );
    return this._modulesConfig();
  });
  readonly announcementStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ANNOUNCEMENT,
    CONFIGURATION_KEYS.ANNOUNCEMENT.ANNOUNCEMENT_STATUS,
    this._announcementStatuses
  );
  readonly paymentSheetStatuses = this.lazyConfigSignal(
    MODULE_NAMES.PAYMENTS,
    CONFIGURATION_KEYS.PAYMENTS.SHEET_STATUSES,
    this._paymentSheetStatuses
  );
  readonly paymentSheetStages = this.lazyConfigSignal(
    MODULE_NAMES.PAYMENTS,
    CONFIGURATION_KEYS.PAYMENTS.SHEET_STAGES,
    this._paymentSheetStages
  );
  readonly paymentSheetItemStatuses = this.lazyConfigSignal(
    MODULE_NAMES.PAYMENTS,
    CONFIGURATION_KEYS.PAYMENTS.ITEM_STATUSES,
    this._paymentSheetItemStatuses
  );
  readonly configurationTypes = this.lazyConfigSignal(
    MODULE_NAMES.CONFIGURATION,
    CONFIGURATION_KEYS.CONFIGURATION.CONFIGURATION_TYPE_DROPDOWN,
    this._configurationTypes
  );

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

  /**
   * Drops all configuration-key HTTP caches and resets dropdown signals.
   * Next read of a config-backed signal refetches from the API.
   */
  invalidateConfigurationKeyCaches(): void {
    this.configurationKeyCaches.clear();
    this.loadedConfigurationKeys.clear();
    this.failedConfigurationKeys.clear();
    this.configurationKeyLoadScheduled.clear();
    this.pendingConfigurationKeys.clear();
    this.configurationKeyEmitters.clear();
    this.resetAllConfigurationSignals();
  }

  /**
   * Invalidates specific configuration keys (cache + related signals).
   * Use after configuration add/edit so dropdowns pick up the new values.
   */
  invalidateConfigurationKeys(keys: string[]): void {
    if (keys.length === 0) {
      return;
    }

    const resolvedKeys = new Set<string>();
    for (const key of keys) {
      const resolved = this.resolveConfigurationKey('', key) ?? key;
      if (resolved) {
        resolvedKeys.add(resolved);
      }
    }

    for (const configurationKey of resolvedKeys) {
      this.configurationKeyCaches.delete(configurationKey);
      this.loadedConfigurationKeys.delete(configurationKey);
      this.failedConfigurationKeys.delete(configurationKey);
      this.configurationKeyLoadScheduled.delete(configurationKey);
      this.pendingConfigurationKeys.delete(configurationKey);
      this.configurationKeyEmitters.delete(configurationKey);
      this.resetSignalsForConfigurationKey(configurationKey);
    }
  }

  private resetAllConfigurationSignals(): void {
    Object.entries(this.MODULE_DROPDOWN_REGISTRY).forEach(
      ([moduleName, dropdowns]) => {
        dropdowns.forEach(dropdown => {
          if (dropdown.key === CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS) {
            dropdown.signal.set(this.buildPassingYearDropdownOptions());
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

  private resetSignalsForConfigurationKey(configurationKey: string): void {
    if (configurationKey === CONFIGURATION_KEYS.GEOGRAPHY.LOCATION) {
      this._states.set([]);
      this._cities.set([]);
      this._stateCityMap.set({});
      return;
    }

    if (
      configurationKey ===
      CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    ) {
      this._moduleNames.set([]);
      this._modulesConfig.set({});
      return;
    }

    Object.entries(this.MODULE_DROPDOWN_REGISTRY).forEach(
      ([moduleName, dropdowns]) => {
        dropdowns.forEach(dropdown => {
          if (dropdown.key !== configurationKey) {
            return;
          }
          if (dropdown.key === CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS) {
            return;
          }
          const fallback =
            this.STATIC_FALLBACK_DATA[moduleName]?.[dropdown.key];
          dropdown.signal.set(fallback ? [...fallback] : []);
        });
      }
    );
  }

  /**
   * Runs a one-shot mapper (table row or detail view) after the configuration
   * keys it reads have loaded. Already-cached keys resolve immediately.
   */
  runAfterTouchedConfiguration<T>(work: () => T, apply: (value: T) => void): void {
    this.afterTouchedConfiguration(work).pipe(take(1)).subscribe(apply);
  }

  afterTouchedConfiguration<T>(work: () => T): Observable<T> {
    return defer(() => {
      const touched = new Set<string>();
      const previousCapture = this.configurationKeyCapture;
      this.configurationKeyCapture = touched;

      let preview: T;
      try {
        preview = work();
      } finally {
        this.configurationKeyCapture = previousCapture;
      }

      const pending = [...touched].filter(
        configurationKey =>
          !this.loadedConfigurationKeys.has(configurationKey) &&
          !this.failedConfigurationKeys.has(configurationKey)
      );

      if (pending.length === 0) {
        return of(preview);
      }

      return this.whenConfigurationKeysSettled(pending).pipe(
        map(() => work())
      );
    });
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

  isConfigurationKeyLoading(moduleName: string, key: string): boolean {
    const configurationKey = this.resolveConfigurationKey(moduleName, key);
    if (!configurationKey) {
      return false;
    }

    if (
      this.loadedConfigurationKeys.has(configurationKey) ||
      this.failedConfigurationKeys.has(configurationKey)
    ) {
      return false;
    }

    return (
      this.configurationKeyLoadScheduled.has(configurationKey) ||
      this.isDropdownLoading(this.configurationLoadingKey(configurationKey))
    );
  }

  /**
   * Get cities based on selected state
   * @param stateValue - The value of the selected state
   * @returns Array of city options for the given state
   */
  getCitiesByState(stateValue: string): IOptionDropdown[] {
    this.ensureConfigurationForKey(
      MODULE_NAMES.GEOGRAPHY,
      CONFIGURATION_KEYS.GEOGRAPHY.LOCATION
    );

    if (!stateValue) {
      return [];
    }

    // Try dynamic data first, then fallback to static
    const dynamicCities = this._stateCityMap()[stateValue];
    if (dynamicCities && Array.isArray(dynamicCities)) {
      return dynamicCities
        .map(city => ({
          label: toTitleCase(city),
          value: city,
        }))
        .sort(this.sortByLabel);
    }

    return this.cities().filter(city => city.value === stateValue);
  }

  getModuleActionsByModuleName(moduleName: string): IOptionDropdown[] {
    this.ensureConfigurationForKey(
      MODULE_NAMES.PERMISSION,
      CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    );
    const config = this._modulesConfig();
    const moduleConfig = config[moduleName];

    if (!moduleConfig?.actions || !Array.isArray(moduleConfig.actions)) {
      return [];
    }

    return this.normalizeDropdownData(moduleConfig.actions);
  }

  ensureConfigurationForKey(moduleName: string, key: string): void {
    const configurationKey = this.resolveConfigurationKey(moduleName, key);
    if (!configurationKey) {
      return;
    }

    this.configurationKeyCapture?.add(configurationKey);

    if (
      this.loadedConfigurationKeys.has(configurationKey) ||
      this.failedConfigurationKeys.has(configurationKey) ||
      this.configurationKeyLoadScheduled.has(configurationKey)
    ) {
      return;
    }

    this.configurationKeyLoadScheduled.add(configurationKey);

    queueMicrotask(() => {
      this.loadConfigurationKey(configurationKey)
        .pipe(take(1))
        .subscribe({
          error: error =>
            this.logger.warn(
              `Configuration key load failed: ${configurationKey}`,
              error
            ),
        });
    });
  }

  isDropdownLoading(dropdownKey: string): boolean {
    return !!this._dropdownLoadingState()[dropdownKey];
  }

  buildPassingYearDropdownOptions(): IOptionDropdown[] {
    const PASSING_YEAR_START = 2016;
    const endYear = new Date().getFullYear();
    const options: IOptionDropdown[] = [];
    for (let year = PASSING_YEAR_START; year <= endYear; year++) {
      const y = String(year);
      options.push({ label: y, value: y });
    }
    return options;
  }

  private lazyConfigSignal(
    moduleName: string,
    key: string,
    source: WritableSignal<IOptionDropdown[]>
  ): Signal<IOptionDropdown[]> {
    const read = source.asReadonly();
    return computed(() => {
      this.ensureConfigurationForKey(moduleName, key);
      return read();
    });
  }

  private configurationLoadingKey(configurationKey: string): string {
    return `config-key:${configurationKey}`;
  }

  private configurationExcludedKeys(): Set<string> {
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
  private resolveConfigurationKey(
    _moduleName: string,
    key: string
  ): string | null {
    if (this.configurationExcludedKeys().has(key)) {
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

  private whenConfigurationKeysSettled(
    configurationKeys: string[]
  ): Observable<void> {
    if (configurationKeys.length === 0) {
      return of(undefined);
    }

    return forkJoin(
      configurationKeys.map(configurationKey =>
        this.loadConfigurationKey(configurationKey).pipe(
          take(1),
          catchError(() => of(null))
        )
      )
    ).pipe(map(() => undefined));
  }

  private loadConfigurationKey(
    configurationKey: string
  ): Observable<IConfigurationGetResponseDto> {
    const existing = this.configurationKeyCaches.get(configurationKey);
    if (existing) {
      return existing;
    }

    const emitter = new ReplaySubject<IConfigurationGetResponseDto>(1);
    this.configurationKeyEmitters.set(configurationKey, emitter);
    this.configurationKeyLoadScheduled.add(configurationKey);
    this.pendingConfigurationKeys.add(configurationKey);
    this.scheduleConfigurationBatch();

    const request$ = emitter.asObservable();
    this.configurationKeyCaches.set(configurationKey, request$);
    return request$;
  }

  private scheduleConfigurationBatch(): void {
    if (this.configurationBatchScheduled) {
      return;
    }
    this.configurationBatchScheduled = true;
    queueMicrotask(() => {
      this.configurationBatchScheduled = false;
      const configurationKeys = [...this.pendingConfigurationKeys];
      this.pendingConfigurationKeys.clear();
      if (configurationKeys.length === 0) {
        return;
      }

      this.fetchConfigurationKeys(configurationKeys).subscribe({
        next: response =>
          this.publishConfigurationBatch(configurationKeys, response),
        error: error => {
          for (const configurationKey of configurationKeys) {
            this.configurationKeyCaches.delete(configurationKey);
            this.configurationKeyLoadScheduled.delete(configurationKey);
            this.failedConfigurationKeys.add(configurationKey);
            this.applyConfigurationKey(configurationKey, {
              records: [],
              totalRecords: 0,
            });
            this.logger.logUserAction(
              `Failed to load configuration key: ${configurationKey}`,
              error
            );
            const emitter = this.configurationKeyEmitters.get(configurationKey);
            this.configurationKeyEmitters.delete(configurationKey);
            emitter?.error(error);
          }
        },
      });
    });
  }

  private publishConfigurationBatch(
    configurationKeys: string[],
    response: IConfigurationGetResponseDto
  ): void {
    const recordsByKey = new Map<
      string,
      IConfigurationGetResponseDto['records']
    >();
    for (const record of response.records) {
      const records = recordsByKey.get(record.key) ?? [];
      records.push(record);
      recordsByKey.set(record.key, records);
    }

    for (const configurationKey of configurationKeys) {
      const records = recordsByKey.get(configurationKey) ?? [];
      const emitter = this.configurationKeyEmitters.get(configurationKey);
      this.configurationKeyEmitters.delete(configurationKey);
      this.configurationKeyLoadScheduled.delete(configurationKey);
      this.applyConfigurationKey(configurationKey, {
        records,
        totalRecords: records.length,
      });
      this.loadedConfigurationKeys.add(configurationKey);
      emitter?.next({ records, totalRecords: records.length });
      emitter?.complete();
    }
  }

  private fetchConfigurationKeys(
    configurationKeys: string[]
  ): Observable<IConfigurationGetResponseDto> {
    this.logger.logUserAction('Load configuration keys', {
      configurationKeys,
    });

    const pageSize =
      ConfigurationDropdownCacheService.CONFIGURATION_KEY_PAGE_SIZE;
    const listPayload = {
      pageSize,
      key: configurationKeys,
      sortField: 'createdAt' as const,
      sortOrder: 'DESC' as const,
    };
    configurationKeys.forEach(configurationKey =>
      this.setDropdownLoading(this.configurationLoadingKey(configurationKey), true)
    );

    return this.configurationService
      .getConfigurationList({
        ...listPayload,
        page: 1,
      })
      .pipe(
        switchMap(firstPage => {
          if (firstPage.totalRecords <= firstPage.records.length) {
            return of(firstPage);
          }

          const pageCount = Math.ceil(firstPage.totalRecords / pageSize);
          const remainingPages = Array.from(
            { length: pageCount - 1 },
            (_, index) =>
              this.configurationService.getConfigurationList({
                ...listPayload,
                page: index + 2,
              })
          );

          return forkJoin(remainingPages).pipe(
            map(pages =>
              this.mergeConfigurationListPages([firstPage, ...pages])
            )
          );
        }),
        finalize(() => {
          configurationKeys.forEach(configurationKey =>
            this.setDropdownLoading(
              this.configurationLoadingKey(configurationKey),
              false
            )
          );
        })
      );
  }

  private mergeConfigurationListPages(
    responses: IConfigurationGetResponseDto[]
  ): IConfigurationGetResponseDto {
    const records = responses.flatMap(response => response.records);

    return {
      records,
      totalRecords: responses[0]?.totalRecords ?? records.length,
    };
  }

  private applyConfigurationKey(
    configurationKey: string,
    response: IConfigurationGetResponseDto
  ): void {
    const moduleConfigMap = this.buildModuleConfigMap(response);

    if (configurationKey === CONFIGURATION_KEYS.GEOGRAPHY.LOCATION) {
      this.handleGeographyLocationConfig(moduleConfigMap);
      return;
    }

    if (
      configurationKey === CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    ) {
      this.handleModulesConfigDropdown(moduleConfigMap);
      return;
    }

    Object.entries(this.MODULE_DROPDOWN_REGISTRY).forEach(
      ([moduleName, dropdowns]) => {
        dropdowns.forEach(dropdown => {
          if (dropdown.key !== configurationKey) {
            return;
          }

          const apiValue = moduleConfigMap[moduleName]?.[dropdown.key];
          const staticFallback =
            this.STATIC_FALLBACK_DATA[moduleName]?.[dropdown.key];
          let nextValue: IOptionDropdown[] = [];

          if (Array.isArray(apiValue)) {
            nextValue = this.isPurchaseOrderConfiguredDropdown(dropdown.key)
              ? this.mapLabeledDropdownOptions(apiValue)
              : this.normalizeDropdownData(apiValue);
          } else if (staticFallback) {
            nextValue = staticFallback;
          } else if (apiValue === undefined) {
            return;
          }

          nextValue = applyIconsToDropdownOptions(dropdown.key, nextValue);

          if (dropdown.signal() !== nextValue) {
            dropdown.signal.set(nextValue);
          }
        });
      }
    );
  }

  private handleModulesConfigDropdown(
    moduleConfigMap: Record<string, Record<string, unknown>>
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
        .sort(this.sortByLabel);

      this._moduleNames.set(moduleNameOptions);
      return;
    }

    const modulesConfig = modulesValue as
      | Record<string, { label: string; actions: IOptionDropdown[] }>
      | undefined;

    if (modulesConfig && typeof modulesConfig === 'object') {
      this._modulesConfig.set(modulesConfig);

      const moduleNameOptions: IOptionDropdown[] = Object.entries(modulesConfig)
        .map(([key, config]) => ({
          label: toTitleCase(config.label),
          value: key,
        }))
        .sort(this.sortByLabel);

      this._moduleNames.set(moduleNameOptions);
    }
  }

  private handleGeographyLocationConfig(
    moduleConfigMap: Record<string, Record<string, unknown>>
  ): void {
    const locationConfig = moduleConfigMap[MODULE_NAMES.GEOGRAPHY]?.[
      CONFIGURATION_KEYS.GEOGRAPHY.LOCATION
    ] as Record<string, string[]> | undefined;

    if (locationConfig && typeof locationConfig === 'object') {
      // Store the state-city mapping for getCitiesByState
      this._stateCityMap.set(locationConfig);

      // Populate states dropdown from the keys (state names)
      const stateOptions: IOptionDropdown[] = Object.keys(locationConfig)
        .sort()
        .map(stateName => ({
          label: toTitleCase(stateName),
          value: stateName,
        }));

      this._states.set(stateOptions);

      // Populate all cities dropdown (flattened list)
      const allCities: IOptionDropdown[] = Object.values(locationConfig)
        .flat()
        .sort()
        .filter((city, index, self) => self.indexOf(city) === index)
        .map(city => ({
          label: toTitleCase(city),
          value: city,
        }));

      this._cities.set(allCities);
    }
  }

  private withDropdownLoading<T>(
    dropdownKey: string,
    source$: Observable<T>
  ): Observable<T> {
    this.setDropdownLoading(dropdownKey, true);
    return source$.pipe(
      finalize(() => this.setDropdownLoading(dropdownKey, false))
    );
  }

  private setDropdownLoading(dropdownKey: string, loading: boolean): void {
    this._dropdownLoadingState.update(prev => ({
      ...prev,
      [dropdownKey]: loading,
    }));
  }

  private isPurchaseOrderConfiguredDropdown(key: string): boolean {
    return (
      key === CONFIGURATION_KEYS.PURCHASE_ORDER.GST_TYPES ||
      key === CONFIGURATION_KEYS.PURCHASE_ORDER.PO_TYPES ||
      key === CONFIGURATION_KEYS.PURCHASE_ORDER.UNITS
    );
  }

  private mapLabeledDropdownOptions(data: unknown[]): IOptionDropdown[] {
    return data
      .map(item => {
        const obj = item as { label?: string; value?: string; name?: string };
        const value = String(obj.value ?? obj.name ?? '').trim();
        const label = String(obj.label ?? value).trim();
        return { label, value };
      })
      .filter(option => option.value.length > 0);
  }

  private normalizeDropdownData(data: unknown[]): IOptionDropdown[] {
    return data
      .map(item => {
        const obj = item as { label: string; value?: string; name?: string };
        const rawLabel = obj.label ?? '';
        // "NA" ko as-is rakhna, toTitleCase se "Na" na bane
        const label =
          rawLabel.toUpperCase() === 'N/A' ? 'N/A' : toTitleCase(rawLabel);
        return {
          label,
          value: obj.value ?? obj.name ?? '',
        };
      })
      .sort(this.sortByLabel);
  }

  /**
   * Sorting comparator for dropdown options by label
   */
  private sortByLabel = (a: IOptionDropdown, b: IOptionDropdown): number => {
    return a.label.localeCompare(b.label);
  };

  private buildModuleConfigMap(
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
}
