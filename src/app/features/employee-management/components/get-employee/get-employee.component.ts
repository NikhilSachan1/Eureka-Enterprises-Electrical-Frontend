import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionService, LoggerService } from '@core/services';
import {
  EMPLOYEE_ACTION_CONFIG_MAP,
  EMPLOYEE_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_EMPLOYEE_FORM_CONFIG,
} from '@features/employee-management/configs';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeGetBaseResponseDto,
  IEmployeeGetRequestDto,
  IEmployeeGetResponseDto,
  IEmployeeGetStatsResponseDto,
} from '@features/employee-management/types/employee.dto';
import { IEmployee } from '@features/employee-management/types/employee.interface';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { EMPLOYEE_MESSAGES } from '../../constants';
import {
  ConfirmationDialogService,
  DrawerService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
  AppConfigurationService,
  NotificationService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  EDrawerSize,
  ETabMode,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetricGroup,
  IPageHeaderConfig,
  ITabChange,
  ITabItem,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  applyGroupMetricValueLoading,
  getMappedValueFromArrayOfObjects,
  toTitleCase,
} from '@shared/utility';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { GetEmployeeDetailComponent } from '../get-employee-detail/get-employee-detail.component';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { GetNonEmployeeComponent } from '@features/non-employee-management/components/get-non-employee/get-non-employee.component';
import { NON_EMPLOYEE_TAB_QUERY_PARAMS } from '@features/non-employee-management/constants/non-employee.constants';

enum EEmployeeTab {
  EMPLOYEE = 'employee',
  NON_EMPLOYEE = 'non-employee',
}

@Component({
  selector: 'app-get-employee',
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    NavTabsComponent,
    NgTemplateOutlet,
    GetNonEmployeeComponent,
  ],
  templateUrl: './get-employee.component.html',
  styleUrl: './get-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetEmployeeComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly employeeService = inject(EmployeeService);

  private readonly drawerService = inject(DrawerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideParamsBuilderService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly notificationService = inject(NotificationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly employeeStats = signal<IEmployeeGetStatsResponseDto | null>(
    null
  );

  private readonly route = inject(ActivatedRoute);
  private readonly appPermissionService = inject(AppPermissionService);

  protected readonly tabMode = ETabMode.CONTENT;
  protected readonly tabs = computed<ITabItem[]>(() => [
    {
      route: EEmployeeTab.EMPLOYEE,
      label: 'Employee',
      icon: ICONS.COMMON.USERS,
      tooltip: 'Employees with salary, leave and attendance',
    },
    {
      route: EEmployeeTab.NON_EMPLOYEE,
      label: 'Non Employee',
      icon: ICONS.COMMON.USER,
      tooltip: 'Users who only log in and work',
    },
  ]);
  /** Without the system-user permission the page stays a plain employee list. */
  protected readonly showTabs = computed(() =>
    this.appPermissionService.hasPermission(
      APP_PERMISSION.SYSTEM_USER.TABLE_VIEW
    )
  );
  private readonly activeTab = signal<EEmployeeTab>(
    this.showTabs() &&
      this.route.snapshot.queryParamMap.get('tab') ===
        NON_EMPLOYEE_TAB_QUERY_PARAMS.tab
      ? EEmployeeTab.NON_EMPLOYEE
      : EEmployeeTab.EMPLOYEE
  );
  protected readonly isNonEmployeeTab = computed(
    () => this.activeTab() === EEmployeeTab.NON_EMPLOYEE
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  protected onTabChanged(change: ITabChange): void {
    this.activeTab.set(change.tab.route as EEmployeeTab);
  }

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      EMPLOYEE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_EMPLOYEE_FORM_CONFIG;
  }

  private loadEmployeeList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.employeeService
      .getEmployeeList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEmployeeGetResponseDto) => {
          const { records, metrics: stats, totalRecords } = response;

          this.appConfigurationService.runAfterTouchedConfiguration(
            () => this.mapTableData(records),
            mappedData => this.table.setData(mappedData)
          );
          this.table.updateTableConfig({ totalRecords });
          this.employeeStats.set(stats);
          this.logger.logUserAction('Employee records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.employeeStats.set(null);
          this.logger.error(EMPLOYEE_MESSAGES.ERROR.GET_LIST, error);
          this.notificationService.error(EMPLOYEE_MESSAGES.ERROR.GET_LIST);
        },
      });
  }

  private prepareParamData(): IEmployeeGetRequestDto {
    return this.tableServerSideParamsBuilderService.buildQueryParams<IEmployeeGetRequestDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IEmployeeGetBaseResponseDto[]): IEmployee[] {
    return response.map((record: IEmployeeGetBaseResponseDto) => {
      return {
        id: record.id,
        employeeName: `${toTitleCase(record.firstName)} ${toTitleCase(record.lastName)}`,
        employeeCode: record.employeeId,
        email: record.email,
        contactNumber: record.contactNumber,
        employeeType: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.employmentTypes(),
          record.employeeType
        ),
        designation: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.designations(),
          record.designation
        ),
        dateOfJoining: record.dateOfJoining,
        status: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.employeeStatus(),
          record.status
        ),
        originalRawData: record,
      } satisfies IEmployee;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadEmployeeList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.employeeStats();
    const loading = this.table.loading();

    const groups: IMetricGroup[] = [
      {
        id: 'employee-counts',
        title: 'Employee Counts',
        icon: ICONS.EMPLOYEE.GROUP,
        metrics: [
          { label: 'Total Employees', value: stats?.total ?? 0 },
          { label: 'Active Employees', value: stats?.active ?? 0 },
          { label: 'Inactive Employees', value: stats?.inactive ?? 0 },
        ],
      },
      {
        id: 'recent-activity',
        title: 'Recent Activity',
        icon: ICONS.COMMON.CALENDAR_PLUS,
        metrics: [
          {
            label: 'New Joiners Last 30 Days',
            value: stats?.newJoinersLast30Days ?? 0,
          },
        ],
      },
      {
        id: 'by-gender',
        title: 'By Gender',
        icon: ICONS.COMMON.USERS,
        metrics: [
          { label: 'Male', value: stats?.byGender?.['male'] ?? 0 },
          { label: 'Female', value: stats?.byGender?.['female'] ?? 0 },
        ],
      },
    ];

    return applyGroupMetricValueLoading(groups, loading);
  }

  protected handleEmployeeTableActionClick(
    event: ITableActionClickEvent<IEmployeeGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showEmployeeDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditEmployee(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadEmployeeList();
      },
    };

    const recordDetail = this.prepareEmployeeRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      EMPLOYEE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareEmployeeRecordDetail(
    selectedRow: IEmployeeGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Employee Name',
        value: `${selectedRow.firstName} ${selectedRow.lastName}`,
        type: EDataType.TEXT,
      },
      {
        label: 'Email ID',
        value: selectedRow.email,
        type: EDataType.EMAIL,
      },
      {
        label: 'Contact Number',
        value: selectedRow.contactNumber,
        type: EDataType.PHONE,
      },
      {
        label: 'Designation',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.designations(),
          selectedRow.designation
        ),
        type: EDataType.TEXT,
      },
      {
        label: 'Joining Date',
        value: selectedRow.dateOfJoining,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Roles',
        value: selectedRow.roles.map(role => toTitleCase(role.name)).join(', '),
      },
    ];
    return {
      details: [
        {
          entryData,
          status: {
            entryType: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.employmentTypes(),
              selectedRow.employeeType
            ),
            approvalStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.employeeStatus(),
              selectedRow.status
            ),
          },
        },
      ],
    };
  }

  private showEmployeeDetailsDrawer(
    rowData: IEmployeeGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Opening employee details drawer', rowData);

    this.drawerService.showDrawer(GetEmployeeDetailComponent, {
      header: `Employee Details`,
      subtitle: `Detailed view of employee`,
      size: EDrawerSize.LARGE,
      componentData: {
        employee: rowData,
      },
    });
  }

  private navigateToEditEmployee(employeeId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.EMPLOYEE,
        ROUTES.EMPLOYEE.EDIT,
        employeeId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing employee',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addEmployee') {
      navigationRoute = [ROUTE_BASE_PATHS.EMPLOYEE, ROUTES.EMPLOYEE.ADD];
    }
    if (actionName === 'addNonEmployee') {
      navigationRoute = [
        ROUTE_BASE_PATHS.EMPLOYEE,
        ROUTES.EMPLOYEE.NON_EMPLOYEE,
        ROUTES.NON_EMPLOYEE.ADD,
      ];
    }
    const success =
      this.routerNavigationService.navigateToRoute(navigationRoute);

    if (!success) {
      this.logger.logUserAction(
        'Navigation failed for header button',
        navigationRoute
      );
    }
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Employee Management',
      subtitle: 'Manage employee records',
      showHeaderButton: true,
      headerButtonConfig: [
        this.isNonEmployeeTab()
          ? {
              ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
              label: 'Add Non Employee',
              icon: ICONS.COMMON.ADD,
              actionName: 'addNonEmployee',
              permission: [APP_PERMISSION.SYSTEM_USER.ADD],
            }
          : {
              ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
              label: 'Add Employee',
              icon: ICONS.COMMON.ADD,
              actionName: 'addEmployee',
              permission: [APP_PERMISSION.EMPLOYEE.ADD],
            },
      ],
    };
  }
}
