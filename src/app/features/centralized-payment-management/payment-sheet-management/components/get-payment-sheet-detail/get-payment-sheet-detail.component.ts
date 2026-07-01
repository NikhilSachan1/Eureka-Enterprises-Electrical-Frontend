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
import { DatePipe } from '@angular/common';
import { AppPermissionService, LoggerService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { APP_CONFIG } from '@core/config';
import { BankDetailsCellComponent } from '@features/centralized-payment-management/shared/components/bank-details-cell/bank-details-cell.component';
import { PaymentSheetAmountsCellComponent } from '@features/centralized-payment-management/shared/components/payment-sheet-amounts-cell/payment-sheet-amounts-cell.component';
import { PaymentOutstandingSectionComponent } from '@features/centralized-payment-management/shared/components/payment-outstanding-section/payment-outstanding-section.component';
import {
  EPaymentOutstandingSectionContext,
  EPaymentOutstandingSourceType,
} from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DEFAULT_ROW_ACTION_CONFIG } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EButtonSeverity,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IButtonConfig,
  IPageHeaderConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { finalize } from 'rxjs';
import { PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP } from '../../config';
import {
  buildPaymentSheetDetailItemsRowActionsConfig,
  createPaymentSheetDetailItemsTableConfig,
} from '../../config/table/get-payment-sheet-detail-items.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  getPaymentSheetDetailActionDisableReason,
  getPaymentSheetWorkflowPermissions,
  isPaymentSheetDetailActionDisabled,
  PAYMENT_SHEET_FORWARD_ACTION_PERMISSION,
  toPaymentSheetDetailAction,
} from '../../utils/payment-sheet-status.util';
import {
  IPaymentSheetDetailGetResponseDto,
  IPaymentSheetItemDetailDto,
} from '../../types/payment-sheet.dto';
import {
  IPaymentSheetDetailItemRow,
  IPaymentSheetDetailSourceGroupView,
} from '../../types/payment-sheet-detail.interface';
import {
  EPaymentSheetDetailAction,
  EPaymentSheetSourceType,
  EPaymentSheetWorkflowActionType,
  PAYMENT_SHEET_WORKFLOW_ACTION_TYPES,
} from '../../types/payment-sheet.enum';
import {
  IPaymentSheetWorkflowPermissions,
  IPaymentSheetWorkflowRow,
} from '../../types/payment-sheet.interface';

@Component({
  selector: 'app-get-payment-sheet-detail',
  imports: [
    DatePipe,
    PageHeaderComponent,
    PaymentOutstandingSectionComponent,
    DataTableComponent,
    BankDetailsCellComponent,
    PaymentSheetAmountsCellComponent,
    EmptyMessagesComponent,
    ButtonComponent,
  ],
  templateUrl: './get-payment-sheet-detail.component.html',
  styleUrl: './get-payment-sheet-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPaymentSheetDetailComponent implements OnInit {
  protected readonly EPaymentOutstandingSectionContext =
    EPaymentOutstandingSectionContext;
  protected readonly EPaymentOutstandingSourceType =
    EPaymentOutstandingSourceType;

  protected readonly paidAtDateFormat =
    APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME;
  protected readonly paidAtDateLocale = APP_CONFIG.DATE_FORMATS.DISPLAY_LOCALE;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dataTableService = inject(TableService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appPermissionService = inject(AppPermissionService);

  private readonly workflowPermissions: IPaymentSheetWorkflowPermissions =
    getPaymentSheetWorkflowPermissions(this.appPermissionService);

  private readonly getDetailWorkflowRow = (): IPaymentSheetWorkflowRow => {
    const detail = this.detail();
    return {
      status: detail?.status,
      currentStage: detail?.currentStage,
    };
  };

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

  protected pageHeaderConfig = computed(() => this.buildPageHeaderConfig());

  protected readonly workflowButtonConfigs = computed(() =>
    this.buildWorkflowButtonConfigs()
  );

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

  protected getRemainingAmount(row: IPaymentSheetDetailItemRow): number {
    return Math.max(0, row.actualDue - row.payableAmount);
  }

  protected isFullyCovered(row: IPaymentSheetDetailItemRow): boolean {
    return this.getRemainingAmount(row) <= 0;
  }

  protected onHeaderButtonClick(actionType: string): void {
    if (actionType !== EButtonActionType.ADD || !this.paymentSheetId) {
      return;
    }

    if (
      isPaymentSheetDetailActionDisabled(
        this.getDetailWorkflowRow(),
        this.workflowPermissions,
        EPaymentSheetDetailAction.ADD_BENEFICIARY
      )
    ) {
      return;
    }

    this.openAddBeneficiariesDialog();
  }

  protected onWorkflowActionClick(
    actionType: EPaymentSheetWorkflowActionType
  ): void {
    if (!this.paymentSheetId) {
      return;
    }

    if (
      isPaymentSheetDetailActionDisabled(
        this.getDetailWorkflowRow(),
        this.workflowPermissions,
        toPaymentSheetDetailAction(actionType)
      )
    ) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.SUBMIT,
      PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP[actionType],
      null,
      false,
      false,
      {
        paymentSheetId: this.paymentSheetId,
        workflowActionType: actionType,
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

    if (
      actionType !== EButtonActionType.EDIT &&
      actionType !== EButtonActionType.DELETE &&
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
      actionType === EButtonActionType.DELETE ||
      actionType === EButtonActionType.REJECT ||
      actionType === EButtonActionType.PAID;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      actionConfig,
      showItemDetail ? this.prepareItemRecordDetail(selectedRow) : null,
      false,
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
          ? this.mapVendorAllocationRows(sectionItems)
          : this.mapItems(sectionItems);
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
    this.updateDetailItemRowActions();
  }

  private updateDetailItemRowActions(): void {
    for (const sourceType of this.sourceSectionOrder) {
      const table = this.sourceTables.get(sourceType);

      if (table) {
        const rowActions = buildPaymentSheetDetailItemsRowActionsConfig(
          this.workflowPermissions,
          () => this.getDetailWorkflowRow(),
          {
            includeEdit: sourceType !== EPaymentSheetSourceType.VENDOR_PAYMENT,
          }
        );

        table.updateRowActions(
          rowActions.map(action => ({
            ...DEFAULT_ROW_ACTION_CONFIG,
            ...action,
          })) as Parameters<typeof table.updateRowActions>[0]
        );
      }
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
    items: IPaymentSheetItemDetailDto[]
  ): IPaymentSheetDetailItemRow[] {
    return items.map(item => this.mapItem(item));
  }

  private mapItem(
    item: IPaymentSheetItemDetailDto
  ): IPaymentSheetDetailItemRow {
    return {
      id: item.id,
      actualDue: item.pendingSnapshot,
      payableAmount: item.currentAmount,
      beneficiaryName: item.user
        ? `${item.user.firstName} ${item.user.lastName}`.trim()
        : (item.vendor?.name ?? '-'),
      beneficiaryCode: item.user?.employeeId ?? item.vendorId ?? '',
      itemStatus: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.paymentSheetItemStatuses(),
        item.itemStatus
      ),
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
    };
  }

  private mapVendorAllocationRows(
    items: IPaymentSheetItemDetailDto[]
  ): IPaymentSheetDetailItemRow[] {
    return items.flatMap(item => {
      const itemStatus = getMappedValueFromArrayOfObjects(
        this.appConfigurationService.paymentSheetItemStatuses(),
        item.itemStatus
      );
      const bankDetails = item.bankSnapshot
        ? {
            bankHolderName: item.bankSnapshot.accountHolderName,
            bankName: item.bankSnapshot.bankName,
            accountNumber: item.bankSnapshot.accountNumber,
            ifscCode: item.bankSnapshot.ifscCode,
          }
        : null;

      return (item.bookPaymentAllocations ?? []).map(allocation => ({
        id: item.id,
        beneficiaryName: item.vendor?.name ?? '-',
        beneficiaryCode: item.vendorId ?? '',
        actualDue: allocation.allocatedAmount,
        payableAmount: allocation.allocatedAmount,
        itemStatus,
        paidAt: item.paidAt ?? null,
        paymentRef: item.paymentRef ?? null,
        bankDetails,
      }));
    });
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
    const addDisabled = isPaymentSheetDetailActionDisabled(
      this.getDetailWorkflowRow(),
      this.workflowPermissions,
      EPaymentSheetDetailAction.ADD_BENEFICIARY
    );

    return {
      title: 'Payment Sheet',
      subtitle: 'Payment sheet beneficiaries',
      showHeaderButton: true,
      showGoBackButton: true,
      headerButtonConfig: [
        {
          id: EButtonActionType.ADD,
          actionName: EButtonActionType.ADD,
          label: 'Add Beneficiaries',
          icon: ICONS.COMMON.USERS,
          severity: EButtonSeverity.PRIMARY,
          permission: [APP_PERMISSION.PAYMENT_SHEET.CREATE],
          disabled: addDisabled,
          disabledTooltip: getPaymentSheetDetailActionDisableReason(
            this.getDetailWorkflowRow(),
            this.workflowPermissions,
            EPaymentSheetDetailAction.ADD_BENEFICIARY
          ),
        },
      ],
    };
  }

  private buildWorkflowButtonConfigs(): {
    actionType: EPaymentSheetWorkflowActionType;
    buttonConfig: Partial<IButtonConfig>;
  }[] {
    const workflowRow = this.getDetailWorkflowRow();
    const detailAction = (
      actionType: EPaymentSheetWorkflowActionType
    ): EPaymentSheetDetailAction => toPaymentSheetDetailAction(actionType);

    return PAYMENT_SHEET_WORKFLOW_ACTION_TYPES.filter(actionType =>
      this.appPermissionService.hasAnyPermission([
        PAYMENT_SHEET_FORWARD_ACTION_PERMISSION[actionType],
      ])
    ).map(actionType => {
      const disabled = isPaymentSheetDetailActionDisabled(
        workflowRow,
        this.workflowPermissions,
        detailAction(actionType)
      );

      return {
        actionType,
        buttonConfig: {
          id: EButtonActionType.SUBMIT,
          label:
            PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP[actionType].dialogConfig
              ?.labels?.singleLabel ?? '',
          icon: ICONS.ACTIONS.SEND,
          severity: EButtonSeverity.SUCCESS,
          disabled,
          disabledTooltip: getPaymentSheetDetailActionDisableReason(
            workflowRow,
            this.workflowPermissions,
            detailAction(actionType)
          ),
        },
      };
    });
  }
}
