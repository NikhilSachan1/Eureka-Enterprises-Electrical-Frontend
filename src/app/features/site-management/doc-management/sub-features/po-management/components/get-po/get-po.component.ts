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
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { LoggerService } from '@core/services';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  GalleryService,
  LoadingService,
  NotificationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  IAttachmentsGetResponseDto,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IGalleryInputData,
  IPageHeaderConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  PO_ACTION_CONFIG_MAP,
  createPoTableEnhancedConfig,
} from '../../config';
import {
  IPoCanCreateGetResponseDto,
  IPoGetBaseResponseDto,
  IPoGetFormDto,
  IPoGetResponseDto,
} from '../../types/po.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { PoService } from '../../services/po.service';
import { IPo } from '../../types/po.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetPoDetailComponent } from '../get-po-detail/get-po-detail.component';
import { AuthService } from '@features/auth-management/services/auth.service';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { UnlockRequestComponent } from '@features/site-management/doc-management/shared/components/unlock-request/unlock-request.component';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { WorkspaceDocumentStatusCellComponent } from '@features/site-management/project-management/components/workspace-document-status-cell/workspace-document-status-cell.component';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { ProjectWorkspaceDocumentStatusService } from '@features/site-management/project-management/services/project-workspace-document-status.service';
import { ensureWorkspaceTableBreakdown } from '@features/site-management/project-management/utility/workspace-table-document-status.util';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { isPoSystemGenerated, poAttachmentKeys } from '../../utils/po-table-row.util';

@Component({
  selector: 'app-get-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    UnlockRequestComponent,
    DocAmountComponent,
    DocWorkspaceContextComponent,
    WorkspaceDocumentStatusCellComponent,
  ],
  templateUrl: './get-po.component.html',
  styleUrl: './get-po.component.scss',
})
export class GetPoComponent implements OnInit {
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
  private readonly poService = inject(PoService);
  private readonly galleryService = inject(GalleryService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly authService = inject(AuthService);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);
  private readonly workspaceDocumentStatus = inject(
    ProjectWorkspaceDocumentStatusService,
    { optional: true }
  );

  protected readonly docRouteContext = signal<EDocContext | undefined>(undefined);
  protected readonly searchTerm = signal<string>('');
  private readonly poCanCreate = signal<IPoCanCreateGetResponseDto | null>(
    null
  );
  private readonly canCreateTrigger$ = new Subject<string | undefined>();

  protected readonly pageHeaderConfig = computed(
    (): IPageHeaderConfig => this.getPageHeaderConfig()
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    this.canCreateTrigger$
      .pipe(
        switchMap(siteId => {
          if (!siteId) {
            this.poCanCreate.set(null);
            return EMPTY;
          }

          return this.poService.getPoCanCreate(siteId).pipe(
            catchError(error => {
              this.poCanCreate.set(null);
              this.logger.logUserAction('Failed to load PO can-create', error);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPoCanCreateGetResponseDto) => {
          this.poCanCreate.set(response);
        },
      });

    effect(() => {
      this.workspaceContext.filterSubmitVersion();
      if (this.tableFilterData) {
        this.loadPoList();
      }
    });

    effect(() => {
      const siteId =
        this.workspaceContext.selectedProjectId() ??
        this.workspaceContext.activeProjectId();
      this.canCreateTrigger$.next(siteId);
    });
  }

  ngOnInit(): void {
    const docContext = this.route.parent?.snapshot.data[
      'docContext'
    ] as EDocContext;
    this.docRouteContext.set(docContext);
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      createPoTableEnhancedConfig(loggedInUserId)
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.poService.getPoList(this.prepareParamData()).pipe(
            finalize(() => this.table.setLoading(false)),
            catchError(error => {
              this.table.setData([]);
              this.logger.logUserAction('Failed to load PO records', error);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPoGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          ensureWorkspaceTableBreakdown(
            this.workspaceDocumentStatus,
            records
          );
          this.logger.logUserAction('PO records loaded successfully');
        },
      });
  }

  protected docPoTaxGstSegments(row: IPo): IDocAmountSegment[] {
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
        suffix: `(${row.gstPercentage})`,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Total',
        value: row.totalAmount,
      },
    ];
  }

  protected docPoInvoicePaymentSegments(row: IPo): IDocAmountSegment[] {
    const isSales = this.isPoSalesParty(row);
    const segments: IDocAmountSegment[] = [
      {
        dataType: EDataType.CURRENCY,
        label: 'Invoiced',
        value: row.invoicedTotal,
      },
    ];
    if (!isSales) {
      segments.push({
        dataType: EDataType.CURRENCY,
        label: 'Booked',
        value: row.bookedTotal,
      });
    }
    segments.push(
      {
        dataType: EDataType.CURRENCY,
        label: 'Paid',
        value: row.paidTotal,
      },
      {
        dataType: EDataType.DATE,
        label: 'Last invoice',
        value: row.lastInvoiceAt,
      },
      {
        dataType: EDataType.DATE,
        label: 'Last payment',
        value: row.lastPaymentAt,
      }
    );
    return segments;
  }

  private isPoSalesParty(row: IPo): boolean {
    return (
      row.originalRawData.partyType === EDocContext.SALES ||
      this.docRouteContext() === EDocContext.SALES
    );
  }

  private loadPoList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IPoGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IPoGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    const docType = this.docRouteContext();

    return {
      ...this.workspaceContext.filters(),
      ...base,
      ...(docType ? { docType } : {}),
      ...(this.searchTerm() ? { search: this.searchTerm() } : {}),
    };
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.loadPoList();
  }

  private mapTableData(response: IPoGetBaseResponseDto[]): IPo[] {
    return response.map((record: IPoGetBaseResponseDto) => {
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
        poDate: record.poDate,
        poNumber: record.poNumber,
        taxableAmount: record.taxableAmount,
        gstPercentage: `${record.gstPercentage}%`,
        gstAmount: record.gstAmount,
        totalAmount: record.totalAmount,
        fileKey: record.fileKey,
        fileKeys: poAttachmentKeys(record),
        approvalStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.projectDocumentApprovalStatuses(),
          record.approvalStatus
        ),
        isLocked: record.isLocked,
        unlockRequestedAt: record.unlockRequestedAt,
        unlockRequestedByUser: record.unlockRequestedByUser,
        unlockReason: record.unlockReason,
        invoicedTotal: record.invoicedTotal,
        bookedTotal: record.bookedTotal,
        paidTotal: record.paidTotal,
        lastInvoiceAt: record.lastInvoiceAt,
        lastPaymentAt: record.lastPaymentAt,
        contractor: record.contractor,
        items: record.items,
        gstType: record.gstType,
        isSystemGenerated: record.isSystemGenerated,
        originalRawData: record,
      } satisfies IPo;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadPoList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addPo') {
      if (this.poCanCreate()?.allowed === false) {
        return;
      }
      this.openAddPoDialog();
      return;
    }

    if (actionName === 'generatePo') {
      if (this.poCanCreate()?.allowed === false) {
        return;
      }
      this.openGeneratePoDialog();
    }
  }

  private openAddPoDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      PO_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        projectName: this.workspaceContext.activeProjectId(),
        onSuccess: () => {
          this.loadPoList();
        },
      }
    );
  }

  private openGeneratePoDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.GENERATE,
      PO_ACTION_CONFIG_MAP[EButtonActionType.GENERATE],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        projectName: this.workspaceContext.activeProjectId(),
        isSystemGenerated: true,
        onSuccess: () => {
          this.loadPoList();
        },
      }
    );
  }

  protected openPoDoc(poId: string): void {
    this.loadingService.show({
      title: 'Loading PO DOC',
      message: 'Fetching the PO document. Please wait…',
    });

    this.poService
      .getPoPdf(poId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttachmentsGetResponseDto) => {
          this.galleryService.show([
            {
              mediaKey: response.key,
              actualMediaUrl: response.url,
            },
          ]);
        },
        error: error => {
          this.logger.logUserAction('Failed to load PO PDF', error);
          this.notificationService.error(
            'Could not load the PO document. Please try again.'
          );
        },
      });
  }

  protected handleAttachmentClick(row: Record<string, unknown>): void {
    const po = row as unknown as IPo;
    if (!po.id) {
      return;
    }

    if (isPoSystemGenerated(po.originalRawData)) {
      this.openPoDoc(po.id);
      return;
    }

    if (!po.fileKeys?.length) {
      return;
    }

    const media: IGalleryInputData[] = po.fileKeys.map((key: string) => ({
      mediaKey: key,
      actualMediaUrl: '',
    }));
    this.galleryService.show(media);
  }

  protected handlePoTableActionClick(
    event: ITableActionClickEvent<IPoGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showPoDetailsDrawer(selectedFirstRow);
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadPoList();
      },
      docContext: selectedFirstRow.partyType,
    };

    const showRecordSummary = actionType !== EButtonActionType.EDIT;
    const recordDetail = showRecordSummary
      ? this.preparePoRecordDetail(selectedFirstRow)
      : null;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      PO_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      false,
      showRecordSummary,
      dynamicComponentInputs
    );
  }

  private preparePoRecordDetail(
    selectedRow: IPoGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'PO Date',
        value: selectedRow.poDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'PO Taxable Amount',
        value: selectedRow.taxableAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'PO GST Amount',
        value: selectedRow.gstAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'PO Total Amount',
        value: selectedRow.totalAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
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
        name: `${selectedRow.contractor?.name} ${selectedRow.vendor?.name}`,
        subtitle: `${selectedRow.poNumber}`,
      },
    };
  }

  private showPoDetailsDrawer(rowData: IPoGetBaseResponseDto): void {
    this.logger.logUserAction('Opening PO details drawer', rowData);

    this.drawerService.showDrawer(GetPoDetailComponent, {
      header: `PO Details`,
      subtitle: `Detailed view of PO`,
      componentData: {
        po: rowData,
      },
    });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    const canCreate = this.poCanCreate();
    const headerButtonConfig: IPageHeaderConfig['headerButtonConfig'] = [
      {
        ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
        label: 'Add PO',
        actionName: 'addPo',
        permission: [APP_PERMISSION.PO_DOC.ADD],
        disabled: canCreate?.allowed === false,
        disabledTooltip: canCreate?.reason ?? undefined,
      },
    ];

    if (this.docRouteContext() === EDocContext.PURCHASE) {
      headerButtonConfig.push({
        ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_2,
        label: 'Generate PO',
        actionName: 'generatePo',
        permission: [APP_PERMISSION.PO_DOC.GENERATE_PO_DOC],
        disabled: canCreate?.allowed === false,
        disabledTooltip: canCreate?.reason ?? undefined,
      });
    }

    return {
      title: '',
      subtitle: '',
      showHeaderButton: true,
      showGoBackButton: false,
      showSearch: true,
      searchPlaceholder: 'Search by PO Number',
      headerButtonConfig,
    };
  }
}
