import {
  inject,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import {
  catchError,
  forkJoin,
  map,
  MonoTypeOperatorFunction,
  Observable,
  of,
  ReplaySubject,
  share,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';

import { LoggerService } from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
import { UserPermissionService } from '@features/settings-management/permission-management/sub-features/user-permission-management/services/user-permission.service';
import { applyIconsToDropdownOptions } from '@shared/config/dropdown-option-icons.config';
import { CONFIGURATION_TYPE_DATA } from '@shared/config/static-data.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeGetFormDto,
  IEmployeeGetResponseDto,
} from '@features/employee-management/types/employee.dto';
import {
  IRoleGetBaseResponseDto,
  IRoleGetResponseDto,
} from '@features/settings-management/permission-management/sub-features/role-management/types/role.dto';
import { RoleService } from '@features/settings-management/permission-management/sub-features/role-management/services/role.service';
import { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import { VehicleService } from '@features/transport-management/vehicle-management/services/vehicle.service';
import { AssetService } from '@features/asset-management/services/asset.service';
import { IVehicleGetResponseDto } from '@features/transport-management/vehicle-management/types/vehicle.dto';
import { ICompanyGetResponseDto } from '@features/site-management/company-management/types/company.dto';
import { CompanyService } from '@features/site-management/company-management/services/company.service';
import { IContractorGetResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import { ContractorService } from '@features/site-management/contractor-management/services/contractor.service';
import { PetroCardService } from '@features/transport-management/petro-card-management/services/petro-card.service';
import { IPetroCardGetResponseDto } from '@features/transport-management/petro-card-management/types/petro-card.dto';
import { FuelExpenseService } from '@features/transport-management/fuel-expense-management/services/fuel-expense.service';
import { ILinkedUserVehicleDetailGetResponseDto } from '@features/transport-management/fuel-expense-management/types/fuel-expense.dto';
import { toTitleCase } from '@shared/utility';
import { ConfigurationService } from '@features/settings-management/configuration-management/services/configuration.service';
import {
  IConfigurationGetFormDto,
  IConfigurationGetResponseDto,
} from '@features/settings-management/configuration-management/types/configuration.dto';

@Injectable({
  providedIn: 'root',
})
export class AppConfigurationService {
  private readonly logger = inject(LoggerService);
  private readonly authService = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);
  private readonly roleService = inject(RoleService);
  private readonly userPermissionService = inject(UserPermissionService);
  private readonly assetService = inject(AssetService);
  private readonly vehicleService = inject(VehicleService);
  private readonly companyService = inject(CompanyService);
  private readonly contractorService = inject(ContractorService);
  private readonly petroCardService = inject(PetroCardService);
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly configurationService = inject(ConfigurationService);

  /**
   * Multicast reference-data HTTP streams; {@link share} resetOnError avoids pinning failed requests.
   */
  private readonly shareAppDataCache = <T>(): MonoTypeOperatorFunction<T> =>
    share<T>({
      connector: () => new ReplaySubject<T>(1),
      resetOnError: true,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    });

  private roleListCache$?: Observable<IRoleGetResponseDto>;
  private appConfigurationCache$?: Observable<IConfigurationGetResponseDto>;
  private employeeListCache$?: Observable<IEmployeeGetResponseDto>;
  private assetListCache$?: Observable<IAssetGetResponseDto>;
  private vehicleListCache$?: Observable<IVehicleGetResponseDto>;
  private petroCardListCache$?: Observable<IPetroCardGetResponseDto>;
  private companyListCache$?: Observable<ICompanyGetResponseDto>;
  private contractorListCache$?: Observable<IContractorGetResponseDto>;
  private linkedUserVehicleDetailCache$?: Observable<ILinkedUserVehicleDetailGetResponseDto | null>;

  private readonly EMPTY_DROPDOWN = signal<IOptionDropdown[]>([]).asReadonly();

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
  private readonly _companyList = signal<IOptionDropdown[]>([]);
  private readonly _companyStatus = signal<IOptionDropdown[]>([]);
  private readonly _contractorList = signal<IOptionDropdown[]>([]);
  private readonly _contractorStatus = signal<IOptionDropdown[]>([]);
  private readonly _projectStatus = signal<IOptionDropdown[]>([]);
  private readonly _projectWorkTypes = signal<IOptionDropdown[]>([]);
  private readonly _projectDocumentTypes = signal<IOptionDropdown[]>([]);
  private readonly _moduleNames = signal<IOptionDropdown[]>([]);
  private readonly _modulesConfig = signal<
    Record<string, { label: string; actions: IOptionDropdown[] }>
  >({});
  private readonly _announcementStatuses = signal<IOptionDropdown[]>([]);
  private readonly _configurationTypes = signal<IOptionDropdown[]>([]);
  // Load App Data
  private readonly _employeeList = signal<IOptionDropdown[]>([]);
  private readonly _employeeListByRole = signal<
    Record<string, IOptionDropdown[]>
  >({});
  private readonly _roleList = signal<IOptionDropdown[]>([]);
  private readonly _clientList = signal<IOptionDropdown[]>([]);
  private readonly _locationList = signal<IOptionDropdown[]>([]);
  private readonly _assetList = signal<IOptionDropdown[]>([]);
  private readonly _vehicleList = signal<IOptionDropdown[]>([]);
  private readonly _petroCardList = signal<IOptionDropdown[]>([]);
  private readonly _linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);
  // Public readonly signals for common use
  readonly genders = this._genders.asReadonly();
  readonly employmentTypes = this._employmentTypes.asReadonly();
  readonly degrees = this._degrees.asReadonly();
  readonly branches = this._branches.asReadonly();
  readonly designations = this._designations.asReadonly();
  readonly bloodGroups = this._bloodGroups.asReadonly();
  readonly passingYears = this._passingYears.asReadonly();
  readonly bankNames = this._bankNames.asReadonly();
  readonly states = this._states.asReadonly();
  readonly cities = this._cities.asReadonly();
  readonly employeeStatus = this._employeeStatus.asReadonly();
  readonly expenseCategories = this._expenseCategories.asReadonly();
  readonly expensePaymentMethods = this._expensePaymentMethods.asReadonly();
  readonly fuelExpensePaymentMethods =
    this._fuelExpensePaymentMethods.asReadonly();
  readonly attendanceStatus = this._attendanceStatus.asReadonly();
  readonly approvalStatus = this._approvalStatus.asReadonly();
  readonly assetCategories = this._assetCategories.asReadonly();
  readonly assetTypes = this._assetTypes.asReadonly();
  readonly assetStatuses = this._assetStatuses.asReadonly();
  readonly assetCalibrationSources = this._assetCalibrationSources.asReadonly();
  readonly assetCalibrationStatuses =
    this._assetCalibrationStatuses.asReadonly();
  readonly assetWarrantyStatuses = this._assetWarrantyStatuses.asReadonly();
  readonly assetCalibrationFrequencies =
    this._assetCalibrationFrequencies.asReadonly();
  readonly assetEventStatuses = this._assetEventStatuses.asReadonly();
  readonly petroCardStatus = this._petroCardStatus.asReadonly();
  readonly vehicleFuelTypes = this._vehicleFuelTypes.asReadonly();
  readonly vehicleStatuses = this._vehicleStatuses.asReadonly();
  readonly vehicleDocumentStatuses = this._vehicleDocumentStatuses.asReadonly();
  readonly vehicleServiceStatuses = this._vehicleServiceStatuses.asReadonly();
  readonly vehicleEventStatuses = this._vehicleEventStatuses.asReadonly();
  readonly vehicleServiceTypes = this._vehicleServiceTypes.asReadonly();
  readonly vehicleServiceStatus = this._vehicleServiceStatus.asReadonly();
  readonly payrollStatus = this._payrollStatus.asReadonly();
  readonly companyList = this._companyList.asReadonly();
  readonly companyStatus = this._companyStatus.asReadonly();
  readonly contractorList = this._contractorList.asReadonly();
  readonly contractorStatus = this._contractorStatus.asReadonly();
  readonly projectStatus = this._projectStatus.asReadonly();
  readonly projectWorkTypes = this._projectWorkTypes.asReadonly();
  readonly projectDocumentTypes = this._projectDocumentTypes.asReadonly();
  readonly moduleNames = this._moduleNames.asReadonly();
  readonly modulesConfig = this._modulesConfig.asReadonly();
  readonly announcementStatuses = this._announcementStatuses.asReadonly();
  readonly configurationTypes = this._configurationTypes.asReadonly();
  // Load App Data
  readonly employeeList = this._employeeList.asReadonly();
  readonly employeeListByRole = this._employeeListByRole.asReadonly();
  readonly roleList = this._roleList.asReadonly();
  readonly clientList = this._clientList.asReadonly();
  readonly locationList = this._locationList.asReadonly();
  readonly assetList = this._assetList.asReadonly();
  readonly vehicleList = this._vehicleList.asReadonly();
  readonly petroCardList = this._petroCardList.asReadonly();
  readonly linkedUserVehicleDetail = this._linkedUserVehicleDetail.asReadonly();

  private readonly STATIC_FALLBACK_DATA: Record<
    string,
    Record<string, IOptionDropdown[]>
  > = {
    [MODULE_NAMES.CONFIGURATION]: {
      [CONFIGURATION_KEYS.CONFIGURATION.CONFIGURATION_TYPE_DROPDOWN]:
        CONFIGURATION_TYPE_DATA,
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
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        signal: this._employeeList,
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
        key: CONFIGURATION_KEYS.COMMON.ROLE_LIST,
        signal: this._roleList,
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
        key: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
        signal: this._vehicleList,
      },
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
      {
        key: CONFIGURATION_KEYS.ASSET.ASSET_LIST,
        signal: this._assetList,
      },
    ],
    [MODULE_NAMES.PETRO_CARD]: [
      {
        key: CONFIGURATION_KEYS.PETRO_CARD.STATUS,
        signal: this._petroCardStatus,
      },
      {
        key: CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST,
        signal: this._petroCardList,
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
        key: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
        signal: this._companyList,
      },
      {
        key: CONFIGURATION_KEYS.COMPANY.COMPANY_STATUS,
        signal: this._companyStatus,
      },
    ],
    [MODULE_NAMES.CONTRACTOR]: [
      {
        key: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
        signal: this._contractorList,
      },
      {
        key: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_STATUS,
        signal: this._contractorStatus,
      },
    ],
    [MODULE_NAMES.PROJECT]: [
      {
        key: CONFIGURATION_KEYS.PROJECT.PROJECT_STATUS,
        signal: this._projectStatus,
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
    [MODULE_NAMES.CONFIGURATION]: [
      {
        key: CONFIGURATION_KEYS.CONFIGURATION.CONFIGURATION_TYPE_DROPDOWN,
        signal: this._configurationTypes,
      },
    ],
  };

  /**
   * Drops cached HTTP streams so the next load hits the network (login, tests, manual refresh).
   * Does not clear populated signals.
   */
  invalidateAppConfigurationCaches(): void {
    this.roleListCache$ = undefined;
    this.appConfigurationCache$ = undefined;
    this.invalidateReferenceListCaches();
  }

  /**
   * Clears only entity list caches (employees, assets, vehicles, …). Use after CRUD when roles/config unchanged.
   */
  invalidateReferenceListCaches(): void {
    this.employeeListCache$ = undefined;
    this.assetListCache$ = undefined;
    this.vehicleListCache$ = undefined;
    this.petroCardListCache$ = undefined;
    this.companyListCache$ = undefined;
    this.contractorListCache$ = undefined;
    this.linkedUserVehicleDetailCache$ = undefined;
  }

  /** Refetch one list after CRUD so cached dropdown data matches the server. */
  refreshEmployeeDropdowns(): void {
    this.employeeListCache$ = undefined;
    this.loadEmployeeList()
      .pipe(take(1))
      .subscribe({
        error: err =>
          this.logger.error('Employee dropdown refetch failed', err),
      });
  }

  refreshAssetDropdowns(): void {
    this.assetListCache$ = undefined;
    this.loadAssetList()
      .pipe(take(1))
      .subscribe({
        error: err => this.logger.error('Asset dropdown refetch failed', err),
      });
  }

  refreshVehicleDropdowns(): void {
    this.vehicleListCache$ = undefined;
    this.loadVehicleList()
      .pipe(take(1))
      .subscribe({
        error: err => this.logger.error('Vehicle dropdown refetch failed', err),
      });
  }

  refreshCompanyDropdowns(): void {
    this.companyListCache$ = undefined;
    this.loadCompanyList()
      .pipe(take(1))
      .subscribe({
        error: err => this.logger.error('Company dropdown refetch failed', err),
      });
  }

  refreshContractorDropdowns(): void {
    this.contractorListCache$ = undefined;
    this.loadContractorList()
      .pipe(take(1))
      .subscribe({
        error: err =>
          this.logger.error('Contractor dropdown refetch failed', err),
      });
  }

  refreshPetroCardDropdowns(): void {
    this.petroCardListCache$ = undefined;
    this.loadPetroCardList()
      .pipe(take(1))
      .subscribe({
        error: err =>
          this.logger.error('Petro card dropdown refetch failed', err),
      });
  }

  refreshLinkedUserVehicleDropdowns(): void {
    this.linkedUserVehicleDetailCache$ = undefined;
    this.loadLinkedUserVehicleDetailForCurrentUser()
      .pipe(take(1))
      .subscribe({
        error: err => this.logger.error('Linked vehicle refetch failed', err),
      });
  }

  /** When many lists may have changed; heavier than a single {@link refreshAssetDropdowns} etc. */
  refreshAllReferenceDropdowns(): void {
    this.invalidateReferenceListCaches();
    this.loadReferenceLists()
      .pipe(take(1))
      .subscribe({
        error: err => this.logger.error('Reference lists refetch failed', err),
      });
  }

  loadAppConfiguration(): Observable<IConfigurationGetResponseDto> {
    return (this.appConfigurationCache$ ??= this.fetchAppConfiguration().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchAppConfiguration(): Observable<IConfigurationGetResponseDto> {
    this.logger.logUserAction('Load App Configuration Request');

    const payload: IConfigurationGetFormDto = {
      page: 1,
      pageSize: 100,
      sortField: 'createdAt',
      sortOrder: 'DESC',
    };

    return this.configurationService.getConfigurationList(payload).pipe(
      tap(response => {
        this.logger.logUserAction('Load App Configuration Response', response);
        const moduleConfigMap = this.buildModuleConfigMap(response);
        this.populateAllModuleDropdowns(moduleConfigMap);
      }),
      catchError(error => {
        this.appConfigurationCache$ = undefined;
        this.logger.logUserAction('Failed to load App Configuration', error);
        return throwError(() => error);
      })
    );
  }

  loadEmployeeList(): Observable<IEmployeeGetResponseDto> {
    return (this.employeeListCache$ ??= this.fetchEmployeeList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchEmployeeList(): Observable<IEmployeeGetResponseDto> {
    this.logger.logUserAction('Loading app data - Employee List');

    const payload: IEmployeeGetFormDto = {
      page: 1,
      pageSize: 100,
    };

    return this.employeeService.getEmployeeList(payload).pipe(
      tap(response => {
        this.logger.logUserAction('Employee List loaded successfully', {
          count: response.totalRecords,
        });

        const employeeListByRole: Record<string, IOptionDropdown[]> = {};

        const employeeList: IOptionDropdown[] = response.records
          .map(employee => {
            const first = employee.firstName?.trim() ?? '';
            const last = employee.lastName?.trim() ?? '';
            const employeeStatus = employee.status?.trim() ?? '';
            const formattedEmployeeStatus = employeeStatus
              ? toTitleCase(employeeStatus)
              : '';
            const employeeCode = employee.employeeId?.trim() ?? '';
            const subtitleParts = [
              employeeCode,
              formattedEmployeeStatus,
            ].filter(Boolean);
            const initialChar =
              first.charAt(0) ||
              last.charAt(0) ||
              (employee.employeeId?.trim()?.charAt(0) ?? '');
            const dropdownItem: IOptionDropdown = {
              label: toTitleCase(`${first} ${last}`.trim()),
              subtitle:
                subtitleParts.length > 0
                  ? subtitleParts.join(' • ')
                  : undefined,
              initial: initialChar ? initialChar.toUpperCase() : undefined,
              value: employee.id,
              disabled: employeeStatus.toLowerCase() === 'archived',
              data: employee,
            };

            // Parse roles and add to role-based lists
            const roles = employee.roles
              .split(',')
              .map(role => role.trim())
              .filter(role => role.length > 0);

            roles.forEach(role => {
              if (!employeeListByRole[role]) {
                employeeListByRole[role] = [];
              }
              employeeListByRole[role].push(dropdownItem);
            });

            return dropdownItem;
          })
          .sort(this.sortByLabel);

        // Sort role-based lists as well
        Object.keys(employeeListByRole).forEach(role => {
          employeeListByRole[role].sort(this.sortByLabel);
        });

        this._employeeList.set(employeeList);
        this._employeeListByRole.set(employeeListByRole);
      }),
      catchError(error => {
        this.employeeListCache$ = undefined;
        this.logger.logUserAction('Failed to load Employee List', error);
        return throwError(() => error);
      })
    );
  }

  loadAllAppRoles(): Observable<IRoleGetResponseDto> {
    return (this.roleListCache$ ??= this.fetchAllAppRoles().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchAllAppRoles(): Observable<IRoleGetResponseDto> {
    this.logger.logUserAction('Loading app data - All App Roles');

    return this.roleService.getRoleList().pipe(
      tap(response => {
        this.logger.logUserAction('All App Roles loaded successfully', {
          count: response.totalRecords,
        });

        const roleList = applyIconsToDropdownOptions(
          CONFIGURATION_KEYS.COMMON.ROLE_LIST,
          response.records
            .map(role => ({
              label: toTitleCase(role.label),
              value: role.name,
              data: role,
            }))
            .sort(this.sortByLabel)
        );

        this._roleList.set(roleList);
      }),
      catchError(error => {
        this.roleListCache$ = undefined;
        this.logger.logUserAction('Failed to load All App Roles', error);
        return throwError(() => error);
      })
    );
  }

  getDropdown(module: string, key: string): Signal<IOptionDropdown[]> {
    return (
      this.MODULE_DROPDOWN_REGISTRY[module]
        ?.find(dropdown => dropdown.key === key)
        ?.signal.asReadonly() ?? this.EMPTY_DROPDOWN
    );
  }

  getEmployeesByRole(roleName: string): IOptionDropdown[] {
    return this._employeeListByRole()[roleName] ?? [];
  }

  /**
   * Get cities based on selected state
   * @param stateValue - The value of the selected state
   * @returns Array of city options for the given state
   */
  getCitiesByState(stateValue: string): IOptionDropdown[] {
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
    const config = this._modulesConfig();
    const moduleConfig = config[moduleName];

    if (!moduleConfig?.actions || !Array.isArray(moduleConfig.actions)) {
      return [];
    }

    return this.normalizeDropdownData(moduleConfig.actions);
  }

  private populateAllModuleDropdowns(
    moduleConfigMap: Record<string, Record<string, unknown>>
  ): void {
    // Handle modules_config_dropdown specially
    this.handleModulesConfigDropdown(moduleConfigMap);

    // Handle geography/location config for states and cities
    this.handleGeographyLocationConfig(moduleConfigMap);

    // Populate all other dropdowns from API config or static fallback
    Object.entries(this.MODULE_DROPDOWN_REGISTRY).forEach(
      ([moduleName, dropdowns]) => {
        dropdowns.forEach(dropdown => {
          // Skip dropdowns that are handled separately
          if (
            dropdown.key ===
              CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN ||
            dropdown.key === CONFIGURATION_KEYS.COMMON.STATES ||
            dropdown.key === CONFIGURATION_KEYS.COMMON.CITIES ||
            dropdown.key === CONFIGURATION_KEYS.COMMON.ROLE_LIST ||
            dropdown.key === CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST ||
            dropdown.key === CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST ||
            dropdown.key === CONFIGURATION_KEYS.ASSET.ASSET_LIST ||
            dropdown.key === CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST ||
            dropdown.key === CONFIGURATION_KEYS.COMPANY.COMPANY_LIST ||
            dropdown.key === CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST ||
            dropdown.key === CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS
          ) {
            return;
          }
          const apiValue = moduleConfigMap[moduleName]?.[dropdown.key];
          const staticFallback =
            this.STATIC_FALLBACK_DATA[moduleName]?.[dropdown.key];

          // Priority: API data > Static fallback > Empty array
          let nextValue: IOptionDropdown[] = [];

          if (Array.isArray(apiValue)) {
            nextValue = this.normalizeDropdownData(apiValue);
          } else if (staticFallback) {
            nextValue = staticFallback;
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
    const modulesConfig = moduleConfigMap[MODULE_NAMES.PERMISSION]?.[
      CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN
    ] as
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

  loadAssetList(): Observable<IAssetGetResponseDto> {
    return (this.assetListCache$ ??= this.fetchAssetList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchAssetList(): Observable<IAssetGetResponseDto> {
    this.logger.logUserAction('Loading app data - Asset List');

    return this.assetService.getAssetList().pipe(
      tap(response => {
        this.logger.logUserAction('Asset List loaded successfully', {
          count: response.totalRecords,
        });

        const assetList: IOptionDropdown[] = response.records
          .map(asset => {
            const rawName = asset.name?.trim() ?? '';
            const aid = asset.assetId?.trim();
            return {
              label: toTitleCase(rawName),
              subtitle: aid || undefined,
              initial: this.initialsForDropdownLabel(rawName),
              value: asset.id,
              data: asset,
            };
          })
          .sort(this.sortByLabel);

        this._assetList.set(assetList);
      }),
      catchError(error => {
        this.assetListCache$ = undefined;
        this.logger.logUserAction('Failed to load Asset List', error);
        return throwError(() => error);
      })
    );
  }

  loadVehicleList(): Observable<IVehicleGetResponseDto> {
    return (this.vehicleListCache$ ??= this.fetchVehicleList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchVehicleList(): Observable<IVehicleGetResponseDto> {
    this.logger.logUserAction('Loading app data - Vehicle List');

    return this.vehicleService.getVehicleList().pipe(
      tap(response => {
        this.logger.logUserAction('Vehicle List loaded successfully', {
          count: response.totalRecords,
        });

        const vehicleList: IOptionDropdown[] = response.records
          .map(vehicle => {
            const reg = vehicle.registrationNo?.trim() ?? '';
            const brandModel = [vehicle.brand, vehicle.model]
              .filter(Boolean)
              .join(' ')
              .trim();
            const initialMatch = reg.match(/[A-Za-z0-9]/);
            return {
              label: reg,
              subtitle: brandModel ? toTitleCase(brandModel) : undefined,
              initial: initialMatch ? initialMatch[0].toUpperCase() : undefined,
              value: vehicle.id,
              data: vehicle,
            };
          })
          .sort(this.sortByLabel);

        this._vehicleList.set(vehicleList);
      }),
      catchError(error => {
        this.vehicleListCache$ = undefined;
        this.logger.logUserAction('Failed to load Vehicle List', error);
        return throwError(() => error);
      })
    );
  }

  loadPetroCardList(): Observable<IPetroCardGetResponseDto> {
    return (this.petroCardListCache$ ??= this.fetchPetroCardList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchPetroCardList(): Observable<IPetroCardGetResponseDto> {
    this.logger.logUserAction('Loading app data - Petro Card List');

    return this.petroCardService.getPetroCardList().pipe(
      tap(response => {
        this.logger.logUserAction('Petro Card List loaded successfully', {
          count: response.totalRecords,
        });

        const petroCardList: IOptionDropdown[] = response.records
          .map(petroCard => ({
            label: toTitleCase(
              `${petroCard.cardName} (${petroCard.cardNumber})`.trim()
            ),
            value: petroCard.id,
          }))
          .sort(this.sortByLabel);

        this._petroCardList.set(petroCardList);
      }),
      catchError(error => {
        this.petroCardListCache$ = undefined;
        this.logger.logUserAction('Failed to load Petro Card List', error);
        return throwError(() => error);
      })
    );
  }

  loadCompanyList(): Observable<ICompanyGetResponseDto> {
    return (this.companyListCache$ ??= this.fetchCompanyList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchCompanyList(): Observable<ICompanyGetResponseDto> {
    this.logger.logUserAction('Loading app data - Company List');

    return this.companyService.getCompanyList().pipe(
      tap(response => {
        this.logger.logUserAction('Company List loaded successfully', {
          count: response.totalRecords,
        });

        const companyList: IOptionDropdown[] = response.records
          .map(company => {
            const rawName = company.name?.trim() ?? '';
            const gst = company.gstNumber?.trim();
            const subtitle = gst
              ? `GST ${gst}`
              : [company.city, company.state].filter(Boolean).join(', ') ||
                (company.email?.trim() ?? '') ||
                `ID ${company.id.slice(0, 8)}`;
            return {
              label: toTitleCase(rawName),
              subtitle,
              initial: this.initialsForDropdownLabel(rawName),
              value: company.id,
              data: company,
            };
          })
          .sort(this.sortByLabel);

        this._companyList.set(companyList);
      }),
      catchError(error => {
        this.companyListCache$ = undefined;
        this.logger.logUserAction('Failed to load Company List', error);
        return throwError(() => error);
      })
    );
  }

  loadContractorList(): Observable<IContractorGetResponseDto> {
    return (this.contractorListCache$ ??= this.fetchContractorList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchContractorList(): Observable<IContractorGetResponseDto> {
    this.logger.logUserAction('Loading app data - Contractor List');

    return this.contractorService.getContractorList().pipe(
      tap(response => {
        this.logger.logUserAction('Contractor List loaded successfully', {
          count: response.totalRecords,
        });

        const contractorList: IOptionDropdown[] = response.records
          .map(contractor => {
            const rawName = contractor.name?.trim() ?? '';
            const gst = contractor.gstNumber?.trim();
            const subtitle = gst
              ? `GST ${gst}`
              : [contractor.city, contractor.state]
                  .filter(Boolean)
                  .join(', ') ||
                (contractor.email?.trim() ?? '') ||
                `ID ${contractor.id.slice(0, 8)}`;
            return {
              label: toTitleCase(rawName),
              subtitle,
              initial: this.initialsForDropdownLabel(rawName),
              value: contractor.id,
              data: contractor,
            };
          })
          .sort(this.sortByLabel);

        this._contractorList.set(contractorList);
      }),
      catchError(error => {
        this.contractorListCache$ = undefined;
        this.logger.logUserAction('Failed to load Contractor List', error);
        return throwError(() => error);
      })
    );
  }

  /** Initials for rich dropdown rows (company / contractor / asset). */
  private initialsForDropdownLabel(rawLabel: string): string | undefined {
    const t = rawLabel.trim();
    if (!t) {
      return undefined;
    }
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return t.slice(0, 2).toUpperCase();
  }

  loadLinkedUserVehicleDetailForCurrentUser(): Observable<ILinkedUserVehicleDetailGetResponseDto | null> {
    return (this.linkedUserVehicleDetailCache$ ??=
      this.fetchLinkedUserVehicleDetailForCurrentUser().pipe(
        this.shareAppDataCache()
      ));
  }

  private fetchLinkedUserVehicleDetailForCurrentUser(): Observable<ILinkedUserVehicleDetailGetResponseDto | null> {
    this.logger.logUserAction('Loading app data - Linked User Vehicle Detail');

    return this.fuelExpenseService
      .getLinkedUserVehicleDetail({ employeeName: null })
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Linked User Vehicle Detail loaded successfully',
            response
          );
          this._linkedUserVehicleDetail.set(response);
        }),
        catchError(error => {
          this.linkedUserVehicleDetailCache$ = undefined;
          this.logger.logUserAction(
            'Failed to load Linked User Vehicle Detail',
            error
          );
          this._linkedUserVehicleDetail.set(null);
          return of(null);
        })
      );
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

  /** All heavy dropdown lists in one round-trip (used by {@link refreshAllReferenceDropdowns}). */
  loadReferenceLists(): Observable<{
    employeeList: IEmployeeGetResponseDto;
    assetList: IAssetGetResponseDto;
    vehicleList: IVehicleGetResponseDto;
    petroCardList: IPetroCardGetResponseDto;
    companyList: ICompanyGetResponseDto;
    contractorList: IContractorGetResponseDto;
    linkedUserVehicleForCurrentUser: ILinkedUserVehicleDetailGetResponseDto | null;
  }> {
    return forkJoin({
      employeeList: this.loadEmployeeList(),
      assetList: this.loadAssetList(),
      vehicleList: this.loadVehicleList(),
      petroCardList: this.loadPetroCardList(),
      companyList: this.loadCompanyList(),
      contractorList: this.loadContractorList(),
      linkedUserVehicleForCurrentUser:
        this.loadLinkedUserVehicleDetailForCurrentUser(),
    });
  }

  loadAllAppData(): Observable<{
    roles: IRoleGetResponseDto;
    permissions: unknown;
    appConfiguration: IConfigurationGetResponseDto;
    employeeList: IEmployeeGetResponseDto;
    assetList: IAssetGetResponseDto;
    vehicleList: IVehicleGetResponseDto;
    petroCardList: IPetroCardGetResponseDto;
    companyList: ICompanyGetResponseDto;
    contractorList: IContractorGetResponseDto;
    linkedUserVehicleForCurrentUser: ILinkedUserVehicleDetailGetResponseDto | null;
  }> {
    this.logger.info('Loading all app data...');

    return this.loadAllAppRoles().pipe(
      switchMap(rolesResponse => {
        const currentRole = this._roleList().find(
          role => role.value === this.authService.getCurrentUser()?.activeRole
        );
        const currentRoleId = (currentRole?.data as IRoleGetBaseResponseDto)
          ?.id;

        return forkJoin({
          permissions:
            this.userPermissionService.fetchAndStoreLoggedInUserPermissions({
              roleId: currentRoleId,
            }),
          appConfiguration: this.loadAppConfiguration(),
          employeeList: this.loadEmployeeList(),
          assetList: this.loadAssetList(),
          vehicleList: this.loadVehicleList(),
          petroCardList: this.loadPetroCardList(),
          companyList: this.loadCompanyList(),
          contractorList: this.loadContractorList(),
          linkedUserVehicleForCurrentUser:
            this.loadLinkedUserVehicleDetailForCurrentUser(),
        }).pipe(
          map(parallelResults => ({
            roles: rolesResponse,
            ...parallelResults,
          }))
        );
      }),
      tap(() => this.logger.info('All app data loaded successfully')),
      catchError(error => {
        this.logger.error('Failed to load app data', error);
        return throwError(() => error);
      })
    );
  }
}
