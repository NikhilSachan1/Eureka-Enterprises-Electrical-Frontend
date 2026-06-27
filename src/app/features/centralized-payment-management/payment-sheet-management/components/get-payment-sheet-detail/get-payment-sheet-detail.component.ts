import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BankDetailsCellComponent } from '@features/centralized-payment-management/shared/components/bank-details-cell/bank-details-cell.component';
import { PaymentOutstandingSectionComponent } from '@features/centralized-payment-management/shared/components/payment-outstanding-section/payment-outstanding-section.component';
import {
  EPaymentOutstandingSectionContext,
  EPaymentOutstandingSourceType,
} from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { AppConfigurationService, TableService } from '@shared/services';
import { IEnhancedTable, IPageHeaderConfig } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { createPaymentSheetDetailItemsTableConfig } from '../../config/table/get-payment-sheet-detail-items.config';
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

  private mapItems(
    items: IPaymentSheetItemDetailDto[]
  ): IPaymentSheetDetailItemRow[] {
    return items.map(item => ({
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

  private buildPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Payment Sheet',
      subtitle: 'Payment sheet beneficiaries',
      showHeaderButton: false,
      showGoBackButton: true,
    };
  }
}
