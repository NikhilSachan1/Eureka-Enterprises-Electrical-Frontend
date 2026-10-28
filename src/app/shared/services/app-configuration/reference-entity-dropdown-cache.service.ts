import {
  inject,
  Injectable,
  Injector,
  signal,
  Signal,
  Type,
  WritableSignal,
} from '@angular/core';
import {
  catchError,
  from,
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
  finalize,
} from 'rxjs';

import { LoggerService } from '@core/services';
import type { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import type { ICompanyBankAccountGetResponseDto } from '@features/company-bank-account-management/types/company-bank-account.dto';
import type { IEmployeeGetResponseDto } from '@features/employee-management/types/employee.dto';
import type { ICompanyGetResponseDto } from '@features/site-management/company-management/types/company.dto';
import type { IContractorGetResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import type { IProjectGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import type { IVendorGetResponseDto } from '@features/site-management/vendor-management/types/vendor.dto';
import type { ILinkedUserVehicleDetailGetResponseDto } from '@features/transport-management/fuel-expense-management/types/fuel-expense.dto';
import type { IPetroCardGetResponseDto } from '@features/transport-management/petro-card-management/types/petro-card.dto';
import type { IVehicleGetResponseDto } from '@features/transport-management/vehicle-management/types/vehicle.dto';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { PaginatedDropdownService } from '@shared/services/paginated-dropdown.service';
import { IOptionDropdown } from '@shared/types';

import { ConfigurationDropdownCacheService } from './configuration-dropdown-cache.service';
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

@Injectable({
  providedIn: 'root',
})
export class ReferenceEntityDropdownCacheService {
  private readonly referenceDropdownListPayload = { page: 1, pageSize: 50 };
  private readonly siteAssetDropdownListPayload = { page: 1, pageSize: 100 };
  private readonly injector = inject(Injector);
  private readonly logger = inject(LoggerService);
  private readonly paginatedDropdownService = inject(PaginatedDropdownService);
  private readonly configCache = inject(ConfigurationDropdownCacheService);

  /** Loads a feature service only when its dropdown/list is first requested. */
  private injectAfterLoad<T>(loadToken: () => Promise<Type<T>>): Observable<T> {
    return from(loadToken().then(token => this.injector.get(token)));
  }

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

  private employeeListCache$?: Observable<IEmployeeGetResponseDto>;
  private assetListCache$?: Observable<IAssetGetResponseDto>;
  private vehicleListCache$?: Observable<IVehicleGetResponseDto>;
  private petroCardListCache$?: Observable<IPetroCardGetResponseDto>;
  private companyBankAccountListCache$?: Observable<ICompanyBankAccountGetResponseDto>;
  private companyListCache$?: Observable<ICompanyGetResponseDto>;
  private contractorListCache$?: Observable<IContractorGetResponseDto>;
  private vendorListCache$?: Observable<IVendorGetResponseDto>;
  private projectListCache$?: Observable<IProjectGetResponseDto>;
  private linkedUserVehicleDetailCache$?: Observable<ILinkedUserVehicleDetailGetResponseDto | null>;
  private readonly _dropdownLoadingState = signal<Record<string, boolean>>({});
  private readonly lazyReferenceDropdownLoadScheduledKeys = new Set<string>();

  private readonly _companyList = signal<IOptionDropdown[]>([]);
  private readonly _contractorList = signal<IOptionDropdown[]>([]);
  private readonly _vendorList = signal<IOptionDropdown[]>([]);
  private readonly _projectList = signal<IOptionDropdown[]>([]);
  private readonly _employeeList = signal<IOptionDropdown[]>([]);
  private readonly _employeeListByRole = signal<
    Record<string, IOptionDropdown[]>
  >({});
  private readonly _assetList = signal<IOptionDropdown[]>([]);
  private readonly _vehicleList = signal<IOptionDropdown[]>([]);
  private readonly _petroCardList = signal<IOptionDropdown[]>([]);
  private readonly _companyBankAccountList = signal<IOptionDropdown[]>([]);
  private readonly _linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);

  readonly companyList = this._companyList.asReadonly();
  readonly contractorList = this._contractorList.asReadonly();
  readonly vendorList = this._vendorList.asReadonly();
  readonly projectList = this._projectList.asReadonly();
  readonly employeeList = this._employeeList.asReadonly();
  readonly employeeListByRole = this._employeeListByRole.asReadonly();
  readonly assetList = this._assetList.asReadonly();
  readonly vehicleList = this._vehicleList.asReadonly();
  readonly petroCardList = this._petroCardList.asReadonly();
  readonly companyBankAccountList = this._companyBankAccountList.asReadonly();
  readonly linkedUserVehicleDetail = this._linkedUserVehicleDetail.asReadonly();

  /** Entity-list keys only — facade composes this with config-key registry. */
  private readonly MODULE_DROPDOWN_REGISTRY: Record<
    string,
    readonly { key: string; signal: WritableSignal<IOptionDropdown[]> }[]
  > = {
    [MODULE_NAMES.EMPLOYEE]: [
      {
        key: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        signal: this._employeeList,
      },
    ],
    [MODULE_NAMES.VEHICLE]: [
      {
        key: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
        signal: this._vehicleList,
      },
    ],
    [MODULE_NAMES.ASSET]: [
      {
        key: CONFIGURATION_KEYS.ASSET.ASSET_LIST,
        signal: this._assetList,
      },
    ],
    [MODULE_NAMES.PETRO_CARD]: [
      {
        key: CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST,
        signal: this._petroCardList,
      },
    ],
    [MODULE_NAMES.COMPANY_BANK_ACCOUNT]: [
      {
        key: CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST,
        signal: this._companyBankAccountList,
      },
    ],
    [MODULE_NAMES.COMPANY]: [
      {
        key: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
        signal: this._companyList,
      },
    ],
    [MODULE_NAMES.CONTRACTOR]: [
      {
        key: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
        signal: this._contractorList,
      },
    ],
    [MODULE_NAMES.VENDOR]: [
      {
        key: CONFIGURATION_KEYS.VENDOR.VENDOR_LIST,
        signal: this._vendorList,
      },
    ],
    [MODULE_NAMES.PROJECT]: [
      {
        key: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
        signal: this._projectList,
      },
    ],
  };

  /**
   * Clears only entity list caches (employees, assets, vehicles, …).
   * Does not clear populated signals.
   */
  invalidateReferenceListCaches(): void {
    this.employeeListCache$ = undefined;
    this.assetListCache$ = undefined;
    this.vehicleListCache$ = undefined;
    this.petroCardListCache$ = undefined;
    this.companyBankAccountListCache$ = undefined;
    this.companyListCache$ = undefined;
    this.contractorListCache$ = undefined;
    this.vendorListCache$ = undefined;
    this.projectListCache$ = undefined;
    this.linkedUserVehicleDetailCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.clear();
  }

  /** Refetch one list after CRUD so cached dropdown data matches the server. */
  refreshEmployeeDropdowns(): void {
    this.employeeListCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST
    );
    this.paginatedDropdownService.invalidate(
      CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST
    );
  }

  refreshAssetDropdowns(): void {
    this.assetListCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.ASSET.ASSET_LIST
    );
    this.paginatedDropdownService.invalidate(CONFIGURATION_KEYS.ASSET.ASSET_LIST);
  }

  refreshVehicleDropdowns(): void {
    this.vehicleListCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST
    );
    this.paginatedDropdownService.invalidate(
      CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST
    );
  }

  refreshCompanyDropdowns(): void {
    this.companyListCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.COMPANY.COMPANY_LIST
    );
    this.paginatedDropdownService.invalidate(
      CONFIGURATION_KEYS.COMPANY.COMPANY_LIST
    );
  }

  refreshContractorDropdowns(): void {
    this.contractorListCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST
    );
    this.paginatedDropdownService.invalidate(
      CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST
    );
  }

  refreshVendorDropdowns(): void {
    this.vendorListCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.VENDOR.VENDOR_LIST
    );
    this.paginatedDropdownService.invalidate(CONFIGURATION_KEYS.VENDOR.VENDOR_LIST);
  }

  refreshProjectListDropdowns(): void {
    this.projectListCache$ = undefined;
    this._projectList.set([]);
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.PROJECT.PROJECT_LIST
    );
    this.paginatedDropdownService.invalidate(
      CONFIGURATION_KEYS.PROJECT.PROJECT_LIST
    );
  }

  refreshPetroCardDropdowns(): void {
    this.petroCardListCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST
    );
    this.paginatedDropdownService.invalidate(
      CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST
    );
  }

  refreshCompanyBankAccountDropdowns(): void {
    this.companyBankAccountListCache$ = undefined;
    this.lazyReferenceDropdownLoadScheduledKeys.delete(
      CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST
    );
    this.paginatedDropdownService.invalidate(
      CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST
    );
  }

  refreshLinkedUserVehicleDropdowns(): void {
    this.linkedUserVehicleDetailCache$ = undefined;
    this.loadLinkedUserVehicleDetailForCurrentUser()
      .pipe(take(1))
      .subscribe({
        error: err => this.logger.error('Linked vehicle refetch failed', err),
      });
  }

  /** When many lists may have changed; heavier than a single refresh* method. */
  refreshAllReferenceDropdowns(): void {
    this.invalidateReferenceListCaches();
    this.paginatedDropdownService.invalidateAll();
  }

  loadEmployeeList(): Observable<IEmployeeGetResponseDto> {
    return (this.employeeListCache$ ??= this.fetchEmployeeList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchEmployeeList(): Observable<IEmployeeGetResponseDto> {
    this.logger.logUserAction('Loading app data - Employee List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
      this.injectAfterLoad(() =>
        import(
          '@features/employee-management/services/employee.service'
        ).then(m => m.EmployeeService)
      ).pipe(
        switchMap(employeeService =>
          employeeService.getEmployeeList(this.referenceDropdownListPayload)
        ),
        tap(response => {
          this.logger.logUserAction('Employee List loaded successfully', {
            count: response.totalRecords,
          });

          const employeeListByRole: Record<string, IOptionDropdown[]> = {};

          const employeeList: IOptionDropdown[] = response.records
            .map(employee => {
              const dropdownItem = toEmployeeDropdownOption(employee);

              const roles = employee.roles
                .map(role => role.name.trim())
                .filter(role => role.length > 0);

              roles.forEach(role => {
                if (!employeeListByRole[role]) {
                  employeeListByRole[role] = [];
                }
                employeeListByRole[role].push(dropdownItem);
              });

              return dropdownItem;
            })
            .sort(sortDropdownByLabel);

          Object.keys(employeeListByRole).forEach(role => {
            employeeListByRole[role].sort(sortDropdownByLabel);
          });

          this._employeeList.set(employeeList);
          this._employeeListByRole.set(employeeListByRole);
        }),
        catchError(error => {
          this.employeeListCache$ = undefined;
          this.logger.logUserAction('Failed to load Employee List', error);
          return throwError(() => error);
        })
      )
    );
  }

  loadAssetList(): Observable<IAssetGetResponseDto> {
    return (this.assetListCache$ ??= this.fetchAssetList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchAssetList(): Observable<IAssetGetResponseDto> {
    this.logger.logUserAction('Loading app data - Asset List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.ASSET.ASSET_LIST,
      this.injectAfterLoad(() =>
        import('@features/asset-management/services/asset.service').then(
          m => m.AssetService
        )
      ).pipe(
        switchMap(assetService =>
          assetService.getAssetList(this.siteAssetDropdownListPayload)
        ),
        tap(response => {
          this.logger.logUserAction('Asset List loaded successfully', {
            count: response.totalRecords,
          });

          const assetList: IOptionDropdown[] = response.records
            .map(asset => toAssetDropdownOption(asset))
            .sort(sortDropdownByLabel);

          this._assetList.set(assetList);
        }),
        catchError(error => {
          this.assetListCache$ = undefined;
          this.logger.logUserAction('Failed to load Asset List', error);
          return throwError(() => error);
        })
      )
    );
  }

  loadVehicleList(): Observable<IVehicleGetResponseDto> {
    return (this.vehicleListCache$ ??= this.fetchVehicleList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchVehicleList(): Observable<IVehicleGetResponseDto> {
    this.logger.logUserAction('Loading app data - Vehicle List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
      this.injectAfterLoad(() =>
        import(
          '@features/transport-management/vehicle-management/services/vehicle.service'
        ).then(m => m.VehicleService)
      ).pipe(
        switchMap(vehicleService =>
          vehicleService.getVehicleList(this.referenceDropdownListPayload)
        ),
        tap(response => {
          this.logger.logUserAction('Vehicle List loaded successfully', {
            count: response.totalRecords,
          });

          const vehicleList: IOptionDropdown[] = response.records
            .map(vehicle => toVehicleDropdownOption(vehicle))
            .sort(sortDropdownByLabel);

          this._vehicleList.set(vehicleList);
        }),
        catchError(error => {
          this.vehicleListCache$ = undefined;
          this.logger.logUserAction('Failed to load Vehicle List', error);
          return throwError(() => error);
        })
      )
    );
  }

  loadPetroCardList(): Observable<IPetroCardGetResponseDto> {
    return (this.petroCardListCache$ ??= this.fetchPetroCardList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchPetroCardList(): Observable<IPetroCardGetResponseDto> {
    this.logger.logUserAction('Loading app data - Petro Card List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST,
      this.injectAfterLoad(() =>
        import(
          '@features/transport-management/petro-card-management/services/petro-card.service'
        ).then(m => m.PetroCardService)
      ).pipe(
        switchMap(petroCardService =>
          petroCardService.getPetroCardList(this.referenceDropdownListPayload)
        ),
        tap(response => {
          this.logger.logUserAction('Petro Card List loaded successfully', {
            count: response.totalRecords,
          });

          const petroCardList: IOptionDropdown[] = response.records
            .map(petroCard => toPetroCardDropdownOption(petroCard))
            .sort(sortDropdownByLabel);

          this._petroCardList.set(petroCardList);
        }),
        catchError(error => {
          this.petroCardListCache$ = undefined;
          this.logger.logUserAction('Failed to load Petro Card List', error);
          return throwError(() => error);
        })
      )
    );
  }

  loadCompanyBankAccountList(): Observable<ICompanyBankAccountGetResponseDto> {
    return (this.companyBankAccountListCache$ ??=
      this.fetchCompanyBankAccountList().pipe(this.shareAppDataCache()));
  }

  private fetchCompanyBankAccountList(): Observable<ICompanyBankAccountGetResponseDto> {
    this.logger.logUserAction('Loading app data - Company Bank Account List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST,
      this.injectAfterLoad(() =>
        import(
          '@features/company-bank-account-management/services/company-bank-account.service'
        ).then(m => m.CompanyBankAccountService)
      ).pipe(
        switchMap(companyBankAccountService =>
          companyBankAccountService.getCompanyBankAccountList(
            this.referenceDropdownListPayload
          )
        ),
        tap(response => {
          this.logger.logUserAction(
            'Company Bank Account List loaded successfully',
            {
              count: response.totalRecords,
            }
          );

          const companyBankAccountList: IOptionDropdown[] = response.records
            .filter(account => account.isActive)
            .map(account => toCompanyBankAccountDropdownOption(account))
            .sort(sortDropdownByLabel);

          this._companyBankAccountList.set(companyBankAccountList);
        }),
        catchError(error => {
          this.companyBankAccountListCache$ = undefined;
          this.logger.logUserAction(
            'Failed to load Company Bank Account List',
            error
          );
          return throwError(() => error);
        })
      )
    );
  }

  loadCompanyList(): Observable<ICompanyGetResponseDto> {
    return (this.companyListCache$ ??= this.fetchCompanyList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchCompanyList(): Observable<ICompanyGetResponseDto> {
    this.logger.logUserAction('Loading app data - Company List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
      this.injectAfterLoad(() =>
        import(
          '@features/site-management/company-management/services/company.service'
        ).then(m => m.CompanyService)
      ).pipe(
        switchMap(companyService =>
          companyService.getCompanyList(this.referenceDropdownListPayload)
        ),
        tap(response => {
          this.logger.logUserAction('Company List loaded successfully', {
            count: response.totalRecords,
          });

          const companyList: IOptionDropdown[] = response.records
            .map(company => toCompanyDropdownOption(company))
            .sort(sortDropdownByLabel);

          this._companyList.set(companyList);
        }),
        catchError(error => {
          this.companyListCache$ = undefined;
          this.logger.logUserAction('Failed to load Company List', error);
          return throwError(() => error);
        })
      )
    );
  }

  loadContractorList(): Observable<IContractorGetResponseDto> {
    return (this.contractorListCache$ ??= this.fetchContractorList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchContractorList(): Observable<IContractorGetResponseDto> {
    this.logger.logUserAction('Loading app data - Contractor List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
      this.injectAfterLoad(() =>
        import(
          '@features/site-management/contractor-management/services/contractor.service'
        ).then(m => m.ContractorService)
      ).pipe(
        switchMap(contractorService =>
          contractorService.getContractorList(this.referenceDropdownListPayload)
        ),
        tap(response => {
          this.logger.logUserAction('Contractor List loaded successfully', {
            count: response.totalRecords,
          });

          const contractorList: IOptionDropdown[] = response.records
            .map(contractor => toContractorDropdownOption(contractor))
            .sort(sortDropdownByLabel);

          this._contractorList.set(contractorList);
        }),
        catchError(error => {
          this.contractorListCache$ = undefined;
          this.logger.logUserAction('Failed to load Contractor List', error);
          return throwError(() => error);
        })
      )
    );
  }

  loadVendorList(): Observable<IVendorGetResponseDto> {
    return (this.vendorListCache$ ??= this.fetchVendorList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchVendorList(): Observable<IVendorGetResponseDto> {
    this.logger.logUserAction('Loading app data - Vendor List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.VENDOR.VENDOR_LIST,
      this.injectAfterLoad(() =>
        import(
          '@features/site-management/vendor-management/services/vendor.service'
        ).then(m => m.VendorService)
      ).pipe(
        switchMap(vendorService =>
          vendorService.getVendorList(this.referenceDropdownListPayload)
        ),
        tap(response => {
          this.logger.logUserAction('Vendor List loaded successfully', {
            count: response.totalRecords,
          });

          const vendorList: IOptionDropdown[] = response.records
            .map(vendor => toVendorDropdownOption(vendor))
            .sort(sortDropdownByLabel);

          this._vendorList.set(vendorList);
        }),
        catchError(error => {
          this.vendorListCache$ = undefined;
          this.logger.logUserAction('Failed to load Vendor List', error);
          return throwError(() => error);
        })
      )
    );
  }

  loadProjectList(): Observable<IProjectGetResponseDto> {
    return (this.projectListCache$ ??= this.fetchProjectList().pipe(
      this.shareAppDataCache()
    ));
  }

  private fetchProjectList(): Observable<IProjectGetResponseDto> {
    this.logger.logUserAction('Loading app data - Project List');

    return this.withDropdownLoading(
      CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
      this.injectAfterLoad(() =>
        import(
          '@features/site-management/project-management/services/project.service'
        ).then(m => m.ProjectService)
      ).pipe(
        switchMap(projectService =>
          projectService
            .getProjectList(this.siteAssetDropdownListPayload)
            .pipe(
              switchMap(response =>
                this.configCache
                  .afterTouchedConfiguration(() => {
                    this.logger.logUserAction(
                      'Project List loaded successfully',
                      {
                        count: response.totalRecords,
                      }
                    );

                    return response.records
                      .map(project =>
                        toProjectDropdownOption(
                          project,
                          this.configCache.projectSiteTypes()
                        )
                      )
                      .sort(sortDropdownByLabel);
                  })
                  .pipe(
                    tap(projectOptions => {
                      this._projectList.set(projectOptions);
                    }),
                    map(() => response)
                  )
              )
            )
        ),
        catchError(error => {
          this.projectListCache$ = undefined;
          this.logger.logUserAction('Failed to load Project List', error);
          return throwError(() => error);
        })
      )
    );
  }

  loadLinkedUserVehicleDetailForCurrentUser(): Observable<ILinkedUserVehicleDetailGetResponseDto | null> {
    return (this.linkedUserVehicleDetailCache$ ??=
      this.fetchLinkedUserVehicleDetailForCurrentUser().pipe(
        this.shareAppDataCache()
      ));
  }

  private fetchLinkedUserVehicleDetailForCurrentUser(): Observable<ILinkedUserVehicleDetailGetResponseDto | null> {
    this.logger.logUserAction('Loading app data - Linked User Vehicle Detail');

    return this.withDropdownLoading(
      'linked_user_vehicle_detail',
      this.injectAfterLoad(() =>
        import(
          '@features/transport-management/fuel-expense-management/services/fuel-expense.service'
        ).then(m => m.FuelExpenseService)
      ).pipe(
        switchMap(fuelExpenseService =>
          fuelExpenseService.getLinkedUserVehicleDetail({ employeeName: null })
        ),
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
      )
    );
  }

  mergeReferenceDropdownOptions(
    dropdownName: string,
    options: IOptionDropdown[]
  ): void {
    const target = this.referenceListSignal(dropdownName);
    if (!target || options.length === 0) {
      return;
    }

    const merged = new Map(target().map(option => [option.value, option]));
    options.forEach(option => merged.set(option.value, option));
    target.set([...merged.values()]);

    if (dropdownName === CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST) {
      this.mergeEmployeeListByRole(options);
    }
  }

  clearReferenceDropdownOptions(dropdownName: string): void {
    this.referenceListSignal(dropdownName)?.set([]);
    if (dropdownName === CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST) {
      this._employeeListByRole.set({});
    }
  }

  mapReferenceDropdownRecords(
    dropdownName: string,
    records: unknown[]
  ): Observable<IOptionDropdown[]> {
    const mapNow = (): IOptionDropdown[] => {
      switch (dropdownName) {
        case CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST:
          return (records as IEmployeeGetResponseDto['records']).map(record =>
            toEmployeeDropdownOption(record)
          );
        case CONFIGURATION_KEYS.ASSET.ASSET_LIST:
          return (records as IAssetGetResponseDto['records']).map(record =>
            toAssetDropdownOption(record)
          );
        case CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST:
          return (records as IVehicleGetResponseDto['records']).map(record =>
            toVehicleDropdownOption(record)
          );
        case CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST:
          return (records as IPetroCardGetResponseDto['records']).map(record =>
            toPetroCardDropdownOption(record)
          );
        case CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST:
          return (
            records as ICompanyBankAccountGetResponseDto['records']
          ).map(record => toCompanyBankAccountDropdownOption(record));
        case CONFIGURATION_KEYS.COMPANY.COMPANY_LIST:
          return (records as ICompanyGetResponseDto['records']).map(record =>
            toCompanyDropdownOption(record)
          );
        case CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST:
          return (records as IContractorGetResponseDto['records']).map(record =>
            toContractorDropdownOption(record)
          );
        case CONFIGURATION_KEYS.VENDOR.VENDOR_LIST:
          return (records as IVendorGetResponseDto['records']).map(record =>
            toVendorDropdownOption(record)
          );
        case CONFIGURATION_KEYS.PROJECT.PROJECT_LIST:
          return (records as IProjectGetResponseDto['records']).map(record =>
            toProjectDropdownOption(record, this.configCache.projectSiteTypes())
          );
        default:
          return [];
      }
    };

    if (dropdownName === CONFIGURATION_KEYS.PROJECT.PROJECT_LIST) {
      return this.configCache.afterTouchedConfiguration(mapNow);
    }

    return of(mapNow());
  }

  getEmployeesByRole(roleName: string): IOptionDropdown[] {
    return this._employeeListByRole()[roleName] ?? [];
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

  isDropdownLoading(dropdownKey: string): boolean {
    return !!this._dropdownLoadingState()[dropdownKey];
  }

  private referenceListSignal(
    dropdownName: string
  ): WritableSignal<IOptionDropdown[]> | undefined {
    const signals: Record<string, WritableSignal<IOptionDropdown[]>> = {
      [CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST]: this._employeeList,
      [CONFIGURATION_KEYS.ASSET.ASSET_LIST]: this._assetList,
      [CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST]: this._vehicleList,
      [CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST]: this._petroCardList,
      [CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST]:
        this._companyBankAccountList,
      [CONFIGURATION_KEYS.COMPANY.COMPANY_LIST]: this._companyList,
      [CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST]: this._contractorList,
      [CONFIGURATION_KEYS.VENDOR.VENDOR_LIST]: this._vendorList,
      [CONFIGURATION_KEYS.PROJECT.PROJECT_LIST]: this._projectList,
    };
    return signals[dropdownName];
  }

  private mergeEmployeeListByRole(options: IOptionDropdown[]): void {
    const current = { ...this._employeeListByRole() };
    options.forEach(option => {
      const roles =
        (
          option.data as { roles?: { name?: string | null }[] | null } | undefined
        )?.roles ?? [];
      roles.forEach(role => {
        const roleName = role.name?.trim();
        if (!roleName) {
          return;
        }
        const existing = current[roleName] ?? [];
        current[roleName] = existing.some(item => item.value === option.value)
          ? existing.map(item => (item.value === option.value ? option : item))
          : [...existing, option];
      });
    });
    this._employeeListByRole.set(current);
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
}
