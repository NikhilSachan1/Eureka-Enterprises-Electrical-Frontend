import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  inject,
  viewChild,
  TemplateRef,
  computed,
} from '@angular/core';
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
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  ITableActionConfig,
  IButtonConfig,
  ITableActionClickEvent,
  EButtonActionType,
  IGalleryInputData,
  EDataType,
} from '@shared/types';
import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
import { AvatarService, GalleryService } from '@shared/services';
import { ICONS } from '@shared/constants';
import { ButtonComponent } from '../button/button.component';
import { StatusTagComponent } from '../status-tag/status-tag.component';
import { EmptyMessagesComponent } from '../empty-messages/empty-messages.component';
import { AppPermissionService, LoggerService } from '@core/services';
import { ChipComponent } from '../chip/chip.component';
import { ReadMoreComponent } from '../read-more/read-more.component';

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
    StatusTagComponent,
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
    EmptyMessagesComponent,
    ChipComponent,
    NgTemplateOutlet,
    ReadMoreComponent,
    PanelModule,
    DecimalPipe,
  ],

  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  readonly dt = viewChild.required<Table>('dt');

  protected ALL_DATA_TYPES = EDataType;
  protected icons = ICONS;

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

  protected clear(table: Table): void {
    table.clear();
  }

  protected clearSelection(): void {
    this.selectedTableRows.set([]);
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
    this.filterData.emit(event);
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
