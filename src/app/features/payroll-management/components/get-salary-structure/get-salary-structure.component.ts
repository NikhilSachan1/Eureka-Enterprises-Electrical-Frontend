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
import { AppPermissionService, LoggerService } from '@core/services';
import {
  SALARY_STRUCTURE_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_SALARY_STRUCTURE_FORM_CONFIG,
} from '@features/payroll-management/config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  ISalaryStructureGetBaseResponseDto,
  ISalaryStructureGetRequestDto,
  ISalaryStructureGetResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import {
  IEmployeeAnnexure,
  ISalaryStructure,
} from '@features/payroll-management/types/payroll.interface';
import { ROUTE_BASE_PATHS, ROUTES, ICONS } from '@shared/constants';
import {
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDrawerSize,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
  IButtonConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { GetSalaryStructureHistoryComponent } from '../get-salary-structure-history/get-salary-structure-history.component';
import { AppPermissionDirective } from '@shared/directives/app-permission.directive';
import { APP_PERMISSION } from '@core/constants';
import { parseAmount } from '@shared/utility';
import { ButtonComponent } from '@shared/components/button/button.component';
import { SalaryAnnexureComponent } from '@features/payroll-management/shared/components/salary-annexure/salary-annexure.component';

@Component({
  selector: 'app-get-salary-structure',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    DataTableComponent,
    AppPermissionDirective,
    ButtonComponent,
    SalaryAnnexureComponent,
  ],
  templateUrl: './get-salary-structure.component.html',
  styleUrl: './get-salary-structure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetSalaryStructureComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly payrollService = inject(PayrollService);
  private readonly loadingService = inject(LoadingService);
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appPermissionService = inject(AppPermissionService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  protected readonly employeeAnnexureData = signal<IEmployeeAnnexure | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly hasEmployeeNameFilter = signal(false);

  protected readonly APP_PERMISSION = APP_PERMISSION;
  protected readonly ICONS = ICONS;

  ngOnInit(): void {
    if (this.shouldShowTable()) {
      this.table = this.dataTableService.createTable(
        SALARY_STRUCTURE_TABLE_ENHANCED_CONFIG
      );
      this.searchFilterConfig = SEARCH_FILTER_SALARY_STRUCTURE_FORM_CONFIG;
    } else {
      this.loadEmployeeAnnexure();
    }
  }

  private loadAllEmployeeSalaryStructure(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Salary Structure',
      message: 'Please wait while we load the salary structure...',
    });

    this.payrollService
      .getSalaryStructureList()
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISalaryStructureGetResponseDto) => {
          const { records, totalRecords } = response;
          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Salary structure records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction(
            'Failed to load salary structure records',
            error
          );
        },
      });
  }

  private loadEmployeeAnnexure(): void {
    this.loadingService.show({
      title: 'Loading Employee Annexure',
      message: 'Please wait while we load the employee annexure...',
    });

    let paramData!: ISalaryStructureGetRequestDto;
    if (this.shouldShowTable()) {
      paramData = this.prepareParamData();
    }

    this.payrollService
      .getSalaryStructureList(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISalaryStructureGetResponseDto) => {
          const { records } = response;
          if (records.length > 0) {
            const mappedData = this.mapEmployeeAnnexureData(records[0]);
            this.employeeAnnexureData.set(mappedData);
            this.logger.logUserAction('Employee annexure loaded successfully');
          } else {
            this.employeeAnnexureData.set(null);
            this.logger.logUserAction('No employee annexure data found');
          }
        },
        error: error => {
          this.employeeAnnexureData.set(null);
          this.logger.logUserAction('Failed to load employee annexure', error);
        },
      });
  }

  private prepareParamData(): ISalaryStructureGetRequestDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<ISalaryStructureGetRequestDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: ISalaryStructureGetBaseResponseDto[]
  ): ISalaryStructure[] {
    return response.map((record: ISalaryStructureGetBaseResponseDto) => {
      return {
        id: record.id,
        employeeName:
          `${record.user?.firstName ?? ''} ${record.user?.lastName ?? ''}`.trim(),
        employeeCode: record.user?.employeeId ?? '',
        effectiveFrom: record.effectiveFrom,
        ctc: record.ctc,
        originalRawData: record,
      };
    });
  }

  private mapEmployeeAnnexureData(
    response: ISalaryStructureGetBaseResponseDto
  ): IEmployeeAnnexure {
    return {
      earnings: {
        items: [
          { label: 'Basic Salary', value: parseAmount(response.basic) },
          { label: 'HRA', value: parseAmount(response.hra) },
        ],
        total: parseAmount(response.grossSalary),
      },
      deductions: {
        items: [
          { label: 'Employee PF', value: parseAmount(response.employeePf) },
          { label: 'TDS', value: parseAmount(response.tds) },
          { label: 'ESIC', value: parseAmount(response.esic) },
        ],
        total: parseAmount(response.totalDeductions),
      },
      employerBenefits: {
        items: [
          { label: 'Employer PF', value: parseAmount(response.employerPf) },
          { label: 'ESIC', value: parseAmount(response.esic) },
        ],
        total: parseAmount(response.employerPf) + parseAmount(response.esic),
      },
      salarySummary: {
        items: [
          {
            title: 'Net Salary (In Hand)',
            monthlyValue: parseAmount(response.netSalary) / 12,
            annualValue: parseAmount(response.netSalary),
          },
          {
            title: 'Annual CTC',
            monthlyValue: parseAmount(response.ctc) / 12,
            annualValue: parseAmount(response.ctc),
          },
        ],
      },
      notPartCTC: {
        items: [
          {
            label: 'Food Allowance',
            value: parseAmount(response.foodAllowance),
          },
        ],
      },
      effectiveFrom: response.effectiveFrom,
      originalRawData: response,
    };
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.checkEmployeeNameFilter();

    if (this.hasEmployeeNameFilter()) {
      this.loadEmployeeAnnexure();
    } else {
      this.employeeAnnexureData.set(null);
      this.loadAllEmployeeSalaryStructure();
    }
  }

  private checkEmployeeNameFilter(): void {
    const employeeNameFilter = this.tableFilterData?.filters?.['employeeName'];
    const value =
      employeeNameFilter &&
      this.tableServerSideFilterAndSortService.extractFilterValue(
        employeeNameFilter
      );

    const hasValue =
      (Array.isArray(value) && value.length > 0) || value !== undefined;

    this.hasEmployeeNameFilter.set(Boolean(hasValue));
  }

  protected handleSalaryStructureTableActionClick(
    event: ITableActionClickEvent<ISalaryStructureGetBaseResponseDto>,
    _isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showSalaryStructureDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditSalaryStructure(selectedFirstRow.id);
      return;
    }
  }

  private showSalaryStructureDetailsDrawer(
    rowData: ISalaryStructureGetBaseResponseDto
  ): void {
    this.logger.logUserAction(
      'Opening salary structure details drawer',
      rowData
    );

    this.drawerService.showDrawer(GetSalaryStructureHistoryComponent, {
      header: `Revision History`,
      subtitle: `View all salary structure revisions`,
      size: EDrawerSize.MEDIUM,
      componentData: {
        salaryStructure: rowData,
      },
    });
  }

  private navigateToEditSalaryStructure(salaryStructureId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.PAYROLL,
        ROUTES.PAYROLL.STRUCTURE,
        salaryStructureId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing salary structure',
        error
      );
    }
  }

  protected showRevisionHistory(): void {
    const annexureData = this.employeeAnnexureData();
    if (!annexureData?.originalRawData) {
      this.logger.logUserAction(
        'Cannot show revision history - missing salary structure data'
      );
      return;
    }

    this.showSalaryStructureDetailsDrawer(annexureData.originalRawData);
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Salary Structure Management',
      subtitle: 'Manage salary structure records',
    };
  }

  private shouldShowTable(): boolean {
    return this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.SALARY_STRUCTURE.TABLE
    );
  }

  protected getRevisionHistoryButtonConfig(): Partial<IButtonConfig> {
    return {
      id: EButtonActionType.VIEW,
      label: 'View Revision History',
      icon: ICONS.COMMON.HISTORY,
    };
  }
}
