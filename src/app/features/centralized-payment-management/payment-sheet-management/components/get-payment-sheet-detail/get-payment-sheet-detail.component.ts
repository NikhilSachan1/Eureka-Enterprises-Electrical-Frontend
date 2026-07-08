import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AppPermissionService, LoggerService } from '@core/services';
import { APP_CONFIG } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { BankDetailsCellComponent } from '@shared/components/bank-details-cell/bank-details-cell.component';
import { PaymentSheetAmountsCellComponent } from '@features/centralized-payment-management/shared/components/payment-sheet-amounts-cell/payment-sheet-amounts-cell.component';
import { PaymentOutstandingSectionComponent } from '@features/centralized-payment-management/shared/components/payment-outstanding-section/payment-outstanding-section.component';
import {
  EPaymentOutstandingSectionContext,
  EPaymentOutstandingSourceType,
  getPaymentOutstandingSourceSectionMeta,
} from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import {
  getPaymentSourceTabAccent,
  getPaymentSourceTabIcon,
  getPaymentSourceTabLabel,
} from '@features/centralized-payment-management/shared/utils/payment-source-tab.util';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ICONS } from '@shared/constants';
import {
  ConfirmationDialogService,
  TableService,
  AppConfigurationService,
} from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { finalize } from 'rxjs';
import {
  PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP,
  getPaymentSheetDetailItemsTableConfig,
  PAYMENT_SHEET_DETAIL_WORKFLOW_BUTTONS_CONFIG,
} from '../../config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  EPaymentSheetSourceType,
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetWorkflowActionType,
} from '../../types/payment-sheet.enum';
import {
  IPaymentSheetDetailGetResponseDto,
  IPaymentSheetItemDetailDto,
} from '../../types/payment-sheet.dto';
import {
  IPaymentSheetDetailItemRow,
  IPaymentSheetDetailSourceGroupView,
  IPaymentSheetItemVerificationView,
  IPaymentSheetOverviewView,
} from '../../types/payment-sheet-detail.interface';
import { APP_PERMISSION } from '@core/constants';
import { getPaymentSheetForwardActionForUserRole } from '../../utils/payment-sheet-status.util';
import {
  getPaymentSheetVerificationStageLabel,
  getVisiblePaymentSheetItemVerificationStages,
} from '../../utils/payment-sheet-verification.util';

@Component({
  selector: 'app-get-payment-sheet-detail',
  imports: [
    CurrencyPipe,
    DatePipe,
    PageHeaderComponent,
    DataTableComponent,
    BankDetailsCellComponent,
    PaymentSheetAmountsCellComponent,
    EmptyMessagesComponent,
    ButtonComponent,
    PaymentOutstandingSectionComponent,
  ],
  templateUrl: './get-payment-sheet-detail.component.html',
  styleUrl: './get-payment-sheet-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPaymentSheetDetailComponent implements OnInit {
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;

  protected readonly paidAtDateFormat =
    APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME;
  protected readonly paidAtDateLocale = APP_CONFIG.DATE_FORMATS.DISPLAY_LOCALE;
  protected readonly verifiedAtDateFormat =
    APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME;
  protected readonly overviewDateFormat =
    APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME;
  protected readonly currencyFormat = APP_CONFIG.CURRENCY_CONFIG.DEFAULT;

  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dataTableService = inject(TableService);
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly authService = inject(AuthService);

  private readonly paymentSheetId =
    this.activatedRoute.snapshot.paramMap.get('paymentSheetId') ?? '';

  private readonly sourceSectionOrder: EPaymentSheetSourceType[] = [
    EPaymentSheetSourceType.EXPENSE,
    EPaymentSheetSourceType.FUEL_EXPENSE,
    EPaymentSheetSourceType.VENDOR_PAYMENT,
  ];

  private readonly sourceTypeMap: Record<
    EPaymentSheetSourceType,
    EPaymentOutstandingSourceType
  > = {
    [EPaymentSheetSourceType.EXPENSE]: EPaymentOutstandingSourceType.EXPENSE,
    [EPaymentSheetSourceType.FUEL_EXPENSE]:
      EPaymentOutstandingSourceType.FUEL_EXPENSE,
    [EPaymentSheetSourceType.VENDOR_PAYMENT]:
      EPaymentOutstandingSourceType.VENDOR_PAYMENT,
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

  protected readonly activeTabIndex = model(0);

  protected readonly detailTabs = computed(() =>
    this.sourceGroups().map(group => ({
      value: group.sourceType,
      label: getPaymentSourceTabLabel(group.sourceType),
    }))
  );

  protected readonly sectionOverview = computed(() =>
    this.sourceGroups().map(group => {
      const accent = getPaymentSourceTabAccent(group.sourceType);
      const recordCountLabel = this.getRecordCountLabel(group.sourceType);

      return {
        value: group.sourceType,
        label: getPaymentSourceTabLabel(group.sourceType),
        icon: getPaymentSourceTabIcon(group.sourceType),
        accentLight: accent.light,
        accentDark: accent.dark,
        stats: [
          {
            kind: 'count' as const,
            label: recordCountLabel,
            value: group.recordCount,
          },
          {
            kind: 'currency' as const,
            label: 'Payable',
            value: group.totalCurrentAmount,
            tone: group.totalCurrentAmount > 0 ? ('debit' as const) : null,
          },
        ],
      };
    })
  );

  protected pageHeaderConfig = computed(() => this.buildPageHeaderConfig());

  protected readonly sheetOverview = computed(() => this.buildSheetOverview());

  protected readonly permittedWorkflowButtons = computed(() => {
    const allowedAction = getPaymentSheetForwardActionForUserRole(
      this.authService.user()?.activeRole
    );

    if (!allowedAction) {
      return [];
    }

    return Object.values(
      this.appPermissionService.filterRecordByPermission(
        PAYMENT_SHEET_DETAIL_WORKFLOW_BUTTONS_CONFIG
      )
    ).filter(button => button.actionName === allowedAction);
  });

  ngOnInit(): void {
    for (const sourceType of this.sourceSectionOrder) {
      this.sourceTables.set(
        sourceType,
        this.dataTableService.createTable(
          getPaymentSheetDetailItemsTableConfig(
            sourceType,
            this.authService.user()?.activeRole
          )
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

  protected getRemainingAmount(row: IPaymentSheetDetailItemRow): number {
    return Math.max(0, row.remainingAmount);
  }

  protected isFullyCovered(row: IPaymentSheetDetailItemRow): boolean {
    return row.remainingAmount <= 0;
  }

  protected hasCompanyProjectContext(row: IPaymentSheetDetailItemRow): boolean {
    return !!(
      row.companyName ??
      row.projectName ??
      row.projectCity ??
      row.projectState
    );
  }

  protected getProjectLocation(row: IPaymentSheetDetailItemRow): string {
    return [row.projectCity, row.projectState].filter(Boolean).join(', ');
  }

  protected hasVerificationContext(row: IPaymentSheetDetailItemRow): boolean {
    return this.getVisibleVerificationStages(row).length > 0;
  }

  protected getVisibleVerificationStages(
    row: IPaymentSheetDetailItemRow
  ): EPaymentSheetStage[] {
    return getVisiblePaymentSheetItemVerificationStages(
      this.detail()?.currentStage,
      row.verifiedStages
    );
  }

  protected getVerificationForStage(
    row: IPaymentSheetDetailItemRow,
    stage: string
  ): IPaymentSheetItemVerificationView | undefined {
    return row.verifications.find(verification => verification.stage === stage);
  }

  protected isCurrentVerificationStage(stage: string): boolean {
    return this.detail()?.currentStage === stage;
  }

  protected getVerificationStageLabel(stage: string): string {
    return getPaymentSheetVerificationStageLabel(stage);
  }

  protected onHeaderButtonClick(actionType: string): void {
    if (actionType !== EButtonActionType.ADD || !this.paymentSheetId) {
      return;
    }

    this.openAddBeneficiariesDialog();
  }

  protected onWorkflowActionClick(actionType: string): void {
    if (!this.paymentSheetId || !actionType) {
      return;
    }

    const workflowActionType = actionType as EPaymentSheetWorkflowActionType;

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.SUBMIT,
      PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP[workflowActionType],
      null,
      false,
      false,
      {
        paymentSheetId: this.paymentSheetId,
        workflowActionType,
        onSuccess: () => this.reloadDetail(),
      }
    );
  }

  private openAddBeneficiariesDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        paymentSheetId: this.paymentSheetId,
        existingItems: this.detail()?.items ?? [],
        onSuccess: () => this.reloadDetail(),
      }
    );
  }

  protected handlePaymentSheetItemActionClick(
    event: ITableActionClickEvent<IPaymentSheetDetailItemRow>,
    isBulk = false
  ): void {
    const { actionType, selectedRows } = event;
    const selectedRow = selectedRows[0];

    if (!selectedRows.length || !this.paymentSheetId) {
      this.logger.error(
        'Payment sheet item action: selected rows or payment sheet id missing'
      );
      return;
    }

    if (!isBulk && !selectedRow?.id) {
      this.logger.error('Payment sheet item action: selected row id missing');
      return;
    }

    if (
      actionType !== EButtonActionType.EDIT &&
      actionType !== EButtonActionType.DELETE &&
      actionType !== EButtonActionType.APPROVE &&
      actionType !== EButtonActionType.UNVERIFY &&
      actionType !== EButtonActionType.REJECT &&
      actionType !== EButtonActionType.PAID
    ) {
      return;
    }

    const actionConfig = PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP[actionType];

    if (!actionConfig) {
      return;
    }

    const showItemDetail =
      !isBulk &&
      (actionType === EButtonActionType.DELETE ||
        actionType === EButtonActionType.APPROVE ||
        actionType === EButtonActionType.UNVERIFY ||
        actionType === EButtonActionType.REJECT ||
        actionType === EButtonActionType.PAID);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      actionConfig,
      showItemDetail && selectedRow
        ? this.prepareItemRecordDetail(selectedRow)
        : null,
      isBulk,
      showItemDetail,
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
      const mappedItems =
        sourceType === EPaymentSheetSourceType.VENDOR_PAYMENT
          ? this.mapVendorAllocationRows(sectionItems, detail)
          : this.mapItems(sectionItems, detail);
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

    if (this.activeTabIndex() >= groups.length) {
      this.activeTabIndex.set(0);
    }
  }

  private reloadDetail(): void {
    if (!this.paymentSheetId) {
      return;
    }

    this.setSourceTablesLoading(true);

    this.paymentSheetService
      .getPaymentSheetDetailById({ paymentSheetId: this.paymentSheetId })
      .pipe(
        finalize(() => this.setSourceTablesLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: detail => {
          this.applyDetail(detail);
        },
        error: error => {
          this.logger.error('Failed to reload payment sheet detail', error);
        },
      });
  }

  private setSourceTablesLoading(loading: boolean): void {
    for (const table of this.sourceTables.values()) {
      table.setLoading(loading);
    }
  }

  private mapItems(
    items: IPaymentSheetItemDetailDto[],
    detail: IPaymentSheetDetailGetResponseDto
  ): IPaymentSheetDetailItemRow[] {
    return items.map(item => this.mapItem(item, detail));
  }

  private mapItem(
    item: IPaymentSheetItemDetailDto,
    detail: IPaymentSheetDetailGetResponseDto
  ): IPaymentSheetDetailItemRow {
    return {
      ...this.getWorkflowFields(detail),
      id: item.id,
      beneficiaryId: item.userId ?? item.vendorId ?? '',
      actualDue: item.actualDueAmount,
      payableAmount: item.payableAmount,
      remainingAmount: item.remainingAmount,
      beneficiaryName: item.user
        ? `${item.user.firstName} ${item.user.lastName}`.trim()
        : (item.vendor?.name ?? '-'),
      beneficiaryCode:
        item.user?.employeeId ?? this.formatVendorLocation(item.vendor),
      itemStatus: item.itemStatus,
      paidAt: item.paidAt ?? null,
      paymentRef: item.paymentRef ?? null,
      bankDetails: item.bankSnapshot
        ? {
            bankHolderName: item.bankSnapshot.accountHolderName,
            bankName: item.bankSnapshot.bankName,
            accountNumber: item.bankSnapshot.accountNumber,
            ifscCode: item.bankSnapshot.ifscCode,
          }
        : null,
      ...this.mapItemVerificationFields(item),
    };
  }

  private mapItemVerificationFields(
    item: IPaymentSheetItemDetailDto
  ): Pick<
    IPaymentSheetDetailItemRow,
    'verifications' | 'verifiedStages' | 'isVerifiedForCurrentStage'
  > {
    return {
      verifications: item.verifications,
      verifiedStages: item.verifiedStages,
      isVerifiedForCurrentStage: item.isVerifiedForCurrentStage,
    };
  }

  private mapVendorAllocationRows(
    items: IPaymentSheetItemDetailDto[],
    detail: IPaymentSheetDetailGetResponseDto
  ): IPaymentSheetDetailItemRow[] {
    return items.flatMap(item => {
      const bankDetails = item.bankSnapshot
        ? {
            bankHolderName: item.bankSnapshot.accountHolderName,
            bankName: item.bankSnapshot.bankName,
            accountNumber: item.bankSnapshot.accountNumber,
            ifscCode: item.bankSnapshot.ifscCode,
          }
        : null;

      return (item.bookPaymentAllocations ?? []).map(allocation => {
        const { invoice } = allocation;

        return {
          ...this.getWorkflowFields(detail),
          id: item.id,
          beneficiaryId: item.vendorId ?? '',
          beneficiaryName: item.vendor?.name ?? '-',
          beneficiaryCode: this.formatVendorLocation(item.vendor),
          companyName: invoice?.companyName ?? '-',
          projectName: invoice?.projectName ?? '-',
          projectCity: invoice?.city,
          projectState: invoice?.state,
          invoiceNumber: invoice?.invoiceNumber ?? '-',
          invoiceDate: invoice?.invoiceDate ?? null,
          actualDue: invoice?.actualDueAmount ?? item.actualDueAmount,
          payableAmount: invoice?.payableAmount ?? item.payableAmount,
          remainingAmount: invoice?.remainingAmount ?? item.remainingAmount,
          itemStatus: item.itemStatus,
          paidAt: item.paidAt ?? null,
          paymentRef: item.paymentRef ?? null,
          bankDetails,
          ...this.mapItemVerificationFields(item),
        };
      });
    });
  }

  private formatVendorLocation(
    vendor: IPaymentSheetItemDetailDto['vendor']
  ): string {
    const location = [vendor?.city, vendor?.state].filter(Boolean).join(', ');

    return location || '-';
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
    const detail = this.detail();

    return {
      title: detail?.sheetNumber ?? 'Payment Sheet Detail',
      subtitle:
        detail?.title?.trim() ?? 'Review sheet overview and beneficiaries',
      showHeaderButton: true,
      showGoBackButton: true,
      headerButtonConfig: [
        {
          id: EButtonActionType.ADD,
          actionName: EButtonActionType.ADD,
          label: 'Add Beneficiaries',
          icon: ICONS.COMMON.USERS,
          permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_ADD],
        },
      ],
    };
  }

  private getWorkflowFields(
    detail: IPaymentSheetDetailGetResponseDto
  ): Pick<IPaymentSheetDetailItemRow, 'status' | 'currentStage'> {
    return {
      status: detail.status,
      currentStage: detail.currentStage,
    };
  }

  private buildSheetOverview(): IPaymentSheetOverviewView | undefined {
    const detail = this.detail();

    if (!detail) {
      return undefined;
    }

    const { totalCurrentAmount } = detail;
    const { totalPaidAmount } = detail;
    const { verificationSummary } = detail;

    return {
      stageLabel: this.getDetailStageLabel(detail),
      createdAt: detail.createdAt,
      beneficiaryCount: detail.items.length,
      verificationSummary: verificationSummary
        ? {
            verified: verificationSummary.verified,
            total: verificationSummary.total,
            allVerified: verificationSummary.allVerified,
            stageLabel: getPaymentSheetVerificationStageLabel(
              verificationSummary.stage
            ),
          }
        : null,
      totalRequestedAmount: detail.totalRequestedAmount,
      totalCurrentAmount,
      totalPaidAmount,
      pendingAmount: Math.max(0, totalCurrentAmount - totalPaidAmount),
      remarks: detail.remarks?.trim() ?? null,
    };
  }

  private getDetailStageLabel(
    detail: IPaymentSheetDetailGetResponseDto
  ): string {
    if (
      detail.status === EPaymentSheetStatus.COMPLETED ||
      detail.status === EPaymentSheetStatus.RETURNED
    ) {
      return getMappedValueFromArrayOfObjects(
        this.appConfigurationService.paymentSheetStatuses(),
        detail.status
      );
    }

    if (detail.currentStage) {
      return getMappedValueFromArrayOfObjects(
        this.appConfigurationService.paymentSheetStages(),
        detail.currentStage
      );
    }

    return '—';
  }

  private getRecordCountLabel(
    sourceType: EPaymentOutstandingSourceType
  ): string {
    const unit = getPaymentOutstandingSourceSectionMeta(
      sourceType,
      EPaymentOutstandingSectionContext.PAYMENT_SHEET
    ).recordCountUnit;

    return unit === 'vendor' ? 'Vendors' : 'Employees';
  }
}
