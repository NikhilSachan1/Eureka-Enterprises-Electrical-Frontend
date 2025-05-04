import { Component, ViewChild, model, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableColumn } from '../../interfaces/table-column.interface';
import { TableFilter } from '../../interfaces/table-filter.interface';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { DatePipe } from '@angular/common';

interface FilterMetadata {
  field: string;
  value: any;
  matchMode: string;
  display: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    Select,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    DividerModule,
    DatePipe
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @ViewChild('dt1') dt1!: Table;

  // Required inputs
  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();

  // Optional inputs with defaults
  loading = input(false);
  selectable = input(true);
  showActions = input(true);
  showFilters = input(true);
  rows = input(10);
  rowsPerPageOptions = input([10, 25, 50]);
  globalFilterFields = input<string[]>([]);
  selectedStatus = input<any>(null);
  filters = input<TableFilter[]>([]);
  searchPlaceholder = input('Search...');
  emptyMessage = input('No records found');
  emptySubMessage = input('Try adjusting your search or filter to find what you\'re looking for.');
  selectionItemName = input('records');
  rowActions = input<{ id: string, icon: string, class: string }[]>([
    { id: 'edit', icon: 'pi pi-pencil', class: 'p-button-text p-button-sm p-button-secondary' },
    { id: 'delete', icon: 'pi pi-trash', class: 'p-button-text p-button-sm p-button-danger' }
  ]);
  bulkActions = input<{ id: string, label: string, icon: string, class: string }[]>([
    { id: 'setInactive', label: 'Set Inactive', icon: 'pi pi-user-minus', class: 'p-button-secondary p-button-sm' },
    { id: 'delete', label: 'Delete', icon: 'pi pi-trash', class: 'p-button-danger p-button-sm' }
  ]);

  // Two-way binding for selected items
  selectedItems = model<any[]>([]);

  // Sorting properties
  sortField = model<string>('');
  sortOrder = model<number>(1);

  // Outputs
  filterChange = output<{field: string, value: any}>();
  globalFilter = output<string>();
  selectionChange = output<any[]>();
  rowActionClick = output<{actionId: string, item: any}>();
  bulkActionClick = output<{actionId: string, items: any[]}>();

  // Signals for derived state
  private readonly hasActiveFilters = signal(false);

  /**
   * Checks if there's a filter configured for the given field
   */
  hasFilterForField(field: string): boolean {
    return this.filters().some(filter => filter.field === field);
  }

  /**
   * Check if any column filters are active
   */
  hasActiveColumnFilters(): boolean {
    if (!this.dt1 || !this.dt1.filters) return false;
    
    // Get all filter keys
    const filterKeys = Object.keys(this.dt1.filters);
    if (filterKeys.length === 0) return false;
    
    // Check if any filter actually has values
    return filterKeys.some(key => {
      const filter = this.dt1.filters[key as keyof typeof this.dt1.filters];
      if (!filter) return false;
      
      // Check if any constraint within the filter has a value
      return Object.entries(filter).some(([_, constraintValue]) => {
        const constraint = constraintValue as { value: any };
        return constraint && constraint.value !== null && constraint.value !== undefined && constraint.value !== '';
      });
    });
  }

  /**
   * Get a list of active column filters
   */
  getActiveColumnFilters(): FilterMetadata[] {
    if (!this.dt1 || !this.dt1.filters) return [];
    
    const result: FilterMetadata[] = [];
    
    Object.entries(this.dt1.filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        // Type assertion to handle dynamic filtering object
        const filterObj = filterValue as Record<string, any>;
        
        Object.entries(filterObj).forEach(([matchMode, constraintValue]) => {
          // Type assertion for the constraint object
          const constraint = constraintValue as { value: any };
          
          if (constraint && constraint.value !== null && constraint.value !== undefined) {
            // Find the column for display name
            const column = this.columns().find(col => 
              col.field === key || col.filterField === key
            );
            
            // Format the display value based on the field type
            let displayValue: string;
            if (key === 'employmentStatus') {
              displayValue = constraint.value.label || constraint.value;
            } else {
              displayValue = typeof constraint.value === 'object' 
                ? constraint.value.label || constraint.value.toString()
                : constraint.value.toString();
            }
              
            result.push({
              field: key,
              value: constraint.value,
              matchMode: matchMode,
              display: `${column?.header || key}: ${displayValue}`
            });
          }
        });
      }
    });
    
    return result;
  }

  /**
   * Clear a specific column filter
   */
  clearColumnFilter(field: string, matchMode: string): void {
    if (this.dt1 && this.dt1.filters) {
      const filters = this.dt1.filters as Record<string, Record<string, any>>;
      
      if (filters[field]) {
        if (matchMode) {
          // Clear specific match mode
          if (filters[field][matchMode]) {
            delete filters[field][matchMode];
            
            // If no match modes left, delete the whole field
            if (Object.keys(filters[field]).length === 0) {
              delete filters[field];
            }
          }
        } else {
          // Clear all match modes for this field
          delete filters[field];
        }
        
        // Update any dynamic filters if they match this field
        const dynamicFilter = this.filters().find(f => f.field === field);
        if (dynamicFilter) {
          dynamicFilter.selected = null;
        }
        
        // Apply the filter change
        this.dt1.filter('', field, 'contains');
      }
    }
  }

  /**
   * Clear all column filters
   */
  clearAllFilters(): void {
    if (this.dt1) {
      this.dt1.reset();
      
      // Reset dynamic filters
      this.filters().forEach(filter => {
        filter.selected = null;
      });
    }
  }

  /**
   * Resolves a nested property from an object using dot notation
   * Example: resolveNestedProperty(user, 'department.name')
   */
  resolveNestedProperty(item: any, path: string): any {
    if (!item || !path) return null;
    
    const properties = path.split('.');
    return properties.reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : null;
    }, item);
  }

  getSeverity(status: string): 'success' | 'warn' | 'info' | 'danger' {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warn';
      case 'on leave':
        return 'info';
      case 'terminated':
        return 'danger';
      default:
        return 'info';
    }
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
    this.globalFilter.emit(value);
  }

  onFilterChange(field: string, event: any) {
    if (this.dt1) {
      if (event.value) {
        const filter = this.filters().find(f => f.field === field);
        const matchMode = filter?.matchMode || 'equals';
        
        // Handle employment status filtering
        if (field === 'employmentStatus') {
          this.dt1.filter(event.value.value, field, 'equals');
        } else {
          this.dt1.filter(event.value.value, field, matchMode);
        }
      } else {
        this.dt1.filter(null, field, 'equals');
      }
    }
    this.filterChange.emit({ field, value: event });
  }

  clearSelection() {
    this.selectedItems.set([]);
    this.selectionChange.emit([]);
  }

  onRowAction(actionId: string, item: any) {
    this.rowActionClick.emit({ actionId, item });
  }

  onBulkAction(actionId: string) {
    this.bulkActionClick.emit({ actionId, items: this.selectedItems() });
  }

  onSort(event: { field: string, order: number }) {
    this.sortField.set(event.field);
    this.sortOrder.set(event.order);
  }
} 