import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  Input,
  input,
  OnInit,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, merge } from 'rxjs';
import {
  IButtonConfig,
  IEnhancedForm,
  IFormConfig,
  IInputFieldsConfig,
  IOptionDropdown,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import {
  AppConfigurationService,
  FormService,
  SearchFilterUrlRestoreService,
} from '@shared/services';
import { InputFieldComponent } from '../input-field/input-field.component';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { Table } from 'primeng/table';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { AppPermissionService } from '@core/services';
import { ICONS } from '@shared/constants';
import {
  areSearchFilterQueryParamsUnchanged,
  hasSearchFilterQueryParams,
  parseSearchFilterQueryParams,
  serializeSearchFilterQueryParams,
} from '@shared/utility';

/** Field rendered as the always-visible search box in the toolbar. */
const SEARCH_FIELD_NAME = 'globalSearch';
/** Typing in the search box applies it after this pause. */
const SEARCH_DEBOUNCE_MS = 450;
/** Auto-search waits for at least this many characters (clearing always applies). */
const SEARCH_MIN_LENGTH = 2;
/** Chips list this many option labels before collapsing the rest into "+N". */
const CHIP_MAX_LABELS = 2;
const EXPANDED_STORAGE_PREFIX = 'search-filter:expanded:';
/** Stop showing the searching spinner if the table never reports back (e.g. request failed). */
const SEARCHING_TIMEOUT_MS = 10_000;
/** How long a field stays highlighted after jumping to it from a chip. */
const FIELD_HIGHLIGHT_MS = 1_400;
/** Drawer slide-in time on phones, before the jumped-to field can take focus. */
const DRAWER_OPEN_DELAY_MS = 320;

let nextInstanceId = 0;

const CHIP_DATE_FORMAT = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

interface IAppliedFilterChip {
  fieldName: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-search-filter',
  imports: [
    ReactiveFormsModule,
    InputFieldComponent,
    ButtonComponent,
    DrawerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    NgTemplateOutlet,
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterComponent implements OnInit {
  protected readonly ICONS = ICONS;
  protected readonly searchFieldName = SEARCH_FIELD_NAME;
  /** Unique per instance so chip → field lookups never hit another filter bar on the page. */
  protected readonly instanceId = `search-filter-${nextInstanceId++}`;
  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissionService = inject(AppPermissionService);
  private readonly appConfigurationService = inject(AppConfigurationService);
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

  /** Phones: the extra filters live in a side drawer; the search box stays inline. */
  protected readonly isCompactViewport = signal(
    typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 768px)').matches
  );
  protected readonly mobileDrawerOpen = signal(false);
  /** Desktop: whether the extra-filters grid under the toolbar is open (remembered per page). */
  protected readonly filtersExpanded = signal(false);

  /** Rows matching the applied filters, as reported by the bound table (null until it loads). */
  protected readonly resultCount = signal<number | null>(null);
  /** True from a submit until the bound table delivers new rows. */
  protected readonly isSearching = signal(false);
  /** Field briefly highlighted after jumping to it from a chip. */
  protected readonly highlightedField = signal<string | null>(null);
  private searchingTimer: ReturnType<typeof setTimeout> | undefined;
  private highlightTimer: ReturnType<typeof setTimeout> | undefined;
  private drawerSubmitCache:
    | { count: number; config: Partial<IButtonConfig> }
    | undefined;

  /** Values last applied to the table (submit, URL restore or prefill); drives the chips. */
  private readonly appliedValues = signal<Record<string, unknown>>({});

  protected readonly appliedChips = computed<IAppliedFilterChip[]>(() => {
    const values = this.appliedValues();
    if (!this.form) {
      return [];
    }
    return Object.keys(this.form.fieldConfigs)
      .filter(fieldName => this.isFieldVisible(fieldName))
      .flatMap(fieldName => {
        const value = values[fieldName];
        if (!hasFilterValue(value)) {
          return [];
        }
        const config = this.form.fieldConfigs[fieldName];
        return [
          {
            fieldName,
            label: config?.label ?? fieldName,
            value: this.formatChipValue(value, config),
          },
        ];
      });
  });

  /** Filters currently applied (visible fields with a value), including the search term. */
  protected readonly activeFilterCount = computed(
    () => this.appliedChips().length
  );

  /** Applied filters other than the search box, shown on the "Filters" toggle. */
  protected readonly appliedExtraFilterCount = computed(
    () =>
      this.appliedChips().filter(
        chip => chip.fieldName !== SEARCH_FIELD_NAME
      ).length
  );

  protected form!: IEnhancedForm<Record<string, unknown>>;
  protected hasSearched = false;
  protected hasPrefillValues = false;
  /** Search box config (placeholder / max length), when the config defines `globalSearch`. */
  protected searchFieldConfig: IInputFieldsConfig | null = null;
  /** Visible filter fields other than the search box, in config order. */
  protected extraFieldNames: string[] = [];
  private restoreFromUrlPending = false;
  private restoreSessionId: number | null = null;
  private urlSyncFields: ITableSearchFilterFormConfig['fields'] = {};
  private allowRestoreWithoutTable = false;
  private expandedStorageKey = '';

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

    // Result count + searching state come from the bound table: new rows (server side)
    // or a client-side filter pass both mean the last search has landed.
    effect(onCleanup => {
      const table = this.tableRefValue();
      if (!table) {
        this.resultCount.set(null);
        return;
      }
      const subscription = merge(
        table.tableService.valueSource$,
        table.onFilter
      ).subscribe(() => {
        // Inputs settle in the same change-detection pass; read them once it ends.
        queueMicrotask(() => this.syncTableState(table));
      });
      onCleanup(() => subscription.unsubscribe());
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.searchingTimer);
      clearTimeout(this.highlightTimer);
    });
  }

  /** `/` focuses the search box from anywhere on the page (outside other inputs). */
  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (
      event.key !== '/' ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      isEditableTarget(event.target)
    ) {
      return;
    }
    const searchBox = this.searchInput()?.nativeElement;
    // Skip hidden instances (inactive tabs, collapsed sections).
    if (!searchBox?.offsetParent) {
      return;
    }
    event.preventDefault();
    searchBox.focus();
    searchBox.select();
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
    this.resolveFieldLayout();
    this.restoreExpandedState();
    this.refreshAppliedFilters();

    this.restoreFromUrlPending = hasSearchFilterQueryParams(urlValues);
    if (this.restoreFromUrlPending) {
      this.restoreSessionId = this.searchFilterUrlRestore.beginRestore();
    }

    this.destroyRef.onDestroy(() => this.endUrlRestore());

    this.form.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.changeDetectorRef.markForCheck());

    this.bindSearchAutoApply();

    queueMicrotask(() => this.formReady.emit(this.form));
  }

  protected isSearchDisabled(): boolean {
    return !this.hasPendingChanges();
  }

  /** Form differs from what is applied (all fields, search included). */
  protected hasPendingChanges(): boolean {
    return !!this.form?.formGroup.dirty && this.changedFieldNames().length > 0;
  }

  /**
   * Filters edited but not applied yet. The search box is left out: it applies itself
   * while typing, so flagging it would only flash the hint mid-word.
   */
  protected pendingFilterCount(): number {
    if (!this.form?.formGroup.dirty) {
      return 0;
    }
    return this.changedFieldNames().filter(
      fieldName => fieldName !== SEARCH_FIELD_NAME
    ).length;
  }

  /** Drawer submit button labelled with how many filters it will apply, e.g. "Search (3)". */
  protected drawerSubmitConfig(): Partial<IButtonConfig> {
    const submit = this.form.buttonConfigs['submit'] ?? {};
    const values = this.form.getRawData();
    const count = this.extraFieldNames.filter(fieldName =>
      hasFilterValue(values[fieldName])
    ).length;
    // Same object while the count is unchanged, so the button input stays stable.
    if (this.drawerSubmitCache?.count !== count) {
      this.drawerSubmitCache = {
        count,
        config: count
          ? { ...submit, label: `${submit.label ?? 'Apply'} (${count})` }
          : submit,
      };
    }
    return this.drawerSubmitCache.config;
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }
    if (this.hasSearchText()) {
      event.preventDefault();
      event.stopPropagation();
      this.clearSearch();
      return;
    }
    (event.target as HTMLInputElement).blur();
  }

  /** Chip click: open the filters and put the cursor in that field. */
  protected editFilter(fieldName: string): void {
    if (fieldName === SEARCH_FIELD_NAME) {
      this.searchInput()?.nativeElement.focus();
      return;
    }

    const compact = this.isCompactViewport();
    if (compact) {
      this.mobileDrawerOpen.set(true);
    } else if (!this.filtersExpanded()) {
      this.toggleFilters();
    }

    clearTimeout(this.highlightTimer);
    this.highlightedField.set(fieldName);
    this.changeDetectorRef.markForCheck();
    this.highlightTimer = setTimeout(() => {
      this.highlightedField.set(null);
      this.changeDetectorRef.markForCheck();
    }, FIELD_HIGHLIGHT_MS);

    setTimeout(
      () => this.focusField(fieldName),
      compact ? DRAWER_OPEN_DELAY_MS : 0
    );
  }

  protected isResetDisabled(): boolean {
    return (
      !this.form?.formGroup.dirty &&
      !this.hasSearched &&
      this.activeFilterCount() === 0
    );
  }

  protected isFieldVisible(fieldName: string): boolean {
    const visibleFieldNames = this.visibleFieldNames();
    return !visibleFieldNames?.length || visibleFieldNames.includes(fieldName);
  }

  protected hasSearchText(): boolean {
    return hasFilterValue(this.form?.formGroup.get(SEARCH_FIELD_NAME)?.value);
  }

  markFilterSubmitted(): void {
    if (!this.form) {
      return;
    }

    this.form.formGroup.markAsPristine();
    this.hasSearched = true;
    this.hasPrefillValues = false;
    this.refreshAppliedFilters();
    this.changeDetectorRef.markForCheck();
  }

  updateFieldConfig(fieldName: string, fieldConfig: IInputFieldsConfig): void {
    if (!this.form?.fieldConfigs[fieldName]) {
      return;
    }

    this.form.fieldConfigs[fieldName] = fieldConfig;
    this.resolveFieldLayout();
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  submitFilter(): void {
    if (!this.form) {
      return;
    }
    this.onSubmit();
  }

  protected toggleFilters(): void {
    const expanded = !this.filtersExpanded();
    this.filtersExpanded.set(expanded);
    writeStorage(this.expandedStorageKey, expanded ? '1' : '0');
  }

  protected clearSearch(): void {
    const control = this.form.formGroup.get(SEARCH_FIELD_NAME);
    if (!control) {
      return;
    }
    control.setValue(null);
    control.markAsDirty();
    this.onSubmit();
  }

  /** Removes one applied filter and re-applies the rest. */
  protected removeFilter(fieldName: string): void {
    const control = this.form.formGroup.get(fieldName);
    if (!control) {
      return;
    }
    control.reset();

    const stillApplied = this.appliedChips().some(
      chip => chip.fieldName !== fieldName
    );
    if (!stillApplied && !this.form.formGroup.dirty) {
      this.onReset();
      return;
    }
    control.markAsDirty();
    this.onSubmit();
  }

  protected onSubmit(): void {
    // Emit before the table reloads: `_filter()` fires the lazy load synchronously, and pages
    // that keep the selection in their own state (e.g. event history) must have it set by then.
    this.onFilterSubmit.emit(this.form.getData());
    const table = this.resolveTable();
    if (table) {
      this.startSearching();
      this.setFilterInTable(table, true);
    }
    this.form.formGroup.markAsPristine();
    this.hasSearched = true;
    this.hasPrefillValues = false;
    this.syncFiltersToUrl(this.form.getRawData());
    this.refreshAppliedFilters();
    this.mobileDrawerOpen.set(false);
    this.changeDetectorRef.markForCheck();
  }

  protected setFilterInTable(table: Table, emitLazyLoad = true): void {
    const formData = this.form.getData();

    Object.entries(formData).forEach(([key, value]) => {
      const matchMode = this.searchFilterConfig().fields[key]
        ?.matchmode as string;
      table.filters[key === SEARCH_FIELD_NAME ? 'global' : key] = {
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
      this.startSearching();
      table.filters = {};
      table.reset();
    }
    this.hasSearched = false;
    this.hasPrefillValues = false;
    this.refreshAppliedFilters();
    this.mobileDrawerOpen.set(false);
    this.changeDetectorRef.markForCheck();
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

  private resolveFieldLayout(): void {
    const fieldNames = Object.keys(this.form.fieldConfigs).filter(fieldName =>
      this.isFieldVisible(fieldName)
    );
    this.searchFieldConfig = fieldNames.includes(SEARCH_FIELD_NAME)
      ? (this.form.fieldConfigs[SEARCH_FIELD_NAME] ?? null)
      : null;
    this.extraFieldNames = fieldNames.filter(
      fieldName => fieldName !== SEARCH_FIELD_NAME
    );
  }

  /** Open by default only when there is no search box to lead with. */
  private restoreExpandedState(): void {
    this.expandedStorageKey =
      EXPANDED_STORAGE_PREFIX + this.router.url.split(/[?#]/)[0];
    const stored = readStorage(this.expandedStorageKey);
    this.filtersExpanded.set(
      stored === null ? !this.searchFieldConfig : stored === '1'
    );
  }

  /** Applies the search box shortly after the user stops typing. */
  private bindSearchAutoApply(): void {
    const control = this.form.formGroup.get(SEARCH_FIELD_NAME);
    if (!control) {
      return;
    }

    control.valueChanges
      .pipe(
        filter(() => control.dirty),
        map(value => (typeof value === 'string' ? value.trim() : '')),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        filter(term => {
          const applied = this.appliedValues()[SEARCH_FIELD_NAME];
          const appliedTerm = typeof applied === 'string' ? applied.trim() : '';
          return (
            term !== appliedTerm &&
            (term.length === 0 || term.length >= SEARCH_MIN_LENGTH)
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.onSubmit());
  }

  private refreshAppliedFilters(): void {
    this.appliedValues.set({ ...this.form.getRawData() });
  }

  /** Fields whose current value differs from the applied one. */
  private changedFieldNames(): string[] {
    const current = this.form.getRawData();
    const applied = this.appliedValues();
    return this.extraFieldNames
      .concat(this.searchFieldConfig ? [SEARCH_FIELD_NAME] : [])
      .filter(
        fieldName =>
          normalizeForCompare(current[fieldName]) !==
          normalizeForCompare(applied[fieldName])
      );
  }

  private startSearching(): void {
    this.isSearching.set(true);
    clearTimeout(this.searchingTimer);
    this.searchingTimer = setTimeout(() => {
      this.isSearching.set(false);
      this.changeDetectorRef.markForCheck();
    }, SEARCHING_TIMEOUT_MS);
  }

  private syncTableState(table: Table): void {
    // Rows are cleared while a page loads; wait for the real result instead of flashing "0".
    if (table.loading) {
      return;
    }
    const count = table.lazy
      ? (table.totalRecords ?? 0)
      : (table.filteredValue ?? table.value ?? []).length;
    this.resultCount.set(count);
    clearTimeout(this.searchingTimer);
    this.isSearching.set(false);
    this.changeDetectorRef.markForCheck();
  }

  private focusField(fieldName: string): void {
    const wrapper = document.querySelector<HTMLElement>(
      `[data-filter-field="${this.instanceId}:${fieldName}"]`
    );
    const target = wrapper?.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not([disabled]), [tabindex="0"], button:not([disabled])'
    );
    target?.focus();
    wrapper?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  private formatChipValue(
    value: unknown,
    config: IInputFieldsConfig | undefined
  ): string {
    if (value instanceof Date) {
      return CHIP_DATE_FORMAT.format(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      const items = value.filter(hasFilterValue);
      if (items.length && items.every(item => item instanceof Date)) {
        return items
          .map(item => CHIP_DATE_FORMAT.format(item))
          .join(' – ');
      }
      const options = this.resolveOptions(config);
      const labels = items.map(item => findOptionLabel(options, item));
      if (labels.every(label => label === null)) {
        return `${items.length} selected`;
      }
      const named = labels.map(
        (label, index) => label ?? String(items[index])
      );
      const extra = named.length - CHIP_MAX_LABELS;
      return extra > 0
        ? `${named.slice(0, CHIP_MAX_LABELS).join(', ')} +${extra}`
        : named.join(', ');
    }
    return (
      findOptionLabel(this.resolveOptions(config), value) ?? String(value)
    );
  }

  /** Static options plus already-loaded configuration dropdowns; used only for chip labels. */
  private resolveOptions(
    config: IInputFieldsConfig | undefined
  ): IOptionDropdown[] {
    if (!config) {
      return [];
    }
    const dropdownConfig =
      config.selectConfig ??
      config.multiSelectConfig ??
      config.autocompleteConfig;
    const options: IOptionDropdown[] = [
      ...(dropdownConfig?.optionsDropdown ?? []),
      ...(config.radioConfig?.options ?? []),
      ...(config.checkboxConfig?.options ?? []),
    ];
    const dynamic = dropdownConfig?.dynamicDropdown;
    if (dynamic?.moduleName && dynamic.dropdownName) {
      options.push(
        ...(this.appConfigurationService.getDropdown(
          dynamic.moduleName,
          dynamic.dropdownName
        )() ?? [])
      );
    }
    return options;
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
    this.refreshAppliedFilters();
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

function hasFilterValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasFilterValue);
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  return value !== null && value !== undefined;
}

/** Comparable form of a filter value: empty values collapse to "", dates to ISO strings. */
function normalizeForCompare(value: unknown): string {
  if (!hasFilterValue(value)) {
    return '';
  }
  return JSON.stringify(value, (_key, item: unknown) =>
    typeof item === 'string' ? item.trim() : item
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    !!target.closest('[role="combobox"], [role="listbox"], [role="dialog"]')
  );
}

function findOptionLabel(
  options: IOptionDropdown[],
  value: unknown
): string | null {
  return options.find(option => option.value === value)?.label ?? null;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode / blocked): the toggle still works for this visit.
  }
}
