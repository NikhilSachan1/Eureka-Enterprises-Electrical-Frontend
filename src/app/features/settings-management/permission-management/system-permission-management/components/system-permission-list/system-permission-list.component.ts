import { Component, inject, OnInit, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TableService } from '../../../../../../shared/services/table.service';
import { ConfirmationDialogService } from '../../../../../../shared/services/confirmation-dialog-config.service';
import { IEnhancedTable } from '../../../../../../shared/models';
import { SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG  } from '../../config/table/system-permission-list-table.config';
import { EBulkActionType, ERowActionType, EDialogType, EFieldType, EFloatLabelVariant, EFieldSize } from '../../../../../../shared/types';
import { SystemPermissionService } from '../../services/system-permission.service';
import { IGetSystemPermissionListResponseDto } from '../../models/system-permission.api.model';
import { catchError, of } from 'rxjs';
import { LoggerService } from '../../../../../../core/services/logger.service';
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
        this.showActivateDialog();
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

  protected showSimpleConfirmationDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.DEFAULT,
      {
        dialogConfig: {
          header: 'Simple Confirmation',
          message: 'This is a simple confirmation dialog without any form fields.',
          icon: ICONS.COMMON.INFO_CIRCLE
        },
        onAccept: () => {
          this.logger.info('Simple confirmation accepted');
        },
        onReject: () => {
          this.logger.info('Simple confirmation rejected');
        }
      }
    );
    dialog.show();
  }

  protected showDeleteConfirmationDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.DELETE,
      {
        dialogConfig: {
          recordDetails: {
            title: 'Item Details',
            details: [
              { label: 'Name', value: 'Sample Permission' },
              { label: 'Module', value: 'User Management' },
              { label: 'Created', value: new Date().toLocaleDateString() },
              { label: 'Status', value: 'Active' }
            ]
          }
        },
        onAccept: () => {
          this.logger.info('Delete confirmation accepted');
        },
        onReject: () => {
          this.logger.info('Delete confirmation rejected');
        }
      }
    );
    dialog.show();
  }

  protected showAdvancedFormDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.DEFAULT,
      {
        dialogConfig: {
          header: 'Advanced Form Dialog',
          message: 'This dialog demonstrates various input field types.',
          icon: ICONS.SETTINGS.COG,
          inputFieldConfigs: [
            {
              fieldType: EFieldType.Text,
              fieldName: 'username',
              id: 'username',
              label: 'Username',
              haveFullWidth: true,
              fieldSize: EFieldSize.Large,
              floatLabelVariant: EFloatLabelVariant.Over,
              validators: [Validators.required, Validators.minLength(3)],
            },
            {
              fieldType: EFieldType.Select,
              fieldName: 'role',
              id: 'role',
              label: 'User Role',
              haveFullWidth: true,
              fieldSize: EFieldSize.Large,
              floatLabelVariant: EFloatLabelVariant.Over,
              selectConfig: {
                optionsDropdown: [
                  { label: 'Administrator', value: 'admin' },
                  { label: 'Manager', value: 'manager' },
                  { label: 'User', value: 'user' },
                ],
                showClearButton: true,
                haveFilter: true,
              },
              validators: [Validators.required],
            },
            {
              fieldType: EFieldType.Number,
              fieldName: 'priority',
              id: 'priority',
              label: 'Priority Level',
              haveFullWidth: true,
              fieldSize: EFieldSize.Large,
              floatLabelVariant: EFloatLabelVariant.Over,
              numberConfig: {
                minimumBoundaryValue: 1,
                maximumBoundaryValue: 10,
                showUpAndDownButtons: true,
              },
              validators: [Validators.required, Validators.min(1), Validators.max(10)],
            },
            {
              fieldType: EFieldType.Date,
              fieldName: 'expiryDate',
              id: 'expiryDate',
              label: 'Expiry Date',
              haveFullWidth: true,
              fieldSize: EFieldSize.Large,
              floatLabelVariant: EFloatLabelVariant.Over,
              dateConfig: {
                showCalendarIcon: true,
                showButtonBar: true,
                minDate: new Date(),
              },
            },
            {
              fieldType: EFieldType.TextArea,
              fieldName: 'notes',
              id: 'notes',
              label: 'Additional Notes',
              haveFullWidth: true,
              fieldSize: EFieldSize.Large,
              floatLabelVariant: EFloatLabelVariant.Over,
              textAreaConfig: {
                rows: 3,
                autoResize: true,
              },
            },
          ]
        },
        onAccept: (formData) => {
          this.logger.info('Advanced form submitted:', formData);
        },
        onReject: (formData) => {
          this.logger.info('Advanced form cancelled:', formData);
        }
      }
    );
    dialog.show();
  }

  protected showAllocationDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.ALLOCATE,
      {
        onAccept: (formData) => {
          this.logger.info('Allocation confirmed:', formData);
        },
        onReject: (formData) => {
          this.logger.info('Allocation cancelled:', formData);
        }
      }
    );
    dialog.show();
  }

  protected showLoadingDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.DEFAULT,
      {
        dialogConfig: {
          header: 'Processing Dialog',
          message: 'This dialog simulates a processing state.',
          icon: ICONS.COMMON.SYNC,
          inputFieldConfigs: [
            {
              fieldType: EFieldType.Text,
              fieldName: 'email',
              id: 'email',
              label: 'Email Address',
              haveFullWidth: true,
              fieldSize: EFieldSize.Large,
              floatLabelVariant: EFloatLabelVariant.Over,
              validators: [Validators.required, Validators.email],
            }
          ]
        },
        onAccept: (formData) => {
          this.logger.info('Email processed:', formData);
        },
        onReject: () => {
          this.logger.info('Email processing cancelled');
        }
      }
    );
    dialog.show();
  }

  // Existing dialog methods (enhanced)
  private showActivateDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.APPROVE,
      {
        dialogConfig: {
          header: 'Activate Permission',
          message: 'Are you sure you want to activate this system permission?',
          icon: ICONS.ACTIONS.CHECK_CIRCLE
        },
        onAccept: (formData) => {
          this.logger.info('Permission activation confirmed', formData);
        },
        onReject: (formData) => {
          this.logger.info('Permission activation cancelled', formData);
        }
      }
    );
    dialog.show();
  }

  private showEditDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.DEFAULT,
      {
        dialogConfig: {
          header: 'Edit Permission',
          message: 'Update the permission details below:',
          icon: ICONS.ACTIONS.EDIT,
          inputFieldConfigs: [
            {
              fieldType: EFieldType.Text,
              fieldName: 'name',
              id: 'name',
              label: 'Permission Name',
              haveFullWidth: true,
              fieldSize: EFieldSize.Large,
              floatLabelVariant: EFloatLabelVariant.Over,
              defaultValue: 'Current Permission Name',
              validators: [Validators.required],
            },
            {
              fieldType: EFieldType.TextArea,
              fieldName: 'description',
              id: 'description',
              label: 'Description',
              haveFullWidth: true,
              fieldSize: EFieldSize.Large,
              floatLabelVariant: EFloatLabelVariant.Over,
              defaultValue: 'Current permission description...',
              textAreaConfig: {
                rows: 3,
                autoResize: true,
              },
            }
          ]
        },
        onAccept: (formData) => {
          this.logger.info('Permission edit confirmed', formData);
        },
        onReject: () => {
          this.logger.info('Permission edit cancelled');
        }
      }
    );
    dialog.show();
  }

  private showDeactivateDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.REJECT,
      {
        dialogConfig: {
          header: 'Deactivate Permission',
          message: 'Are you sure you want to deactivate this permission?',
        },
        onAccept: (formData) => {
          this.logger.info('Permission deactivation confirmed', formData);
        },
        onReject: () => {
          this.logger.info('Permission deactivation cancelled');
        }
      }
    );
    dialog.show();
  }

  private showBulkApproveDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.APPROVE,
      {
        dialogConfig: {
          header: 'Bulk Approve Permissions',
          message: 'Are you sure you want to approve all selected permissions?',
        },
        onAccept: (formData) => {
          this.logger.info('Bulk approval confirmed', formData);
        },
        onReject: () => {
          this.logger.info('Bulk approval cancelled');
        }
      }
    );
    dialog.show();
  }

  private showBulkRejectDialog(): void {
    const dialog = this.confirmationDialogService.createConfirmationDialog(
      EDialogType.REJECT,
      {
        dialogConfig: {
          header: 'Bulk Reject Permissions',
          message: 'Are you sure you want to reject all selected permissions?',
        },
        onAccept: (formData) => {
          this.logger.info('Bulk rejection confirmed', formData);
        },
        onReject: () => {
          this.logger.info('Bulk rejection cancelled');
        }
      }
    );
    dialog.show();
  }
}
