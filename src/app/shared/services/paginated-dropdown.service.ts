import { inject, Injectable, Injector, signal, Type } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { CONFIGURATION_KEYS } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import {
  catchError,
  finalize,
  forkJoin,
  from,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

const PAGINATED_DROPDOWN_KEYS = new Set<string>([
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface IPaginatedDropdownQuery {
  dropdownName: string;
  search?: string;
  filterByRole?: string[];
  employeeStatus?: string;
}

export interface IPaginatedDropdownView {
  options: IOptionDropdown[];
  loading: boolean;
  hasMore: boolean;
  initialLoading: boolean;
  totalRecords: number;
}

interface IPageResult {
  options: IOptionDropdown[];
  totalRecords: number;
}

interface ISession {
  dropdownName: string;
  search: string;
  filterByRole: string[];
  employeeStatus?: string;
  pinnedIds: string[];
}

interface ICatalog {
  key: string;
  dropdownName: string;
  search: string;
  filterByRole: string[];
  employeeStatus?: string;
  pageOptions: IOptionDropdown[];
  loadedPage: number;
  totalRecords: number;
  loading: boolean;
  generation: number;
}

interface IReferenceListSink {
  merge: (dropdownName: string, options: IOptionDropdown[]) => void;
  clear: (dropdownName: string) => void;
  mapRecords: (
    dropdownName: string,
    records: unknown[]
  ) => Observable<IOptionDropdown[]>;
}

@Injectable({
  providedIn: 'root',
})
export class PaginatedDropdownService {
  private readonly injector = inject(Injector);
  private readonly stateTick = signal(0);
  private readonly sessions = new Map<string, ISession>();
  private readonly catalogs = new Map<string, ICatalog>();
  private readonly inFlightPages = new Map<string, Observable<IPageResult>>();
  private readonly records = new Map<string, Map<string, IOptionDropdown>>();
  private readonly failedIds = new Set<string>();
  private readonly inFlightDetails = new Map<
    string,
    Observable<IOptionDropdown | null>
  >();
  private referenceListSink?: IReferenceListSink;

  registerReferenceListSink(sink: IReferenceListSink): void {
    this.referenceListSink = sink;
  }

  isPaginatedDropdown(dropdownName: string | undefined): boolean {
    return !!dropdownName && PAGINATED_DROPDOWN_KEYS.has(dropdownName);
  }

  watch(sessionId: string): IPaginatedDropdownView {
    this.stateTick();
    return this.view(sessionId);
  }

  sync(
    sessionId: string,
    query: IPaginatedDropdownQuery,
    selectedIds: string[]
  ): void {
    const session = this.ensureSession(sessionId, query);
    const queryChanged =
      session.dropdownName !== query.dropdownName ||
      !sameStrings(session.filterByRole, query.filterByRole ?? []) ||
      session.employeeStatus !== query.employeeStatus;

    if (queryChanged) {
      session.dropdownName = query.dropdownName;
      session.filterByRole = [...(query.filterByRole ?? [])];
      session.employeeStatus = query.employeeStatus;
      session.search = '';
    }

    session.pinnedIds = selectedIds.filter(id => UUID_PATTERN.test(id));
    this.publish();
    this.ensurePinned(session);
    this.ensureFirstPage(session);
  }

  loadFirst(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    this.ensureFirstPage(session);
  }

  loadMore(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    const catalog = session ? this.catalogFor(session) : undefined;
    if (!session || !catalog || catalog.loading || !this.hasMore(catalog)) {
      return;
    }
    this.loadPage(catalog, catalog.loadedPage + 1, false);
  }

  search(sessionId: string, term: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    const nextSearch = term.trim();
    if (nextSearch === session.search && this.catalogFor(session)?.loadedPage) {
      return;
    }
    session.search = nextSearch;
    const catalog = this.ensureCatalog(session);
    if (catalog.loadedPage > 0 || catalog.loading) {
      this.publish();
      return;
    }
    this.loadPage(catalog, 1, true);
  }

  resetSearch(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session?.search) {
      return;
    }
    session.search = '';
    this.publish();
  }

  destroy(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.publish();
  }

  invalidate(dropdownName: string): void {
    this.records.delete(dropdownName);
    for (const key of [...this.failedIds]) {
      if (key.startsWith(`${dropdownName}:`)) {
        this.failedIds.delete(key);
      }
    }
    for (const key of [...this.inFlightDetails.keys()]) {
      if (key.startsWith(`${dropdownName}:`)) {
        this.inFlightDetails.delete(key);
      }
    }
    for (const catalog of this.catalogs.values()) {
      if (catalog.dropdownName !== dropdownName) {
        continue;
      }
      catalog.generation += 1;
      catalog.pageOptions = [];
      catalog.loadedPage = 0;
      catalog.totalRecords = 0;
      catalog.loading = false;
    }
    this.referenceListSink?.clear(dropdownName);
    const liveCatalogs = new Map<string, ICatalog>();
    for (const session of this.sessions.values()) {
      if (session.dropdownName !== dropdownName) {
        continue;
      }
      const catalog = this.ensureCatalog(session);
      liveCatalogs.set(catalog.key, catalog);
    }
    this.publish();
    for (const catalog of liveCatalogs.values()) {
      this.loadPage(catalog, 1, true);
    }
  }

  invalidateAll(): void {
    for (const dropdownName of PAGINATED_DROPDOWN_KEYS) {
      this.invalidate(dropdownName);
    }
  }

  searchOnce(
    query: IPaginatedDropdownQuery
  ): Observable<IOptionDropdown[]> {
    const catalog = this.ensureCatalog({
      dropdownName: query.dropdownName,
      search: query.search?.trim() ?? '',
      filterByRole: [...(query.filterByRole ?? [])],
      employeeStatus: query.employeeStatus,
      pinnedIds: [],
    });
    if (catalog.loadedPage > 0) {
      return of(catalog.pageOptions);
    }
    if (!catalog.loading) {
      this.loadPage(catalog, 1, true);
    }
    const inFlight = this.inFlightPages.get(this.pageFlightKey(catalog, 1));
    if (!inFlight) {
      return of(catalog.pageOptions);
    }
    return inFlight.pipe(
      map(result => result.options),
      catchError(() => of([]))
    );
  }

  private ensureSession(
    sessionId: string,
    query: IPaginatedDropdownQuery
  ): ISession {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      return existing;
    }
    const session: ISession = {
      dropdownName: query.dropdownName,
      search: '',
      filterByRole: [...(query.filterByRole ?? [])],
      employeeStatus: query.employeeStatus,
      pinnedIds: [],
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  private ensureFirstPage(session: ISession): void {
    const catalog = this.ensureCatalog(session);
    if (catalog.loadedPage === 0 && !catalog.loading) {
      this.loadPage(catalog, 1, true);
    }
  }

  private catalogFor(session: ISession): ICatalog | undefined {
    return this.catalogs.get(catalogKey(session));
  }

  private ensureCatalog(session: ISession): ICatalog {
    const key = catalogKey(session);
    const existing = this.catalogs.get(key);
    if (existing) {
      return existing;
    }
    const catalog: ICatalog = {
      key,
      dropdownName: session.dropdownName,
      search: session.search,
      filterByRole: [...session.filterByRole],
      employeeStatus: session.employeeStatus,
      pageOptions: [],
      loadedPage: 0,
      totalRecords: 0,
      loading: false,
      generation: 0,
    };
    this.catalogs.set(key, catalog);
    return catalog;
  }

  private hasMore(catalog: ICatalog): boolean {
    return (
      catalog.loadedPage > 0 &&
      catalog.loadedPage * APP_CONFIG.DROPDOWN_CONFIG.PAGINATED_PAGE_SIZE <
        catalog.totalRecords
    );
  }

  private pageFlightKey(catalog: ICatalog, page: number): string {
    return `${catalog.key}:${page}:${catalog.generation}`;
  }

  private ensurePinned(session: ISession): void {
    const missing = session.pinnedIds.filter(id => {
      const cacheKey = `${session.dropdownName}:${id}`;
      return (
        !this.records.get(session.dropdownName)?.has(id) &&
        !this.failedIds.has(cacheKey)
      );
    });
    if (missing.length === 0) {
      return;
    }

    forkJoin(
      missing.map(id => this.fetchDetail(session.dropdownName, id))
    ).subscribe(options => {
      const resolved = options.filter(
        (option): option is IOptionDropdown => option !== null
      );
      this.remember(session.dropdownName, resolved);
      this.publish();
    });
  }

  private loadPage(catalog: ICatalog, page: number, replace: boolean): void {
    if (catalog.loading || (!replace && catalog.loadedPage >= page)) {
      return;
    }

    catalog.loading = true;
    const generation = catalog.generation;
    const dropdownName = catalog.dropdownName;
    this.publish();

    const flightKey = this.pageFlightKey(catalog, page);
    let request$ = this.inFlightPages.get(flightKey);
    if (!request$) {
      request$ = this.fetchPage(dropdownName, {
        page,
        pageSize: APP_CONFIG.DROPDOWN_CONFIG.PAGINATED_PAGE_SIZE,
        search: catalog.search || undefined,
        filterByRole: catalog.filterByRole,
        employeeStatus: catalog.employeeStatus,
      }).pipe(
        finalize(() => this.inFlightPages.delete(flightKey)),
        shareReplay(1)
      );
      this.inFlightPages.set(flightKey, request$);
    }

    request$.subscribe({
      next: result => {
        const current = this.catalogs.get(catalog.key);
        if (!current || current.generation !== generation) {
          return;
        }
        current.pageOptions = replace
          ? result.options
          : mergeOptions(current.pageOptions, result.options);
        current.loadedPage = page;
        current.totalRecords = result.totalRecords;
        current.loading = false;
        this.remember(dropdownName, result.options);
        this.publish();
      },
      error: () => {
        const current = this.catalogs.get(catalog.key);
        if (!current || current.generation !== generation) {
          return;
        }
        current.loading = false;
        this.publish();
      },
    });
  }

  private view(sessionId: string): IPaginatedDropdownView {
    const session = this.sessions.get(sessionId);
    const catalog = session ? this.catalogFor(session) : undefined;
    if (!session || !catalog) {
      return {
        options: [],
        loading: false,
        hasMore: false,
        initialLoading: false,
        totalRecords: 0,
      };
    }

    const pinned = session.pinnedIds
      .map(id => this.records.get(session.dropdownName)?.get(id))
      .filter((option): option is IOptionDropdown => !!option);
    // Selected options keep their place in the list; one not loaded yet is appended so its label still shows.
    const options = mergeOptions(catalog.pageOptions, pinned);
    const listCatalog =
      session.search === ''
        ? catalog
        : (this.catalogs.get(
            catalogKey({
              dropdownName: session.dropdownName,
              search: '',
              filterByRole: session.filterByRole,
              employeeStatus: session.employeeStatus,
            })
          ) ?? catalog);

    return {
      options,
      loading: catalog.loading,
      hasMore: this.hasMore(catalog),
      initialLoading: catalog.loading && options.length === 0,
      totalRecords: listCatalog.totalRecords,
    };
  }

  private remember(dropdownName: string, options: IOptionDropdown[]): void {
    if (options.length === 0) {
      return;
    }
    const bucket = this.records.get(dropdownName) ?? new Map();
    options.forEach(option => bucket.set(option.value, option));
    this.records.set(dropdownName, bucket);
    this.referenceListSink?.merge(dropdownName, options);
  }

  private fetchDetail(
    dropdownName: string,
    id: string
  ): Observable<IOptionDropdown | null> {
    const cacheKey = `${dropdownName}:${id}`;
    const cached = this.records.get(dropdownName)?.get(id);
    if (cached) {
      return of(cached);
    }
    const inFlight = this.inFlightDetails.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    const request$ = this.fetchDetailRequest(dropdownName, id).pipe(
      tap(option => {
        if (!option) {
          this.failedIds.add(cacheKey);
        }
      }),
      catchError(() => {
        this.failedIds.add(cacheKey);
        return of(null);
      }),
      tap(() => this.inFlightDetails.delete(cacheKey)),
      shareReplay(1)
    );
    this.inFlightDetails.set(cacheKey, request$);
    return request$;
  }

  private fetchDetailRequest(
    dropdownName: string,
    id: string
  ): Observable<IOptionDropdown | null> {
    switch (dropdownName) {
      case CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST:
        return this.injectService(() =>
          import('@features/employee-management/services/employee.service').then(
            module => module.EmployeeService
          )
        ).pipe(
          switchMap(service => service.getEmployeeDetailById({ id })),
          switchMap(employee =>
            this.mapRecords(dropdownName, [employee]).pipe(
              map(options => options[0] ?? null)
            )
          )
        );
      case CONFIGURATION_KEYS.ASSET.ASSET_LIST:
        return this.injectService(() =>
          import('@features/asset-management/services/asset.service').then(
            module => module.AssetService
          )
        ).pipe(
          switchMap(service => service.getAssetDetailById({ assetId: id })),
          switchMap(asset =>
            this.mapRecords(dropdownName, [asset]).pipe(
              map(options => options[0] ?? null)
            )
          )
        );
      case CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST:
        return this.injectService(() =>
          import(
            '@features/transport-management/vehicle-management/services/vehicle.service'
          ).then(module => module.VehicleService)
        ).pipe(
          switchMap(service => service.getVehicleDetailById({ vehicleId: id })),
          switchMap(vehicle =>
            this.mapRecords(dropdownName, [vehicle]).pipe(
              map(options => options[0] ?? null)
            )
          )
        );
      case CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST:
        return of(null);
      case CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST:
        return of(null);
      case CONFIGURATION_KEYS.COMPANY.COMPANY_LIST:
        return this.injectService(() =>
          import(
            '@features/site-management/company-management/services/company.service'
          ).then(module => module.CompanyService)
        ).pipe(
          switchMap(service => service.getCompanyDetailById({ companyId: id })),
          switchMap(company =>
            this.mapRecords(dropdownName, [company]).pipe(
              map(options => options[0] ?? null)
            )
          )
        );
      case CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST:
        return this.injectService(() =>
          import(
            '@features/site-management/contractor-management/services/contractor.service'
          ).then(module => module.ContractorService)
        ).pipe(
          switchMap(service =>
            service.getContractorDetailById({ contractorId: id })
          ),
          switchMap(contractor =>
            this.mapRecords(dropdownName, [contractor]).pipe(
              map(options => options[0] ?? null)
            )
          )
        );
      case CONFIGURATION_KEYS.VENDOR.VENDOR_LIST:
        return this.injectService(() =>
          import(
            '@features/site-management/vendor-management/services/vendor.service'
          ).then(module => module.VendorService)
        ).pipe(
          switchMap(service => service.getVendorDetailById({ vendorId: id })),
          switchMap(vendor =>
            this.mapRecords(dropdownName, [vendor]).pipe(
              map(options => options[0] ?? null)
            )
          )
        );
      case CONFIGURATION_KEYS.PROJECT.PROJECT_LIST:
        return this.injectService(() =>
          import(
            '@features/site-management/project-management/services/project.service'
          ).then(module => module.ProjectService)
        ).pipe(
          switchMap(service => service.getProjectDetailById({ projectId: id })),
          switchMap(project =>
            this.mapRecords(dropdownName, [project]).pipe(
              map(options => options[0] ?? null)
            )
          )
        );
      default:
        return of(null);
    }
  }

  private fetchPage(
    dropdownName: string,
    query: {
      page: number;
      pageSize: number;
      search?: string;
      filterByRole?: string[];
      employeeStatus?: string;
    }
  ): Observable<IPageResult> {
    const listQuery = {
      page: query.page,
      pageSize: query.pageSize,
      ...(query.search ? { search: query.search } : {}),
    };

    switch (dropdownName) {
      case CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST:
        return this.injectService(() =>
          import('@features/employee-management/services/employee.service').then(
            module => module.EmployeeService
          )
        ).pipe(
          switchMap(service =>
            service.getEmployeeList({
              ...listQuery,
              ...(query.filterByRole?.length
                ? { employeeRole: query.filterByRole }
                : {}),
              ...(query.employeeStatus
                ? { employeeStatus: query.employeeStatus }
                : {}),
            })
          ),
          switchMap(response => this.toPageResult(dropdownName, response))
        );
      case CONFIGURATION_KEYS.ASSET.ASSET_LIST:
        return this.injectService(() =>
          import('@features/asset-management/services/asset.service').then(
            module => module.AssetService
          )
        ).pipe(
          switchMap(service => service.getAssetList(listQuery)),
          switchMap(response => this.toPageResult(dropdownName, response))
        );
      case CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST:
        return this.injectService(() =>
          import(
            '@features/transport-management/vehicle-management/services/vehicle.service'
          ).then(module => module.VehicleService)
        ).pipe(
          switchMap(service => service.getVehicleList(listQuery)),
          switchMap(response => this.toPageResult(dropdownName, response))
        );
      case CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST:
        return this.injectService(() =>
          import(
            '@features/transport-management/petro-card-management/services/petro-card.service'
          ).then(module => module.PetroCardService)
        ).pipe(
          switchMap(service => service.getPetroCardList(listQuery)),
          switchMap(response => this.toPageResult(dropdownName, response))
        );
      case CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST:
        return this.injectService(() =>
          import(
            '@features/company-bank-account-management/services/company-bank-account.service'
          ).then(module => module.CompanyBankAccountService)
        ).pipe(
          switchMap(service => service.getCompanyBankAccountList(listQuery)),
          switchMap(response =>
            this.toPageResult(dropdownName, {
              totalRecords: response.totalRecords,
              records: response.records.filter(account => account.isActive),
            })
          )
        );
      case CONFIGURATION_KEYS.COMPANY.COMPANY_LIST:
        return this.injectService(() =>
          import(
            '@features/site-management/company-management/services/company.service'
          ).then(module => module.CompanyService)
        ).pipe(
          switchMap(service => service.getCompanyList(listQuery)),
          switchMap(response => this.toPageResult(dropdownName, response))
        );
      case CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST:
        return this.injectService(() =>
          import(
            '@features/site-management/contractor-management/services/contractor.service'
          ).then(module => module.ContractorService)
        ).pipe(
          switchMap(service => service.getContractorList(listQuery)),
          switchMap(response => this.toPageResult(dropdownName, response))
        );
      case CONFIGURATION_KEYS.VENDOR.VENDOR_LIST:
        return this.injectService(() =>
          import(
            '@features/site-management/vendor-management/services/vendor.service'
          ).then(module => module.VendorService)
        ).pipe(
          switchMap(service => service.getVendorList(listQuery)),
          switchMap(response => this.toPageResult(dropdownName, response))
        );
      case CONFIGURATION_KEYS.PROJECT.PROJECT_LIST:
        return this.injectService(() =>
          import(
            '@features/site-management/project-management/services/project.service'
          ).then(module => module.ProjectService)
        ).pipe(
          switchMap(service => service.getProjectList(listQuery)),
          switchMap(response => this.toPageResult(dropdownName, response))
        );
      default:
        return of({ options: [], totalRecords: 0 });
    }
  }

  private mapRecords(
    dropdownName: string,
    records: unknown[]
  ): Observable<IOptionDropdown[]> {
    const mapRecords = this.referenceListSink?.mapRecords;
    if (!mapRecords) {
      return of([]);
    }
    return mapRecords(dropdownName, records);
  }

  private toPageResult(
    dropdownName: string,
    response: { totalRecords: number; records: unknown[] }
  ): Observable<IPageResult> {
    return this.mapRecords(dropdownName, response.records).pipe(
      map(options => ({
        totalRecords: response.totalRecords,
        options,
      }))
    );
  }

  private injectService<T>(loadToken: () => Promise<Type<T>>): Observable<T> {
    return from(loadToken().then(token => this.injector.get(token)));
  }

  private publish(): void {
    this.stateTick.update(value => value + 1);
  }
}

function mergeOptions(
  current: IOptionDropdown[],
  incoming: IOptionDropdown[]
): IOptionDropdown[] {
  const merged = new Map<string, IOptionDropdown>();
  current.forEach(option => merged.set(option.value, option));
  incoming.forEach(option => {
    if (!merged.has(option.value)) {
      merged.set(option.value, option);
    }
  });
  return [...merged.values()];
}

function sameStrings(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function catalogKey(query: {
  dropdownName: string;
  search: string;
  filterByRole: string[];
  employeeStatus?: string;
}): string {
  return [
    query.dropdownName,
    query.employeeStatus ?? '',
    [...query.filterByRole].sort().join('\u0001'),
    query.search,
  ].join('\u0002');
}
