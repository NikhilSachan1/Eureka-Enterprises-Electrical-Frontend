import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
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
} from '../../models';
import { ESeverity, PrimeNGSeverity } from '../../types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SliderModule,
    FormsModule,
    ToolbarModule,
    TooltipModule,
    MenuModule,
    OverlayPanelModule,
  ],

  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  @ViewChild('dt') dt!: Table;

  @Input({ required: true }) loading!: boolean;
  @Input({ required: true }) tableConfig!: IDataTableConfig;
  @Input({ required: true }) tableHeader!: IDataTableHeaderConfig[];
  @Input({ required: true }) tableData!: Record<string, unknown>[];
  @Input({ required: true }) bulkActionButtons!: IBulkActionConfig[];
  @Input() rowActions: IRowActionConfig[] = [];

  @Output() bulkActionClick = new EventEmitter<string>();
  @Output() rowActionClick = new EventEmitter<string>();
  protected selectedTableRows = signal<Record<string, unknown>[]>([]);

  protected clear(table: Table): void {
    table.clear();
  }

  protected clearSelection(): void {
    this.selectedTableRows.set([]);
  }

  protected onGlobalFilter(event: Event, table: Table): void {
    const target = event.target as HTMLInputElement;
    table.filterGlobal(target.value, 'contains');
  }

  protected getSeverity(
    status: string | ESeverity | undefined,
  ): PrimeNGSeverity {
    switch (status?.toLowerCase()) {
      case ESeverity.SUCCESS:
      case 'active':
        return 'success';
      case ESeverity.INFO:
        return 'info';
      case ESeverity.WARNING:
      case 'on leave':
        return 'warn';
      case ESeverity.DANGER:
      case 'inactive':
        return 'danger';
      case ESeverity.SECONDARY:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  protected resolveNestedProperty(item: any, path: string): any {
    if (!item || !path) return null;

    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : null;
    }, item);
  }

  protected onFilterChange(event: any): void {
    console.log(event);
  }

  protected isActionDisabled(action: any, rowData: any): boolean {
    if (!action.disabledWhen) return false;
    return action.disabledWhen(rowData);
  }

  protected onBulkActionClick(action: string): void {
    this.bulkActionClick.emit(action);
  }

  protected onRowActionClick(action: string): void {
    this.rowActionClick.emit(action);
  }
}
