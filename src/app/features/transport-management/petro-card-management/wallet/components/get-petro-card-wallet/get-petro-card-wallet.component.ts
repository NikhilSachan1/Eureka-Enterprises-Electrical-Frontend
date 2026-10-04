import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants';
import { LoggerService } from '@core/services';
import { PetroCardWalletDashboardComponent } from '@features/dashboard/components/petro-card-wallet-dashboard/petro-card-wallet-dashboard.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  EDrawerSize,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { WALLET_RECHARGE_ACTION_CONFIG_MAP } from '../../config/dialog/delete-wallet-recharge.config';
import { SEARCH_FILTER_WALLET_RECHARGES_FORM_CONFIG } from '../../config/form/search-filter-wallet.config';
import { WALLET_RECHARGE_TABLE_ENHANCED_CONFIG } from '../../config/table/get-wallet.config';
import { PetroCardWalletService } from '../../services/petro-card-wallet.service';
import {
  IWalletRechargeGetBaseResponseDto,
  IWalletRechargeGetFormDto,
} from '../../types/petro-card-wallet.dto';
import { IWalletRecharge } from '../../types/petro-card-wallet.interface';
import { GetWalletRechargeDetailComponent } from '../get-wallet-recharge-detail/get-wallet-recharge-detail.component';

@Component({
  selector: 'app-get-petro-card-wallet',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    DataTableComponent,
    PetroCardWalletDashboardComponent,
  ],
  templateUrl: './get-petro-card-wallet.component.html',
  styleUrl: './get-petro-card-wallet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPetroCardWalletComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly walletService = inject(PetroCardWalletService);
  private readonly dataTableService = inject(TableService);
  private readonly tableParams = inject(TableServerSideParamsBuilderService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly drawerService = inject(DrawerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected rechargeTable!: IEnhancedTable;
  protected rechargeSearchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly walletBalanceCard = viewChild(PetroCardWalletDashboardComponent);

  protected readonly pageHeaderConfig = computed(() =>
    this.getPageHeaderConfig()
  );

  private rechargeFilterData?: TableLazyLoadEvent;

  ngOnInit(): void {
    this.rechargeTable = this.dataTableService.createTable(
      WALLET_RECHARGE_TABLE_ENHANCED_CONFIG
    );
    this.rechargeSearchFilterConfig =
      SEARCH_FILTER_WALLET_RECHARGES_FORM_CONFIG;
  }

  protected onRechargeTableStateChange(event: TableLazyLoadEvent): void {
    this.rechargeFilterData = event;
    this.loadRecharges();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName !== 'addWalletRecharge') {
      return;
    }
    void this.routerNavigationService.navigateToRoute([
      ROUTE_BASE_PATHS.TRANSPORT,
      ROUTE_BASE_PATHS.PETRO_CARD,
      ROUTES.PETRO_CARD.WALLET,
      ROUTES.PETRO_CARD.WALLET_ADD,
    ]);
  }

  protected handleRechargeAction(
    event: ITableActionClickEvent<IWalletRechargeGetBaseResponseDto>
  ): void {
    const row = event.selectedRows[0];
    if (!row) {
      return;
    }
    if (event.actionType === EButtonActionType.VIEW) {
      this.showRechargeDetailsDrawer(row);
      return;
    }
    if (event.actionType === EButtonActionType.EDIT) {
      this.openRechargeEditor(row);
      return;
    }
    if (event.actionType === EButtonActionType.DELETE) {
      this.confirmDelete(row.id, row.amount, row.referenceNumber ?? null);
    }
  }

  private showRechargeDetailsDrawer(
    rowData: IWalletRechargeGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Opening wallet recharge details drawer', rowData);

    this.drawerService.showDrawer(GetWalletRechargeDetailComponent, {
      header: 'Recharge Details',
      subtitle: 'Detailed view of wallet recharge',
      size: EDrawerSize.MEDIUM,
      componentData: {
        recharge: rowData,
      },
    });
  }

  private loadRecharges(): void {
    if (!this.rechargeFilterData) {
      return;
    }
    this.rechargeTable.setLoading(true);
    const params =
      this.tableParams.buildQueryParams<IWalletRechargeGetFormDto>(
        this.rechargeFilterData,
        this.rechargeTable.getHeaders()
      );

    this.walletService
      .getRecharges(params)
      .pipe(
        finalize(() => this.rechargeTable.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.rechargeTable.setData(this.mapTableData(response.records));
          this.rechargeTable.updateTableConfig({
            totalRecords: response.totalRecords,
          });
        },
        error: () => this.rechargeTable.setData([]),
      });
  }

  private mapTableData(
    records: IWalletRechargeGetBaseResponseDto[]
  ): IWalletRecharge[] {
    return records.map(record => ({
      id: record.id,
      rechargeDate: record.rechargeDate,
      amount: record.amount,
      referenceNumber: record.referenceNumber ?? null,
      paymentMode: record.paymentMode
        ? getMappedValueFromArrayOfObjects(
            this.appConfigurationService.expensePaymentMethods(),
            record.paymentMode
          )
        : null,
      originalRawData: record,
    }));
  }

  private openRechargeEditor(record: IWalletRechargeGetBaseResponseDto): void {
    void this.routerNavigationService.navigateWithState(
      [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.PETRO_CARD,
        ROUTES.PETRO_CARD.WALLET,
        ROUTES.PETRO_CARD.WALLET_EDIT,
        record.id,
      ],
      { rechargeData: record }
    );
  }

  private confirmDelete(
    id: string,
    amount: number,
    referenceNumber: string | null
  ): void {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Amount',
        value: amount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      { label: 'Reference', value: referenceNumber || '-' },
    ];
    const recordDetail: IDataViewDetailsWithEntity = {
      details: [{ entryData }],
    };
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.DELETE,
      WALLET_RECHARGE_ACTION_CONFIG_MAP[EButtonActionType.DELETE],
      recordDetail,
      false,
      true,
      {
        rechargeId: id,
        onSuccess: () => {
          this.loadRecharges();
          this.walletBalanceCard()?.reloadBalance();
        },
      }
    );
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'PetroCard Wallet',
      subtitle:
        'One wallet for every PetroCard. Recharge the wallet, not a card.',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Record Recharge',
          actionName: 'addWalletRecharge',
          permission: [APP_PERMISSION.PETRO_CARD.WALLET_MANAGE],
        },
      ],
    };
  }
}
