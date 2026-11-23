import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  input,
  output,
  signal,
  model,
  inject,
  viewChild,
  TemplateRef,
  computed,
  effect,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import {
  Table,
  TableFilterEvent,
  TableLazyLoadEvent,
  TableModule,
  TableRowCollapseEvent,
  TableRowExpandEvent,
} from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectButtonModule } from 'primeng/selectbutton';
import {
  IDataTableConfig,
  IDataTableFrozenColumnConfig,
  IDataTableHeaderConfig,
  ITableActionConfig,
  IButtonConfig,
  ITableActionClickEvent,
  EButtonActionType,
  EButtonVariant,
  EButtonSeverity,
  IGalleryInputData,
  EDataType,
} from '@shared/types';
import {
  NgClass,
  NgTemplateOutlet,
  DatePipe,
  CurrencyPipe,
  DecimalPipe,
} from '@angular/common';
import {
  AvatarService,
  GalleryService,
  SearchFilterUrlRestoreService,
  TableFilterResetService,
  TableRowHighlightService,
  PageEmptyStateActionService,
} from '@shared/services';
import {
  ICONS,
  SKELETON_CARD_COUNT,
  SKELETON_LINE_WIDTHS,
  SKELETON_TABLE_DEFAULT_ROWS,
  SKELETON_TABLE_MAX_ROWS,
} from '@shared/constants';
import { ButtonComponent } from '../button/button.component';
import { StatusTagComponent } from '../status-tag/status-tag.component';
import { EmptyMessagesComponent } from '../empty-messages/empty-messages.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { APP_CONFIG } from '@core/config';
import { AppPermissionService, LoggerService } from '@core/services';
import { ChipComponent } from '../chip/chip.component';
import { ReadMoreComponent } from '../read-more/read-more.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { registerActiveBulkTable } from './active-bulk-table';
import {
  DATA_TABLE_CLEAR_FILTERS_BUTTON_CONFIG,
  DATA_TABLE_FILTERED_EMPTY_STATE,
  DATA_TABLE_LOAD_ERROR_STATE,
  DATA_TABLE_RETRY_BUTTON_CONFIG,
  DEFAULT_FROZEN_ACTIONS_COLUMN_CONFIG,
  DEFAULT_FROZEN_SELECTION_COLUMN_CONFIG,
  DEFAULT_READ_MORE_CONFIG,
} from '@shared/config';
import {
  StatusUtil,
  areSearchFilterQueryParamsUnchanged,
  isDataTableColumnFrozen,
  isDataTableScrollable,
  resolveColumnWidth,
  resolveFrozenAlign,
  resolveTablePaginationFromQuery,
  serializeTablePaginationQueryParams,
} from '@shared/utility';
import { ESkeletonVariant } from '@shared/types/skeleton/skeleton.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    TableModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ButtonComponent,
    IconFieldModule,
    InputIconModule,
    SliderModule,
    FormsModule,
    CheckboxModule,
    ToolbarModule,
    TooltipModule,
    MenuModule,
    NgClass,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    EmptyMessagesComponent,
    SkeletonComponent,
    NgTemplateOutlet,
    PanelModule,
    PaginatorModule,
    PaginatorComponent,
    SelectButtonModule,
    StatusTagComponent,
    ChipComponent,
    ReadMoreComponent,
  ],

  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  readonly dt = viewChild.required<Table>('dt');

  protected ALL_DATA_TYPES = EDataType;
  protected icons = ICONS;
  protected readonly appConfig = APP_CONFIG;
  protected readonly defaultReadMoreConfig = DEFAULT_READ_MORE_CONFIG;

  /** Icon-only trigger when row actions collapse into the overflow menu (matches row action styling). */
  protected readonly rowOverflowTriggerButtonConfig: Partial<IButtonConfig> = {
    label: '',
    icon: ICONS.COMMON.ELLIPSIS_V,
    variant: EButtonVariant.OUTLINED,
    shadow: true,
    tooltip: 'Actions',
  };

  private avatarService = inject(AvatarService);
  private galleryService = inject(GalleryService);
  private logger = inject(LoggerService);
  private permissionService = inject(AppPermissionService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly searchFilterUrlRestore = inject(
    SearchFilterUrlRestoreService
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly rowHighlight = inject(TableRowHighlightService);
  /** Removes the listeners that end the row highlight. */
  private stopRowFlash?: () => void;

  /** Row lit once after arriving from e.g. a notification (see TableRowHighlightService). */
  protected readonly flashRowId = signal<string | null>(null);
  private readonly tableFilterReset = inject(TableFilterResetService);
  private readonly pageEmptyStateAction = inject(PageEmptyStateActionService);

  protected readonly filteredEmptyState = DATA_TABLE_FILTERED_EMPTY_STATE;
  protected readonly clearFiltersButtonConfig =
    DATA_TABLE_CLEAR_FILTERS_BUTTON_CONFIG;
  protected readonly loadErrorState = DATA_TABLE_LOAD_ERROR_STATE;
  protected readonly retryButtonConfig = DATA_TABLE_RETRY_BUTTON_CONFIG;

  protected readonly showTableLoading = computed(
    () => this.loading() || this.searchFilterUrlRestore.hasPendingRestore()
  );

  /**
   * True when search or a filter is applied to the table, so an empty result means
   * "nothing matches" rather than "no records yet".
   */
  protected hasActiveFilters(): boolean {
    const filters = this.dt().filters ?? {};
    return Object.values(filters).some(entry =>
      (Array.isArray(entry) ? entry : [entry]).some(meta =>
        hasFilterValue(meta?.value)
      )
    );
  }

  /** The page's main action (e.g. "Add Asset") for the "no records yet" state. */
  protected readonly emptyStateAction = computed(() =>
    this.tableConfig().showEmptyStateAction === false
      ? null
      : this.pageEmptyStateAction.action()
  );

  protected canClearFilters(): boolean {
    return this.tableFilterReset.canReset(this.dt());
  }

  protected clearFilters(): void {
    this.tableFilterReset.reset(this.dt());
  }

  protected resolveDateLocale(col?: Partial<IDataTableHeaderConfig>): string {
    return (
      col?.dateLocale ??
      APP_CONFIG.DATE_FORMATS.DISPLAY_LOCALE ??
      APP_CONFIG.NUMBER_FORMATS.LOCALE
    );
  }

  // Input signals
  loading = input.required<boolean>();
  tableConfig = input.required<IDataTableConfig>();
  tableHeader = input.required<IDataTableHeaderConfig[]>();
  tableData = input.required<Record<string, unknown>[]>();
  bulkActionButtons = input<ITableActionConfig[]>([]);
  rowActions = input<ITableActionConfig[]>([]);
  customBodyTemplates = input<Record<string, TemplateRef<unknown>>>({});
  rowExpansionTemplate = input<TemplateRef<unknown> | undefined>(undefined);
  isRowExpandable = input<(row: Record<string, unknown>) => boolean>();

  bulkActionClick = output<ITableActionClickEvent>();
  rowActionClick = output<ITableActionClickEvent>();
  filterData = output<TableLazyLoadEvent>();
  attachmentClick = output<Record<string, unknown>>();
  selectionChange = output<Record<string, unknown>[]>();
  /** "Clear Selection" in the bulk bar (useful when the parent owns the selection). */
  selectionCleared = output<void>();

  /**
   * Controlled selection: ids (`tableUniqueId`) of the rows to show as selected. When unset the
   * table keeps its own selection, as before.
   */
  selectedRowIds = input<readonly string[] | undefined>(undefined);

  /**
   * Rows the bulk bar works on instead of the ticked rows of this table — for a selection that
   * spans nested tables (e.g. days of several applications). Bulk buttons show from one row.
   */
  bulkSelectionRows = input<Record<string, unknown>[] | undefined>(undefined);

  /**
   * Child rows: an expanded row shows these as lighter rows of the same table, cell by cell in
   * the same columns (instead of `rowExpansionTemplate`'s free panel). Receives the row as
   * displayed (mapped) data.
   */
  childRows = input<
    ((row: Record<string, unknown>) => Record<string, unknown>[]) | undefined
  >(undefined);
  /** Child cell content per column `field`; context `{ $implicit: child, parent, column }`. */
  childCellTemplates = input<Record<string, TemplateRef<unknown>>>({});
  /** Child row checkbox state; ticking emits {@link childSelectionToggle}. */
  isChildSelected = input<(child: Record<string, unknown>) => boolean>(
    () => false
  );
  childSelectionToggle = output<Record<string, unknown>>();
  /** A row whose children are only partly ticked shows "–"; clicking it emits {@link partialRowToggle}. */
  isRowPartiallySelected = input<
    ((row: Record<string, unknown>) => boolean) | undefined
  >(undefined);
  partialRowToggle = output<Record<string, unknown>>();
  /** Actions on each child row (same rules as row actions: permission, hide/disable, reason). */
  childRowActions = input<Partial<ITableActionConfig>[]>([]);
  childRowActionClick = output<ITableActionClickEvent>();

  protected getVisibleChildRowActions(
    child: Record<string, unknown>
  ): ITableActionConfig[] {
    return (this.childRowActions() as ITableActionConfig[]).filter(action =>
      this.isActionVisible(action, child)
    );
  }

  protected onChildRowActionClick(
    actionType: EButtonActionType,
    child: Record<string, unknown>
  ): void {
    this.childRowActionClick.emit({
      actionType,
      selectedRows: [this.extractOriginalData(child)],
    });
  }

  protected isPartiallySelected(row: Record<string, unknown>): boolean {
    return this.isRowPartiallySelected()?.(row) ?? false;
  }

  /** Rows (original data) the bulk bar counts, checks and emits. */
  protected readonly bulkRows = computed(
    () =>
      this.bulkSelectionRows() ??
      this.selectedTableRows().map(row => this.extractOriginalData(row))
  );

  /** Bulk bar threshold: own selection needs 2 rows (1 uses row actions); a parent's needs 1. */
  protected readonly showBulkBar = computed(() =>
    this.bulkSelectionRows()
      ? this.bulkRows().length > 0
      : this.bulkRows().length > 1
  );

  protected readonly rowSelectable = ({
    data,
  }: {
    data: Record<string, unknown>;
    index: number;
  }): boolean => {
    const disableWhen = this.tableConfig().disableRowSelectionWhen;
    if (!disableWhen) {
      return true;
    }

    return !disableWhen(this.extractOriginalData(data));
  };

  protected selectedTableRows = signal<Record<string, unknown>[]>([]);
  private lastEmittedSelectionKey = '';
  private initialLazyLoadEmitted = false;
  /** The last load request sent to the page; "Try again" sends it once more. */
  private lastLazyLoadEvent: TableLazyLoadEvent | null = null;
  private viewReady = false;
  private paginationRestoredFromUrl = false;
  /** Placeholder rows while loading: the page size, between the default and the max. */
  protected readonly skeletonRows = computed(() => {
    const pageSize = this.paginationRows() || SKELETON_TABLE_DEFAULT_ROWS;
    const count = Math.min(Math.max(pageSize, 1), SKELETON_TABLE_MAX_ROWS);
    return Array.from({ length: count }, (_, index) => index);
  });

  protected readonly ESkeletonVariant = ESkeletonVariant;
  protected readonly skeletonCards = Array.from(
    { length: SKELETON_CARD_COUNT },
    (_, index) => index
  );

  /** Uneven line widths, so a loading table looks like real text. */
  protected skeletonWidth(row: number, column: number): string {
    return SKELETON_LINE_WIDTHS[
      (row * 3 + column) % SKELETON_LINE_WIDTHS.length
    ];
  }

  protected visibleTableHeaders = computed(() => {
    return this.permissionService.filterByPermission(this.tableHeader());
  });

  protected isTableScrollable = computed(() =>
    isDataTableScrollable(this.tableConfig(), this.visibleTableHeaders())
  );

  protected isColumnFrozen(
    config?: Partial<
      IDataTableFrozenColumnConfig | IDataTableHeaderConfig
    > | null
  ): boolean {
    return isDataTableColumnFrozen(this.isTableScrollable(), config);
  }

  protected getFrozenAlign(
    config?: Partial<
      IDataTableFrozenColumnConfig | IDataTableHeaderConfig
    > | null,
    fallback: 'left' | 'right' = 'left'
  ): 'left' | 'right' {
    return resolveFrozenAlign(config, fallback);
  }

  protected readonly defaultFrozenSelectionColumn =
    DEFAULT_FROZEN_SELECTION_COLUMN_CONFIG;
  protected readonly defaultFrozenActionsColumn =
    DEFAULT_FROZEN_ACTIONS_COLUMN_CONFIG;

  protected getColumnWidth(
    config?: Partial<
      IDataTableFrozenColumnConfig | IDataTableHeaderConfig
    > | null,
    defaultWhenFrozen?: Partial<IDataTableFrozenColumnConfig>
  ): string | undefined {
    return resolveColumnWidth(
      this.isTableScrollable(),
      config,
      defaultWhenFrozen
    );
  }

  /**
   * Row selection checkbox column visibility.
   * `showCheckbox: true` forces the column on; `false` hides it;
   * otherwise it appears when at least one bulk action is visible.
   */
  protected showBulkSelectionCheckbox = computed(() => {
    const { showCheckbox } = this.tableConfig();

    if (showCheckbox === false) {
      return false;
    }

    if (showCheckbox === true) {
      return true;
    }

    return this.bulkActionButtons().some(action =>
      this.isActionVisible(action)
    );
  });

  /** Bulk action bar only when at least one bulk action is visible. */
  protected showBulkActionBar = computed(() => {
    return this.bulkActionButtons().some(action =>
      this.isActionVisible(action)
    );
  });

  /** Actions column only when at least one row action is permitted for the user. */
  protected showRowActionsColumn = computed(() => {
    return this.rowActions().some(action =>
      this.hasRequiredPermissions(action)
    );
  });

  /** Colspan for empty state row: data columns + optional checkbox + optional actions */
  protected emptyMessageColSpan = computed(() => {
    let span = this.visibleTableHeaders().length;
    if (this.hasRowExpansion()) {
      span += 1;
    }
    if (this.showBulkSelectionCheckbox()) {
      span += 1;
    }
    if (this.showRowActionsColumn()) {
      span += 1;
    }
    return span;
  });

  protected readonly hasRowExpansion = computed(
    () =>
      !!this.childRows() ||
      (this.rowExpansionTemplate() !== null &&
        this.rowExpansionTemplate() !== undefined)
  );
  protected readonly expandedRowKeys = signal<Record<string, boolean>>({});

  protected isExpandableRow(row: Record<string, unknown>): boolean {
    const canExpand = this.isRowExpandable();
    return canExpand ? canExpand(row) : true;
  }

  protected onRowExpand(event: TableRowExpandEvent): void {
    const key = this.normalizeRowIdForSelection(
      event.data,
      this.tableConfig().tableUniqueId
    );

    if (!key) {
      return;
    }

    this.expandedRowKeys.update(keys => ({ ...keys, [key]: true }));
  }

  protected onRowCollapse(event: TableRowCollapseEvent): void {
    const key = this.normalizeRowIdForSelection(
      event.data,
      this.tableConfig().tableUniqueId
    );

    if (!key) {
      return;
    }

    this.expandedRowKeys.update(keys => {
      const next = { ...keys };
      delete next[key];
      return next;
    });
  }

  protected isCardRowExpanded(row: Record<string, unknown>): boolean {
    const key = this.normalizeRowIdForSelection(
      row,
      this.tableConfig().tableUniqueId
    );
    if (!key) {
      return false;
    }
    return !!this.expandedRowKeys()[key];
  }

  protected toggleCardRowExpansion(row: Record<string, unknown>): void {
    if (!this.isExpandableRow(row)) {
      return;
    }

    const key = this.normalizeRowIdForSelection(
      row,
      this.tableConfig().tableUniqueId
    );
    if (!key) {
      return;
    }

    this.expandedRowKeys.update(keys => {
      const next = { ...keys };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      return next;
    });
  }

  /** Wide custom cells read better with the label above the value. */
  protected isStackedCardField(column: IDataTableHeaderConfig): boolean {
    return (
      !!column.customTemplateKey ||
      column.bodyTemplate === EDataType.TEXT_WITH_READ_MORE ||
      column.bodyTemplate === EDataType.TEXT_WITH_SUBTITLE ||
      column.bodyTemplate === EDataType.ATTACHMENTS
    );
  }

  /** Phones use the same breakpoint as the app sidebar. */
  protected readonly isCompactViewport = signal(
    typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 768px)').matches
  );

  // View mode: 'list' or 'card' - using model signal for two-way binding with SelectButton
  protected viewMode = model<'list' | 'card'>('list');
  /** Phone layout. Cards are the default; the switch can open the table. */
  protected mobileViewMode = model<'list' | 'card'>('card');
  protected readonly canSwitchMobileLayout = computed(
    () =>
      this.isCompactViewport() &&
      this.appConfig.MOBILE_SHOW_CARDS &&
      this.tableConfig().mobileCardLayout !== false
  );

  protected readonly resolvedViewMode = computed(() => {
    if (this.canSwitchMobileLayout()) {
      return this.mobileViewMode();
    }

    if (this.isCompactViewport()) {
      return 'list' as const;
    }

    return this.tableConfig().showViewModeToggle === false
      ? 'list'
      : this.viewMode();
  });

  /** First non-status column is the card title. Every other column keeps its header. */
  protected readonly cardLayoutColumns = computed(() => {
    const visible = this.visibleTableHeaders().filter(
      column => column.showColumn !== false
    );
    const title =
      visible.find(column => column.bodyTemplate !== EDataType.STATUS) ??
      visible[0];
    const body = visible.filter(column => column !== title);

    return { title, body };
  });

  // Track pagination state for card view
  protected paginationFirst = signal<number>(0);
  protected paginationRows = signal<number>(0);

  // SelectButton options for view mode toggle
  protected readonly viewModeOptions = [
    { label: 'List', value: 'list', icon: ICONS.COMMON.LIST },
    { label: 'Card', value: 'card', icon: ICONS.COMMON.TH_LARGE },
  ];

  protected readonly mobileLayoutOptions = [
    { label: 'Cards', value: 'card' as const, icon: ICONS.COMMON.TH_LARGE },
    { label: 'Table', value: 'list' as const, icon: ICONS.COMMON.TABLE },
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(max-width: 768px)');
      const syncViewport = (): void => {
        this.isCompactViewport.set(media.matches);
      };
      syncViewport();
      media.addEventListener('change', syncViewport);
      this.destroyRef.onDestroy(() =>
        media.removeEventListener('change', syncViewport)
      );
    }

    // Load view mode from localStorage on init
    const savedViewMode = localStorage.getItem('table-view-mode') as
      | 'list'
      | 'card'
      | null;
    if (savedViewMode === 'list' || savedViewMode === 'card') {
      this.viewMode.set(savedViewMode);
    }

    const savedMobileViewMode = localStorage.getItem(
      'mobile-table-view-mode'
    ) as 'list' | 'card' | null;
    if (savedMobileViewMode === 'list' || savedMobileViewMode === 'card') {
      this.mobileViewMode.set(savedMobileViewMode);
    }

    // Save view mode to localStorage when it changes
    effect(() => {
      const mode = this.viewMode();
      localStorage.setItem('table-view-mode', mode);
    });

    effect(() => {
      localStorage.setItem('mobile-table-view-mode', this.mobileViewMode());
    });

    // Initialize pagination from URL, then fall back to table config
    effect(() => {
      const config = this.tableConfig();
      untracked(() => this.applyPaginationFromUrl(config));
    });

    effect(() => {
      if (!this.showBulkSelectionCheckbox()) {
        this.selectedTableRows.set([]);
      }
    });

    // Controlled selection: mirror the parent's ids onto the rows of this page.
    effect(() => {
      const ids = this.selectedRowIds();
      if (!ids) {
        return;
      }
      const idPath = this.tableConfig().tableUniqueId;
      const wanted = new Set(ids);
      const rows = this.tableData().filter(row => {
        const id = this.normalizeRowIdForSelection(row, idPath);
        return id !== null && wanted.has(id);
      });
      untracked(() => {
        const current = this.selectedTableRows()
          .map(row => this.normalizeRowIdForSelection(row, idPath))
          .join('|');
        const next = rows
          .map(row => this.normalizeRowIdForSelection(row, idPath))
          .join('|');
        if (current !== next) {
          this.selectedTableRows.set(rows);
        }
      });
    });

    effect(() => {
      if (!this.showBulkSelectionCheckbox()) {
        return;
      }

      const idPath = this.tableConfig().tableUniqueId;
      const selected = this.selectedTableRows().filter(
        row => !this.isRowSelectionDisabled(row)
      );
      const selectedRows = selected.map(row => this.extractOriginalData(row));
      // Row id first: several rows can share a userId (e.g. days of one employee's leave).
      const selectionKey = selected
        .map(row =>
          String(
            this.normalizeRowIdForSelection(row, idPath) ??
              this.extractOriginalData(row)['userId'] ??
              ''
          )
        )
        .join('|');

      if (selectionKey === this.lastEmittedSelectionKey) {
        return;
      }

      this.lastEmittedSelectionKey = selectionKey;
      this.selectionChange.emit(selectedRows);
    });

    effect(() => {
      const pendingRestore = this.searchFilterUrlRestore.hasPendingRestore();
      untracked(() => {
        if (!pendingRestore) {
          this.emitInitialLazyLoadIfNeeded();
        }
      });
    });

    afterNextRender(() => {
      this.viewReady = true;
      this.emitInitialLazyLoadIfNeeded();
    });

    // A requested row lights up once when it appears; the request is then cleared.
    effect(() => {
      const pendingId = this.rowHighlight.pendingId();
      const rows = this.tableData();
      if (!pendingId || this.showTableLoading() || rows.length === 0) {
        return;
      }
      untracked(() => {
        const idPath = this.tableConfig().tableUniqueId;
        const found = rows.some(
          row => this.normalizeRowIdForSelection(row, idPath) === pendingId
        );
        if (found) {
          this.rowHighlight.clear();
          this.flashRow(pendingId);
        }
      });
    });

    this.destroyRef.onDestroy(() => this.stopRowFlash?.());
  }

  protected rowKey(row: Record<string, unknown>): string | null {
    return this.normalizeRowIdForSelection(
      row,
      this.tableConfig().tableUniqueId
    );
  }

  protected isFlashRow(row: Record<string, unknown>): boolean {
    const flashId = this.flashRowId();
    return flashId !== null && this.rowKey(row) === flashId;
  }

  /**
   * Lights the row (it pulses a few times, then stays lit) until the user clicks or presses a
   * key anywhere, so it cannot be missed and does not keep blinking.
   */
  private flashRow(rowId: string): void {
    this.stopRowFlash?.();
    this.flashRowId.set(rowId);

    afterNextRender(
      () => {
        const el = this.hostRef.nativeElement.querySelector<HTMLElement>(
          `[data-row-key="${CSS.escape(rowId)}"]`
        );
        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        el?.scrollIntoView({
          block: 'center',
          behavior: reduceMotion ? 'auto' : 'smooth',
        });

        // Added after the page has opened, so the click that led here does not end it.
        const end = (): void => {
          this.stopRowFlash?.();
          this.flashRowId.set(null);
        };
        const doc = this.hostRef.nativeElement.ownerDocument;
        doc.addEventListener('pointerdown', end, { capture: true });
        doc.addEventListener('keydown', end, { capture: true });
        this.stopRowFlash = (): void => {
          doc.removeEventListener('pointerdown', end, { capture: true });
          doc.removeEventListener('keydown', end, { capture: true });
          this.stopRowFlash = undefined;
        };
      },
      { injector: this.injector }
    );
  }

  /** Stable string key for row identity (matches {@link tableConfig}.tableUniqueId). */
  private normalizeRowIdForSelection(
    row: Record<string, unknown>,
    idPath: string
  ): string | null {
    const id = this.resolveNestedProperty<unknown>(row, idPath);
    if (id === null || id === undefined) {
      return null;
    }
    return String(id);
  }

  protected toggleViewMode(): void {
    this.viewMode.update(mode => (mode === 'list' ? 'card' : 'list'));
  }

  protected clear(table: Table): void {
    table.clear();
  }

  clearSelection(): void {
    this.selectedTableRows.set([]);
    const table = this.dt();
    if (table) {
      table.selection = [];
    }
    this.selectionCleared.emit();
  }

  /**
   * Check if a row is selected (for card view checkbox)
   */
  protected isRowSelected(rowData: Record<string, unknown>): boolean {
    const rowId = this.normalizeRowIdForSelection(
      rowData,
      this.tableConfig().tableUniqueId
    );
    if (rowId === null) {
      return false;
    }

    return this.selectedTableRows().some(
      row =>
        this.normalizeRowIdForSelection(
          row,
          this.tableConfig().tableUniqueId
        ) === rowId
    );
  }

  protected toggleRowSelection(
    rowData: Record<string, unknown>,
    event: Event
  ): void {
    if (this.isRowSelectionDisabled(rowData)) {
      event.preventDefault();
      return;
    }

    const target = event.target as HTMLInputElement;
    const idPath = this.tableConfig().tableUniqueId;
    const rowId = this.normalizeRowIdForSelection(rowData, idPath);
    if (rowId === null) {
      return;
    }

    const currentSelection = this.selectedTableRows();

    if (target.checked) {
      if (
        !currentSelection.some(
          row => this.normalizeRowIdForSelection(row, idPath) === rowId
        )
      ) {
        this.selectedTableRows.set([...currentSelection, rowData]);
      }
    } else {
      this.selectedTableRows.set(
        currentSelection.filter(
          row => this.normalizeRowIdForSelection(row, idPath) !== rowId
        )
      );
    }
  }

  resolveNestedProperty<T = unknown>(
    obj: Record<string, unknown>,
    path: string
  ): T | undefined {
    return path
      .split('.')
      .reduce(
        (current, key) => (current as Record<string, unknown>)?.[key],
        obj as unknown
      ) as T;
  }

  protected onFilterChange(_event: TableFilterEvent): void {
    this.logger.logUserAction('Filter changed', _event);
  }

  protected onLazyLoad(event: TableLazyLoadEvent): void {
    const lazyLoadEvent = this.withCurrentTableFilters(event);

    if (
      this.searchFilterUrlRestore.hasPendingRestore() &&
      !this.lazyLoadEventHasFilters(lazyLoadEvent)
    ) {
      return;
    }

    this.logger.logUserAction('Lazy load', lazyLoadEvent);
    this.initialLazyLoadEmitted = true;
    // Sync pagination state - update paginationFirst and rows to keep both views in sync
    const newFirst = lazyLoadEvent.first ?? 0;
    const newRows = lazyLoadEvent.rows ?? this.tableConfig().displayRows;

    if (this.paginationFirst() !== newFirst) {
      this.paginationFirst.set(newFirst);
    }
    if (this.paginationRows() !== newRows) {
      this.paginationRows.set(newRows);
    }

    this.lastLazyLoadEvent = lazyLoadEvent;
    this.filterData.emit(lazyLoadEvent);
    this.syncPaginationToUrl(newFirst, newRows);
  }

  /** "Try again" is offered when the page loads through the table (server-side tables). */
  protected canRetryLoad(): boolean {
    return this.lastLazyLoadEvent !== null;
  }

  /** Repeats the last load request after a failed load. */
  protected retryLoad(): void {
    if (this.lastLazyLoadEvent) {
      this.logger.logUserAction('Retry table load', this.lastLazyLoadEvent);
      this.filterData.emit(this.lastLazyLoadEvent);
    }
  }

  private withCurrentTableFilters(
    event: TableLazyLoadEvent
  ): TableLazyLoadEvent {
    const table = this.dt();
    const filters = {
      ...(event.filters ?? {}),
      ...(table?.filters ?? {}),
    };
    const globalFilter =
      (typeof event.globalFilter === 'string' && event.globalFilter.trim()
        ? event.globalFilter
        : undefined) ?? this.getGlobalFilterValue(filters);

    return {
      ...event,
      filters,
      globalFilter,
    };
  }

  private getGlobalFilterValue(
    filters: TableLazyLoadEvent['filters'] | undefined
  ): string | undefined {
    if (!filters) {
      return undefined;
    }

    const { global } = filters;
    const value = Array.isArray(global) ? global[0]?.value : global?.value;
    return typeof value === 'string' && value.trim() ? value : undefined;
  }

  private lazyLoadEventHasFilters(event: TableLazyLoadEvent): boolean {
    if (typeof event.globalFilter === 'string' && event.globalFilter.trim()) {
      return true;
    }

    const { filters } = event;
    if (!filters) {
      return false;
    }

    return Object.values(filters).some(meta => {
      if (!meta) {
        return false;
      }

      const value = Array.isArray(meta) ? meta[0]?.value : meta.value;
      if (value === null || value === undefined || value === '') {
        return false;
      }

      return Array.isArray(value) ? value.length > 0 : true;
    });
  }

  private applyPaginationFromUrl(config: IDataTableConfig): void {
    if (this.paginationRestoredFromUrl) {
      return;
    }

    this.paginationRestoredFromUrl = true;

    if (!config.showPaginator) {
      this.paginationFirst.set(0);
      this.paginationRows.set(config.displayRows);
      return;
    }

    const { first, rows } = resolveTablePaginationFromQuery(
      this.router.parseUrl(this.router.url).queryParamMap,
      config.displayRows,
      config.rowsPerPageOptions
    );
    this.paginationRows.set(rows);
    this.paginationFirst.set(first);
  }

  private syncPaginationToUrl(first: number, rows: number): void {
    if (!this.tableConfig().showPaginator) {
      return;
    }

    const queryParams = serializeTablePaginationQueryParams(
      first,
      rows,
      this.tableConfig().displayRows
    );
    const current = this.router.parseUrl(this.router.url).queryParamMap;

    if (areSearchFilterQueryParamsUnchanged(current, queryParams)) {
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

  private emitInitialLazyLoadIfNeeded(): void {
    if (
      !this.viewReady ||
      !this.tableConfig().enableServerSide ||
      this.initialLazyLoadEmitted ||
      this.searchFilterUrlRestore.hasPendingRestore()
    ) {
      return;
    }

    const table = this.dt();
    this.applyPaginationFromUrl(this.tableConfig());
    this.onLazyLoad({
      first: this.paginationFirst(),
      rows: this.paginationRows() || this.tableConfig().displayRows,
      sortField: table?.sortField,
      sortOrder: table?.sortOrder,
      filters: table?.filters,
      globalFilter: this.getGlobalFilterValue(table?.filters),
    });
  }

  /**
   * Handle pagination change from card view paginator
   * Converts paginator event to TableLazyLoadEvent format and syncs with table
   */
  protected onCardPaginatorChange(event: PaginatorState): void {
    // Update pagination state - handle undefined values
    const first = event.first ?? 0;
    const rows = event.rows ?? this.tableConfig().displayRows;

    // Update pagination signals
    this.paginationFirst.set(first);
    this.paginationRows.set(rows);

    // Get current table state to preserve filters and sorting
    const table = this.dt();
    if (table) {
      // Create TableLazyLoadEvent compatible object
      const lazyLoadEvent: TableLazyLoadEvent = {
        first,
        rows,
        sortField: table.sortField,
        sortOrder: table.sortOrder,
        filters: table.filters,
      };

      // Trigger lazy load to fetch new data and sync table
      this.onLazyLoad(lazyLoadEvent);
    }
  }

  private extractOriginalData(
    rowData: Record<string, unknown>
  ): Record<string, unknown> {
    if (rowData && 'originalRawData' in rowData && rowData['originalRawData']) {
      return rowData['originalRawData'] as Record<string, unknown>;
    }
    return rowData;
  }

  protected isRowSelectionDisabled(rowData: Record<string, unknown>): boolean {
    const disableWhen = this.tableConfig().disableRowSelectionWhen;
    if (!disableWhen) {
      return false;
    }

    return disableWhen(this.extractOriginalData(rowData));
  }

  protected isActionDisabled(
    action: ITableActionConfig,
    rowData?: Record<string, unknown>
  ): boolean {
    if (!action.disableWhen) {
      return false;
    }

    // Row action: check single row
    if (rowData) {
      return action.disableWhen(this.extractOriginalData(rowData));
    }

    // Bulk action: disable if ANY selected row is blocked ('all': only if every one is).
    const isBlocked = (row: Record<string, unknown>): boolean =>
      action.disableWhen?.(row) ?? false;
    return action.bulkDisableMode === 'all'
      ? this.bulkRows().length > 0 && this.bulkRows().every(isBlocked)
      : this.bulkRows().some(isBlocked);
  }

  /** Adds `disabledTooltip` for row/bulk buttons when `disableReason` applies. */
  protected resolveActionButtonConfig(
    action: ITableActionConfig,
    rowData?: Record<string, unknown>
  ): Partial<IButtonConfig> {
    return {
      ...action,
      disabledTooltip: this.resolveDisableReasonTooltip(action, rowData),
    };
  }

  private resolveDisableReasonTooltip(
    action: ITableActionConfig,
    rowData?: Record<string, unknown>
  ): string | undefined {
    if (
      (!action.disableReason && !(action.bulkDisableReason && !rowData)) ||
      !this.isActionDisabled(action, rowData)
    ) {
      return undefined;
    }
    if (rowData) {
      return action.disableReason?.(this.extractOriginalData(rowData));
    }
    if (action.bulkDisableReason) {
      return action.bulkDisableReason(this.bulkRows());
    }
    const blocking = this.bulkRows().find(r => action.disableWhen?.(r));
    return blocking ? action.disableReason?.(blocking) : undefined;
  }

  /**
   * Checks if action should be VISIBLE for given row.
   */
  protected isActionVisible(
    action: ITableActionConfig,
    rowData?: Record<string, unknown>
  ): boolean {
    // Step 1: Check permission-based visibility
    if (!this.hasRequiredPermissions(action)) {
      return false;
    }

    // Step 2: Check hideWhen condition
    if (action.hideWhen) {
      const originalRowData = rowData
        ? this.extractOriginalData(rowData)
        : this.bulkRows()[0];

      if (originalRowData && action.hideWhen(originalRowData)) {
        return false;
      }
    }

    return true;
  }

  private hasRequiredPermissions(action: ITableActionConfig): boolean {
    if (!action.permission) {
      return true;
    }
    return this.permissionService.hasAnyPermission(action.permission);
  }

  /**
   * Returns filtered row actions that should be visible for a specific row.
   * Use this in template to get only visible actions per row.
   *
   * @param rowData - The row data to filter actions for
   * @returns Array of visible actions for this row
   */
  protected getVisibleRowActions(
    rowData: Record<string, unknown>
  ): ITableActionConfig[] {
    return this.rowActions().filter(action =>
      this.isActionVisible(action, rowData)
    );
  }

  protected getRowActionsLimit(): number {
    return this.tableConfig().rowActionsLimit ?? 3;
  }

  protected shouldShowRowActionsInMenuOnly(
    rowData: Record<string, unknown>
  ): boolean {
    return (
      this.getVisibleRowActions(rowData).length > this.getRowActionsLimit()
    );
  }

  protected overflowMenuModel = signal<MenuItem[]>([]);
  private rowOverflowMenu = viewChild<Menu>('rowOverflowMenu');

  private resolveRowActionMenuLabel(action: ITableActionConfig): string {
    const fromLabel = action.label?.trim();
    if (fromLabel) {
      return fromLabel;
    }
    const fromTooltip = action.tooltip?.trim();
    if (fromTooltip) {
      return fromTooltip;
    }
    return String(action.id);
  }

  private resolveRowActionMenuIcon(
    action: ITableActionConfig
  ): string | undefined {
    if (action.icon) {
      return action.icon;
    }
    return StatusUtil.getIcon(action.id) ?? undefined;
  }

  /**
   * Opens the overflow menu; `anchor` is used as `event.currentTarget` for PrimeNG popup
   * positioning (shared {@link ButtonComponent} does not emit the native event).
   */
  protected openRowOverflowMenuForRow(
    rowData: Record<string, unknown>,
    anchor: HTMLElement
  ): void {
    const visible = this.getVisibleRowActions(rowData);
    this.overflowMenuModel.set(
      visible.map(action => {
        const tip =
          this.resolveDisableReasonTooltip(action, rowData) ??
          action.tooltip?.trim();
        return {
          label: this.resolveRowActionMenuLabel(action),
          icon: this.resolveRowActionMenuIcon(action),
          disabled: this.isActionDisabled(action, rowData),
          ...(tip ? { tooltipOptions: { tooltipLabel: tip } } : {}),
          // Shown under a disabled item: phones have no hover for the tooltip.
          state: {
            disabledReason: this.isActionDisabled(action, rowData)
              ? this.resolveDisableReasonTooltip(action, rowData)
              : undefined,
          },
          command: (): void => {
            this.onRowActionClick(action.id, rowData);
          },
        };
      })
    );
    const pseudoEvent = { currentTarget: anchor } as unknown as Event;
    queueMicrotask(() => this.rowOverflowMenu()?.toggle(pseudoEvent));
  }

  /**
   * Returns filtered bulk actions that should be visible.
   * Checks permission-based visibility only (not row-specific).
   *
   * @returns Array of visible bulk actions
   */
  protected getVisibleBulkActions(): ITableActionConfig[] {
    return this.bulkActionButtons().filter(action =>
      this.isActionVisible(action)
    );
  }

  protected onBulkActionClick(actionType: EButtonActionType): void {
    registerActiveBulkTable(this);
    this.bulkActionClick.emit({
      actionType,
      selectedRows: this.bulkRows(),
    });
  }

  protected onRowActionClick(
    actionType: EButtonActionType,
    rowData: Record<string, unknown>
  ): void {
    this.rowActionClick.emit({
      actionType,
      selectedRows: [this.extractOriginalData(rowData)],
    });
  }

  protected getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }

  protected getBackgroundColorForSeed(seed: unknown): string {
    return this.avatarService.getConsistentColor(
      seed !== null && seed !== undefined ? String(seed) : ''
    );
  }

  protected getClearSelectionButtonConfig(): Partial<IButtonConfig> {
    return {
      id: EButtonActionType.CLEAR_SELECTION,
      label: 'Clear',
      icon: this.icons.ACTIONS.TIMES,
      variant: EButtonVariant.TEXT,
      severity: EButtonSeverity.SECONDARY,
      tooltip: 'Clear selection',
    };
  }

  protected openAttachmentsGallery(
    attchmentsKeys: string[],
    rowData?: Record<string, unknown>,
    column?: IDataTableHeaderConfig
  ): void {
    if (attchmentsKeys.length === 0) {
      return;
    }

    const enableGallery = column?.enableAttachmentGallery ?? true;

    if (enableGallery) {
      const media: IGalleryInputData[] = attchmentsKeys.map((key: string) => ({
        mediaKey: key,
        actualMediaUrl: '',
      }));

      this.galleryService.show(media);
    } else {
      this.attachmentClick.emit(rowData ?? {});
    }
  }
}

/** A filter counts as applied when it holds something other than null, '' or []. */
function hasFilterValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return !Array.isArray(value) || value.length > 0;
}
