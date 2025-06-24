import { Component, inject, OnInit, signal } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TableService } from '../../../../../../shared/services/table.service';
import { IEnhancedTable } from '../../../../../../shared/models';
import { SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG  } from '../../config/table/system-permission-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../../../../shared/types';
import { SystemPermissionService } from '../../services/system-permission.service';
import { IGetSystemPermissionListResponseDto } from '../../models/system-permission.api.model';
import { catchError, of } from 'rxjs';
import { LoggerService } from '../../../../../../core/services/logger.service';

@Component({
  selector: 'app-system-permission-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './system-permission-list.component.html',
  styleUrl: './system-permission-list.component.scss'
})
export class SystemPermissionListComponent implements OnInit {

  protected table!: IEnhancedTable;

  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly tableService = inject(TableService);
  private readonly logger = inject(LoggerService);

  ngOnInit(): void {
    this.table = this.tableService.createTable(SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG );
    this.getTableData();
  }

  private getTableData(): void {
    this.table.setLoading(true);
    
    this.systemPermissionService.getSystemPermissionList()
      .pipe(
        catchError((error) => {
          this.logger.error('Error fetching system permissions:', error);
          return of({ records: [], totalRecords: 0 } as IGetSystemPermissionListResponseDto);
        })
      )
      .subscribe({
        next: (response: IGetSystemPermissionListResponseDto) => {
          this.logger.info('System permissions fetched successfully', response);
          const mappedData = this.mapTableData(response);          
          this.table.setData(mappedData);
          this.table.setLoading(false);
        },
        error: (error) => {
          this.logger.error('Unexpected error:', error);
          this.table.setData([]);
          this.table.setLoading(false);
        }
      });
  }

  private mapTableData(response: IGetSystemPermissionListResponseDto) {
    return response.records.map(record => ({
      id: record.id,
      name: record.name,
      module: record.module,
      label: record.label,
      description: record.description,
      status: record.deletedAt ? 'Inactive' : 'Active'
    }));
  }

  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.APPROVE:
        console.log('Activate permissions');
        break;
      case EBulkActionType.REJECT:
        console.log('Deactivate permissions');
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.APPROVE:
        console.log('Activate permission');
        break;
      case ERowActionType.EDIT:
        console.log('Edit permission');
        break;
      case ERowActionType.REJECT:
        console.log('Deactivate permission');
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }
}
