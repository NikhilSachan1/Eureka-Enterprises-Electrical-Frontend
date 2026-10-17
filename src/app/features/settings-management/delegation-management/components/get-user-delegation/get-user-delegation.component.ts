import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  SEARCH_FILTER_USER_DELEGATION_FORM_CONFIG,
  USER_DELEGATION_ACTION_CONFIG_MAP,
  USER_DELEGATION_TABLE_ENHANCED_CONFIG,
} from '@features/settings-management/delegation-management/config';
import { UserDelegationService } from '@features/settings-management/delegation-management/services/user-delegation.service';
import {
  IUserDelegationGetBaseResponseDto,
  IUserDelegationGetFormDto,
  IUserDelegationGetResponseDto,
} from '@features/settings-management/delegation-management/types/user-delegation.dto';
import { IUserDelegation } from '@features/settings-management/delegation-management/types/user-delegation.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { ICONS } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-get-user-delegation',
  imports: [PageHeaderComponent, SearchFilterComponent, DataTableComponent],
  templateUrl: './get-user-delegation.component.html',
  styleUrl: './get-user-delegation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetUserDelegationComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly userDelegationService = inject(UserDelegationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      USER_DELEGATION_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_USER_DELEGATION_FORM_CONFIG;
  }

  private loadDelegationList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.userDelegationService
      .getDelegationList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUserDelegationGetResponseDto) => {
          const rows = this.mapTableData(response.records);
          const pageSize = this.tableFilterData.rows ?? rows.length;
          const first = this.tableFilterData.first ?? 0;
          this.table.setData(rows.slice(first, first + pageSize));
          this.table.updateTableConfig({ totalRecords: rows.length });
          this.logger.logUserAction('Delegation records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load delegation records', error);
        },
      });
  }

  private prepareParamData(): IUserDelegationGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IUserDelegationGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    records: IUserDelegationGetBaseResponseDto[]
  ): IUserDelegation[] {
    return records.map(record => ({
      id: record.id,
      managerName: record.managerName,
      managerEmployeeId: record.managerEmployeeId,
      memberName: record.memberName,
      memberEmployeeId: record.memberEmployeeId,
      moduleLabel: this.moduleLabel(record.module),
      createdAt: new Date(record.createdAt),
      grantedByName: record.grantedBy,
      originalRawData: record,
    }));
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadDelegationList();
  }

  protected handleDelegationTableActionClick(
    event: ITableActionClickEvent<IUserDelegationGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType !== EButtonActionType.CANCEL || !selectedFirstRow) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      USER_DELEGATION_ACTION_CONFIG_MAP[actionType],
      this.prepareDelegationRecordDetail(selectedFirstRow),
      false,
      true,
      {
        selectedRecord: selectedRows,
        onSuccess: () => {
          this.loadDelegationList();
        },
      }
    );
  }

  private prepareDelegationRecordDetail(
    selectedRow: IUserDelegationGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Manager',
        value: selectedRow.managerName,
        type: EDataType.TEXT,
      },
      {
        label: 'Member',
        value: selectedRow.memberName,
        type: EDataType.TEXT,
      },
      {
        label: 'Module',
        value: this.moduleLabel(selectedRow.module),
        type: EDataType.TEXT,
      },
    ];

    return {
      details: [{ entryData }],
    };
  }

  private moduleLabel(module: string): string {
    return String(
      getMappedValueFromArrayOfObjects(
        this.appConfigurationService.moduleNames(),
        module
      )
    );
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName !== 'grantDelegation') {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      USER_DELEGATION_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        onSuccess: () => {
          this.loadDelegationList();
        },
      }
    );
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Delegations',
      subtitle:
        'Choose a manager and the employee they will handle. This can be any employee.',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Grant delegation',
          icon: ICONS.COMMON.ADD,
          actionName: 'grantDelegation',
          permission: [APP_PERMISSION.USER_DELEGATION.MANAGE],
        },
      ],
    };
  }
}
