import { Component, inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TableService } from '../../../../../../shared/services/table.service';
import { ConfirmationDialogService } from '../../../../../../shared/services/confirmation-dialog-config.service';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { SystemPermissionService } from '../../services/system-permission.service';

import { IEnhancedTable } from '../../../../../../shared/models';
import { SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG } from '../../config/table/system-permission-list-table.config';
import { IGetSystemPermissionListResponseDto } from '../../models/system-permission.api.model';
import { EBulkActionType, ERowActionType, EDialogType, EFieldType, EFloatLabelVariant, EFieldSize } from '../../../../../../shared/types';
import { ICONS } from '../../../../../../shared/constants';

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
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly logger = inject(LoggerService);

  ngOnInit(): void {
    this.table = this.tableService.createTable(SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG);
    this.loadTableData();
  }

  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.APPROVE:
        break;
      case EBulkActionType.REJECT:
        break;
      default:
        this.logger.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.APPROVE:
        this.showAdvancedFormDialog();
        break;
      case ERowActionType.EDIT:
        break;
      case ERowActionType.REJECT:
        break;
      default:
        this.logger.warn('Unknown row action:', action);
    }
  }

  private loadTableData(): void {
    this.table.setLoading(true);
    
    this.systemPermissionService.getSystemPermissionList()
      .subscribe({
        next: (response: IGetSystemPermissionListResponseDto) => {
          const mappedData = this.mapTableData(response);
          this.table.setData(mappedData);
        },
        error: (error) => {
          this.logger.error('Failed to fetch system permissions:', error);
          this.table.setData([]);
        },
        complete: () => {
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

  private showAdvancedFormDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(EDialogType.DEFAULT, {
      dialogSettingConfig: {
        header: 'Advanced Form Dialog',
        message: 'This dialog demonstrates various input field types.',
        icon: ICONS.SETTINGS.COG
      },
      recordDetails: {
        title: 'Item Details',
        details: [
          { label: 'Name', value: 'Sample Permission' },
          { label: 'Module', value: 'User Management' },
          { label: 'Created', value: new Date().toLocaleDateString() },
          { label: 'Status', value: 'Active' }
        ]
      },
      inputFields: {
        username: {
          fieldType: EFieldType.Text,
          fieldName: 'username',
          id: 'username',
          label: 'Username',
          haveFullWidth: true,
          fieldSize: EFieldSize.Large,
          floatLabelVariant: EFloatLabelVariant.Over,
          validators: [Validators.required, Validators.minLength(3)]
        }
      },
      onAccept: (formData?: Record<string, any>) => {
        this.logger.info('Advanced form submitted:', formData);
      },
      onReject: (formData?: Record<string, any>) => {
        this.logger.info('Advanced form cancelled:', formData);
      }
    });
    dialog.show();
  }
}
