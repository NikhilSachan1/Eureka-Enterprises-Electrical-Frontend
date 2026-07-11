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
  DrawerService,
  GalleryService,
  TableService,
  AppConfigurationService,
} from '@shared/services';
import {
  getMappedValueFromArrayOfObjects,
  mapPaidFromAccountToBankDetails,
} from '@shared/utility';
import {
  EButtonActionType,
  EDataType,
  EDrawerSize,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IGalleryInputData,
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
import { PaymentSheetTimelineDrawerComponent } from '../payment-sheet-timeline-drawer/payment-sheet-timeline-drawer.component';
import {
  EPaymentSheetSourceType,
  EPaymentSheetStage,
  EPaymentSheetStatus,
  EPaymentSheetTimelineMode,
  EPaymentSheetWorkflowActionType,
  EPaymentSheetItemStatus,
} from '../../types/payment-sheet.enum';
import {
  IPaymentSheetDetailGetResponseDto,
  IPaymentSheetItemDetailDto,
} from '../../types/payment-sheet.dto';
import {
  IPaymentSheetDetailItemRow,
  IPaymentSheetDetailSourceGroupView,
  IPaymentSheetItemRejectView,
  IPaymentSheetItemVerificationView,
  IPaymentSheetOverviewView,
  IPaymentSheetPaymentAdviceView,
} from '../../types/payment-sheet-detail.interface';
import { APP_PERMISSION } from '@core/constants';
import {
  getPaymentSheetForwardActionForUserRole,
  getPaymentSheetForwardDisableReason,
  getPaymentSheetCurrentOwnerBanner,
  isPaymentSheetForwardActionAllowed,
} from '../../utils/payment-sheet-status.util';
import {
  getPaymentSheetVerificationStageLabel,
  getVisiblePaymentSheetItemVerificationStages,
} from '../../utils/payment-sheet-verification.util';
import {
  isPaymentSheetItemPaid,
  isPaymentSheetItemRejected,
} from '../../utils/payment-sheet-table-row.util';

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
  private readonly drawerService = inject(DrawerService);
  private readonly galleryService = inject(GalleryService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly authService = inject(AuthService);

  protected readonly paymentSheetId =
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

  protected readonly currentOwnerBanner = computed(() => {
    const detail = this.detail();

    if (!detail) {
      return null;
    }

    return getPaymentSheetCurrentOwnerBanner(this.getWorkflowFields(detail));
  });

  protected readonly permittedWorkflowButtons = computed(() => {
    const detail = this.detail();
    const allowedAction = getPaymentSheetForwardActionForUserRole(
      this.authService.user()?.activeRole
    );

    if (!allowedAction || !detail) {
      return [];
    }

    return Object.values(
      this.appPermissionService.filterRecordByPermission(
        PAYMENT_SHEET_DETAIL_WORKFLOW_BUTTONS_CONFIG
      )
    )
      .filter(button => button.actionName === allowedAction)
      .map(button => {
        const workflowAction =
          button.actionName as EPaymentSheetWorkflowActionType;

        return {
          ...button,
          disabled: !isPaymentSheetForwardActionAllowed(detail, workflowAction),
          disabledTooltip: getPaymentSheetForwardDisableReason(
            detail,
            workflowAction
          ),
        };
      });
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

  protected hasStatusContext(row: IPaymentSheetDetailItemRow): boolean {
    return (
      this.hasVerificationContext(row) ||
      this.shouldShowPaymentStatus(row) ||
      this.hasRejectContext(row)
    );
  }

  protected hasRejectContext(row: IPaymentSheetDetailItemRow): boolean {
    return !!row.rejectDetail;
  }

  protected hasVerificationContext(row: IPaymentSheetDetailItemRow): boolean {
    return this.getVisibleVerificationStages(row).length > 0;
  }

  protected shouldShowPaymentStatus(row: IPaymentSheetDetailItemRow): boolean {
    const detail = this.detail();

    if (!detail) {
      return false;
    }

    return (
      !isPaymentSheetItemRejected(row) &&
      !this.hasRejectContext(row) &&
      (detail.status === EPaymentSheetStatus.PROCESSING ||
        detail.status === EPaymentSheetStatus.COMPLETED ||
        detail.currentStage === EPaymentSheetStage.PROCESSING ||
        isPaymentSheetItemPaid(row))
    );
  }

  protected isItemPaid(row: IPaymentSheetDetailItemRow): boolean {
    return isPaymentSheetItemPaid(row);
  }

  protected getPaidFromAccountBankName(
    row: IPaymentSheetDetailItemRow
  ): string | null {
    const bankName = row.paidFromAccount?.bankName?.trim();

    if (!bankName) {
      return null;
    }

    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.bankNames(),
      bankName
    );
  }

  protected viewPaymentAdvicePdf(pdfKey: string | null | undefined): void {
    const normalizedKey = pdfKey?.trim();

    if (!normalizedKey) {
      return;
    }

    const media: IGalleryInputData[] = [
      {
        mediaKey: normalizedKey,
        actualMediaUrl: '',
      },
    ];

    this.galleryService.show(media);
  }

  protected isCurrentPaymentStage(): boolean {
    const detail = this.detail();

    return (
      detail?.status === EPaymentSheetStatus.PROCESSING &&
      detail.currentStage === EPaymentSheetStage.PROCESSING
    );
  }

  protected getVisibleVerificationStages(
    row: IPaymentSheetDetailItemRow
  ): EPaymentSheetStage[] {
    if (this.hasRejectContext(row)) {
      return getVisiblePaymentSheetItemVerificationStages(
        this.detail()?.currentStage,
        row.verifiedStages,
        {
          onlyVerifiedStages: row.verifications.map(
            verification => verification.stage
          ),
        }
      );
    }

    return getVisiblePaymentSheetItemVerificationStages(
      this.detail()?.currentStage,
      row.verifiedStages
    );
  }

  protected getVerificationForStage(
    row: IPaymentSheetDetailItemRow,
    stage: string
  ): IPaymentSheetItemVerificationView | undefined {
    const normalizedStage = stage.toUpperCase();

    return row.verifications.find(
      verification => verification.stage.toUpperCase() === normalizedStage
    );
  }

  protected isCurrentVerificationStage(stage: string): boolean {
    return this.detail()?.currentStage === stage;
  }

  protected getVerificationStageLabel(stage: string): string {
    return getPaymentSheetVerificationStageLabel(stage);
  }

  protected onHeaderButtonClick(actionType: string): void {
    const detail = this.detail();

    if (
      actionType === EButtonActionType.DOWNLOAD &&
      this.paymentSheetId &&
      detail
    ) {
      this.openDownloadPdfDialog();
      return;
    }

    if (
      actionType !== EButtonActionType.ADD ||
      !this.paymentSheetId ||
      !detail ||
      (detail.status !== EPaymentSheetStatus.DRAFT &&
        detail.status !== EPaymentSheetStatus.RETURNED)
    ) {
      return;
    }

    this.openAddBeneficiariesDialog();
  }

  private openDownloadPdfDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.DOWNLOAD,
      PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP[EButtonActionType.DOWNLOAD],
      null,
      false,
      false,
      {
        paymentSheetId: this.paymentSheetId,
      }
    );
  }

  protected onWorkflowActionClick(actionType: string): void {
    const detail = this.detail();

    if (!this.paymentSheetId || !actionType || !detail) {
      return;
    }

    const workflowActionType = actionType as EPaymentSheetWorkflowActionType;

    if (!isPaymentSheetForwardActionAllowed(detail, workflowActionType)) {
      return;
    }

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

    if (
      actionType === EButtonActionType.EVENT_HISTORY &&
      !isBulk &&
      selectedRow
    ) {
      this.openItemHistoryDrawer(selectedRow);
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

  private openItemHistoryDrawer(row: IPaymentSheetDetailItemRow): void {
    const detail = this.detail();

    this.drawerService.showDrawer(PaymentSheetTimelineDrawerComponent, {
      header: 'Activity Timeline',
      subtitle: 'View payment sheet workflow and activity history',
      size: EDrawerSize.SMALL,
      componentData: {
        mode: EPaymentSheetTimelineMode.ITEM_HISTORY,
        itemId: row.id,
        history: detail?.history ?? [],
        paidFromAccount: row.paidFromAccount,
        paymentAdvice: row.paymentAdvice,
        sheetNumber: detail?.sheetNumber ?? '—',
        contextSubtitle: `${row.beneficiaryName} · ${row.beneficiaryCode}`,
      },
    });
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
      paidByUserName: this.mapPaidByUserName(item.paidByUser),
      paidFromAccount: mapPaidFromAccountToBankDetails(item.paidFromAccount),
      paymentAdvice: null,
      bankDetails: item.bankSnapshot
        ? {
            bankHolderName: item.bankSnapshot.accountHolderName,
            bankName: item.bankSnapshot.bankName,
            accountNumber: item.bankSnapshot.accountNumber,
            ifscCode: item.bankSnapshot.ifscCode,
          }
        : null,
      ...this.mapItemVerificationFields(item),
      rejectDetail: this.mapItemRejectDetail(item),
    };
  }

  private mapPaidByUserName(
    paidByUser: IPaymentSheetItemDetailDto['paidByUser']
  ): string | null {
    if (!paidByUser) {
      return null;
    }

    const name = `${paidByUser.firstName} ${paidByUser.lastName}`.trim();

    return name || null;
  }

  private mapItemRejectDetail(
    item: IPaymentSheetItemDetailDto
  ): IPaymentSheetItemRejectView | null {
    if (item.rejectDetail) {
      const { rejectedBy } = item.rejectDetail;

      return {
        stage: item.rejectDetail.stage ?? null,
        rejectedByName: rejectedBy
          ? `${rejectedBy.firstName} ${rejectedBy.lastName}`.trim()
          : '—',
        rejectedAt: item.rejectDetail.rejectedAt,
        reason: item.rejectDetail.reason?.trim() || '—',
      };
    }

    const isRejected =
      item.itemStatus?.toLowerCase() === EPaymentSheetItemStatus.REJECTED;

    if (!isRejected && !item.rejectReason?.trim() && !item.rejectedAt) {
      return null;
    }

    return {
      stage: item.rejectStage ?? null,
      rejectedByName: '—',
      rejectedAt: item.rejectedAt ?? '',
      reason: item.rejectReason?.trim() ?? '—',
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
          paidByUserName: this.mapPaidByUserName(item.paidByUser),
          paidFromAccount: mapPaidFromAccountToBankDetails(
            item.paidFromAccount
          ),
          paymentAdvice: this.mapPaymentAdvice(allocation.paymentAdvice),
          bankDetails,
          ...this.mapItemVerificationFields(item),
          rejectDetail: this.mapItemRejectDetail(item),
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

  private mapPaymentAdvice(
    paymentAdvice: NonNullable<
      IPaymentSheetItemDetailDto['bookPaymentAllocations']
    >[number]['paymentAdvice']
  ): IPaymentSheetPaymentAdviceView | null {
    if (!paymentAdvice) {
      return null;
    }

    return {
      referenceNumber: paymentAdvice.referenceNumber,
      pdfKey: paymentAdvice.pdfKey ?? null,
    };
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
    const canAddBeneficiaries =
      detail?.status === EPaymentSheetStatus.DRAFT ||
      detail?.status === EPaymentSheetStatus.RETURNED;

    return {
      title: detail?.sheetNumber ?? 'Payment Sheet Detail',
      subtitle:
        detail?.title?.trim() ?? 'Review sheet overview and beneficiaries',
      showHeaderButton: true,
      showGoBackButton: true,
      headerButtonConfig: [
        {
          id: EButtonActionType.DOWNLOAD,
          actionName: EButtonActionType.DOWNLOAD,
          label: 'Download PDF',
          icon: ICONS.COMMON.DOWNLOAD,
          permission: [APP_PERMISSION.PAYMENT_SHEET.DOWNLOAD],
        },
        {
          id: EButtonActionType.ADD,
          actionName: EButtonActionType.ADD,
          label: 'Add Beneficiaries',
          icon: ICONS.COMMON.USERS,
          permission: [APP_PERMISSION.PAYMENT_SHEET.BENEFICIARY_ADD],
          disabled: !canAddBeneficiaries,
          disabledTooltip: canAddBeneficiaries
            ? undefined
            : 'Add beneficiaries is only available while the payment sheet is in draft or returned.',
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
      createdAt: detail.createdAt,
      createdByName: this.resolveCreatedByName(detail.createdByUser),
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

  private resolveCreatedByName(
    user: IPaymentSheetDetailGetResponseDto['createdByUser']
  ): string | null {
    if (!user) {
      return null;
    }

    const name = `${user.firstName} ${user.lastName}`.trim();

    return name || null;
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
