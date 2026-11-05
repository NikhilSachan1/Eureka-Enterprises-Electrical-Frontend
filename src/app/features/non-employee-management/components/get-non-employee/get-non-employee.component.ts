import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { IEmployeeGetRequestDto } from '@features/employee-management/types/employee.dto';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects, toTitleCase } from '@shared/utility';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { NON_EMPLOYEE_ACTION_CONFIG_MAP } from '../../configs/dialog/get-non-employee.config';
import { SEARCH_FILTER_NON_EMPLOYEE_FORM_CONFIG } from '../../configs/form/search-filter-non-employee.config';
import { NON_EMPLOYEE_TABLE_ENHANCED_CONFIG } from '../../configs/table/get-non-employee.config';
import { INonEmployeeGetBaseResponseDto } from '../../schemas/non-employee.schema';
import { NonEmployeeService } from '../../services/non-employee.service';

/** Search and table shown in the "Non Employee" tab of the employee directory. */
@Component({
  selector: 'app-get-non-employee',
  imports: [DataTableComponent, SearchFilterComponent],
  templateUrl: './get-non-employee.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetNonEmployeeComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly nonEmployeeService = inject(NonEmployeeService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideParamsBuilderService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected table!: IEnhancedTable;
  protected searchFilterConfig: ITableSearchFilterFormConfig =
    SEARCH_FILTER_NON_EMPLOYEE_FORM_CONFIG;
  private tableFilterData!: TableLazyLoadEvent;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      NON_EMPLOYEE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadList();
  }

  private loadList(): void {
    this.table.setLoading(true);
    const params =
      this.tableServerSideParamsBuilderService.buildQueryParams<IEmployeeGetRequestDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    this.nonEmployeeService
      .getNonEmployeeList(params)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ records, totalRecords }) => {
          this.appConfigurationService.runAfterTouchedConfiguration(
            () => this.mapTableData(records),
            mappedData => this.table.setData(mappedData)
          );
          this.table.updateTableConfig({ totalRecords });
        },
        error: error => {
          this.table.setData([]);
          this.logger.error('Failed to load non employee list', error);
        },
      });
  }

  private mapTableData(records: INonEmployeeGetBaseResponseDto[]) {
    return records.map(record => ({
      ...record,
      name: this.fullName(record),
      roleNames: this.roleNames(record),
      status: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.employeeStatus(),
        record.status
      ),
      originalRawData: record,
    }));
  }

  protected handleTableActionClick(
    event: ITableActionClickEvent<INonEmployeeGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [row] = selectedRows;

    if (actionType === EButtonActionType.EDIT) {
      void this.routerNavigationService.navigateToRoute([
        ROUTE_BASE_PATHS.EMPLOYEE,
        ROUTES.EMPLOYEE.NON_EMPLOYEE,
        ROUTES.NON_EMPLOYEE.EDIT,
        row.id,
      ]);
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      NON_EMPLOYEE_ACTION_CONFIG_MAP[actionType],
      this.prepareRecordDetail(row),
      false,
      true,
      {
        selectedRecord: selectedRows,
        onSuccess: () => this.loadList(),
      }
    );
  }

  private prepareRecordDetail(
    row: INonEmployeeGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    return {
      details: [
        {
          entryData: [
            { label: 'Name', value: this.fullName(row), type: EDataType.TEXT },
            { label: 'Email ID', value: row.email, type: EDataType.EMAIL },
            {
              label: 'Contact Number',
              value: row.contactNumber ?? '-',
              type: EDataType.PHONE,
            },
            { label: 'Roles', value: this.roleNames(row) },
          ],
          status: {
            approvalStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.employeeStatus(),
              row.status
            ),
          },
        },
      ],
    };
  }

  private fullName(row: INonEmployeeGetBaseResponseDto): string {
    return `${toTitleCase(row.firstName)} ${toTitleCase(row.lastName)}`;
  }

  private roleNames(row: INonEmployeeGetBaseResponseDto): string {
    return row.roles
      .map(role =>
        getMappedValueFromArrayOfObjects(
          this.appConfigurationService.roleList(),
          role.name
        )
      )
      .join(', ');
  }
}
