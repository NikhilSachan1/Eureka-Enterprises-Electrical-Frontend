import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  inject,
  viewChild,
  TemplateRef,
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
import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  ITableActionConfig,
  IButtonConfig,
  ITableActionClickEvent,
  EButtonActionType,
  ETableBodyTemplate,
} from '@shared/types';
import {
  CurrencyPipe,
  DatePipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
import { AvatarService } from '@shared/services';
import { ICONS } from '@shared/constants';
import { ButtonComponent } from '../button/button.component';
import { StatusTagComponent } from '../status-tag/status-tag.component';
import { EmptyMessagesComponent } from '../empty-messages/empty-messages.component';
import { LoggerService } from '@core/services';

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
    NgTemplateOutlet,
  ],

  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  readonly dt = viewChild.required<Table>('dt');

  protected ALL_TABLE_BODY_TEMPLATES = ETableBodyTemplate;
  protected icons = ICONS;

  private avatarService = inject(AvatarService);
  private logger = inject(LoggerService);

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

  protected selectedTableRows = signal<Record<string, unknown>[]>([]);

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

  protected isActionDisabled(
    action: ITableActionConfig,
    rowData: Record<string, unknown>
  ): boolean {
    if (action.disabledCondition) {
      return action.disabledCondition([rowData]);
    }
    return false;
  }

  protected isBulkActionDisabled(action: ITableActionConfig): boolean {
    if (action.disabledCondition) {
      return action.disabledCondition(this.selectedTableRows());
    }
    return false;
  }

  protected onBulkActionClick(actionType: EButtonActionType): void {
    this.bulkActionClick.emit({
      actionType,
      selectedRows: this.selectedTableRows(),
    });
  }

  protected onRowActionClick(
    actionType: EButtonActionType,
    rowData: Record<string, unknown>
  ): void {
    this.rowActionClick.emit({ actionType, selectedRows: [rowData] });
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
}
