import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  model,
  inject,
  viewChild,
  TemplateRef,
  computed,
  effect,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import {
  Table,
  TableFilterEvent,
  TableLazyLoadEvent,
  TableModule,
} from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
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
import { AvatarService, GalleryService } from '@shared/services';
import { ICONS } from '@shared/constants';
import { ButtonComponent } from '../button/button.component';
import { StatusTagComponent } from '../status-tag/status-tag.component';
import { EmptyMessagesComponent } from '../empty-messages/empty-messages.component';
import { APP_CONFIG } from '@core/config';
import { AppPermissionService, LoggerService } from '@core/services';
import { ChipComponent } from '../chip/chip.component';
import { ReadMoreComponent } from '../read-more/read-more.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import {
  DEFAULT_FROZEN_ACTIONS_COLUMN_CONFIG,
  DEFAULT_FROZEN_SELECTION_COLUMN_CONFIG,
  DEFAULT_READ_MORE_CONFIG,
} from '@shared/config';
import {
  StatusUtil,
  isDataTableColumnFrozen,
  isDataTableScrollable,
  resolveFrozenAlign,
  resolveColumnWidth,
} from '@shared/utility';

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
    ToolbarModule,
    TooltipModule,
    MenuModule,
    NgClass,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    EmptyMessagesComponent,
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

  bulkActionClick = output<ITableActionClickEvent>();
  rowActionClick = output<ITableActionClickEvent>();
  filterData = output<TableLazyLoadEvent>();
  attachmentClick = output<Record<string, unknown>>();
  selectionChange = output<Record<string, unknown>[]>();

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
    if (this.showBulkSelectionCheckbox()) {
      span += 1;
    }
    if (this.showRowActionsColumn()) {
      span += 1;
    }
    return span;
  });

  // View mode: 'list' or 'card' - using model signal for two-way binding with SelectButton
  protected viewMode = model<'list' | 'card'>('list');

  // Track pagination state for card view
  protected paginationFirst = signal<number>(0);
  protected paginationRows = signal<number>(0);

  // SelectButton options for view mode toggle
  protected readonly viewModeOptions = [
    { label: 'List', value: 'list', icon: ICONS.COMMON.LIST },
    { label: 'Card', value: 'card', icon: ICONS.COMMON.TH_LARGE },
  ];

  constructor() {
    // Load view mode from localStorage on init
    const savedViewMode = localStorage.getItem('table-view-mode') as
      | 'list'
      | 'card'
      | null;
    if (savedViewMode === 'list' || savedViewMode === 'card') {
      this.viewMode.set(savedViewMode);
    }

    // Save view mode to localStorage when it changes
    effect(() => {
      const mode = this.viewMode();
      localStorage.setItem('table-view-mode', mode);
    });

    // Initialize pagination rows from config when available
    effect(() => {
      const config = this.tableConfig();
      if (config && this.paginationRows() === 0) {
        this.paginationRows.set(config.displayRows);
      }
    });

    effect(() => {
      if (!this.showBulkSelectionCheckbox()) {
        this.selectedTableRows.set([]);
      }
    });

    effect(() => {
      if (!this.showBulkSelectionCheckbox()) {
        return;
      }

      const rows = this.tableData();
      const idPath = this.tableConfig().tableUniqueId;
      const rowById = new Map<string, Record<string, unknown>>();

      for (const row of rows) {
        const id = this.normalizeRowIdForSelection(row, idPath);
        if (id !== null) {
          rowById.set(id, row);
        }
      }

      const selected = this.selectedTableRows();
      const synced = selected.flatMap(row => {
        const id = this.normalizeRowIdForSelection(row, idPath);
        if (id === null) {
          return [];
        }
        return [rowById.get(id) ?? row];
      });

      if (
        synced.length !== selected.length ||
        synced.some((row, index) => row !== selected[index])
      ) {
        this.selectedTableRows.set(synced);
      }
    });

    effect(() => {
      if (!this.showBulkSelectionCheckbox()) {
        return;
      }

      const idPath = this.tableConfig().tableUniqueId;
      const selectedRows = this.selectedTableRows()
        .filter(row => !this.isRowSelectionDisabled(row))
        .map(row => this.extractOriginalData(row));
      const selectionKey = selectedRows
        .map(row => String(row['userId'] ?? row[idPath] ?? ''))
        .join('|');

      if (selectionKey === this.lastEmittedSelectionKey) {
        return;
      }

      this.lastEmittedSelectionKey = selectionKey;
      this.selectionChange.emit(selectedRows);
    });
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
  }

  getSelectedRows(): Record<string, unknown>[] {
    return this.selectedTableRows().map(row => this.extractOriginalData(row));
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
    this.logger.logUserAction('Lazy load', event);
    // Sync pagination state - update paginationFirst and rows to keep both views in sync
    const newFirst = event.first ?? 0;
    const newRows = event.rows ?? this.tableConfig().displayRows;

    if (this.paginationFirst() !== newFirst) {
      this.paginationFirst.set(newFirst);
    }
    if (this.paginationRows() !== newRows) {
      this.paginationRows.set(newRows);
    }

    this.filterData.emit(event);
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

    // Bulk action: disable if ANY selected row returns true
    const selectedRows = this.selectedTableRows().map(row =>
      this.extractOriginalData(row)
    );
    return selectedRows.some(row => action.disableWhen?.(row) ?? false);
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
    if (!action.disableReason || !this.isActionDisabled(action, rowData)) {
      return undefined;
    }
    if (rowData) {
      return action.disableReason(this.extractOriginalData(rowData));
    }
    const selected = this.selectedTableRows().map(row =>
      this.extractOriginalData(row)
    );
    const blocking = selected.find(r => action.disableWhen?.(r));
    return blocking ? action.disableReason(blocking) : undefined;
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
        : this.selectedTableRows().map(row => this.extractOriginalData(row))[0];

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
      selectedRows: this.selectedTableRows().map(row =>
        this.extractOriginalData(row)
      ),
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
      label: 'Clear Selection',
      icon: this.icons.ACTIONS.TIMES,
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

let activeBulkTable: DataTableComponent | null = null;

function registerActiveBulkTable(table: DataTableComponent): void {
  activeBulkTable = table;
}

/** Called after bulk confirmation onSuccess — clears the table that opened the dialog. */
export function clearActiveBulkTableSelection(): void {
  activeBulkTable?.clearSelection();
  activeBulkTable = null;
}
