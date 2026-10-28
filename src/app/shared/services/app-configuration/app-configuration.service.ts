import {
  inject,
  Injectable,
  Injector,
  signal,
  Signal,
  Type,
} from '@angular/core';
import {
  catchError,
  forkJoin,
  from,
  map,
  MonoTypeOperatorFunction,
  Observable,
  of,
  ReplaySubject,
  share,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { LoggerService } from '@core/services';
import { AppPermissionService } from '@core/services/app-permission.service';
import { AuthService } from '@features/auth-management/services/auth.service';
import type { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import type { ICompanyBankAccountGetResponseDto } from '@features/company-bank-account-management/types/company-bank-account.dto';
import type { IEmployeeGetResponseDto } from '@features/employee-management/types/employee.dto';
import { UserDelegationService } from '@features/settings-management/delegation-management/services/user-delegation.service';
import { UserPermissionService } from '@features/settings-management/permission-management/sub-features/user-permission-management/services/user-permission.service';
import type {
  IRoleGetBaseResponseDto,
  IRoleGetResponseDto,
} from '@features/settings-management/permission-management/sub-features/role-management/types/role.dto';
import { RoleService } from '@features/settings-management/permission-management/sub-features/role-management/services/role.service';
import type { ICompanyGetResponseDto } from '@features/site-management/company-management/types/company.dto';
import type { IContractorGetResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import type { IProjectGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import type { IVendorGetResponseDto } from '@features/site-management/vendor-management/types/vendor.dto';
import type { ILinkedUserVehicleDetailGetResponseDto } from '@features/transport-management/fuel-expense-management/types/fuel-expense.dto';
import type { IPetroCardGetResponseDto } from '@features/transport-management/petro-card-management/types/petro-card.dto';
import type { IVehicleGetResponseDto } from '@features/transport-management/vehicle-management/types/vehicle.dto';
import { applyIconsToDropdownOptions } from '@shared/config/dropdown-option-icons.config';
import { CONFIGURATION_KEYS, EUserRole, MODULE_NAMES } from '@shared/constants';
import { PaginatedDropdownService } from '@shared/services/paginated-dropdown.service';
import { IOptionDropdown } from '@shared/types';
import { toTitleCase } from '@shared/utility';

import { ConfigurationDropdownCacheService } from './configuration-dropdown-cache.service';
import { ReferenceEntityDropdownCacheService } from './reference-entity-dropdown-cache.service';
import {
  sortDropdownByLabel,
  toAssetDropdownOption,
  toCompanyBankAccountDropdownOption,
  toCompanyDropdownOption,
  toContractorDropdownOption,
  toEmployeeDropdownOption,
  toPetroCardDropdownOption,
  toProjectDropdownOption,
  toVehicleDropdownOption,
  toVendorDropdownOption,
} from './reference-dropdown.mappers';

/**
 * Public facade for app-wide dropdown/config caches.
 * Delegates to {@link ConfigurationDropdownCacheService} and
 * {@link ReferenceEntityDropdownCacheService}; keeps bootstrap (roles, vendor menu).
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigurationService {
  private readonly injector = inject(Injector);
  private readonly logger = inject(LoggerService);
  private readonly authService = inject(AuthService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly roleService = inject(RoleService);
  private readonly userPermissionService = inject(UserPermissionService);
  private readonly userDelegationService = inject(UserDelegationService);
  private readonly paginatedDropdownService = inject(PaginatedDropdownService);
  private readonly configCache = inject(ConfigurationDropdownCacheService);
  private readonly entityCache = inject(ReferenceEntityDropdownCacheService);

  private roleListCache$?: Observable<IRoleGetResponseDto>;
  private readonly _roleList = signal<IOptionDropdown[]>([]);
  private readonly _clientList = signal<IOptionDropdown[]>([]);
  private readonly _locationList = signal<IOptionDropdown[]>([]);
  private readonly EMPTY_DROPDOWN = signal<IOptionDropdown[]>([]).asReadonly();

  private readonly shareAppDataCache = <T>(): MonoTypeOperatorFunction<T> =>
    share<T>({
      connector: () => new ReplaySubject<T>(1),
      resetOnError: true,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    });

  constructor() {
    this.paginatedDropdownService.registerReferenceListSink({
      merge: (dropdownName, options) =>
        this.entityCache.mergeReferenceDropdownOptions(dropdownName, options),
      clear: dropdownName =>
        this.entityCache.clearReferenceDropdownOptions(dropdownName),
      mapRecords: (dropdownName, records) =>
        this.entityCache.mapReferenceDropdownRecords(dropdownName, records),
    });
  }

  // --- Config-backed dropdowns (delegate) ---
  readonly genders = this.configCache.genders;
  readonly employmentTypes = this.configCache.employmentTypes;
  readonly degrees = this.configCache.degrees;
  readonly branches = this.configCache.branches;
  readonly designations = this.configCache.designations;
  readonly bloodGroups = this.configCache.bloodGroups;
  readonly passingYears = this.configCache.passingYears;
  readonly bankNames = this.configCache.bankNames;
  readonly states = this.configCache.states;
  readonly cities = this.configCache.cities;
  readonly employeeStatus = this.configCache.employeeStatus;
  readonly expenseCategories = this.configCache.expenseCategories;
  readonly expensePaymentMethods = this.configCache.expensePaymentMethods;
  readonly fuelExpensePaymentMethods =
    this.configCache.fuelExpensePaymentMethods;
  readonly attendanceStatus = this.configCache.attendanceStatus;
  readonly approvalStatus = this.configCache.approvalStatus;
  readonly projectDocumentApprovalStatuses =
    this.configCache.projectDocumentApprovalStatuses;
  readonly partyTypes = this.configCache.partyTypes;
  readonly assetCategories = this.configCache.assetCategories;
  readonly assetTypes = this.configCache.assetTypes;
  readonly assetStatuses = this.configCache.assetStatuses;
  readonly assetCalibrationSources = this.configCache.assetCalibrationSources;
  readonly assetCalibrationStatuses =
    this.configCache.assetCalibrationStatuses;
  readonly assetWarrantyStatuses = this.configCache.assetWarrantyStatuses;
  readonly assetCalibrationFrequencies =
    this.configCache.assetCalibrationFrequencies;
  readonly assetEventStatuses = this.configCache.assetEventStatuses;
  readonly petroCardStatus = this.configCache.petroCardStatus;
  readonly vehicleFuelTypes = this.configCache.vehicleFuelTypes;
  readonly vehicleStatuses = this.configCache.vehicleStatuses;
  readonly vehicleDocumentStatuses = this.configCache.vehicleDocumentStatuses;
  readonly vehicleServiceStatuses = this.configCache.vehicleServiceStatuses;
  readonly vehicleEventStatuses = this.configCache.vehicleEventStatuses;
  readonly vehicleServiceTypes = this.configCache.vehicleServiceTypes;
  readonly vehicleServiceStatus = this.configCache.vehicleServiceStatus;
  readonly payrollStatus = this.configCache.payrollStatus;
  readonly companyStatus = this.configCache.companyStatus;
  readonly contractorStatus = this.configCache.contractorStatus;
  readonly vendorTypes = this.configCache.vendorTypes;
  readonly projectSiteTypes = this.configCache.projectSiteTypes;
  readonly projectStatus = this.configCache.projectStatus;
  readonly projectAllocationStatuses =
    this.configCache.projectAllocationStatuses;
  readonly siteRoles = this.configCache.siteRoles;
  readonly poGstTypes = this.configCache.poGstTypes;
  readonly poTypes = this.configCache.poTypes;
  readonly units = this.configCache.units;
  readonly projectWorkTypes = this.configCache.projectWorkTypes;
  readonly projectDocumentTypes = this.configCache.projectDocumentTypes;
  readonly moduleNames = this.configCache.moduleNames;
  readonly modulesConfig = this.configCache.modulesConfig;
  readonly announcementStatuses = this.configCache.announcementStatuses;
  readonly paymentSheetStatuses = this.configCache.paymentSheetStatuses;
  readonly paymentSheetStages = this.configCache.paymentSheetStages;
  readonly paymentSheetItemStatuses =
    this.configCache.paymentSheetItemStatuses;
  readonly configurationTypes = this.configCache.configurationTypes;

  // --- Entity list dropdowns (delegate) ---
  readonly companyList = this.entityCache.companyList;
  readonly contractorList = this.entityCache.contractorList;
  readonly vendorList = this.entityCache.vendorList;
  readonly projectList = this.entityCache.projectList;
  readonly employeeList = this.entityCache.employeeList;
  readonly employeeListByRole = this.entityCache.employeeListByRole;
  readonly assetList = this.entityCache.assetList;
  readonly vehicleList = this.entityCache.vehicleList;
  readonly petroCardList = this.entityCache.petroCardList;
  readonly companyBankAccountList = this.entityCache.companyBankAccountList;
  readonly linkedUserVehicleDetail = this.entityCache.linkedUserVehicleDetail;

  // --- Bootstrap-owned ---
  readonly roleList = this._roleList.asReadonly();
  readonly clientList = this._clientList.asReadonly();
  readonly locationList = this._locationList.asReadonly();

  /**
   * Drops cached HTTP streams and resets config-backed dropdown signals
   * (login, tests, manual refresh). Entity list signals stay until their refresh/load.
   */
  invalidateAppConfigurationCaches(): void {
    this.userDelegationService.clearManagedUsersCache();
    this.roleListCache$ = undefined;
    this.configCache.invalidateConfigurationKeyCaches();
    this.entityCache.invalidateReferenceListCaches();
  }

  /**
   * After configuration add/edit: drop caches + reset signals for the given keys
   * (or all config dropdowns when keys omitted).
   */
  invalidateConfigurationDropdowns(keys?: string[]): void {
    if (keys?.length) {
      this.configCache.invalidateConfigurationKeys(keys);
      return;
    }
    this.configCache.invalidateConfigurationKeyCaches();
  }

  invalidateReferenceListCaches(): void {
    this.entityCache.invalidateReferenceListCaches();
  }

  refreshEmployeeDropdowns(): void {
    this.entityCache.refreshEmployeeDropdowns();
  }

  refreshAssetDropdowns(): void {
    this.entityCache.refreshAssetDropdowns();
  }

  refreshVehicleDropdowns(): void {
    this.entityCache.refreshVehicleDropdowns();
  }

  refreshCompanyDropdowns(): void {
    this.entityCache.refreshCompanyDropdowns();
  }

  refreshContractorDropdowns(): void {
    this.entityCache.refreshContractorDropdowns();
  }

  refreshVendorDropdowns(): void {
    this.entityCache.refreshVendorDropdowns();
  }

  refreshProjectListDropdowns(): void {
    this.entityCache.refreshProjectListDropdowns();
  }

  refreshPetroCardDropdowns(): void {
    this.entityCache.refreshPetroCardDropdowns();
  }

  refreshCompanyBankAccountDropdowns(): void {
    this.entityCache.refreshCompanyBankAccountDropdowns();
  }

  refreshLinkedUserVehicleDropdowns(): void {
    this.entityCache.refreshLinkedUserVehicleDropdowns();
  }

  refreshAllReferenceDropdowns(): void {
    this.entityCache.refreshAllReferenceDropdowns();
  }

  runAfterTouchedConfiguration<T>(
    work: () => T,
    apply: (value: T) => void
  ): void {
    this.configCache.runAfterTouchedConfiguration(work, apply);
  }

  afterTouchedConfiguration<T>(work: () => T): Observable<T> {
    return this.configCache.afterTouchedConfiguration(work);
  }

  loadEmployeeList(): Observable<IEmployeeGetResponseDto> {
    return this.entityCache.loadEmployeeList();
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
            .sort(sortDropdownByLabel)
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
    this.configCache.ensureConfigurationForKey(module, key);

    if (
      module === MODULE_NAMES.COMMON &&
      key === CONFIGURATION_KEYS.COMMON.ROLE_LIST
    ) {
      return this.roleList;
    }

    return (
      this.configCache.getRegistrySignal(module, key) ??
      this.entityCache.getRegistrySignal(module, key) ??
      this.EMPTY_DROPDOWN
    );
  }

  isConfigurationKeyLoading(moduleName: string, key: string): boolean {
    return this.configCache.isConfigurationKeyLoading(moduleName, key);
  }

  mergeReferenceDropdownOptions(
    dropdownName: string,
    options: IOptionDropdown[]
  ): void {
    this.entityCache.mergeReferenceDropdownOptions(dropdownName, options);
  }

  clearReferenceDropdownOptions(dropdownName: string): void {
    this.entityCache.clearReferenceDropdownOptions(dropdownName);
  }

  getEmployeesByRole(roleName: string): IOptionDropdown[] {
    return this.entityCache.getEmployeesByRole(roleName);
  }

  getCitiesByState(stateValue: string): IOptionDropdown[] {
    return this.configCache.getCitiesByState(stateValue);
  }

  getModuleActionsByModuleName(moduleName: string): IOptionDropdown[] {
    return this.configCache.getModuleActionsByModuleName(moduleName);
  }

  loadAssetList(): Observable<IAssetGetResponseDto> {
    return this.entityCache.loadAssetList();
  }

  loadVehicleList(): Observable<IVehicleGetResponseDto> {
    return this.entityCache.loadVehicleList();
  }

  loadPetroCardList(): Observable<IPetroCardGetResponseDto> {
    return this.entityCache.loadPetroCardList();
  }

  loadCompanyBankAccountList(): Observable<ICompanyBankAccountGetResponseDto> {
    return this.entityCache.loadCompanyBankAccountList();
  }

  loadCompanyList(): Observable<ICompanyGetResponseDto> {
    return this.entityCache.loadCompanyList();
  }

  loadContractorList(): Observable<IContractorGetResponseDto> {
    return this.entityCache.loadContractorList();
  }

  loadVendorList(): Observable<IVendorGetResponseDto> {
    return this.entityCache.loadVendorList();
  }

  loadProjectList(): Observable<IProjectGetResponseDto> {
    return this.entityCache.loadProjectList();
  }

  toEmployeeDropdownOption(
    employee: IEmployeeGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toEmployeeDropdownOption(employee);
  }

  toAssetDropdownOption(
    asset: IAssetGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toAssetDropdownOption(asset);
  }

  toVehicleDropdownOption(
    vehicle: IVehicleGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toVehicleDropdownOption(vehicle);
  }

  toPetroCardDropdownOption(
    petroCard: IPetroCardGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toPetroCardDropdownOption(petroCard);
  }

  toCompanyBankAccountDropdownOption(
    account: ICompanyBankAccountGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toCompanyBankAccountDropdownOption(account);
  }

  toCompanyDropdownOption(
    company: ICompanyGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toCompanyDropdownOption(company);
  }

  toContractorDropdownOption(
    contractor: IContractorGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toContractorDropdownOption(contractor);
  }

  toVendorDropdownOption(
    vendor: IVendorGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toVendorDropdownOption(vendor);
  }

  toProjectDropdownOption(
    project: IProjectGetResponseDto['records'][number]
  ): IOptionDropdown {
    return toProjectDropdownOption(project, this.projectSiteTypes());
  }

  loadLinkedUserVehicleDetailForCurrentUser(): Observable<ILinkedUserVehicleDetailGetResponseDto | null> {
    return this.entityCache.loadLinkedUserVehicleDetailForCurrentUser();
  }

  isDropdownLoading(dropdownKey: string): boolean {
    return (
      this.configCache.isDropdownLoading(dropdownKey) ||
      this.entityCache.isDropdownLoading(dropdownKey)
    );
  }

  buildPassingYearDropdownOptions(): IOptionDropdown[] {
    return this.configCache.buildPassingYearDropdownOptions();
  }

  loadReferenceLists(): Observable<void> {
    return of(undefined);
  }

  loadAllAppData(): Observable<{
    roles: IRoleGetResponseDto;
    permissions: unknown;
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
          vendorMenuAccess: this.loadVendorMenuAccessForActiveRole(),
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

  /**
   * Startup-safe loader: fetches only data required globally at app bootstrap/login.
   * Configuration modules and entity lists load when a page first needs them.
   */
  loadCriticalAppData(): Observable<{
    roles: IRoleGetResponseDto;
    permissions: unknown;
  }> {
    this.logger.info('Loading critical app data...');

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
          vendorMenuAccess: this.loadVendorMenuAccessForActiveRole(),
          managedUsers: this.userDelegationService.loadManagedUsers().pipe(
            catchError(error => {
              this.logger.error('Failed to load managed users', error);
              return of(null);
            })
          ),
        }).pipe(
          map(parallelResults => ({
            roles: rolesResponse,
            ...parallelResults,
          }))
        );
      }),
      tap(() => this.logger.info('Critical app data loaded successfully')),
      catchError(error => {
        this.logger.error('Failed to load critical app data', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Fire-and-forget prefetch for non-critical entity lists.
   * Keeps navigation fast while warming caches in background.
   */
  prefetchReferenceListsInBackground(): void {
    return;
  }

  private injectAfterLoad<T>(loadToken: () => Promise<Type<T>>): Observable<T> {
    return from(loadToken().then(token => this.injector.get(token)));
  }

  private isActiveRoleEmployee(): boolean {
    return this.authService.getCurrentUser()?.activeRole === EUserRole.EMPLOYEE;
  }

  private loadVendorMenuAccessForActiveRole(): Observable<boolean> {
    if (!this.isActiveRoleEmployee()) {
      this.appPermissionService.setAssignableVendorAccess({
        gated: false,
        allowed: true,
        siteIds: [],
      });
      return of(true);
    }

    return this.loadAssignableVendorMenuAccess();
  }

  private loadAssignableVendorMenuAccess(): Observable<boolean> {
    return this.injectAfterLoad(() =>
      import(
        '@features/site-management/vendor-management/services/vendor.service'
      ).then(m => m.VendorService)
    ).pipe(
      switchMap(vendorService => vendorService.getAssignableSiteVendors()),
      tap(response => {
        this.appPermissionService.setAssignableVendorAccess({
          gated: true,
          allowed: response.allowed === true,
          siteIds: (response.sites ?? []).map(site => site.id),
        });
      }),
      map(response => response.allowed === true),
      catchError(() => {
        this.appPermissionService.setAssignableVendorAccess({
          gated: true,
          allowed: false,
          siteIds: [],
        });
        return of(false);
      })
    );
  }
}
