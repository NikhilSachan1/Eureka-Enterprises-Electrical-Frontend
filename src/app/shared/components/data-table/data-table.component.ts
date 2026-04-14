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
import { AppPermissionService, LoggerService } from '@core/services';
import { ChipComponent } from '../chip/chip.component';
import { ReadMoreComponent } from '../read-more/read-more.component';
import { PaginatorComponent } from '../paginator/paginator.component';
import { StatusUtil } from '@shared/utility';

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

  protected selectedTableRows = signal<Record<string, unknown>[]>([]);
  protected visibleTableHeaders = computed(() => {
    return this.permissionService.filterByPermission(this.tableHeader());
  });

  /**
   * Selection UI only when table allows it and there is at least one visible bulk action.
   * If bulk config is empty or all actions are hidden by permissions, no checkboxes.
   */
  protected showBulkSelectionCheckbox = computed(() => {
    if (!this.tableConfig().showCheckbox) {
      return false;
    }
    return this.bulkActionButtons().some(action =>
      this.hasRequiredPermissions(action)
    );
  });

  /** Colspan for empty state row: data columns + optional checkbox + optional actions */
  protected emptyMessageColSpan = computed(() => {
    let span = this.visibleTableHeaders().length;
    if (this.showBulkSelectionCheckbox()) {
      span += 1;
    }
    if ((this.rowActions()?.length ?? 0) > 0) {
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

    /**
     * After bulk delete (or any refresh), selected row objects can still be in the
     * selection signal even though they no longer exist in {@link tableData}. Remove
     * stale selections so the bulk-action bar and header checkbox stay in sync.
     */
    effect(() => {
      if (!this.showBulkSelectionCheckbox()) {
        return;
      }
      const rows = this.tableData();
      const idPath = this.tableConfig().tableUniqueId;
      const idSet = new Set(
        rows.map(row => this.normalizeRowIdForSelection(row, idPath))
      );

      const selected = this.selectedTableRows();
      const pruned = selected.filter(row => {
        const id = this.normalizeRowIdForSelection(row, idPath);
        return id !== null && idSet.has(id);
      });

      if (pruned.length !== selected.length) {
        this.selectedTableRows.set(pruned);
      }
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

  protected clearSelection(): void {
    this.selectedTableRows.set([]);
  }

  /**
   * Check if a row is selected (for card view checkbox)
   */
  protected isRowSelected(rowData: Record<string, unknown>): boolean {
    const rowId = this.resolveNestedProperty<string>(
      rowData,
      this.tableConfig().tableUniqueId
    );
    return this.selectedTableRows().some(
      row =>
        this.resolveNestedProperty<string>(
          row,
          this.tableConfig().tableUniqueId
        ) === rowId
    );
  }

  /**
   * Toggle row selection (for card view checkbox)
   */
  protected toggleRowSelection(
    rowData: Record<string, unknown>,
    event: Event
  ): void {
    const target = event.target as HTMLInputElement;
    const currentSelection = this.selectedTableRows();
    const rowId = this.resolveNestedProperty<string>(
      rowData,
      this.tableConfig().tableUniqueId
    );

    if (target.checked) {
      // Add to selection
      if (
        !currentSelection.some(
          row =>
            this.resolveNestedProperty<string>(
              row,
              this.tableConfig().tableUniqueId
            ) === rowId
        )
      ) {
        this.selectedTableRows.set([...currentSelection, rowData]);
      }
    } else {
      // Remove from selection
      this.selectedTableRows.set(
        currentSelection.filter(
          row =>
            this.resolveNestedProperty<string>(
              row,
              this.tableConfig().tableUniqueId
            ) !== rowId
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
      this.hasRequiredPermissions(action)
    );
  }

  protected onBulkActionClick(actionType: EButtonActionType): void {
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
