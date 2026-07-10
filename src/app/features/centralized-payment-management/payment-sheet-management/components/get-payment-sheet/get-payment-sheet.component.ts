import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
import { PaymentSheetAmountsCellComponent } from '@features/centralized-payment-management/shared/components/payment-sheet-amounts-cell/payment-sheet-amounts-cell.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
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
import {
  PAYMENT_SHEET_LIST_ACTION_CONFIG_MAP,
  getPaymentSheetTableEnhancedConfig,
  SEARCH_FILTER_PAYMENT_SHEET_FORM_CONFIG,
} from '../../config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import { PaymentSheetTimelineDrawerComponent } from '../payment-sheet-timeline-drawer/payment-sheet-timeline-drawer.component';
import {
  EPaymentSheetStatus,
  EPaymentSheetTimelineMode,
} from '../../types/payment-sheet.enum';
import {
  IPaymentSheetGetBaseResponseDto,
  IPaymentSheetGetFormDto,
  IPaymentSheetGetResponseDto,
} from '../../types/payment-sheet.dto';
import { IPaymentSheet } from '../../types/payment-sheet.interface';
import {
  PAYMENT_SHEET_LIST_WORKFLOW_STEPS,
  TPaymentSheetWorkflowStepState,
} from '../../types/payment-sheet-workflow.types';

@Component({
  selector: 'app-get-payment-sheet',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    DataTableComponent,
    PaymentSheetAmountsCellComponent,
  ],
  templateUrl: './get-payment-sheet.component.html',
  styleUrl: './get-payment-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPaymentSheetComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly authService = inject(AuthService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  protected readonly workflowSteps = PAYMENT_SHEET_LIST_WORKFLOW_STEPS;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      getPaymentSheetTableEnhancedConfig(this.authService.user()?.activeRole)
    );
    this.searchFilterConfig = SEARCH_FILTER_PAYMENT_SHEET_FORM_CONFIG;
  }

  protected getPendingAmount(row: IPaymentSheet): number {
    return Math.max(0, row.totalCurrentAmount - row.totalPaidAmount);
  }

  protected isFullyPaid(row: IPaymentSheet): boolean {
    return row.totalCurrentAmount > 0 && this.getPendingAmount(row) <= 0;
  }

  protected shouldShowWorkflowTimeline(row: IPaymentSheet): boolean {
    const { status, currentStage } = row;

    if (
      status === EPaymentSheetStatus.REJECTED ||
      status === EPaymentSheetStatus.RETURNED
    ) {
      return Boolean(currentStage);
    }

    return true;
  }

  protected getWorkflowStepState(
    row: IPaymentSheet,
    stepIndex: number
  ): TPaymentSheetWorkflowStepState {
    const status = row.status as EPaymentSheetStatus;
    const currentIndex = this.getWorkflowStageIndex(row.currentStage);

    if (status === EPaymentSheetStatus.COMPLETED) {
      return 'complete';
    }

    if (
      status === EPaymentSheetStatus.DRAFT ||
      status === EPaymentSheetStatus.RETURNED
    ) {
      if (currentIndex >= 0) {
        if (stepIndex < currentIndex) {
          return 'complete';
        }
        if (stepIndex === currentIndex) {
          return 'current';
        }
        return 'pending';
      }

      return stepIndex === 0 ? 'current' : 'pending';
    }

    if (status === EPaymentSheetStatus.REJECTED) {
      if (currentIndex === -1) {
        return stepIndex === 0 ? 'current' : 'pending';
      }
      if (stepIndex < currentIndex) {
        return 'complete';
      }
      if (stepIndex === currentIndex) {
        return 'current';
      }
      return 'pending';
    }

    if (currentIndex === -1) {
      return stepIndex === 0 ? 'current' : 'pending';
    }

    if (stepIndex < currentIndex) {
      return 'complete';
    }
    if (stepIndex === currentIndex) {
      return 'current';
    }
    return 'pending';
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadPaymentSheetList();
  }

  protected handlePaymentSheetTableActionClick(
    event: ITableActionClickEvent<IPaymentSheet>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW && selectedRow?.id) {
      void this.routerNavigationService.navigateToRoute([
        ROUTE_BASE_PATHS.PAYMENT_HUB,
        ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEETS,
        selectedRow.id,
      ]);
      return;
    }

    if (actionType === EButtonActionType.WORKFLOW_JOURNEY && selectedRow?.id) {
      this.openWorkflowDrawer(selectedRow);
      return;
    }

    if (actionType === EButtonActionType.DOWNLOAD && selectedRow?.id) {
      this.confirmationDialogService.showConfirmationDialog(
        EButtonActionType.DOWNLOAD,
        PAYMENT_SHEET_LIST_ACTION_CONFIG_MAP[EButtonActionType.DOWNLOAD],
        null,
        false,
        false,
        {
          paymentSheetId: selectedRow.id,
        }
      );
      return;
    }

    if (
      (actionType === EButtonActionType.CANCEL ||
        actionType === EButtonActionType.REJECT) &&
      selectedRow?.id
    ) {
      const actionConfig = PAYMENT_SHEET_LIST_ACTION_CONFIG_MAP[actionType];

      if (!actionConfig) {
        return;
      }

      this.confirmationDialogService.showConfirmationDialog(
        actionType,
        actionConfig,
        this.preparePaymentSheetRecordDetail(selectedRow),
        false,
        true,
        {
          paymentSheetId: selectedRow.id,
          onSuccess: () => this.loadPaymentSheetList(),
        }
      );
    }
  }

  private openWorkflowDrawer(row: IPaymentSheet): void {
    const raw = row.originalRawData ?? row;

    this.drawerService.showDrawer(PaymentSheetTimelineDrawerComponent, {
      header: 'Activity Timeline',
      subtitle: 'View payment sheet workflow and activity history',
      size: EDrawerSize.SMALL,
      componentData: {
        mode: EPaymentSheetTimelineMode.WORKFLOW,
        paymentSheetId: raw.id,
        sheetNumber: raw.sheetNumber,
        contextSubtitle: raw.title?.trim() ? raw.title.trim() : '—',
      },
    });
  }

  private preparePaymentSheetRecordDetail(
    row: IPaymentSheet
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Status',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.paymentSheetStatuses(),
          row.originalRawData?.status ?? row.status
        ),
        type: EDataType.TEXT,
      },
      {
        label: 'Current Stage',
        value: row.originalRawData?.currentStage
          ? getMappedValueFromArrayOfObjects(
              this.appConfigurationService.paymentSheetStages(),
              row.originalRawData.currentStage
            )
          : '—',
        type: EDataType.TEXT,
      },
      {
        label: 'Payable Amount',
        value: row.totalCurrentAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
    ];

    return {
      details: [{ entryData }],
      entity: {
        name: row.sheetNumber,
        subtitle: row.title ?? '—',
      },
    };
  }

  private loadPaymentSheetList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.paymentSheetService
      .getPaymentSheetList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPaymentSheetGetResponseDto) => {
          const { records, totalRecords } = response;
          const mappedData = this.mapTableData(records);

          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Payment sheet records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.table.updateTableConfig({ totalRecords: 0 });
          this.logger.logUserAction('Failed to load payment sheets', error);
        },
      });
  }

  private prepareParamData(): IPaymentSheetGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IPaymentSheetGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    records: IPaymentSheetGetBaseResponseDto[]
  ): IPaymentSheet[] {
    return records.map(record => ({
      ...record,
      title: record.title?.trim() ?? '—',
      status: record.status,
      statusLabel: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.paymentSheetStatuses(),
        record.status
      ),
      currentStage: record.currentStage,
      originalRawData: record,
    }));
  }

  private getWorkflowStageIndex(stage: string | null | undefined): number {
    if (!stage) {
      return -1;
    }

    return PAYMENT_SHEET_LIST_WORKFLOW_STEPS.findIndex(
      step => step.stage === stage
    );
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Payment Sheets',
      subtitle: 'View and track payment sheet batches',
      showHeaderButton: false,
      showGoBackButton: false,
    };
  }
}
