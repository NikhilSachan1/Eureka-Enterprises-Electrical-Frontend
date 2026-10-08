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
import { BankDetailsCellComponent } from '@shared/components/bank-details-cell/bank-details-cell.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EBankDetailsDisplayMode,
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import {
  getMappedValueFromArrayOfObjects,
  mapPaidFromAccountToBankDetails,
} from '@shared/utility';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { WALLET_RECHARGE_ACTION_CONFIG_MAP } from '../../config/dialog/get-wallet-recharge.config';
import { SEARCH_FILTER_WALLET_RECHARGES_FORM_CONFIG } from '../../config/form/search-filter-wallet.config';
import { WALLET_RECHARGE_TABLE_ENHANCED_CONFIG } from '../../config/table/get-wallet.config';
import { PetroCardWalletService } from '../../services/petro-card-wallet.service';
import {
  IWalletRechargeGetBaseResponseDto,
  IWalletRechargeGetFormDto,
} from '../../types/petro-card-wallet.dto';
import { IWalletRecharge } from '../../types/petro-card-wallet.interface';
import {
  getWalletRechargeStatus,
  isWalletRechargeEditable,
  isWalletRechargePaid,
} from '../../utils/wallet-recharge-payment.util';

@Component({
  selector: 'app-get-petro-card-wallet',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    DataTableComponent,
    PetroCardWalletDashboardComponent,
    BankDetailsCellComponent,
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
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly EBankDetailsDisplayMode = EBankDetailsDisplayMode;

  protected rechargeTable!: IEnhancedTable;
  protected rechargeSearchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly walletBalanceCard = viewChild(
    PetroCardWalletDashboardComponent
  );

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
    this.openAddRechargeDialog();
  }

  protected handleRechargeAction(
    event: ITableActionClickEvent<IWalletRechargeGetBaseResponseDto>
  ): void {
    const row = event.selectedRows[0];
    if (!row) {
      return;
    }
    if (event.actionType === EButtonActionType.EDIT) {
      this.openEditRechargeDialog(row);
      return;
    }
    if (event.actionType === EButtonActionType.DELETE) {
      this.confirmDelete(row.id, row.amount, row.referenceNumber ?? null);
    }
  }

  private openAddRechargeDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      WALLET_RECHARGE_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        onSuccess: () => this.refreshAfterMutation(),
      }
    );
  }

  private openEditRechargeDialog(
    record: IWalletRechargeGetBaseResponseDto
  ): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.EDIT,
      WALLET_RECHARGE_ACTION_CONFIG_MAP[EButtonActionType.EDIT],
      null,
      false,
      false,
      {
        selectedRecord: [record],
        onSuccess: () => this.refreshAfterMutation(),
      }
    );
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
          this.appConfigurationService.runAfterTouchedConfiguration(
            () => this.mapTableData(response.records),
            mappedData => this.rechargeTable.setData(mappedData)
          );
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
    return records.map(record => {
      const status = getWalletRechargeStatus(record);
      const isPaid = isWalletRechargePaid(record);
      const bankName = record.paidFromAccount?.bankName?.trim();

      return {
        id: record.id,
        rechargeDate: record.rechargeDate,
        amount: record.amount,
        referenceNumber: record.referenceNumber ?? null,
        status,
        statusLabel: status === 'PAID' ? 'Paid' : 'Pending',
        editable: isWalletRechargeEditable(record),
        isPaymentRecorded: isPaid,
        paymentModeLabel: record.paymentMode
          ? getMappedValueFromArrayOfObjects(
              this.appConfigurationService.expensePaymentMethods(),
              record.paymentMode
            )
          : null,
        paidFromBankName: bankName
          ? getMappedValueFromArrayOfObjects(
              this.appConfigurationService.bankNames(),
              bankName
            )
          : null,
        paidFromAccount: record.paidFromAccount
          ? mapPaidFromAccountToBankDetails(record.paidFromAccount)
          : null,
        originalRawData: record,
      };
    });
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
        onSuccess: () => this.refreshAfterMutation(),
      }
    );
  }

  private refreshAfterMutation(): void {
    this.loadRecharges();
    this.walletBalanceCard()?.reloadBalance();
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
