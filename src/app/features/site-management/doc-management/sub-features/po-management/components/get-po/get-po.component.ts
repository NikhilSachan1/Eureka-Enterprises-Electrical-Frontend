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
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
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
import { PO_ACTION_CONFIG_MAP, PO_TABLE_ENHANCED_CONFIG } from '../../config';
import {
  IPoGetBaseResponseDto,
  IPoGetFormDto,
  IPoGetResponseDto,
} from '../../types/po.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PoService } from '../../services/po.service';
import { IPo } from '../../types/po.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetPoDetailComponent } from '../get-po-detail/get-po-detail.component';
import { IProjectWorkspaceSearchFilterFormDto } from '@features/site-management/project-management/types/project.interface';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { UnlockRequestComponent } from '@features/site-management/doc-management/shared/components/unlock-request/unlock-request.component';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';

@Component({
  selector: 'app-get-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    UnlockRequestComponent,
    DocAmountComponent,
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
        this.loadPoList();
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
      PO_TABLE_ENHANCED_CONFIG(this.docRouteContext())
    );
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
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Invoiced',
        value: row.invoicedTotal,
      },
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
      {
        dataType: EDataType.DATE,
        label: 'Last invoice',
        value: row.lastInvoiceAt,
      },
      {
        dataType: EDataType.DATE,
        label: 'Last payment',
        value: row.lastPaymentAt,
      },
    ];
  }

  private loadPoList(): void {
    this.table.setLoading(true);

    const paramData = this.prepareParamData();

    this.poService
      .getPoList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPoGetResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });

          this.logger.logUserAction('PO records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load PO records', error);
        },
      });
  }

  private prepareParamData(): IPoGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IPoGetFormDto>(
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

  private mapTableData(response: IPoGetBaseResponseDto[]): IPo[] {
    return response.map((record: IPoGetBaseResponseDto) => {
      return {
        id: record.id,
        company: record.site.company,
        site: record.site,
        siteCityStateSubtitle: `${record.site.city}, ${record.site.state}`,
        poDate: record.poDate,
        poNumber: record.poNumber,
        taxableAmount: record.taxableAmount,
        gstPercentage: `${record.gstPercentage}%`,
        gstAmount: record.gstAmount,
        totalAmount: record.totalAmount,
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
        invoicedTotal: record.invoicedTotal,
        bookedTotal: record.bookedTotal,
        paidTotal: record.paidTotal,
        lastInvoiceAt: record.lastInvoiceAt,
        lastPaymentAt: record.lastPaymentAt,
        contractor: record.contractor,
        vendor: record.vendor,
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
      this.openAddPoDialog();
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
        onSuccess: () => {
          this.loadPoList();
        },
      }
    );
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
    return {
      title: '',
      subtitle: '',
      showHeaderButton: true,
      showGoBackButton: false,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add PO',
          actionName: 'addPo',
          // permission: [APP_PERMISSION.PO_DOC.ADD],
        },
      ],
    };
  }
}
