import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
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
  ],

  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  @ViewChild('dt') dt!: Table;

  @Input() loading: boolean = true;
  @Input() tableConfig: any = {};
  @Input() tableHeader: any[] = [];
  @Input() tableData!: any[];
  @Input() bulkActionButtons: any[] = [];
  
  selectedTableRows!: any;
  
  ngOnInit() {
    this.bulkActionButtons = this.getBulkActionButtons();
  }

  clear(table: Table) {
    table.clear();
  }

  clearSelection() {
    this.selectedTableRows = [];
  }

  onGlobalFilter(event: Event, table: Table) {
    const target = event.target as HTMLInputElement;
    table.filterGlobal(target.value, 'contains');
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'inactive':
        return 'danger';

      case 'active':
        return 'success';

      case 'new':
        return 'info';

      case 'on leave':
        return 'warn';

      default:
        return 'secondary';
    }
  }

  resolveNestedProperty(item: any, path: string): any {
    if (!item || !path) return null;
    
    const properties = path.split('.');
    return properties.reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : null;
    }, item);
  }

  getBulkActionButtons() {
    const bulkActionButtons = [
      {
        label: 'Set In-active',
        icon: 'pi pi-download',
        styleClass: 'p-button-sm',
        outlined: true,
        click: () => {
          console.log('Export');
        },
        severity: 'primary',
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'p-button-sm',
        outlined: true,
        click: () => {
          console.log('Delete');
        },
        severity: 'danger',
      },
    ];

    return bulkActionButtons;
  }

  onFilterChange(event: any) {
    console.log(event);
  }
}
