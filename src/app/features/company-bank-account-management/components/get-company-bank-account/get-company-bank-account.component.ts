import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { CompanyBankAccountService } from '../../services/company-bank-account.service';
import {
  EButtonActionType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  ICompanyBankAccountGetBaseResponseDto,
  ICompanyBankAccountGetFormDto,
  ICompanyBankAccountGetResponseDto,
} from '../../types/company-bank-account.dto';
import {
  COMPANY_BANK_ACCOUNT_ACTION_CONFIG_MAP,
  COMPANY_BANK_ACCOUNT_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_COMPANY_BANK_ACCOUNT_FORM_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { ICompanyBankAccount } from '../../types/company-bank-account.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { ECompanyBankAccountStatus } from '../../types/company-bank-account.enum';

@Component({
  selector: 'app-get-company-bank-account',
  imports: [PageHeaderComponent, SearchFilterComponent, DataTableComponent],
  templateUrl: './get-company-bank-account.component.html',
  styleUrl: './get-company-bank-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetCompanyBankAccountComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly companyBankAccountService = inject(
    CompanyBankAccountService
  );
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      COMPANY_BANK_ACCOUNT_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_COMPANY_BANK_ACCOUNT_FORM_CONFIG;
  }

  private loadCompanyBankAccountList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.companyBankAccountService
      .getCompanyBankAccountList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ICompanyBankAccountGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Company bank account records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction(
            'Failed to load company bank account records',
            error
          );
        },
      });
  }

  private prepareParamData(): ICompanyBankAccountGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<ICompanyBankAccountGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: ICompanyBankAccountGetBaseResponseDto[]
  ): ICompanyBankAccount[] {
    return response.map(record => ({
      id: record.id,
      bankName: record.bankName,
      bankNameDisplay: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.bankNames(),
        record.bankName
      ),
      accountHolderName: record.accountHolderName,
      accountNumber: record.accountNumber,
      ifscCode: record.ifscCode,
      branchName: record.branchName?.trim() ?? '—',
      isActive: record.isActive,
      status: record.isActive
        ? ECompanyBankAccountStatus.ACTIVE
        : ECompanyBankAccountStatus.INACTIVE,
      addedAt: record.createdAt,
      originalRawData: record,
    }));
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadCompanyBankAccountList();
  }

  protected handleCompanyBankAccountTableActionClick(
    event: ITableActionClickEvent<ICompanyBankAccountGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditCompanyBankAccount(
        selectedFirstRow.id,
        selectedFirstRow
      );
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadCompanyBankAccountList();
      },
    };

    const recordDetail =
      this.prepareCompanyBankAccountRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      COMPANY_BANK_ACCOUNT_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareCompanyBankAccountRecordDetail(
    selectedRow: ICompanyBankAccountGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Bank Name',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.bankNames(),
          selectedRow.bankName
        ),
      },
      {
        label: 'Account Holder Name',
        value: selectedRow.accountHolderName,
      },
      {
        label: 'Account Number',
        value: selectedRow.accountNumber,
      },
      {
        label: 'IFSC Code',
        value: selectedRow.ifscCode,
      },
      {
        label: 'Branch Name',
        value: selectedRow.branchName ?? '—',
      },
      {
        label: 'Status',
        value: selectedRow.isActive
          ? ECompanyBankAccountStatus.ACTIVE
          : ECompanyBankAccountStatus.INACTIVE,
      },
    ];

    return {
      details: [
        {
          entryData,
        },
      ],
      entity: {
        name: selectedRow.accountHolderName,
        subtitle: selectedRow.accountNumber,
      },
    };
  }

  private navigateToEditCompanyBankAccount(
    companyBankAccountId: string,
    selectedRow: ICompanyBankAccountGetBaseResponseDto
  ): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.COMPANY_BANK_ACCOUNT,
      ROUTES.COMPANY_BANK_ACCOUNT.EDIT,
      companyBankAccountId,
    ];

    const success = this.routerNavigationService.navigateWithState(
      routeSegments,
      { companyBankAccountData: selectedRow }
    );

    if (!success) {
      this.logger.logUserAction(
        'Navigation failed for edit company bank account',
        { companyBankAccountId }
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName !== 'addCompanyBankAccount') {
      return;
    }

    const success = this.routerNavigationService.navigateToRoute([
      ROUTE_BASE_PATHS.COMPANY_BANK_ACCOUNT,
      ROUTES.COMPANY_BANK_ACCOUNT.ADD,
    ]);

    if (!success) {
      this.logger.logUserAction(
        'Navigation failed for add company bank account'
      );
    }
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Company Bank Account',
      subtitle: 'Manage company bank account records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Company Bank Account',
          actionName: 'addCompanyBankAccount',
          permission: [APP_PERMISSION.COMPANY_BANK_ACCOUNT.ADD],
        },
      ],
    };
  }
}
