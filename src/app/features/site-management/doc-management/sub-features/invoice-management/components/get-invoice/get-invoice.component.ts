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
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import {
  AppConfigurationService,
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
  INVOICE_ACTION_CONFIG_MAP,
  INVOICE_TABLE_ENHANCED_CONFIG,
} from '../../config';
import {
  IInvoiceGetBaseResponseDto,
  IInvoiceGetFormDto,
  IInvoiceGetResponseDto,
} from '../../types/invoice.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { InvoiceService } from '../../services/invoice.service';
import { IInvoice } from '../../types/invoice.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetInvoiceDetailComponent } from '../get-invoice-detail/get-invoice-detail.component';
import { IProjectWorkspaceSearchFilterFormDto } from '@features/site-management/project-management/types/project.interface';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { UnlockRequestComponent } from '@features/site-management/doc-management/shared/components/unlock-request/unlock-request.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-get-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    UnlockRequestComponent,
    DocAmountComponent,
    DocReferenceComponent,
  ],
  templateUrl: './get-invoice.component.html',
  styleUrl: './get-invoice.component.scss',
})
export class GetInvoiceComponent implements OnInit {
  protected readonly APP_CONFIG = APP_CONFIG;

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
  private readonly invoiceService = inject(InvoiceService);
  private readonly route = inject(ActivatedRoute);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  private readonly docRouteContext = signal<EDocContext | undefined>(undefined);

  protected readonly pageHeaderConfig = computed(
    (): IPageHeaderConfig => this.getPageHeaderConfig()
  );

  constructor() {
    effect(() => {
      this.projectWorkspaceContext.docWorkspaceFilter();
      untracked(() => {
        if (!this.table || this.tableFilterData === undefined) {
          return;
        }
        this.loadInvoiceList();
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
      INVOICE_TABLE_ENHANCED_CONFIG(this.docRouteContext())
    );
  }

  protected docInvoiceTaxGstSegments(row: IInvoice): IDocAmountSegment[] {
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
        label: 'Total',
        value: row.totalAmount,
      },
    ];
  }

  protected docInvoiceBookedPaidSegments(row: IInvoice): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Booked',
        value: row.bookedTotal,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Paid',
        value: row.paidTotal,
      },
    ];
  }

  private loadInvoiceList(): void {
    this.table.setLoading(true);

    const paramData = this.prepareParamData();

    this.invoiceService
      .getInvoiceList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IInvoiceGetResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });

          this.logger.logUserAction('Invoice records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load invoice records', error);
        },
      });
  }

  private prepareParamData(): IInvoiceGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IInvoiceGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    const docType = this.docRouteContext();
    const workspaceParams =
      this.projectWorkspaceContext.docWorkspaceFilter() as IProjectWorkspaceSearchFilterFormDto;

    return {
      ...workspaceParams,
      ...base,
      ...(docType ? { docType } : {}),
    };
  }

  private mapTableData(response: IInvoiceGetBaseResponseDto[]): IInvoice[] {
    return response.map((record: IInvoiceGetBaseResponseDto) => {
      return {
        id: record.id,
        company: record.site.company,
        site: record.site,
        siteCityStateSubtitle: `${record.site.city}, ${record.site.state}`,
        invoiceDate: record.invoiceDate,
        invoiceNumber: record.invoiceNumber,
        taxableAmount: record.taxableAmount,
        gstPercentage: `(${record.gstPercentage}%)`,
        gstAmount: record.gstAmount,
        totalAmount: record.totalAmount,
        bookedTotal: record.bookedTotal,
        paidTotal: record.paidTotal,
        jmc: record.jmc,
        fileKey: record.fileKey,
        fileKeys: record.fileKey ? [record.fileKey] : [],
        approvalStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.projectDocumentApprovalStatuses(),
          record.approvalStatus
        ),
        isLocked: record.isLocked,
        unlockRequestedAt: record.unlockRequestedAt,
        unlockRequestedByUser: record.unlockRequestedByUser,
        unlockReason: record.unlockReason,
        contractor: record.contractor,
        vendor: record.vendor,
        documentReferenceHierarchy:
          DocReferenceHierarchy.forInvoiceOrJmcParentRow({
            poNumber: record.jmc.po.poNumber,
            jmcNumber: record.jmc.jmcNumber,
          }),
        originalRawData: record,
      } satisfies IInvoice;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadInvoiceList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addInvoice') {
      this.openAddInvoiceDialog();
    }
  }

  private openAddInvoiceDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      INVOICE_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        onSuccess: () => {
          this.loadInvoiceList();
        },
      }
    );
  }

  protected handleInvoiceTableActionClick(
    event: ITableActionClickEvent<IInvoiceGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showInvoiceDetailsDrawer(selectedFirstRow);
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadInvoiceList();
      },
    };

    const showRecordSummary = actionType !== EButtonActionType.EDIT;
    const recordDetail = showRecordSummary
      ? this.prepareInvoiceRecordDetail(selectedFirstRow)
      : null;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      INVOICE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      false,
      showRecordSummary,
      dynamicComponentInputs
    );
  }

  private prepareInvoiceRecordDetail(
    selectedRow: IInvoiceGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Invoice Date',
        value: selectedRow.invoiceDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Attachment(s)',
        value: [selectedRow.fileKey],
        type: EDataType.ATTACHMENTS,
      },
    ];
    return {
      details: [
        {
          status: {
            entryType: selectedRow.partyType,
            approvalStatus: selectedRow.approvalStatus,
          },
          entryData,
        },
      ],
      entity: {
        name: `${selectedRow.contractor?.name ?? ''} ${selectedRow.vendor?.name ?? ''}`.trim(),
        subtitle: `${selectedRow.invoiceNumber}`,
      },
    };
  }

  private showInvoiceDetailsDrawer(rowData: IInvoiceGetBaseResponseDto): void {
    this.logger.logUserAction('Opening Invoice details drawer', rowData);

    this.drawerService.showDrawer(GetInvoiceDetailComponent, {
      header: `Invoice Details`,
      subtitle: `Detailed view of Invoice`,
      componentData: {
        invoice: rowData,
      },
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
          label: 'Add Invoice',
          actionName: 'addInvoice',
        },
      ],
    };
  }
}
