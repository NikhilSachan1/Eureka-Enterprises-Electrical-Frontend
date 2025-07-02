import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import {
  TableService,
  RouterNavigationService,
  LoadingService,
} from '../../../../../../shared/services/';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { SystemPermissionService } from '../../services/system-permission.service';
import {
  IEnhancedTable,
  IRowActionClickEvent,
} from '../../../../../../shared/models';
import { SYSTEM_PERMISSION_LIST_ENHANCED_TABLE_CONFIG } from '../../config/table/system-permission-list-table.config';
import {
  IGetSingleSystemPermissionListResponseDto,
  IGetSystemPermissionListResponseDto,
} from '../../models/system-permission.api.model';
import { ERowActionType } from '../../../../../../shared/types';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../../../../shared/constants';

@Component({
  selector: 'app-system-permission-list',
  imports: [DataTableComponent],
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
    }));
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}