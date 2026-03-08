import {
  inject,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { catchError, forkJoin, Observable, tap, throwError } from 'rxjs';

import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { UserPermissionService } from '@features/settings-management/permission-management/sub-features/user-permission-management/services/user-permission.service';
import {
  APPROVAL_STATUS_DATA,
  ATTENDANCE_STATUS_DATA,
  BANK_NAME_DATA,
  EMPLOYEE_STATUS_DATA,
  PASSING_YEAR_DATA,
  PETRO_CARD_STATUS_DATA,
  COMPANY_STATUS_DATA,
  CONTRACTOR_STATUS_DATA,
} from '@shared/config/static-data.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { AppConfiguationResponseSchema } from '@shared/schemas';
import { IAppConfiguationResponseDto, IOptionDropdown } from '@shared/types';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import { IEmployeeGetResponseDto } from '@features/employee-management/types/employee.dto';
import { IRoleGetResponseDto } from '@features/settings-management/permission-management/sub-features/role-management/types/role.dto';
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
import { toTitleCase } from '@shared/utility';

@Injectable({
  providedIn: 'root',
})
export class AppConfigurationService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly employeeService = inject(EmployeeService);
  private readonly roleService = inject(RoleService);
  private readonly userPermissionService = inject(UserPermissionService);
  private readonly assetService = inject(AssetService);
  private readonly vehicleService = inject(VehicleService);
  private readonly companyService = inject(CompanyService);
  private readonly contractorService = inject(ContractorService);
  private readonly petroCardService = inject(PetroCardService);

  private readonly EMPTY_DROPDOWN = signal<IOptionDropdown[]>([]).asReadonly();

  private readonly _genders = signal<IOptionDropdown[]>([]);
  private readonly _employmentTypes = signal<IOptionDropdown[]>([]);
  private readonly _degrees = signal<IOptionDropdown[]>([]);
  private readonly _branches = signal<IOptionDropdown[]>([]);
  private readonly _designations = signal<IOptionDropdown[]>([]);
  private readonly _bloodGroups = signal<IOptionDropdown[]>([]);
  private readonly _passingYears = signal<IOptionDropdown[]>([]);
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
  private readonly _moduleNames = signal<IOptionDropdown[]>([]);
  private readonly _modulesConfig = signal<
    Record<string, { label: string; actions: IOptionDropdown[] }>
  >({});
  private readonly _announcementStatuses = signal<IOptionDropdown[]>([]);
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
  readonly moduleNames = this._moduleNames.asReadonly();
  readonly modulesConfig = this._modulesConfig.asReadonly();
  readonly announcementStatuses = this._announcementStatuses.asReadonly();
  // Load App Data
  readonly employeeList = this._employeeList.asReadonly();
  readonly employeeListByRole = this._employeeListByRole.asReadonly();
  readonly roleList = this._roleList.asReadonly();
  readonly clientList = this._clientList.asReadonly();
  readonly locationList = this._locationList.asReadonly();
  readonly assetList = this._assetList.asReadonly();
  readonly vehicleList = this._vehicleList.asReadonly();
  readonly petroCardList = this._petroCardList.asReadonly();

  private readonly STATIC_FALLBACK_DATA: Record<
    string,
    Record<string, IOptionDropdown[]>
  > = {
    [MODULE_NAMES.EMPLOYEE]: {
      [CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS]: PASSING_YEAR_DATA,
      [CONFIGURATION_KEYS.EMPLOYEE.BANK_NAMES]: BANK_NAME_DATA,
      [CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_STATUS]: EMPLOYEE_STATUS_DATA,
    },
    [MODULE_NAMES.ATTENDANCE]: {
      [CONFIGURATION_KEYS.ATTENDANCE.STATUS]: ATTENDANCE_STATUS_DATA,
    },
    [MODULE_NAMES.COMMON]: {
      [CONFIGURATION_KEYS.COMMON.APPROVAL_STATUS]: APPROVAL_STATUS_DATA,
    },
    [MODULE_NAMES.PETRO_CARD]: {
      [CONFIGURATION_KEYS.PETRO_CARD.STATUS]: PETRO_CARD_STATUS_DATA,
    },
    [MODULE_NAMES.COMPANY]: {
      [CONFIGURATION_KEYS.COMPANY.COMPANY_STATUS]: COMPANY_STATUS_DATA,
    },
    [MODULE_NAMES.CONTRACTOR]: {
      [CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_STATUS]: CONTRACTOR_STATUS_DATA,
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
      {
        key: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
        signal: this._vehicleList,
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
  };

  loadAppConfiguration(): Observable<IAppConfiguationResponseDto> {
    this.logger.logUserAction('Load App Configuration Request');

    return this.apiService
      .getValidated(API_ROUTES.APP_CONFIGUATION.GET, {
        response: AppConfiguationResponseSchema,
      })
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Load App Configuration Response',
            response
          );
          const moduleConfigMap = this.buildModuleConfigMap(response);
          this.populateAllModuleDropdowns(moduleConfigMap);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Load App Configuration Validation Error',
              error
            );
          } else {
            this.logger.logUserAction('Load App Configuration Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  loadEmployeeList(): Observable<IEmployeeGetResponseDto> {
    this.logger.logUserAction('Loading app data - Employee List');

    return this.employeeService.getEmployeeList().pipe(
      tap(response => {
        this.logger.logUserAction('Employee List loaded successfully', {
          count: response.totalRecords,
        });

        const employeeListByRole: Record<string, IOptionDropdown[]> = {};

        const employeeList: IOptionDropdown[] = response.records
          .map(employee => {
            const dropdownItem: IOptionDropdown = {
              label: toTitleCase(
                `${employee.firstName} ${employee.lastName}`.trim()
              ),
              value: employee.id,
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
        this.logger.logUserAction('Failed to load Employee List', error);
        return throwError(() => error);
      })
    );
  }

  loadAllAppRoles(): Observable<IRoleGetResponseDto> {
    this.logger.logUserAction('Loading app data - All App Roles');

    return this.roleService.getRoleList().pipe(
      tap(response => {
        this.logger.logUserAction('All App Roles loaded successfully', {
          count: response.totalRecords,
        });

        const roleList = response.records
          .map(role => ({
            label: toTitleCase(role.label),
            value: role.name,
            data: role,
          }))
          .sort(this.sortByLabel);

        this._roleList.set(roleList);
      }),
      catchError(error => {
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
            dropdown.key === CONFIGURATION_KEYS.COMMON.CITIES
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
    this.logger.logUserAction('Loading app data - Asset List');

    return this.assetService.getAssetList().pipe(
      tap(response => {
        this.logger.logUserAction('Asset List loaded successfully', {
          count: response.totalRecords,
        });

        const assetList: IOptionDropdown[] = response.records
          .map(asset => ({
            label: toTitleCase(`${asset.name}`.trim()),
            value: asset.id,
          }))
          .sort(this.sortByLabel);

        this._assetList.set(assetList);
      }),
      catchError(error => {
        this.logger.logUserAction('Failed to load Asset List', error);
        return throwError(() => error);
      })
    );
  }

  loadVehicleList(): Observable<IVehicleGetResponseDto> {
    this.logger.logUserAction('Loading app data - Vehicle List');

    return this.vehicleService.getVehicleList().pipe(
      tap(response => {
        this.logger.logUserAction('Vehicle List loaded successfully', {
          count: response.totalRecords,
        });

        const vehicleList: IOptionDropdown[] = response.records
          .map(vehicle => ({
            label: toTitleCase(
              `${vehicle.registrationNo} (${vehicle.brand} ${vehicle.model})`.trim()
            ),
            value: vehicle.id,
          }))
          .sort(this.sortByLabel);

        this._vehicleList.set(vehicleList);
      }),
      catchError(error => {
        this.logger.logUserAction('Failed to load Vehicle List', error);
        return throwError(() => error);
      })
    );
  }

  loadPetroCardList(): Observable<IPetroCardGetResponseDto> {
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
        this.logger.logUserAction('Failed to load Petro Card List', error);
        return throwError(() => error);
      })
    );
  }

  loadCompanyList(): Observable<ICompanyGetResponseDto> {
    this.logger.logUserAction('Loading app data - Company List');

    return this.companyService.getCompanyList().pipe(
      tap(response => {
        this.logger.logUserAction('Company List loaded successfully', {
          count: response.totalRecords,
        });

        const companyList: IOptionDropdown[] = response.records
          .map(company => ({
            label: toTitleCase(company.name),
            value: company.id,
            data: company,
          }))
          .sort(this.sortByLabel);

        this._companyList.set(companyList);
      }),
      catchError(error => {
        this.logger.logUserAction('Failed to load Company List', error);
        return throwError(() => error);
      })
    );
  }

  loadContractorList(): Observable<IContractorGetResponseDto> {
    this.logger.logUserAction('Loading app data - Contractor List');

    return this.contractorService.getContractorList().pipe(
      tap(response => {
        this.logger.logUserAction('Contractor List loaded successfully', {
          count: response.totalRecords,
        });

        const contractorList: IOptionDropdown[] = response.records
          .map(contractor => ({
            label: toTitleCase(contractor.name),
            value: contractor.id,
          }))
          .sort(this.sortByLabel);

        this._contractorList.set(contractorList);
      }),
      catchError(error => {
        this.logger.logUserAction('Failed to load Contractor List', error);
        return throwError(() => error);
      })
    );
  }

  private normalizeDropdownData(data: unknown[]): IOptionDropdown[] {
    return data
      .map(item => {
        const obj = item as { label: string; value?: string; name?: string };
        return {
          label: toTitleCase(obj.label),
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
    response: IAppConfiguationResponseDto
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

  loadAllAppData(): Observable<{
    permissions: unknown;
    appConfiguration: IAppConfiguationResponseDto;
    employeeList: IEmployeeGetResponseDto;
    roles: IRoleGetResponseDto;
  }> {
    this.logger.info('Loading all app data...');

    return forkJoin({
      permissions:
        this.userPermissionService.fetchAndStoreLoggedInUserPermissions(),
      appConfiguration: this.loadAppConfiguration(),
      employeeList: this.loadEmployeeList(),
      roles: this.loadAllAppRoles(),
    }).pipe(
      tap(() => {
        this.logger.info('All app data loaded successfully');
      }),
      catchError(error => {
        this.logger.error('Failed to load app data', error);
        return throwError(() => error);
      })
    );
  }
}
