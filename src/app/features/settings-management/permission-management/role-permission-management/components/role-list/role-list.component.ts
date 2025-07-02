import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  IEnhancedTable,
  IRowActionClickEvent,
} from '../../../../../../shared/models';
import { ROLE_PERMISSION_LIST_ENHANCED_TABLE_CONFIG } from '../../config/table/role-permission-list-table.config';
import { ERowActionType } from '../../../../../../shared/types';
import { finalize, Subject, takeUntil } from 'rxjs';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { RolePermissionService } from '../../services/role-permission.service';
import {
  IGetRoleListResponseDto,
  IGetSingleRoleListResponseDto,
} from '../../models/role-permission.api.model';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../../../../shared/constants';
import { LoadingService, RouterNavigationService, TableService } from '../../../../../../shared/services';

@Component({
  selector: 'app-role-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})

export class RoleListComponent implements OnInit, OnDestroy {

  protected table!: IEnhancedTable;

  private readonly destroy$ = new Subject<void>();

  private readonly rolePermissionService = inject(RolePermissionService);
  private readonly dataTableService = inject(TableService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      ROLE_PERMISSION_LIST_ENHANCED_TABLE_CONFIG,
    );
    this.loadRoleList();
  }

  private loadRoleList(): void {

    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Roles',
      message: 'Fetching roles...',
    });

    this.rolePermissionService
      .getRoleList()
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: IGetRoleListResponseDto) => {
          const mappedData = this.mapTableData(response);
          this.table.setData(mappedData);
          this.logger.logUserAction('Roles loaded successfully');
        },
        error: (error) => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load roles', error);
        },
      });
  }

  private mapTableData(response: IGetRoleListResponseDto) {
    return response.records.map((record) => ({
      id: record.id,
      name: record.name,
      description: record.description,
      label: record.label,
    }));
  }

  protected handleRowActionClick(event: IRowActionClickEvent): void {
    this.logger.logUserAction('Row action clicked', event);

    const { actionType, rowData } = event;

    switch (actionType) {
      case ERowActionType.EDIT:
        this.navigateToEditRole(rowData as IGetSingleRoleListResponseDto);
        break;
      case ERowActionType.EDIT_PERMISSIONS:
        console.log('Edit permissions');
        break;
      default:
        this.logger.warn('Unknown row action:', actionType);
    }
  }

  private navigateToEditRole(rowData: IGetSingleRoleListResponseDto) {
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
        },
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
