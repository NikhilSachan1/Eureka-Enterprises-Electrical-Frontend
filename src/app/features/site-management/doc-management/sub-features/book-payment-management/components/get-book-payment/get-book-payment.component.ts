import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@core/config';
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
import {
  BOOK_PAYMENT_ACTION_CONFIG_MAP,
  BOOK_PAYMENT_TABLE_ENHANCED_CONFIG,
} from '../../config';
import {
  IBookPaymentGetBaseResponseDto,
  IBookPaymentGetFormDto,
  IBookPaymentGetResponseDto,
} from '../../types/book-payment.dto';
import { IBookPayment } from '../../types/book-payment.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BookPaymentService } from '../../services/book-payment.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetBookPaymentDetailComponent } from '../get-book-payment-detail/get-book-payment-detail.component';
import { IProjectWorkspaceSearchFilterFormDto } from '@features/site-management/project-management/types/project.interface';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-get-book-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
    DocAmountComponent,
  ],
  templateUrl: './get-book-payment.component.html',
  styleUrl: './get-book-payment.component.scss',
})
export class GetBookPaymentComponent implements OnInit {
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
  private readonly bookPaymentService = inject(BookPaymentService);
  private readonly route = inject(ActivatedRoute);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );

  private readonly docRouteContext = signal<EDocContext | undefined>(undefined);

  protected readonly pageHeaderConfig = computed(() =>
    this.getPageHeaderConfig()
  );

  constructor() {
    effect(() => {
      this.projectWorkspaceContext.docWorkspaceFilter();
      untracked(() => {
        if (!this.table || this.tableFilterData === undefined) {
          return;
        }
        this.loadBookPaymentList();
      });
    });
  }

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  ngOnInit(): void {
    const docContext = this.route.parent?.snapshot.data[
      'docContext'
    ] as EDocContext;
    this.docRouteContext.set(docContext);
    this.table = this.dataTableService.createTable(
      BOOK_PAYMENT_TABLE_ENHANCED_CONFIG
    );
  }

  protected docBookPaymentAmountSegments(
    row: IBookPayment
  ): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Taxable',
        value: row.taxableAmount,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'GST',
        value: row.gstAmount,
        suffix: row.gstPercentage,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'TDS',
        value: row.tdsDeductionAmount,
        suffix: row.tdsPercentage,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Total',
        value: row.paymentTotalAmount,
      },
    ];
  }

  private loadBookPaymentList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.bookPaymentService
      .getBookPaymentList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IBookPaymentGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('Book payments loaded');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load book payments', error);
        },
      });
  }

  private prepareParamData(): IBookPaymentGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IBookPaymentGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );
    const workspaceParams =
      this.projectWorkspaceContext.docWorkspaceFilter() as IProjectWorkspaceSearchFilterFormDto;

    return {
      ...workspaceParams,
      ...base,
    };
  }

  private mapTableData(
    response: IBookPaymentGetBaseResponseDto[]
  ): IBookPayment[] {
    return response.map(record => ({
      id: record.id,
      bookingDate: record.bookingDate,
      invoice: record.invoice,
      taxableAmount: record.taxableAmount,
      gstAmount: record.gstAmount,
      gstPercentage: `(${record.gstPercentage}%)`,
      tdsDeductionAmount: record.tdsDeductionAmount,
      tdsPercentage: `(${record.tdsPercentage}%)`,
      paymentTotalAmount: record.paymentTotalAmount,
      hasTransfer: record.hasTransfer ?? false,
      transferStatusLabel: record.hasTransfer === true ? 'Done' : 'Pending',
      paymentHoldReasonDisplay: record.paymentHoldReason?.trim() ?? '—',
      paymentHoldReason: record.paymentHoldReason,
      docWorkspaceContext: {
        companyName: record.site.company.name,
        partyName: record.vendor.name,
        projectName: record.site.name,
        siteLocationSubtitle: `${record.site.city}, ${record.site.state}`,
      },
      documentReferenceHierarchy: DocReferenceHierarchy.forBookPaymentRow({
        poNumber: record.invoice.jmc.po.poNumber,
        jmcNumber: record.invoice.jmc.jmcNumber,
        invoiceNumber: record.invoice.invoiceNumber,
      }),
      originalRawData: record,
    }));
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadBookPaymentList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addBookPayment') {
      this.openAddBookPaymentDialog();
    }
  }

  private openAddBookPaymentDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      BOOK_PAYMENT_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        onSuccess: () => this.loadBookPaymentList(),
      }
    );
  }

  protected handleBookPaymentTableActionClick(
    event: ITableActionClickEvent<IBookPaymentGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const selectedFirstRow = selectedRows[0];

    if (!selectedFirstRow) {
      this.logger.error(
        'Book payment row action: selected row missing (unexpected)'
      );
      return;
    }

    if (actionType === EButtonActionType.VIEW) {
      this.showBookPaymentDetailsDrawer(selectedFirstRow);
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      docContext: this.docRouteContext(),
      onSuccess: () => this.loadBookPaymentList(),
    };

    const showRecordSummary = actionType !== EButtonActionType.EDIT;
    const recordDetail = showRecordSummary
      ? this.prepareBookPaymentRecordDetail(selectedFirstRow)
      : null;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      BOOK_PAYMENT_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      false,
      showRecordSummary,
      dynamicComponentInputs
    );
  }

  private prepareBookPaymentRecordDetail(
    row: IBookPaymentGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Booking Date',
        value: row.bookingDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Bank transfer',
        value: row.hasTransfer === true ? 'Done' : 'Pending',
      },
      {
        label: 'Payment hold reason',
        value: row.paymentHoldReason ?? '-',
      },
      {
        label: 'Payment Total',
        value: row.paymentTotalAmount,
        type: EDataType.CURRENCY,
      },
    ];
    return {
      details: [
        {
          entryData,
        },
      ],
      entity: {
        name: `${row.vendor?.name ?? ''}`.trim() || 'Book payment',
        subtitle: row.invoice?.invoiceNumber ?? row.id,
      },
    };
  }

  private showBookPaymentDetailsDrawer(
    row: IBookPaymentGetBaseResponseDto
  ): void {
    this.drawerService.showDrawer(GetBookPaymentDetailComponent, {
      header: 'Book payment details',
      subtitle: 'Detailed view',
      componentData: { bookPayment: row },
    });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: '',
      subtitle: '',
      showHeaderButton: true,
      showGoBackButton: false,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Book Payment',
          actionName: 'addBookPayment',
        },
      ],
    };
  }
}
