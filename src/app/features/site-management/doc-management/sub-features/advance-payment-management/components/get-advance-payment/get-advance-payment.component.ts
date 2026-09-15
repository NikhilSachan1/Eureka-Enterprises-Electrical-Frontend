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
import {
  ADVANCE_PAYMENT_ACTION_CONFIG_MAP,
  createAdvancePaymentTableEnhancedConfig,
} from '../../config';
import {
  IAdvancePaymentGetBaseResponseDto,
  IAdvancePaymentGetFormDto,
  IAdvancePaymentGetResponseDto,
} from '../../types/advance-payment.dto';
import { IAdvancePayment } from '../../types/advance-payment.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { AdvancePaymentService } from '../../services/advance-payment.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetAdvancePaymentDetailComponent } from '../get-advance-payment-detail/get-advance-payment-detail.component';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import {
  buildAdvancePaymentPoDoc,
  buildAdvancePaymentWorkspaceContext,
  resolveAdvancePaymentFileKeys,
  resolveAdvancePaymentPoNumber,
  resolveAdvancePaymentVendorName,
} from '../../utils/advance-payment-table-row.util';

@Component({
  selector: 'app-get-advance-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    DocWorkspaceContextComponent,
    DocAmountComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './get-advance-payment.component.html',
  styleUrl: './get-advance-payment.component.scss',
})
export class GetAdvancePaymentComponent implements OnInit {
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
  private readonly advancePaymentService = inject(AdvancePaymentService);
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
        this.loadAdvancePaymentList();
      }
    });
  }

  ngOnInit(): void {
    const docContext = this.route.parent?.snapshot.data[
      'docContext'
    ] as EDocContext;
    this.docRouteContext.set(docContext);
    this.table = this.dataTableService.createTable(
      createAdvancePaymentTableEnhancedConfig()
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.advancePaymentService
            .getAdvancePaymentList(this.prepareParamData())
            .pipe(
              finalize(() => this.table.setLoading(false)),
              catchError(error => {
                this.table.setData([]);
                this.logger.logUserAction(
                  'Failed to load advance payment records',
                  error
                );
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAdvancePaymentGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Advance payment records loaded successfully'
          );
        },
      });
  }

  private loadAdvancePaymentList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IAdvancePaymentGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IAdvancePaymentGetFormDto>(
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
    this.loadAdvancePaymentList();
  }

  private mapTableData(
    response: IAdvancePaymentGetBaseResponseDto[]
  ): IAdvancePayment[] {
    return response.map((record: IAdvancePaymentGetBaseResponseDto) => {
      return {
        id: record.id,
        advanceNumber: record.advanceNumber,
        approvalStatus: record.approvalStatus,
        amount: record.amount,
        advanceDate: record.advanceDate,
        settledAmount: record.settledAmount,
        balanceAmount: record.balanceAmount,
        po: record.po,
        vendor: record.vendor,
        site: record.site,
        company: record.company,
        poDoc: buildAdvancePaymentPoDoc(record),
        fileKeys: resolveAdvancePaymentFileKeys(record),
        docWorkspaceContext: buildAdvancePaymentWorkspaceContext(record),
        originalRawData: record,
      } satisfies IAdvancePayment;
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

  protected docAdvancePaymentAmountSegments(
    row: IAdvancePayment
  ): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Amount',
        value: row.amount,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Settled',
        value: row.settledAmount,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Balance',
        value: row.balanceAmount,
      },
    ];
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadAdvancePaymentList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addAdvancePayment') {
      this.openAddAdvancePaymentDialog();
    }
  }

  private openAddAdvancePaymentDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      ADVANCE_PAYMENT_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        projectName: this.workspaceContext.activeProjectId(),
        onSuccess: () => {
          this.loadAdvancePaymentList();
        },
      }
    );
  }

  protected handleAdvancePaymentTableActionClick(
    event: ITableActionClickEvent<IAdvancePaymentGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (!selectedFirstRow) {
      this.logger.error(
        'Advance payment row action: selected row missing (unexpected)'
      );
      return;
    }

    if (actionType === EButtonActionType.VIEW) {
      this.showAdvancePaymentDetailsDrawer(selectedFirstRow);
      return;
    }

    const showRecordSummary = actionType !== EButtonActionType.EDIT;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      ADVANCE_PAYMENT_ACTION_CONFIG_MAP[actionType],
      showRecordSummary
        ? this.prepareAdvancePaymentRecordDetail(selectedFirstRow)
        : null,
      false,
      showRecordSummary,
      {
        selectedRecord: selectedRows,
        docContext: this.docRouteContext(),
        onSuccess: () => {
          this.loadAdvancePaymentList();
        },
      }
    );
  }

  private prepareAdvancePaymentRecordDetail(
    selectedRow: IAdvancePaymentGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Advance No.',
        value: selectedRow.advanceNumber ?? '—',
      },
      {
        label: 'PO Number',
        value: resolveAdvancePaymentPoNumber(selectedRow) ?? '—',
      },
      {
        label: 'Advance Amount',
        value: selectedRow.amount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Attachment',
        value: resolveAdvancePaymentFileKeys(selectedRow),
        type: EDataType.ATTACHMENTS,
      },
    ];

    return {
      details: [
        {
          status: {
            approvalStatus: selectedRow.approvalStatus,
          },
          entryData,
        },
      ],
      entity: {
        name:
          resolveAdvancePaymentVendorName(selectedRow).trim() ||
          'Advance payment',
        subtitle:
          selectedRow.advanceNumber ??
          resolveAdvancePaymentPoNumber(selectedRow) ??
          selectedRow.id,
      },
    };
  }

  private showAdvancePaymentDetailsDrawer(
    rowData: IAdvancePaymentGetBaseResponseDto
  ): void {
    this.logger.logUserAction(
      'Opening Advance Payment details drawer',
      rowData
    );

    this.drawerService.showDrawer(GetAdvancePaymentDetailComponent, {
      header: 'Advance Payment Details',
      subtitle: 'Detailed view of Advance Payment',
      componentData: {
        advancePayment: rowData,
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
      searchPlaceholder: 'Search by Advance / PO Number',
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Advance Payment',
          actionName: 'addAdvancePayment',
          permission: [APP_PERMISSION.ADVANCE_PAYMENT_DOC.ADD],
        },
      ],
    };
  }
}
