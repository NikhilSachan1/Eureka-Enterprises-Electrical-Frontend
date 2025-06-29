import { Component, OnInit, inject } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TableService } from '../../../../../../shared/services/data-table-config.service';
import { IEnhancedTable, IRowActionClickEvent } from '../../../../../../shared/models';
import { ROLE_PERMISSION_LIST_ENHANCED_TABLE_CONFIG } from '../../config/table/role-permission-list-table.config';
import { ERowActionType } from '../../../../../../shared/types';
import { finalize, Subject, takeUntil } from 'rxjs';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { RouterService } from '../../../../../../shared/services/router.service';
import { RolePermissionService } from '../../services/role-permission.service';
import { IGetRoleListResponseDto, IGetSingleRoleListResponseDto } from '../../models/role-permission.api.model';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../../../../shared/constants';

@Component({
  selector: 'app-role-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent implements OnInit {

  protected table!: IEnhancedTable;

  private readonly destroy$ = new Subject<void>();

  private readonly rolePermissionService = inject(RolePermissionService);
  private readonly dataTableService = inject(TableService);
  private readonly logger = inject(LoggerService);
  private readonly routerService = inject(RouterService);

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(ROLE_PERMISSION_LIST_ENHANCED_TABLE_CONFIG);
    this.loadTableData();
  }

  private loadTableData(): void {
    this.table.setLoading(true);

    this.rolePermissionService.getRoleList()
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: IGetRoleListResponseDto) => {
          const mappedData: any[] = this.mapTableData(response);
          this.table.setData(mappedData);
        },
        error: () => {
          this.table.setData([]);
        }
      });
  }

  private mapTableData(response: IGetRoleListResponseDto) {
    return response.records.map(record => ({
      id: record.id,
      name: record.name,
      description: record.description,
    }));
  }

  protected handleRowActionClick(event: IRowActionClickEvent): void {
    const { actionType, rowData } = event;
    switch (actionType) {
      case ERowActionType.EDIT:
        this.editRolePermission(rowData as IGetSingleRoleListResponseDto);
        break;
      case ERowActionType.EDIT_PERMISSIONS:
        console.log('Edit permissions');
        break;
      default:
        this.logger.warn('Unknown row action:', actionType);
    }
  }

  private editRolePermission(rowData: IGetSingleRoleListResponseDto) {
    this.logger.info('Navigating to edit role permission with ID:', rowData.id);
    
    this.routerService.navigate(
      [
        `${ROUTE_BASE_PATHS.SETTINGS.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}/${ROUTES.SETTINGS.PERMISSION.ROLE.EDIT}`, 
        rowData['id']
      ],
      {
        state: { roleData: rowData },
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
