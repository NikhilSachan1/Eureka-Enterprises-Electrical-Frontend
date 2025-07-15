import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  TableService,
  RouterNavigationService,
  LoadingService,
  ConfirmationDialogService,
  NotificationService,
} from '@shared/services/';
import { LoggerService } from '@core/services/logger.service';
import { SystemPermissionService } from '@features/settings-management/permission-management/system-permission-management/services/system-permission.service';
import {
  IBulkActionClickEvent,
  IEnhancedTable,
  IRowActionClickEvent,
} from '@shared/models';
import { SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG } from '@features/settings-management/permission-management/system-permission-management/config/table/system-permission-list-table.config';
import { createSystemPermissionDeleteDialogConfig, createSystemPermissionBulkDeleteDialogConfig } from '@features/settings-management/permission-management/system-permission-management/config/dialog/system-permission-dialog.config';
import {
  IDeleteSystemPermissionRequestDto,
  IDeleteSystemPermissionResponseDto,
  IGetSingleSystemPermissionListResponseDto,
  IGetSystemPermissionListResponseDto,
} from '@features/settings-management/permission-management/system-permission-management/models/system-permission.api.model';
import { ERowActionType, EBulkActionType, EDialogType } from '@shared/types';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

@Component({
  selector: 'app-system-permission-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './system-permission-list.component.html',
  styleUrl: './system-permission-list.component.scss',
})

export class SystemPermissionListComponent implements OnInit, OnDestroy {

  protected table!: IEnhancedTable;

  private readonly destroy$ = new Subject<void>();

  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly dataTableService = inject(TableService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG,
    );
    this.loadSystemPermissionList();
  }

  private loadSystemPermissionList(): void {

    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Permissions',
      message: 'Fetching system permissions...',
    });

    this.systemPermissionService
      .getSystemPermissionList()
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: IGetSystemPermissionListResponseDto) => {
          const mappedData = this.mapTableData(response);
          this.table.setData(mappedData);
          this.logger.logUserAction('System permissions loaded successfully');
        },
        error: (error) => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load system permissions', error);
        },
      });
  }

  private mapTableData(response: IGetSystemPermissionListResponseDto) {
    return response.records.map((record: IGetSingleSystemPermissionListResponseDto) => ({
      id: record.id,
      name: record.name,
      module: record.module,
      label: record.label,
      description: record.description,
      isEditable: record.isEditable,
      isDeletable: record.isDeletable,
    }));
  }

  protected handleBulkActionClick(event: IBulkActionClickEvent): void {
    this.logger.logUserAction('Bulk action clicked', event);

    const { actionType, selectedRows } = event;

    switch (actionType) {
      case EBulkActionType.DELETE:
        this.showBulkDeleteConfirmationDialog(selectedRows as IGetSingleSystemPermissionListResponseDto[]);
        break;
      default:
        this.logger.warn('Unknown bulk action:', actionType);
    }
  }

  protected handleRowActionClick(event: IRowActionClickEvent): void {
    this.logger.logUserAction('Row action clicked', event);

    const { actionType, rowData } = event;

    switch (actionType) {
      case ERowActionType.EDIT:
        this.navigateToEditSystemPermission(
          rowData as IGetSingleSystemPermissionListResponseDto,
        );
        break;
      case ERowActionType.DELETE:
        this.showSingleDeleteConfirmationDialog(rowData as IGetSingleSystemPermissionListResponseDto);
        break;
      default:
        this.logger.warn('Unknown row action:', actionType);
    }
  }

  private navigateToEditSystemPermission(
    rowData: IGetSingleSystemPermissionListResponseDto,
  ) {
    this.logger.logUserAction('Navigating to edit permission', rowData);

    try {

      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
        ROUTES.SETTINGS.PERMISSION.SYSTEM.EDIT,
        rowData.id,
      ];

      const success = this.routerNavigationService.navigateWithState(
        routeSegments,
        {
          permissionData: rowData,
        },
      );

      if (!success) {
        this.logger.logUserAction('Navigation failed for edit button', {
          permissionId: rowData.id,
        });
      }
    } catch (error) {
      this.logger.logUserAction('Navigation error', error);
    }
  }

  private showSingleDeleteConfirmationDialog(rowData: IGetSingleSystemPermissionListResponseDto): void {
    this.logger.logUserAction('Single system permission delete action triggered', rowData);
    
    const formattedPermissionData = this.formatSingleDeletePermissionData(rowData);
    const formData = this.prepareDeletePermissionFormData(formattedPermissionData);
    const dialogConfig = createSystemPermissionDeleteDialogConfig(
      rowData,
      () => this.executeDeletePermission(formData),
    );
    
    const confirmationDialog = this.confirmationDialogService.createConfirmationDialog(EDialogType.DELETE, dialogConfig);
    confirmationDialog.show();
  }

  private showBulkDeleteConfirmationDialog(selectedRows: IGetSingleSystemPermissionListResponseDto[]): void {
    this.logger.logUserAction('Bulk system permission delete action triggered', selectedRows);

    const formattedPermissionData = this.formatBulkDeletePermissionData(selectedRows);
    const formData = this.prepareDeletePermissionFormData(formattedPermissionData);
    const dialogConfig = createSystemPermissionBulkDeleteDialogConfig(
      selectedRows,
      () => this.executeDeletePermission(formData),
    );
    
    const confirmationDialog = this.confirmationDialogService.createConfirmationDialog(EDialogType.DELETE, dialogConfig);
    confirmationDialog.show();
  }

  private executeDeletePermission(formData: IDeleteSystemPermissionRequestDto): void {
    this.logger.logUserAction('Executing delete permission', formData);
    this.loadingService.show({
      title: 'Deleting Permissions',
      message: 'Deleting system permission(s)...',
    });
    this.systemPermissionService
      .deleteSystemPermission(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.table.setData([]);
          this.loadSystemPermissionList();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: IDeleteSystemPermissionResponseDto) => {
          this.logger.logUserAction('Delete permission response', response);
          this.notificationService.success('Permission(s) deleted successfully', 'Success');
        },
        error: (error) => {
          this.logger.logUserAction('Delete permission error', error);
          this.notificationService.error('Failed to delete permission(s)', 'Error');
        }
      });
  }

  private formatSingleDeletePermissionData(rowData: IGetSingleSystemPermissionListResponseDto): string[] {
    return [rowData.id];
  }

  private formatBulkDeletePermissionData(selectedRows: IGetSingleSystemPermissionListResponseDto[]): string[] {
    return selectedRows.map(row => row.id);
  }

  private prepareDeletePermissionFormData(permissionIds: string[]): IDeleteSystemPermissionRequestDto {
    return {
      ids: permissionIds,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}