import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  Input,
  input,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IEnhancedForm,
  IFormConfig,
  IInputFieldsConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { FormService, SearchFilterUrlRestoreService } from '@shared/services';
import { InputFieldComponent } from '../input-field/input-field.component';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { Table } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { DrawerModule } from 'primeng/drawer';
import { AppPermissionService } from '@core/services';
import { ICONS } from '@shared/constants';
import {
  areSearchFilterQueryParamsUnchanged,
  hasSearchFilterQueryParams,
  parseSearchFilterQueryParams,
  serializeSearchFilterQueryParams,
} from '@shared/utility';

@Component({
  selector: 'app-search-filter',
  imports: [
    ReactiveFormsModule,
    InputFieldComponent,
    KeyValuePipe,
    ButtonComponent,
    PanelModule,
    DrawerModule,
    NgTemplateOutlet,
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterComponent implements OnInit {
  protected readonly ICONS = ICONS;
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissionService = inject(AppPermissionService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly searchFilterUrlRestore = inject(
    SearchFilterUrlRestoreService
  );

  searchFilterConfig = input.required<ITableSearchFilterFormConfig>();
  prefillValues = input<Record<string, unknown>>();
  /** When set, only these field names are shown; form still keeps all field values. */
  visibleFieldNames = input<string[] | undefined>(undefined);
  syncToUrl = input(true);

  /**
   * Bound by list pages via `[tableRef]="dataTable.dt()"`.
   * When this input is omitted (workspace / register), filters emit on submit
   * and are never applied to a nested child table.
   */
  private readonly tableRefValue = signal<Table | undefined>(undefined);
  private tableRefBound = false;

  @Input()
  set tableRef(value: Table | undefined) {
    this.tableRefBound = true;
    this.tableRefValue.set(value);
  }

  onSearchFilterChange = output<Record<string, unknown>>();
  onFilterSubmit = output<Record<string, unknown>>();
  onFilterReset = output<void>();
  formReady = output<IEnhancedForm<Record<string, unknown>>>();

  /** Phones: the form lives in a side drawer opened from a small "Filters" button. */
  protected readonly isCompactViewport = signal(
    typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 768px)').matches
  );
  protected readonly mobileDrawerOpen = signal(false);
  /** Filters currently applied (visible fields with a value), shown as a badge in the header. */
  protected readonly activeFilterCount = signal(0);

  protected form!: IEnhancedForm<Record<string, unknown>>;
  protected hasSearched = false;
  protected hasPrefillValues = false;
  private restoreFromUrlPending = false;
  private restoreSessionId: number | null = null;
  private urlSyncFields: ITableSearchFilterFormConfig['fields'] = {};
  private allowRestoreWithoutTable = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(max-width: 768px)');
      const syncViewport = (): void => {
        this.isCompactViewport.set(media.matches);
      };
      media.addEventListener('change', syncViewport);
      this.destroyRef.onDestroy(() =>
        media.removeEventListener('change', syncViewport)
      );
    }

    afterNextRender(() => {
      this.applyRestoredFilters();
      if (this.restoreFromUrlPending && !this.tableRefValue()) {
        setTimeout(() => {
          this.allowRestoreWithoutTable = true;
          this.applyRestoredFilters();
        });
      }
    });

    effect(() => {
      const table = this.tableRefValue();
      untracked(() => {
        if (this.restoreFromUrlPending && table) {
          this.applyRestoredFilters();
        }
      });
    });
  }

  ngOnInit(): void {
    const filteredConfig = this.getPermissionFilteredConfig();
    this.urlSyncFields = filteredConfig.fields;
    const urlValues = this.readFiltersFromUrl(filteredConfig);
    const prefillData = {
      ...(this.prefillValues() ?? {}),
      ...urlValues,
    };

    this.form = this.formService.createForm(
      filteredConfig as unknown as IFormConfig<Record<string, unknown>>,
      {
        destroyRef: this.destroyRef,
        defaultValues: prefillData,
      }
    );

    if (Object.keys(prefillData).length > 0) {
      this.hasPrefillValues = true;
    }
    this.refreshActiveFilterCount();

    this.restoreFromUrlPending = hasSearchFilterQueryParams(urlValues);
    if (this.restoreFromUrlPending) {
      this.restoreSessionId = this.searchFilterUrlRestore.beginRestore();
    }

    this.destroyRef.onDestroy(() => this.endUrlRestore());

    this.form.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.changeDetectorRef.markForCheck());

    queueMicrotask(() => this.formReady.emit(this.form));
  }

  protected isSearchDisabled(): boolean {
    return !this.form?.formGroup.dirty;
  }

  protected isResetDisabled(): boolean {
    return !this.form?.formGroup.dirty && !this.hasSearched;
  }

  protected isFieldVisible(fieldName: string): boolean {
    const visibleFieldNames = this.visibleFieldNames();
    return !visibleFieldNames?.length || visibleFieldNames.includes(fieldName);
  }

  markFilterSubmitted(): void {
    if (!this.form) {
      return;
    }

    this.form.formGroup.markAsPristine();
    this.hasSearched = true;
    this.hasPrefillValues = false;
    this.changeDetectorRef.markForCheck();
  }

  updateFieldConfig(fieldName: string, fieldConfig: IInputFieldsConfig): void {
    if (!this.form?.fieldConfigs[fieldName]) {
      return;
    }

    this.form.fieldConfigs[fieldName] = fieldConfig;
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private getPermissionFilteredConfig(): ITableSearchFilterFormConfig {
    const originalConfig = this.searchFilterConfig();

    return {
      ...originalConfig,
      fields: this.permissionService.filterRecordByPermission(
        originalConfig.fields
      ),
    };
  }

  submitFilter(): void {
    if (!this.form) {
      return;
    }
    this.onSubmit();
  }

  protected onSubmit(): void {
    // Emit before the table reloads: `_filter()` fires the lazy load synchronously, and pages
    // that keep the selection in their own state (e.g. event history) must have it set by then.
    this.onFilterSubmit.emit(this.form.getData());
    const table = this.resolveTable();
    if (table) {
      this.setFilterInTable(table, true);
    }
    this.form.formGroup.markAsPristine();
    this.hasSearched = true;
    this.hasPrefillValues = false;
    this.syncFiltersToUrl(this.form.getRawData());
    this.refreshActiveFilterCount();
    this.mobileDrawerOpen.set(false);
    this.changeDetectorRef.markForCheck();
  }

  protected setFilterInTable(table: Table, emitLazyLoad = true): void {
    const formData = this.form.getData();

    Object.entries(formData).forEach(([key, value]) => {
      const matchMode = this.searchFilterConfig().fields[key]
        ?.matchmode as string;
      table.filters[key === 'globalSearch' ? 'global' : key] = {
        value,
        matchMode,
      };
    });

    if (emitLazyLoad) {
      table.first = 0;
      (table as Table & { _filter: () => void })._filter();
    }
  }

  protected onReset(): void {
    this.form.formGroup.reset();
    this.syncFiltersToUrl({});
    this.onFilterReset.emit();
    const table = this.resolveTable();
    if (table && (this.hasSearched || this.hasPrefillValues)) {
      table.filters = {};
      table.reset();
    }
    this.hasSearched = false;
    this.hasPrefillValues = false;
    this.refreshActiveFilterCount();
    this.mobileDrawerOpen.set(false);
    this.changeDetectorRef.markForCheck();
  }

  private refreshActiveFilterCount(): void {
    const data = this.form.getRawData();
    const count = Object.keys(this.form.fieldConfigs).filter(fieldName => {
      if (!this.isFieldVisible(fieldName)) {
        return false;
      }
      const value = data[fieldName];
      if (Array.isArray(value)) {
        return value.some(
          item => item !== null && item !== undefined && item !== ''
        );
      }
      return value !== null && value !== undefined && value !== '';
    }).length;
    this.activeFilterCount.set(count);
  }

  protected customSort(): number {
    return 0;
  }

  private applyRestoredFilters(): void {
    if (!this.form || !this.restoreFromUrlPending) {
      return;
    }

    const table = this.tableRefValue();
    if (!table && (this.tableRefBound || !this.allowRestoreWithoutTable)) {
      return;
    }

    this.restoreFromUrlPending = false;
    // Restored filters count as a submit, so pages can sync their state before the first load.
    this.onFilterSubmit.emit(this.form.getData());
    if (table) {
      this.setFilterInTable(table, false);
    }
    this.form.formGroup.markAsPristine();
    this.hasSearched = true;
    this.hasPrefillValues = false;
    this.endUrlRestore();
    this.changeDetectorRef.markForCheck();
  }

  private endUrlRestore(): void {
    if (this.restoreSessionId === null || this.restoreSessionId === undefined) {
      return;
    }
    this.searchFilterUrlRestore.finishRestore(this.restoreSessionId);
    this.restoreSessionId = null;
  }

  private resolveTable(): Table | undefined {
    return this.tableRefBound ? this.tableRefValue() : undefined;
  }

  private readFiltersFromUrl(
    config: ITableSearchFilterFormConfig
  ): Record<string, unknown> {
    if (!this.syncToUrl()) {
      return {};
    }

    return parseSearchFilterQueryParams(
      this.router.parseUrl(this.router.url).queryParamMap,
      config.fields
    );
  }

  private syncFiltersToUrl(data: Record<string, unknown>): void {
    if (!this.syncToUrl()) {
      return;
    }

    const queryParams = serializeSearchFilterQueryParams(
      data,
      this.urlSyncFields
    );

    if (
      areSearchFilterQueryParamsUnchanged(
        this.router.parseUrl(this.router.url).queryParamMap,
        queryParams
      )
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.resolveQueryParamRoute(),
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private resolveQueryParamRoute(): ActivatedRoute {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
