import { formatDate, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  DrawerService,
  TableServerSideParamsBuilderService,
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
import { TableLazyLoadEvent } from 'primeng/table';
import { PAYMENT_REQUEST_ACTION_CONFIG_MAP } from '../../config/dialog/get-payment-request.config';
import { createPaymentRequestTableEnhancedConfig } from '../../config/table/get-payment-request.config';
import {
  IPaymentRequestGetBaseResponseDto,
  IPaymentRequestGetFormDto,
  IPaymentRequestGetResponseDto,
} from '../../types/payment-request.dto';
import { IPaymentRequest } from '../../types/payment-request.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { PaymentRequestService } from '../../services/payment-request.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetPaymentRequestDetailComponent } from '../get-payment-request-detail/get-payment-request-detail.component';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import {
  buildPaymentRequestInvoiceDoc,
  buildPaymentRequestPoDoc,
} from '../../utils/payment-request-table-row.util';

@Component({
  selector: 'app-get-payment-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    DocWorkspaceContextComponent,
    DocAmountComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './get-payment-request.component.html',
  styleUrl: './get-payment-request.component.scss',
})
export class GetPaymentRequestComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly route = inject(ActivatedRoute);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly docRouteContext = signal<EDocContext | undefined>(
    undefined
  );
  protected readonly searchTerm = signal<string>('');

  protected readonly pageHeaderConfig = computed(
    (): IPageHeaderConfig => this.getPageHeaderConfig()
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    effect(() => {
      this.workspaceContext.filterSubmitVersion();
      if (this.tableFilterData) {
        this.loadPaymentRequestList();
      }
    });
  }

  ngOnInit(): void {
    const docContext = this.route.parent?.snapshot.data[
      'docContext'
    ] as EDocContext;
    this.docRouteContext.set(docContext);
    this.table = this.dataTableService.createTable(
      createPaymentRequestTableEnhancedConfig()
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.paymentRequestService
            .getPaymentRequestList(this.prepareParamData())
            .pipe(
              finalize(() => this.table.setLoading(false)),
              catchError(error => {
                this.table.setData([]);
                this.logger.logUserAction(
                  'Failed to load payment request records',
                  error
                );
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPaymentRequestGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Payment request records loaded successfully'
          );
        },
      });
  }

  private loadPaymentRequestList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IPaymentRequestGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IPaymentRequestGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    const { search: workspaceSearch, ...workspaceFilters } =
      this.workspaceContext.filters();

    return {
      ...workspaceFilters,
      ...base,
      ...(workspaceSearch ? { poNumber: workspaceSearch } : {}),
      ...(this.searchTerm() ? { search: this.searchTerm() } : {}),
    };
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.loadPaymentRequestList();
  }

  private mapTableData(
    response: IPaymentRequestGetBaseResponseDto[]
  ): IPaymentRequest[] {
    return response.map((record: IPaymentRequestGetBaseResponseDto) => {
      return {
        id: record.id,
        status: record.status,
        requestedAmount: record.requestedAmount,
        approvedAmount: record.approvedAmount,
        reason: record.reason,
        invoice: record.invoice,
        vendor: record.vendor,
        invoiceDoc: buildPaymentRequestInvoiceDoc(record),
        poDoc: buildPaymentRequestPoDoc(record),
        docWorkspaceContext: {
          companyName: record.site?.company?.name ?? '',
          partyName: record.vendor?.name ?? '',
          projectName: record.site?.name ?? '',
          siteLocationSubtitle: [record.site?.city, record.site?.state]
            .filter((part): part is string => Boolean(part))
            .join(', '),
        },
        originalRawData: record,
      } satisfies IPaymentRequest;
    });
  }

  protected formatLinkedDocDate(value: string | null): string {
    if (!value) {
      return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '—';
    }
    return formatDate(
      parsed,
      APP_CONFIG.DATE_FORMATS.DEFAULT,
      APP_CONFIG.DATE_FORMATS.DISPLAY_LOCALE
    );
  }

  protected docPaymentRequestAmountSegments(
    row: IPaymentRequest
  ): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Requested',
        value: row.requestedAmount,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Approved',
        value: row.approvedAmount,
      },
    ];
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadPaymentRequestList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addPaymentRequest') {
      this.openAddPaymentRequestDialog();
    }
  }

  private openAddPaymentRequestDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      PAYMENT_REQUEST_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        projectName: this.workspaceContext.activeProjectId(),
        onSuccess: () => {
          this.loadPaymentRequestList();
        },
      }
    );
  }

  protected handlePaymentRequestTableActionClick(
    event: ITableActionClickEvent<IPaymentRequestGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (!selectedFirstRow) {
      this.logger.error(
        'Payment request row action: selected row missing (unexpected)'
      );
      return;
    }

    if (actionType === EButtonActionType.VIEW) {
      this.showPaymentRequestDetailsDrawer(selectedFirstRow);
      return;
    }

    const showRecordSummary = actionType !== EButtonActionType.EDIT;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      PAYMENT_REQUEST_ACTION_CONFIG_MAP[actionType],
      showRecordSummary
        ? this.preparePaymentRequestRecordDetail(selectedFirstRow)
        : null,
      false,
      showRecordSummary,
      {
        selectedRecord: selectedRows,
        docContext: this.docRouteContext(),
        onSuccess: () => {
          this.loadPaymentRequestList();
        },
      }
    );
  }

  private preparePaymentRequestRecordDetail(
    selectedRow: IPaymentRequestGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Invoice Number',
        value: selectedRow.invoice?.invoiceNumber ?? '—',
      },
      {
        label: 'Requested Amount',
        value: selectedRow.requestedAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
    ];

    return {
      details: [
        {
          status: {
            approvalStatus: selectedRow.status,
          },
          entryData,
        },
      ],
      entity: {
        name: selectedRow.vendor?.name?.trim() || 'Payment request',
        subtitle: selectedRow.invoice?.invoiceNumber ?? selectedRow.id,
      },
    };
  }

  private showPaymentRequestDetailsDrawer(
    rowData: IPaymentRequestGetBaseResponseDto
  ): void {
    this.logger.logUserAction(
      'Opening Payment Request details drawer',
      rowData
    );

    this.drawerService.showDrawer(GetPaymentRequestDetailComponent, {
      header: 'Payment Request Details',
      subtitle: 'Detailed view of Payment Request',
      componentData: {
        paymentRequest: rowData,
      },
    });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: '',
      subtitle: '',
      showHeaderButton: true,
      showGoBackButton: false,
      showSearch: true,
      searchPlaceholder: 'Search by Invoice Number',
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Payment Request',
          actionName: 'addPaymentRequest',
          permission: [APP_PERMISSION.PAYMENT_REQUEST_DOC.ADD],
        },
      ],
    };
  }
}
