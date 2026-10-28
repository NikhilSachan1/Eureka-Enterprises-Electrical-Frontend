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
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import { ConfigurationService } from '@features/settings-management/configuration-management/services/configuration.service';
import type { IConfigurationGetResponseDto } from '@features/settings-management/configuration-management/types/configuration.dto';

import {
  buildModuleConfigMap,
  buildPassingYearDropdownOptions,
  configurationLoadingKey,
  mapApiDropdownValue,
  mergeConfigurationListPages,
  resolveConfigurationKey,
} from './configuration-dropdown.utils';
import { ConfigurationDropdownSignalStore } from './configuration-dropdown-signal-store.service';
import {
  applyGeographyLocationConfig,
  resolveCitiesByState,
} from './geography-configuration.apply';
import {
  applyModulesConfigDropdown,
  resolveModuleActionsByModuleName,
} from './modules-configuration.apply';

/**
 * Loads configuration-backed dropdowns (batched HTTP) and exposes lazy signals.
 * Signal ownership lives in {@link ConfigurationDropdownSignalStore};
 * geography / modules apply logic lives in dedicated helpers.
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigurationDropdownCacheService {
  private static readonly CONFIGURATION_KEY_PAGE_SIZE = 20;

  private readonly logger = inject(LoggerService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly store = inject(ConfigurationDropdownSignalStore);

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

  // Configuration-backed signals load their module on first read, then stay cached.
  readonly genders = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.GENDERS,
    this.store.gendersSignal
  );
  readonly employmentTypes = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.EMPLOYMENT_TYPES,
    this.store.employmentTypesSignal
  );
  readonly degrees = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.DEGREES,
    this.store.degreesSignal
  );
  readonly branches = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.BRANCHES,
    this.store.branchesSignal
  );
  readonly designations = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.DESIGNATIONS,
    this.store.designationsSignal
  );
  readonly bloodGroups = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.BLOOD_GROUPS,
    this.store.bloodGroupsSignal
  );
  readonly passingYears = this.store.passingYearsSignal.asReadonly();
  readonly bankNames = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.BANK_NAMES,
    this.store.bankNamesSignal
  );
  readonly states = this.lazyConfigSignal(
    MODULE_NAMES.COMMON,
    CONFIGURATION_KEYS.COMMON.STATES,
    this.store.statesSignal
  );
  readonly cities = this.lazyConfigSignal(
    MODULE_NAMES.COMMON,
    CONFIGURATION_KEYS.COMMON.CITIES,
    this.store.citiesSignal
  );
  readonly employeeStatus = this.lazyConfigSignal(
    MODULE_NAMES.EMPLOYEE,
    CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_STATUS,
    this.store.employeeStatusSignal
  );
  readonly expenseCategories = this.lazyConfigSignal(
    MODULE_NAMES.EXPENSE,
    CONFIGURATION_KEYS.EXPENSE.CATEGORIES,
    this.store.expenseCategoriesSignal
  );
  readonly expensePaymentMethods = this.lazyConfigSignal(
    MODULE_NAMES.EXPENSE,
    CONFIGURATION_KEYS.EXPENSE.PAYMENT_METHODS,
    this.store.expensePaymentMethodsSignal
  );
  readonly fuelExpensePaymentMethods = this.lazyConfigSignal(
    MODULE_NAMES.FUEL_EXPENSE,
    CONFIGURATION_KEYS.FUEL_EXPENSE.PAYMENT_METHODS,
    this.store.fuelExpensePaymentMethodsSignal
  );
  readonly attendanceStatus = this.lazyConfigSignal(
    MODULE_NAMES.ATTENDANCE,
    CONFIGURATION_KEYS.ATTENDANCE.STATUS,
    this.store.attendanceStatusSignal
  );
  readonly approvalStatus = this.lazyConfigSignal(
    MODULE_NAMES.COMMON,
    CONFIGURATION_KEYS.COMMON.APPROVAL_STATUS,
    this.store.approvalStatusSignal
  );
  readonly projectDocumentApprovalStatuses = this.lazyConfigSignal(
    MODULE_NAMES.FINANCIAL,
    CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_APPROVAL_STATUSES,
    this.store.projectDocumentApprovalStatusesSignal
  );
  readonly partyTypes = this.lazyConfigSignal(
    MODULE_NAMES.FINANCIAL,
    CONFIGURATION_KEYS.PROJECT.PARTY_TYPES,
    this.store.partyTypesSignal
  );
  readonly assetCategories = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.CATEGORY_LIST,
    this.store.assetCategoriesSignal
  );
  readonly assetTypes = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.TYPE_LIST,
    this.store.assetTypesSignal
  );
  readonly assetStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.STATUS_LIST,
    this.store.assetStatusesSignal
  );
  readonly assetCalibrationSources = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.CALIBRATION_SOURCE_LIST,
    this.store.assetCalibrationSourcesSignal
  );
  readonly assetCalibrationStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.CALIBRATION_STATUS_LIST,
    this.store.assetCalibrationStatusesSignal
  );
  readonly assetWarrantyStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.WARRANTY_STATUS_LIST,
    this.store.assetWarrantyStatusesSignal
  );
  readonly assetCalibrationFrequencies = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.CALIBRATION_FREQUENCY_LIST,
    this.store.assetCalibrationFrequenciesSignal
  );
  readonly assetEventStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ASSET,
    CONFIGURATION_KEYS.ASSET.EVENT_STATUS_LIST,
    this.store.assetEventStatusesSignal
  );
  readonly petroCardStatus = this.lazyConfigSignal(
    MODULE_NAMES.PETRO_CARD,
    CONFIGURATION_KEYS.PETRO_CARD.STATUS,
    this.store.petroCardStatusSignal
  );
  readonly vehicleFuelTypes = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.FUEL_TYPE_LIST,
    this.store.vehicleFuelTypesSignal
  );
  readonly vehicleStatuses = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.STATUS_LIST,
    this.store.vehicleStatusesSignal
  );
  readonly vehicleDocumentStatuses = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.DOCUMENT_STATUS_LIST,
    this.store.vehicleDocumentStatusesSignal
  );
  readonly vehicleServiceStatuses = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.SERVICE_ALERT_STATUS_LIST,
    this.store.vehicleServiceStatusesSignal
  );
  readonly vehicleEventStatuses = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.EVENT_STATUS_LIST,
    this.store.vehicleEventStatusesSignal
  );
  readonly vehicleServiceTypes = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.SERVICE_TYPE_LIST,
    this.store.vehicleServiceTypesSignal
  );
  readonly vehicleServiceStatus = this.lazyConfigSignal(
    MODULE_NAMES.VEHICLE,
    CONFIGURATION_KEYS.VEHICLE.SERVICE_STATUS,
    this.store.vehicleServiceStatusSignal
  );
  readonly payrollStatus = this.lazyConfigSignal(
    MODULE_NAMES.PAYROLL,
    CONFIGURATION_KEYS.PAYROLL.STATUS,
    this.store.payrollStatusSignal
  );
  readonly companyStatus = this.lazyConfigSignal(
    MODULE_NAMES.COMPANY,
    CONFIGURATION_KEYS.COMPANY.COMPANY_STATUS,
    this.store.companyStatusSignal
  );
  readonly contractorStatus = this.lazyConfigSignal(
    MODULE_NAMES.CONTRACTOR,
    CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_STATUS,
    this.store.contractorStatusSignal
  );
  readonly vendorTypes = this.lazyConfigSignal(
    MODULE_NAMES.VENDOR,
    CONFIGURATION_KEYS.VENDOR.VENDOR_TYPES,
    this.store.vendorTypesSignal
  );
  readonly projectSiteTypes = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.PROJECT_TYPES,
    this.store.projectSiteTypesSignal
  );
  readonly projectStatus = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.PROJECT_STATUS,
    this.store.projectStatusSignal
  );
  readonly projectAllocationStatuses =
    this.store.projectAllocationStatusesSignal.asReadonly();
  readonly siteRoles = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.SITE_ROLES,
    this.store.siteRolesSignal
  );
  readonly poGstTypes = this.lazyConfigSignal(
    MODULE_NAMES.PURCHASE_ORDER,
    CONFIGURATION_KEYS.PURCHASE_ORDER.GST_TYPES,
    this.store.poGstTypesSignal
  );
  readonly poTypes = this.lazyConfigSignal(
    MODULE_NAMES.PURCHASE_ORDER,
    CONFIGURATION_KEYS.PURCHASE_ORDER.PO_TYPES,
    this.store.poTypesSignal
  );
  readonly units = this.lazyConfigSignal(
    MODULE_NAMES.PURCHASE_ORDER,
    CONFIGURATION_KEYS.PURCHASE_ORDER.UNITS,
    this.store.unitsSignal
  );
  readonly projectWorkTypes = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.PROJECT_WORK_TYPES,
    this.store.projectWorkTypesSignal
  );
  readonly projectDocumentTypes = this.lazyConfigSignal(
    MODULE_NAMES.PROJECT,
    CONFIGURATION_KEYS.PROJECT.PROJECT_DOCUMENT_TYPES,
    this.store.projectDocumentTypesSignal
  );
  readonly moduleNames = this.lazyConfigSignal(
    MODULE_NAMES.PERMISSION,
    CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN,
    this.store.moduleNamesSignal
  );
  readonly modulesConfig = computed(() => {
    this.ensureConfigurationForKey(
      MODULE_NAMES.PERMISSION,
      CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    );
    return this.store.modulesConfigSignal();
  });
  readonly announcementStatuses = this.lazyConfigSignal(
    MODULE_NAMES.ANNOUNCEMENT,
    CONFIGURATION_KEYS.ANNOUNCEMENT.ANNOUNCEMENT_STATUS,
    this.store.announcementStatusesSignal
  );
  readonly paymentSheetStatuses = this.lazyConfigSignal(
    MODULE_NAMES.PAYMENTS,
    CONFIGURATION_KEYS.PAYMENTS.SHEET_STATUSES,
    this.store.paymentSheetStatusesSignal
  );
  readonly paymentSheetStages = this.lazyConfigSignal(
    MODULE_NAMES.PAYMENTS,
    CONFIGURATION_KEYS.PAYMENTS.SHEET_STAGES,
    this.store.paymentSheetStagesSignal
  );
  readonly paymentSheetItemStatuses = this.lazyConfigSignal(
    MODULE_NAMES.PAYMENTS,
    CONFIGURATION_KEYS.PAYMENTS.ITEM_STATUSES,
    this.store.paymentSheetItemStatusesSignal
  );
  readonly configurationTypes = this.lazyConfigSignal(
    MODULE_NAMES.CONFIGURATION,
    CONFIGURATION_KEYS.CONFIGURATION.CONFIGURATION_TYPE_DROPDOWN,
    this.store.configurationTypesSignal
  );

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
    this.store.resetAllConfigurationSignals();
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
      const resolved = resolveConfigurationKey('', key) ?? key;
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
      this.store.resetSignalsForConfigurationKey(configurationKey);
    }
  }

  runAfterTouchedConfiguration<T>(
    work: () => T,
    apply: (value: T) => void
  ): void {
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
    return this.store.getRegistrySignal(module, key);
  }

  isConfigurationKeyLoading(moduleName: string, key: string): boolean {
    const configurationKey = resolveConfigurationKey(moduleName, key);
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
      this.isDropdownLoading(configurationLoadingKey(configurationKey))
    );
  }

  getCitiesByState(stateValue: string): IOptionDropdown[] {
    this.ensureConfigurationForKey(
      MODULE_NAMES.GEOGRAPHY,
      CONFIGURATION_KEYS.GEOGRAPHY.LOCATION
    );

    return resolveCitiesByState(
      stateValue,
      this.store.stateCityMapSignal(),
      this.cities()
    );
  }

  getModuleActionsByModuleName(moduleName: string): IOptionDropdown[] {
    this.ensureConfigurationForKey(
      MODULE_NAMES.PERMISSION,
      CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    );
    return resolveModuleActionsByModuleName(
      moduleName,
      this.store.modulesConfigSignal()
    );
  }

  isDropdownLoading(dropdownKey: string): boolean {
    return !!this._dropdownLoadingState()[dropdownKey];
  }

  buildPassingYearDropdownOptions(): IOptionDropdown[] {
    return buildPassingYearDropdownOptions();
  }

  ensureConfigurationForKey(moduleName: string, key: string): void {
    const configurationKey = resolveConfigurationKey(moduleName, key);
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
            const emitter =
              this.configurationKeyEmitters.get(configurationKey);
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
      this.setDropdownLoading(configurationLoadingKey(configurationKey), true)
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
            map(pages => mergeConfigurationListPages([firstPage, ...pages]))
          );
        }),
        finalize(() => {
          configurationKeys.forEach(configurationKey =>
            this.setDropdownLoading(
              configurationLoadingKey(configurationKey),
              false
            )
          );
        })
      );
  }

  private applyConfigurationKey(
    configurationKey: string,
    response: IConfigurationGetResponseDto
  ): void {
    const moduleConfigMap = buildModuleConfigMap(response);

    if (configurationKey === CONFIGURATION_KEYS.GEOGRAPHY.LOCATION) {
      applyGeographyLocationConfig(
        moduleConfigMap,
        this.store.geographySignals
      );
      return;
    }

    if (
      configurationKey === CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    ) {
      applyModulesConfigDropdown(moduleConfigMap, this.store.modulesSignals);
      return;
    }

    Object.entries(this.store.registry).forEach(([moduleName, dropdowns]) => {
      dropdowns.forEach(dropdown => {
        if (dropdown.key !== configurationKey) {
          return;
        }

        const apiValue = moduleConfigMap[moduleName]?.[dropdown.key];
        const staticFallback =
          this.store.staticFallbackData[moduleName]?.[dropdown.key];
        const nextValue = mapApiDropdownValue(
          dropdown.key,
          apiValue,
          staticFallback
        );
        if (nextValue === null) {
          return;
        }

        this.store.applyMappedDropdown(moduleName, dropdown.key, nextValue);
      });
    });
  }

  private setDropdownLoading(dropdownKey: string, loading: boolean): void {
    this._dropdownLoadingState.update(prev => ({
      ...prev,
      [dropdownKey]: loading,
    }));
  }
}
