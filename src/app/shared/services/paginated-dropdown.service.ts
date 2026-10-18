import { inject, Injectable, Injector, signal, Type } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { CONFIGURATION_KEYS } from '@shared/constants';
import { IOptionDropdown } from '@shared/types';
import {
  catchError,
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
      session.pageOptions = [];
      session.loadedPage = 0;
      session.totalRecords = 0;
      session.generation += 1;
    }

    session.pinnedIds = selectedIds.filter(id => UUID_PATTERN.test(id));
    this.publish();
    this.ensurePinned(session);
    if (session.loadedPage === 0 && !session.loading) {
      this.loadPage(sessionId, 1, true);
    }
  }

  loadFirst(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.loading || session.loadedPage > 0) {
      return;
    }
    this.loadPage(sessionId, 1, true);
  }

  loadMore(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.loading || !this.view(sessionId).hasMore) {
      return;
    }
    this.loadPage(sessionId, session.loadedPage + 1, false);
  }

  search(sessionId: string, term: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    const nextSearch = term.trim();
    if (nextSearch === session.search && session.loadedPage > 0) {
      return;
    }
    session.search = nextSearch;
    session.pageOptions = [];
    session.loadedPage = 0;
    session.totalRecords = 0;
    session.generation += 1;
    session.loading = false;
    this.loadPage(sessionId, 1, true);
  }

  resetSearch(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session?.search) {
      return;
    }
    session.search = '';
    session.pageOptions = [];
    session.loadedPage = 0;
    session.totalRecords = 0;
    session.generation += 1;
    session.loading = false;
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
    this.inFlightDetails.clear();
    for (const session of this.sessions.values()) {
      if (session.dropdownName !== dropdownName) {
        continue;
      }
      session.pageOptions = [];
      session.loadedPage = 0;
      session.totalRecords = 0;
      session.loading = false;
      session.generation += 1;
    }
    this.referenceListSink?.clear(dropdownName);
    this.publish();
  }

  invalidateAll(): void {
    for (const dropdownName of PAGINATED_DROPDOWN_KEYS) {
      this.invalidate(dropdownName);
    }
  }

  searchOnce(
    query: IPaginatedDropdownQuery
  ): Observable<IOptionDropdown[]> {
    return this.fetchPage(query.dropdownName, {
      page: 1,
      pageSize: APP_CONFIG.DROPDOWN_CONFIG.PAGINATED_PAGE_SIZE,
      search: query.search?.trim() || undefined,
      filterByRole: query.filterByRole,
      employeeStatus: query.employeeStatus,
    }).pipe(
      tap(result => this.remember(query.dropdownName, result.options)),
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
      pageOptions: [],
      loadedPage: 0,
      totalRecords: 0,
      loading: false,
      generation: 0,
    };
    this.sessions.set(sessionId, session);
    return session;
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

  private loadPage(sessionId: string, page: number, replace: boolean): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.loading) {
      return;
    }

    session.loading = true;
    const generation = session.generation;
    const dropdownName = session.dropdownName;
    this.publish();

    this.fetchPage(dropdownName, {
      page,
      pageSize: APP_CONFIG.DROPDOWN_CONFIG.PAGINATED_PAGE_SIZE,
      search: session.search || undefined,
      filterByRole: session.filterByRole,
      employeeStatus: session.employeeStatus,
    }).subscribe({
      next: result => {
        const current = this.sessions.get(sessionId);
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
        const current = this.sessions.get(sessionId);
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
    if (!session) {
      return {
        options: [],
        loading: false,
        hasMore: false,
        initialLoading: false,
      };
    }

    const pinned = session.pinnedIds
      .map(id => this.records.get(session.dropdownName)?.get(id))
      .filter((option): option is IOptionDropdown => !!option);
    const options = mergeOptions(pinned, session.pageOptions);
    const hasMore =
      session.loadedPage > 0 &&
      session.loadedPage * APP_CONFIG.DROPDOWN_CONFIG.PAGINATED_PAGE_SIZE <
      session.totalRecords;

    return {
      options,
      loading: session.loading,
      hasMore,
      initialLoading:
        session.loading && options.length === 0,
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
