import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { DataTableComponent } from '@shared/components';
import {
  IEnhancedTable,
  IRowActionClickEvent,
  IBulkActionClickEvent,
  IEnhancedTableConfig,
} from '@shared/models';
import { EBulkActionType, EDialogType, ERowActionType } from '@shared/types';
import { finalize } from 'rxjs';
import { LoggerService } from '@core/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
  TableService,
} from '@shared/services';
import { RoleService } from '../../services/role.service';
import {
  createRoleBulkDeleteDialogConfig,
  createRoleDeleteDialogConfig,
  ROLE_TABLE_ENHANCED_CONFIG,
} from '../../config';
import {
  IRoleDeleteRequestDto,
  IRoleDeleteResponseDto,
  IRoleGetBaseResponseDto,
  IRoleGetResponseDto,
} from '../../types/role.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IRole } from '../../types/role.interface';

@Component({
  selector: 'app-get-role',
  imports: [DataTableComponent],
  templateUrl: './get-role.component.html',
  styleUrl: './get-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleListComponent implements OnInit {
  private readonly roleService = inject(RoleService);
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
      ROLE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.loadRoleList();
  }

  private loadRoleList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Roles',
      message: 'Please wait while we load the roles...',
    });

    this.roleService
      .getRoleList()
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRoleGetResponseDto) => {
          const mappedData = this.mapTableData(response);
          this.table.setData(mappedData);
          this.logger.logUserAction('Roles loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load roles', error);
        },
      });
  }

  private executeDeleteRole(formData: IRoleDeleteRequestDto): void {
    this.logger.logUserAction('Executing delete role', formData);
    this.loadingService.show({
      title: 'Deleting Role(s)',
      message: 'Please wait while we delete the role(s)...',
    });

    this.roleService
      .deleteRole(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.table.setData([]);
          this.loadRoleList();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRoleDeleteResponseDto) => {
          this.logger.logUserAction('Delete role response', response);
          this.notificationService.success('Role(s) deleted successfully');
        },
        error: error => {
          this.logger.logUserAction('Delete role error', error);
          this.notificationService.error('Failed to delete role(s)');
        },
      });
  }

  protected handleBulkActionClick(event: IBulkActionClickEvent): void {
    this.logger.logUserAction('Bulk action clicked', event);

    const { actionType, selectedRows } = event;

    switch (actionType) {
      case EBulkActionType.DELETE:
        this.showBulkDeleteConfirmationDialog(
          selectedRows as IRoleGetBaseResponseDto[]
        );
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
        this.navigateToEditRole(rowData as IRoleGetBaseResponseDto);
        break;
      case ERowActionType.DELETE:
        this.showSingleDeleteConfirmationDialog(
          rowData as IRoleGetBaseResponseDto
        );
        break;
      case ERowActionType.SET_PERMISSIONS:
        this.navigateToSetRolePermissions(rowData as IRoleGetBaseResponseDto);
        break;
      default:
        this.logger.warn('Unknown row action:', actionType);
    }
  }

  private mapTableData(response: IRoleGetResponseDto): Partial<IRole>[] {
    return response.records.map((record: IRoleGetBaseResponseDto) => ({
      id: record.id,
      name: record.name,
      description: record.description,
      label: record.label,
      permissionCount: `${record.permissionCount} / ${response.totalPermissions}`,
      isDeletable: record.isDeletable,
      isEditable: record.isEditable,
    }));
  }

  private navigateToEditRole(rowData: IRoleGetBaseResponseDto): void {
    this.logger.logUserAction('Navigating to edit role', rowData);

    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
        ROUTES.SETTINGS.PERMISSION.ROLE.EDIT,
        rowData.id,
      ];

      const success = this.routerNavigationService.navigateWithState(
        routeSegments,
        {
          roleData: rowData,
        }
      );

      if (!success) {
        this.logger.logUserAction('Navigation failed for edit button', {
          roleId: rowData.id,
        });
      }
    } catch (error) {
      this.logger.logUserAction('Navigation error', error);
    }
  }

  private navigateToSetRolePermissions(rowData: IRoleGetBaseResponseDto): void {
    this.logger.logUserAction('Navigating to set role permissions');

    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE_PERMISSION,
        ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET_PERMISSIONS,
        rowData.id,
      ];

      const success =
        this.routerNavigationService.navigateToRoute(routeSegments);

      if (!success) {
        this.logger.logUserAction('Navigation failed for set role permissions');
      }
    } catch (error) {
      this.logger.logUserAction('Navigation error', error);
    }
  }

  private showSingleDeleteConfirmationDialog(
    rowData: IRoleGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Single role delete action triggered', rowData);

    const formattedRoleData = this.formatSingleDeleteRoleData(rowData);
    const formData = this.prepareDeleteRoleFormData(formattedRoleData);
    const dialogConfig = createRoleDeleteDialogConfig(rowData, () =>
      this.executeDeleteRole(formData)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.DELETE
    );
  }

  private showBulkDeleteConfirmationDialog(
    selectedRows: IRoleGetBaseResponseDto[]
  ): void {
    this.logger.logUserAction(
      'Bulk role delete action triggered',
      selectedRows
    );

    const formattedRoleData = this.formatBulkDeleteRoleData(selectedRows);
    const formData = this.prepareDeleteRoleFormData(formattedRoleData);
    const dialogConfig = createRoleBulkDeleteDialogConfig(selectedRows, () =>
      this.executeDeleteRole(formData)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.DELETE
    );
  }

  private formatSingleDeleteRoleData(
    rowData: IRoleGetBaseResponseDto
  ): string[] {
    return [rowData.id];
  }

  private formatBulkDeleteRoleData(
    selectedRows: IRoleGetBaseResponseDto[]
  ): string[] {
    return selectedRows.map(row => row.id);
  }

  private prepareDeleteRoleFormData(roleIds: string[]): IRoleDeleteRequestDto {
    return { ids: roleIds };
  }
}
