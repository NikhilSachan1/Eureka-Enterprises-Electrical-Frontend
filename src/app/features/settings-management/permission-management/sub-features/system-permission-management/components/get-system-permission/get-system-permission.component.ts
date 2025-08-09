import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import {
  TableService,
  RouterNavigationService,
  LoadingService,
  ConfirmationDialogService,
  NotificationService,
} from '@shared/services/';
import { LoggerService } from '@core/services';
import {
  IEnhancedTable,
  IEnhancedTableConfig,
  ITableActionClickEvent,
} from '@shared/models';
import {
  ISystemPermissionDeleteRequestDto,
  ISystemPermissionDeleteResponseDto,
  ISystemPermissionGetBaseResponseDto,
  ISystemPermissionGetResponseDto,
} from '../../types/system-permission.dto';
import { ETableActionType, EDialogType } from '@shared/types';
import { finalize } from 'rxjs/operators';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  createSystemPermissionDeleteDialogConfig,
  createSystemPermissionBulkDeleteDialogConfig,
  SYSTEM_PERMISSION_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { SystemPermissionService } from '../../services/system-permission.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';

@Component({
  selector: 'app-get-system-permission',
  imports: [DataTableComponent],
  templateUrl: './get-system-permission.component.html',
  styleUrl: './get-system-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetSystemPermissionComponent implements OnInit {
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly dataTableService = inject(TableService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected table!: IEnhancedTable;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      SYSTEM_PERMISSION_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.loadSystemPermissionList();
  }

  private loadSystemPermissionList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading System Permissions',
      message: 'Please wait while we load the system permissions...',
    });

    this.systemPermissionService
      .getSystemPermissionList()
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISystemPermissionGetResponseDto) => {
          const mappedData = this.mapTableData(response);
          this.table.setData(mappedData);
          this.logger.logUserAction('System permissions loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load system permissions', error);
        },
      });
  }

  private executeDeleteSystemPermission(
    formData: ISystemPermissionDeleteRequestDto
  ): void {
    this.logger.logUserAction('Executing delete system permission', formData);
    this.loadingService.show({
      title: 'Deleting System Permission(s)',
      message: 'Please wait while we delete the system permission(s)...',
    });
    this.systemPermissionService
      .deleteSystemPermission(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.table.setData([]);
          this.loadSystemPermissionList();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISystemPermissionDeleteResponseDto) => {
          this.logger.logUserAction('Delete permission response', response);
          this.notificationService.success(
            'System Permission(s) deleted successfully'
          );
        },
        error: error => {
          this.logger.logUserAction('Delete system permission error', error);
          this.notificationService.error(
            'Failed to delete system permission(s)'
          );
        },
      });
  }

  protected handleBulkActionClick(event: ITableActionClickEvent): void {
    this.logger.logUserAction('Bulk action clicked', event);

    const { actionType, selectedRows } = event;

    switch (actionType) {
      case ETableActionType.DELETE:
        this.showBulkDeleteConfirmationDialog(
          selectedRows as ISystemPermissionGetBaseResponseDto[]
        );
        break;
      default:
        this.logger.warn('Unknown bulk action:', actionType);
    }
  }

  protected handleRowActionClick(event: ITableActionClickEvent): void {
    this.logger.logUserAction('Row action clicked', event);

    const { actionType, selectedRows } = event;

    switch (actionType) {
      case ETableActionType.EDIT:
        this.navigateToEditSystemPermission(
          selectedRows as unknown as ISystemPermissionGetBaseResponseDto
        );
        break;
      case ETableActionType.DELETE:
        this.showSingleDeleteConfirmationDialog(
          selectedRows as unknown as ISystemPermissionGetBaseResponseDto
        );
        break;
      default:
        this.logger.warn('Unknown row action:', actionType);
    }
  }

  private mapTableData(
    response: ISystemPermissionGetResponseDto
  ): Partial<ISystemPermissionGetBaseResponseDto>[] {
    return response.records.map(
      (record: ISystemPermissionGetBaseResponseDto) => ({
        id: record.id,
        name: record.name,
        module: record.module,
        label: record.label,
        description: record.description,
        isEditable: record.isEditable,
        isDeletable: record.isDeletable,
      })
    );
  }

  private navigateToEditSystemPermission(
    rowData: ISystemPermissionGetBaseResponseDto
  ): void {
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
          systemPermissionData: rowData,
        }
      );

      if (!success) {
        this.logger.logUserAction('Navigation failed for edit button', {
          systemPermissionId: rowData.id,
        });
      }
    } catch (error) {
      this.logger.logUserAction('Navigation error', error);
    }
  }

  private showSingleDeleteConfirmationDialog(
    rowData: ISystemPermissionGetBaseResponseDto
  ): void {
    this.logger.logUserAction(
      'Single system permission delete action triggered',
      rowData
    );

    const formattedSystemPermissionData =
      this.formatSingleDeleteSystemPermissionData(rowData);
    const formData = this.prepareDeleteSystemPermissionFormData(
      formattedSystemPermissionData
    );
    const dialogConfig = createSystemPermissionDeleteDialogConfig(rowData, () =>
      this.executeDeleteSystemPermission(formData)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.DELETE
    );
  }

  private showBulkDeleteConfirmationDialog(
    selectedRows: ISystemPermissionGetBaseResponseDto[]
  ): void {
    this.logger.logUserAction(
      'Bulk system permission delete action triggered',
      selectedRows
    );

    const formattedSystemPermissionData =
      this.formatBulkDeleteSystemPermissionData(selectedRows);
    const formData = this.prepareDeleteSystemPermissionFormData(
      formattedSystemPermissionData
    );
    const dialogConfig = createSystemPermissionBulkDeleteDialogConfig(
      selectedRows,
      () => this.executeDeleteSystemPermission(formData)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.DELETE
    );
  }

  private formatSingleDeleteSystemPermissionData(
    rowData: ISystemPermissionGetBaseResponseDto
  ): string[] {
    return [rowData.id];
  }

  private formatBulkDeleteSystemPermissionData(
    selectedRows: ISystemPermissionGetBaseResponseDto[]
  ): string[] {
    return selectedRows.map(row => row.id);
  }

  private prepareDeleteSystemPermissionFormData(
    systemPermissionIds: string[]
  ): ISystemPermissionDeleteRequestDto {
    return {
      ids: systemPermissionIds,
    };
  }
}
