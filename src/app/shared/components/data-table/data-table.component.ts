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
} from '../../models';
import { ESeverity, ETableBodyTemplate, EPrimeNGSeverity } from '../../types';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { AvatarService } from '../../services';
import { ButtonComponent } from '../button/button.component';
import { ICONS } from '../../constants';

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
    OverlayPanelModule,
    NgClass,
    DatePipe,
    CurrencyPipe
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

  bulkActionClick = output<string>();
  rowActionClick = output<string>();
  
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

  protected getSeverity(status: string | ESeverity | undefined): EPrimeNGSeverity {
    const severityMap: Record<string, EPrimeNGSeverity> = {
      [ESeverity.SUCCESS]: 'success',
      [ESeverity.INFO]: 'info',
      [ESeverity.WARNING]: 'warn',
      [ESeverity.DANGER]: 'danger',
      [ESeverity.SECONDARY]: 'secondary',
      'active': 'success',
      'allocated': 'success',
      'on leave': 'warn',
      'available': 'warn',
      'inactive': 'danger',
      'pending': 'warn',
      'approved': 'success',
      'rejected': 'danger',
      'present': 'success',
      'absent': 'danger',
      'leave': 'warn',
      'holiday': 'contrast',
      'checked in': 'info',
      'checked out': 'info',
      'not checked in': 'info',
      'not checked out': 'info',
    };

    return severityMap[status?.toLowerCase() ?? ''] ?? 'secondary';
  }

  protected resolveNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  protected onFilterChange(event: any): void {
    // Handle filter changes if needed
  }

  protected isActionDisabled(action: IRowActionConfig, rowData: any): boolean {
    // Implement action disabled logic based on your requirements
    return false;
  }

  protected onBulkActionClick(actionType: string): void {
    this.bulkActionClick.emit(actionType);
  }

  protected onRowActionClick(actionType: string): void {
    this.rowActionClick.emit(actionType);
  }

  protected getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }
}
