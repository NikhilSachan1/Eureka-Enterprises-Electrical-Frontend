import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { UserService } from '../../services/user.service';
import { LoggerService } from '@core/services';
import {
  RouterNavigationService,
  LoadingService,
  ConfirmationDialogService,
  TableService,
  TableServerSideParamsBuilderService,
} from '@shared/services';
import {
  IEnhancedTable,
  IEnhancedTableConfig,
  ITableActionClickEvent,
  IDataViewDetailsWithEntity,
  IDataViewDetails,
  EDataType,
  EButtonActionType,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { USER_TABLE_ENHANCED_CONFIG } from '../../config/table/get-user.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  IUserGetBaseResponseDto,
  IUserGetFormDto,
  IUserGetResponseDto,
} from '../../types/user.dto';
import { IUser } from '../../types/user.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  SEARCH_FILTER_USER_FORM_CONFIG,
  USER_ACTION_CONFIG_MAP,
} from '../../config';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { TableLazyLoadEvent } from 'primeng/table';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';

@Component({
  selector: 'app-get-user',
  imports: [DataTableComponent, SearchFilterComponent, StatusTagComponent],
  templateUrl: './get-user.component.html',
  styleUrl: './get-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetUserComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly userService = inject(UserService);
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
      USER_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_USER_FORM_CONFIG;
  }

  private loadUserList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Users Permissions',
      message: 'Please wait while we load the users permissions...',
    });

    const paramData = this.prepareParamData();

    this.userService
      .getUserList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUserGetResponseDto) => {
          const { records, totalRecords } = response;
          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('Users loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load users', error);
        },
      });
  }

  private prepareParamData(): IUserGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IUserGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IUserGetBaseResponseDto[]): IUser[] {
    return response.map((record: IUserGetBaseResponseDto) => {
      return {
        id: record.id,
        employeeName: `${record.firstName} ${record.lastName}`,
        employeeCode: record.employeeId,
        employeeStatus: record.status,
        employeeRole: record.role ?? '', // TODO: Remove this nullable once the role is added to the user
        userPermissionCount: {
          user: record.userPermissionsCount,
          role: record.rolePermissionsCount,
          total: record.totalPermissions,
        },
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(filterData: TableLazyLoadEvent): void {
    this.tableFilterData = filterData;
    this.loadUserList();
  }

  protected handleUserTableActionClick(
    event: ITableActionClickEvent<IUserGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.SET_PERMISSIONS) {
      this.navigateToSetUserPermissions(selectedFirstRow.id);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadUserList();
      },
    };

    const recordDetail = this.prepareUserRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      USER_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareUserRecordDetail(
    selectedRow: IUserGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Employee Role',
        value: selectedRow.role,
        type: EDataType.TEXT,
      },
      {
        label: 'User Permission Count',
        value: selectedRow.userPermissionsCount,
        type: EDataType.TEXT,
      },
    ];
    return {
      details: [
        {
          status: {
            approvalStatus: selectedRow.status,
          },
          entryData,
        },
      ],
      entity: {
        name: `${selectedRow.firstName} ${selectedRow.lastName}`,
        subtitle: selectedRow.employeeId,
      },
    };
  }

  private navigateToSetUserPermissions(userId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER_PERMISSION,
        ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.SET_PERMISSIONS,
        userId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while setting user permissions',
        error
      );
    }
  }
}
