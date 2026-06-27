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
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '@core/services';
import { APP_CONFIG } from '@core/config';
import { BankDetailsCellComponent } from '@features/centralized-payment-management/shared/components/bank-details-cell/bank-details-cell.component';
import { PaymentOutstandingSectionComponent } from '@features/centralized-payment-management/shared/components/payment-outstanding-section/payment-outstanding-section.component';
import {
  EPaymentOutstandingSectionContext,
  EPaymentOutstandingSourceType,
} from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP } from '../../config';
import { createPaymentSheetDetailItemsTableConfig } from '../../config/table/get-payment-sheet-detail-items.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IPaymentSheetDetailGetResponseDto,
  IPaymentSheetItemDetailDto,
} from '../../types/payment-sheet.dto';
import {
  IPaymentSheetDetailItemRow,
  IPaymentSheetDetailSourceGroupView,
} from '../../types/payment-sheet-detail.interface';
import { EPaymentSheetSourceType } from '../../types/payment-sheet.enum';

@Component({
  selector: 'app-get-payment-sheet-detail',
  imports: [
    PageHeaderComponent,
    PaymentOutstandingSectionComponent,
    DataTableComponent,
    BankDetailsCellComponent,
    EmptyMessagesComponent,
  ],
  templateUrl: './get-payment-sheet-detail.component.html',
  styleUrl: './get-payment-sheet-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPaymentSheetDetailComponent implements OnInit {
  protected readonly EPaymentOutstandingSectionContext =
    EPaymentOutstandingSectionContext;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dataTableService = inject(TableService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly paymentSheetId =
    this.activatedRoute.snapshot.paramMap.get('paymentSheetId') ?? '';

  private readonly sourceSectionOrder: EPaymentSheetSourceType[] = [
    EPaymentSheetSourceType.EXPENSE,
    EPaymentSheetSourceType.FUEL_EXPENSE,
  ];

  private readonly sourceTypeMap: Record<
    EPaymentSheetSourceType,
    EPaymentOutstandingSourceType
  > = {
    [EPaymentSheetSourceType.EXPENSE]: EPaymentOutstandingSourceType.EXPENSE,
    [EPaymentSheetSourceType.FUEL_EXPENSE]:
      EPaymentOutstandingSourceType.FUEL_EXPENSE,
  };

  private readonly sourceTables = new Map<
    EPaymentSheetSourceType,
    IEnhancedTable
  >();

  protected readonly detail = signal<IPaymentSheetDetailGetResponseDto | null>(
    null
  );
  protected readonly sourceGroups = signal<
    IPaymentSheetDetailSourceGroupView[]
  >([]);

  protected pageHeaderConfig = computed(() => this.buildPageHeaderConfig());

  ngOnInit(): void {
    for (const sourceType of this.sourceSectionOrder) {
      this.sourceTables.set(
        sourceType,
        this.dataTableService.createTable(
          createPaymentSheetDetailItemsTableConfig()
        )
      );
    }

    const resolvedDetail = this.activatedRoute.snapshot.data[
      'paymentSheetDetail'
    ] as IPaymentSheetDetailGetResponseDto | null;

    if (!resolvedDetail) {
      return;
    }

    this.applyDetail(resolvedDetail);
  }

  protected handlePaymentSheetItemActionClick(
    event: ITableActionClickEvent<IPaymentSheetDetailItemRow>
  ): void {
    const { actionType, selectedRows } = event;
    const selectedRow = selectedRows[0];

    if (!selectedRow?.id || !this.paymentSheetId) {
      this.logger.error(
        'Payment sheet item action: selected row or payment sheet id missing'
      );
      return;
    }

    if (actionType !== EButtonActionType.DELETE) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP[actionType],
      this.prepareItemRecordDetail(selectedRow),
      false,
      true,
      {
        selectedRecord: selectedRows,
        paymentSheetId: this.paymentSheetId,
        onSuccess: () => this.reloadDetail(),
      }
    );
  }

  private applyDetail(detail: IPaymentSheetDetailGetResponseDto): void {
    this.detail.set(detail);

    const items = detail.items ?? [];
    const groups: IPaymentSheetDetailSourceGroupView[] = [];

    for (const sourceType of this.sourceSectionOrder) {
      const sectionItems = items.filter(item => item.sourceType === sourceType);
      const mappedItems = this.mapItems(sectionItems);
      const table = this.sourceTables.get(sourceType);

      if (table) {
        table.setData(mappedItems);

        if (mappedItems.length) {
          groups.push({
            sourceType: this.sourceTypeMap[sourceType],
            recordCount: mappedItems.length,
            totalCurrentAmount: mappedItems.reduce(
              (sum, item) => sum + item.payableAmount,
              0
            ),
            table,
          });
        }
      }
    }

    this.sourceGroups.set(groups);
  }

  private reloadDetail(): void {
    if (!this.paymentSheetId) {
      return;
    }

    this.paymentSheetService
      .getPaymentSheetDetailById({ paymentSheetId: this.paymentSheetId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: detail => {
          this.applyDetail(detail);
        },
        error: error => {
          this.logger.error('Failed to reload payment sheet detail', error);
        },
      });
  }

  private mapItems(
    items: IPaymentSheetItemDetailDto[]
  ): IPaymentSheetDetailItemRow[] {
    return items.map(item => ({
      id: item.id,
      actualDue: item.pendingSnapshot,
      payableAmount: item.currentAmount,
      beneficiaryName: item.user
        ? `${item.user.firstName} ${item.user.lastName}`.trim()
        : '-',
      beneficiaryCode: item.user?.employeeId ?? '',
      itemStatus: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.paymentSheetItemStatuses(),
        item.itemStatus
      ),
      bankDetails: item.bankSnapshot
        ? {
            bankHolderName: item.bankSnapshot.accountHolderName,
            bankName: item.bankSnapshot.bankName,
            accountNumber: item.bankSnapshot.accountNumber,
            ifscCode: item.bankSnapshot.ifscCode,
          }
        : null,
    }));
  }

  private prepareItemRecordDetail(
    row: IPaymentSheetDetailItemRow
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Payable Amount',
        value: row.payableAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
    ];

    return {
      details: [{ entryData }],
      entity: {
        name: row.beneficiaryName,
        subtitle: row.beneficiaryCode,
      },
    };
  }

  private buildPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Payment Sheet',
      subtitle: 'Payment sheet beneficiaries',
      showHeaderButton: false,
      showGoBackButton: true,
    };
  }
}
