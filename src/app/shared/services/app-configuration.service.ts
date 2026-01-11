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
  CLIENT_NAME_DATA,
  EMPLOYEE_STATUS_DATA,
  INDIA_STATE_DATA,
  LOCATION_DATA,
  PASSING_YEAR_DATA,
  PETRO_CARD_STATUS_DATA,
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
  private readonly _employeeStatus = signal<IOptionDropdown[]>([]);
  private readonly _expenseCategories = signal<IOptionDropdown[]>([]);
  private readonly _expensePaymentMethods = signal<IOptionDropdown[]>([]);
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

  // Load App Data
  readonly employeeList = this._employeeList.asReadonly();
  readonly employeeListByRole = this._employeeListByRole.asReadonly();
  readonly roleList = this._roleList.asReadonly();
  readonly clientList = this._clientList.asReadonly();
  readonly locationList = this._locationList.asReadonly();
  readonly assetList = this._assetList.asReadonly();
  readonly vehicleList = this._vehicleList.asReadonly();

  private readonly STATIC_FALLBACK_DATA: Record<
    string,
    Record<string, IOptionDropdown[]>
  > = {
    [MODULE_NAMES.EMPLOYEE]: {
      [CONFIGURATION_KEYS.EMPLOYEE.PASSING_YEARS]: PASSING_YEAR_DATA,
      [CONFIGURATION_KEYS.EMPLOYEE.BANK_NAMES]: BANK_NAME_DATA,
      [CONFIGURATION_KEYS.EMPLOYEE.STATES]: INDIA_STATE_DATA,
      [CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_STATUS]: EMPLOYEE_STATUS_DATA,
    },
    [MODULE_NAMES.ATTENDANCE]: {
      [CONFIGURATION_KEYS.ATTENDANCE.STATUS]: ATTENDANCE_STATUS_DATA,
    },
    [MODULE_NAMES.COMMON]: {
      [CONFIGURATION_KEYS.COMMON.APPROVAL_STATUS]: APPROVAL_STATUS_DATA,
    },
    [MODULE_NAMES.SITE]: {
      [CONFIGURATION_KEYS.SITE.CLIENT_LIST]: CLIENT_NAME_DATA,
      [CONFIGURATION_KEYS.SITE.LOCATION_LIST]: LOCATION_DATA,
    },
    [MODULE_NAMES.PETRO_CARD]: {
      [CONFIGURATION_KEYS.PETRO_CARD.STATUS]: PETRO_CARD_STATUS_DATA,
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
        key: CONFIGURATION_KEYS.EMPLOYEE.STATES,
        signal: this._states,
      },
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.CITIES,
        signal: this._cities,
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
    ],
    [MODULE_NAMES.SITE]: [
      {
        key: CONFIGURATION_KEYS.SITE.CLIENT_LIST,
        signal: this._clientList,
      },
      {
        key: CONFIGURATION_KEYS.SITE.LOCATION_LIST,
        signal: this._locationList,
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

        const employeeList: IOptionDropdown[] = [];
        const employeeListByRole: Record<string, IOptionDropdown[]> = {};

        response.records.forEach(employee => {
          const dropdownItem: IOptionDropdown = {
            label: `${employee.firstName} ${employee.lastName}`.trim(),
            value: employee.id,
          };

          // Add to full employee list
          employeeList.push(dropdownItem);

          // Parse roles (comma-separated string) and add to role-based lists
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

        const roleList = response.records.map(role => ({
          label: role.label,
          value: role.name,
        }));

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

  private populateAllModuleDropdowns(
    moduleConfigMap: Record<string, Record<string, unknown>>
  ): void {
    Object.entries(this.MODULE_DROPDOWN_REGISTRY).forEach(
      ([moduleName, dropdowns]) => {
        dropdowns.forEach(dropdown => {
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

  loadAssetList(): Observable<IAssetGetResponseDto> {
    this.logger.logUserAction('Loading app data - Asset List');

    return this.assetService.getAssetList().pipe(
      tap(response => {
        this.logger.logUserAction('Asset List loaded successfully', {
          count: response.totalRecords,
        });

        const assetList: IOptionDropdown[] = [];

        response.records.forEach(asset => {
          const dropdownItem: IOptionDropdown = {
            label: `${asset.name}`.trim(),
            value: asset.id,
          };

          // Add to full asset list
          assetList.push(dropdownItem);
        });

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

        const vehicleList: IOptionDropdown[] = [];

        response.records.forEach(vehicle => {
          const dropdownItem: IOptionDropdown = {
            label:
              `${vehicle.registrationNo} (${vehicle.brand} ${vehicle.model})`.trim(),
            value: vehicle.id,
          };

          // Add to full asset list
          vehicleList.push(dropdownItem);
        });

        this._vehicleList.set(vehicleList);
      }),
      catchError(error => {
        this.logger.logUserAction('Failed to load Vehicle List', error);
        return throwError(() => error);
      })
    );
  }

  private normalizeDropdownData(data: unknown[]): IOptionDropdown[] {
    return data.map(item => {
      const obj = item as { label: string; value?: string; name?: string };
      return {
        label: obj.label,
        value: obj.value ?? obj.name ?? '',
      };
    });
  }

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
