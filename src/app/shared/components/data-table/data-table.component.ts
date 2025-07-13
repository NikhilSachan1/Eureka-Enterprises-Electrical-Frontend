import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewChild,
  signal,
  inject,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
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
import { OverlayPanelModule } from 'primeng/overlaypanel';
import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IBulkActionConfig,
  IRowActionConfig,
  IButtonConfig,
  IRowActionClickEvent,
  IBulkActionClickEvent,
} from '../../models';
import { ETableBodyTemplate } from '../../types';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { AvatarService } from '../../services';
import { ButtonComponent } from '../button/button.component';
import { StatusTagComponent } from '../status-tag/status-tag.component';
import { ICONS } from '../../constants';
import { EmptyMessagesComponent } from "../empty-messages/empty-messages.component";

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
    OverlayPanelModule,
    NgClass,
    DatePipe,
    CurrencyPipe,
    EmptyMessagesComponent
],

  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  @ViewChild('dt') dt!: Table;

  protected ALL_TABLE_BODY_TEMPLATES = ETableBodyTemplate;
  protected icons = ICONS;
  
  private avatarService = inject(AvatarService);

  // Input signals
  loading = input.required<boolean>();
  tableConfig = input.required<IDataTableConfig>();
  tableHeader = input.required<IDataTableHeaderConfig[]>();
  tableData = input.required<Record<string, unknown>[]>();
  bulkActionButtons = input<IBulkActionConfig[]>([]);
  rowActions = input<IRowActionConfig[]>([]);

  bulkActionClick = output<IBulkActionClickEvent>();
  rowActionClick = output<IRowActionClickEvent>();
  
  protected selectedTableRows = signal<Record<string, unknown>[]>([]);

  protected clear(table: Table): void {
    table.clear();
  }

  protected clearSelection(): void {
    this.selectedTableRows.set([]);
  }

  protected applyFilterGlobal($event: any, stringVal: string): void {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  protected resolveNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  protected onFilterChange(event: any): void {
    // Handle filter changes if needed
  }

  protected isActionDisabled(action: IRowActionConfig, rowData: any): boolean {
    if (action.disabledCondition) {
      return action.disabledCondition(rowData);
    }
    return false;
  }

  protected isBulkActionDisabled(action: IBulkActionConfig): boolean {
    if (action.disabledCondition) {
      return action.disabledCondition(this.selectedTableRows());
    }
    return false;
  }

  protected onBulkActionClick(actionType: string): void {
    this.bulkActionClick.emit({ actionType, selectedRows: this.selectedTableRows() });
  }

  protected onRowActionClick(actionType: string, rowData: any): void {
    this.rowActionClick.emit({ actionType, rowData });
  }

  protected getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }

  protected getClearSelectionButtonConfig(): Partial<IButtonConfig> {
    return {
      label: 'Clear Selection',
      icon: this.icons.ACTIONS.TIMES
    };
  }
}
