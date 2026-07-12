import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
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
  createInvoiceTableEnhancedConfig,
} from '../../config';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  IInvoiceGetBaseResponseDto,
  IInvoiceGetFormDto,
  IInvoiceGetResponseDto,
} from '../../types/invoice.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { InvoiceService } from '../../services/invoice.service';
import { IInvoice } from '../../types/invoice.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetInvoiceDetailComponent } from '../get-invoice-detail/get-invoice-detail.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { UnlockRequestComponent } from '@features/site-management/doc-management/shared/components/unlock-request/unlock-request.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';

import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { buildInvoiceTaxGstAmountSegments } from '../../utils/invoice-table-row.util';

@Component({
  selector: 'app-get-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    UnlockRequestComponent,
    DocAmountComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
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
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly authService = inject(AuthService);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);

  private readonly docRouteContext = signal<EDocContext | undefined>(undefined);
  protected readonly searchTerm = signal<string>('');

  protected readonly pageHeaderConfig = computed(
    (): IPageHeaderConfig => this.getPageHeaderConfig()
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  private readonly loadTrigger$ = new Subject<void>();
  private readonly invoiceDialogAmountsTpl = viewChild<TemplateRef<unknown>>(
    'invoiceDialogAmounts'
  );

  constructor() {
    effect(() => {
      this.workspaceContext.filterSubmitVersion();
      if (this.tableFilterData) {
        this.loadInvoiceList();
      }
    });
  }

  ngOnInit(): void {
    const docContext = this.route.parent?.snapshot.data[
      'docContext'
    ] as EDocContext;
    this.docRouteContext.set(docContext);
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      createInvoiceTableEnhancedConfig(loggedInUserId)
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.invoiceService
            .getInvoiceList(this.prepareParamData())
            .pipe(
              finalize(() => this.table.setLoading(false)),
              catchError(error => {
                this.table.setData([]);
                this.logger.logUserAction(
                  'Failed to load invoice records',
                  error
                );
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IInvoiceGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('Invoice records loaded successfully');
        },
      });
  }

  protected docInvoiceTaxGstSegments(row: IInvoice): IDocAmountSegment[] {
    return buildInvoiceTaxGstAmountSegments({
      invoiceNumber: row.originalRawData.invoiceNumber,
      taxableAmount: row.taxableAmount,
      tdsAmount: row.tdsAmount,
      tdsPercentage: row.tdsPercentage,
      gstAmount: row.gstAmount,
      gstPercentage: row.gstPercentage,
      totalAmount: row.totalAmount,
      isGstHold: row.isGstHold,
    });
  }

  protected docInvoiceBookedPaidSegments(row: IInvoice): IDocAmountSegment[] {
    const isSales = this.docRouteContext() === EDocContext.SALES;
    const segments: IDocAmountSegment[] = [];
    if (!isSales) {
      segments.push({
        dataType: EDataType.CURRENCY,
        label: 'Booked',
        value: row.bookedTotal,
      });
    }
    segments.push({
      dataType: EDataType.CURRENCY,
      label: 'Paid',
      value: row.paidTotal,
    });
    return segments;
  }

  private loadInvoiceList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IInvoiceGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IInvoiceGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    const docType = this.docRouteContext();
    const { search: workspaceSearch, ...workspaceFilters } =
      this.workspaceContext.filters();

    return {
      ...workspaceFilters,
      ...base,
      ...(docType ? { docType } : {}),
      ...(workspaceSearch ? { poNumber: workspaceSearch } : {}),
      ...(this.searchTerm() ? { search: this.searchTerm() } : {}),
    };
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.loadInvoiceList();
  }

  private mapTableData(response: IInvoiceGetBaseResponseDto[]): IInvoice[] {
    return response.map((record: IInvoiceGetBaseResponseDto) => {
      return {
        id: record.id,
        docWorkspaceContext: {
          companyName: record.site.company.name,
          partyName: [record.contractor?.name, record.vendor?.name]
            .filter((n): n is string => Boolean(n))
            .join(' · '),
          projectName: record.site.name,
          siteLocationSubtitle: `${record.site.city}, ${record.site.state}`,
        },
        invoiceDate: record.invoiceDate,
        invoiceNumber: record.invoiceNumber ?? 'No Invoice',
        taxableAmount: record.taxableAmount,
        tdsAmount: record.tdsAmount,
        tdsPercentage: record.tdsPercentage ? `(${record.tdsPercentage}%)` : '',
        gstPercentage: record.gstPercentage ? `(${record.gstPercentage}%)` : '',
        gstAmount: record.gstAmount,
        isGstHold: record.isGstHold,
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
        projectName: this.workspaceContext.activeProjectId(),
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
    const detailTpl = this.invoiceDialogAmountsTpl();

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      {
        ...INVOICE_ACTION_CONFIG_MAP[actionType],
        ...(detailTpl && showRecordSummary
          ? {
              detailViewCustomTemplates: {
                invoiceDialogAmounts: detailTpl,
              },
            }
          : {}),
      },
      recordDetail,
      false,
      showRecordSummary,
      dynamicComponentInputs
    );
  }

  protected docInvoiceDialogAmountSegments(value: {
    invoiceNumber: string | null;
    taxableAmount: string | null;
    tdsAmount: string | null;
    tdsPercentage: string | number | null;
    gstAmount: string | null;
    gstPercentage: string | number | null;
    totalAmount: string | null;
    isGstHold?: boolean | null;
  }): IDocAmountSegment[] {
    return buildInvoiceTaxGstAmountSegments(value);
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
        label: 'Invoice amounts',
        value: {
          invoiceNumber: selectedRow.invoiceNumber,
          taxableAmount: selectedRow.taxableAmount,
          tdsAmount: selectedRow.tdsAmount,
          tdsPercentage: selectedRow.tdsPercentage,
          gstAmount: selectedRow.gstAmount,
          gstPercentage: selectedRow.gstPercentage,
          isGstHold: selectedRow.isGstHold,
          totalAmount: selectedRow.totalAmount,
        },
        customTemplateKey: 'invoiceDialogAmounts',
      },
      {
        label: 'Attachment(s)',
        value: selectedRow.fileKey ? [selectedRow.fileKey] : [],
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
        subtitle: selectedRow.invoiceNumber ?? 'No Invoice',
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
      showSearch: true,
      searchPlaceholder: 'Search by Invoice Number',
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Invoice',
          actionName: 'addInvoice',
          permission: [APP_PERMISSION.INVOICE_DOC.ADD],
        },
      ],
    };
  }
}
