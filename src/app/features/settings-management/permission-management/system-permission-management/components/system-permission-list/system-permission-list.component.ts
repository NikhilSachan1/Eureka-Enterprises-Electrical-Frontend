import { Component, inject, OnInit, signal } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DataTableConfigService } from '../../../../../../shared/services/data-table-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../../../../shared/models';
import { SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG, SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG, SYSTEM_PERMISSION_LIST_TABLE_CONFIG, SYSTEM_PERMISSION_LIST_TABLE_HEADER } from '../../config/table/system-permission-list-table.config';
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

  protected tableConfig = signal<IDataTableConfig>({} as IDataTableConfig);
  protected tableHeader = signal<IDataTableHeaderConfig[]>([]);
  protected tableData = signal<any[]>([]);
  protected loading = signal<boolean>(true);
  protected bulkActionButtons = signal<IBulkActionConfig[]>([]);
  protected rowActions = signal<IRowActionConfig[]>([]);

  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly logger = inject(LoggerService);

  ngOnInit(): void {
    this.initializeTableConfig();
    this.getTableData();
  }

  private initializeTableConfig(): void {
    this.tableConfig.set(this.getTableConfig());
    this.tableHeader.set(this.getTableHeader());
    this.bulkActionButtons.set(this.getBulkActionButtons());
    this.rowActions.set(this.getRowActions());
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(SYSTEM_PERMISSION_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(SYSTEM_PERMISSION_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG);
  }

  private getTableData(): void {
    this.loading.set(true);
    
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
          this.tableData.set(mappedData);
          this.loading.set(false);
        },
        error: (error) => {
          this.logger.error('Unexpected error:', error);
          this.tableData.set([]);
          this.loading.set(false);
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
