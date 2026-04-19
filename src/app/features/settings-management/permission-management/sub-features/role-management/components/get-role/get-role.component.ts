import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { finalize } from 'rxjs';
import { LoggerService } from '@core/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { RoleService } from '../../services/role.service';
import {
  ROLE_ACTION_CONFIG_MAP,
  ROLE_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_ROLE_FORM_CONFIG,
} from '../../config';
import {
  IRoleGetBaseResponseDto,
  IRoleGetFormDto,
  IRoleGetResponseDto,
} from '../../types/role.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IRole } from '../../types/role.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { toTitleCase } from '@shared/utility';
import { TableLazyLoadEvent } from 'primeng/table';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';

@Component({
  selector: 'app-get-role',
  imports: [DataTableComponent, SearchFilterComponent],
  templateUrl: './get-role.component.html',
  styleUrl: './get-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetRoleComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly roleService = inject(RoleService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      ROLE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_ROLE_FORM_CONFIG;
  }

  private loadRoleList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Roles',
      message: "We're loading the roles. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.roleService
      .getRoleList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRoleGetResponseDto) => {
          const { records, totalRecords, totalPermissions } = response;
          const mappedData = this.mapTableData(records, totalPermissions);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('Roles loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load roles', error);
        },
      });
  }

  private prepareParamData(): IRoleGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IRoleGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IRoleGetBaseResponseDto[],
    totalPermissions: number
  ): IRole[] {
    return response.map((record: IRoleGetBaseResponseDto) => ({
      id: record.id,
      roleCode: record.name,
      roleDescription: toTitleCase(record.description),
      roleLabel: toTitleCase(record.label),
      rolePermissionCount: {
        current: record.permissionCount,
        total: totalPermissions,
      },
      isDeletable: record.isDeletable,
      isEditable: record.isEditable,
      originalRawData: record,
    }));
  }

  protected onTableStateChange(filterData: TableLazyLoadEvent): void {
    this.tableFilterData = filterData;
    this.loadRoleList();
  }

  protected handleRoleTableActionClick(
    event: ITableActionClickEvent<IRoleGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditRole(selectedFirstRow.id, selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.SET_PERMISSIONS) {
      this.navigateToSetRolePermissions(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadRoleList();
      },
    };

    const recordDetail = this.prepareRoleRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      ROLE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareRoleRecordDetail(
    selectedRow: IRoleGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Role Label',
        value: selectedRow.label,
        type: EDataType.TEXT,
      },
      {
        label: 'Role Name',
        value: selectedRow.name,
        type: EDataType.TEXT,
      },
    ];
    return {
      details: [
        {
          entryData,
        },
      ],
    };
  }

  private navigateToEditRole(
    roleId: string,
    selectedRow: IRoleGetBaseResponseDto
  ): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
        ROUTES.SETTINGS.PERMISSION.ROLE.EDIT,
        roleId,
      ];

      const success = this.routerNavigationService.navigateWithState(
        routeSegments,
        { roleDetail: selectedRow }
      );

      if (!success) {
        this.logger.logUserAction('Navigation failed for edit role', {
          roleId,
        });
      }
    } catch (error) {
      this.logger.logUserAction('Navigation error while editing role', error);
    }
  }

  private navigateToSetRolePermissions(roleId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE_PERMISSION,
        ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET_PERMISSIONS,
        roleId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while setting role permissions',
        error
      );
    }
  }
}
