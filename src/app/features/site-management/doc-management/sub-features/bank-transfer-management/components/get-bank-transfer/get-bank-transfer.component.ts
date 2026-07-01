import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  getBankTransferActionConfigMap,
  getBankTransferTableConfig,
  getBankTransferHasPaidFromAccountFilterFieldConfig,
  getBankTransferPaidFromAccountFilterFieldConfig,
} from '../../config';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  IBankTransferGetBaseResponseDto,
  IBankTransferGetFormDto,
  IBankTransferGetResponseDto,
} from '../../types/bank-transfer.dto';
import { IBankTransfer } from '../../types/bank-transfer.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { BankTransferService } from '../../services/bank-transfer.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetBankTransferDetailComponent } from '../get-bank-transfer-detail/get-bank-transfer-detail.component';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-get-bank-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DataTableComponent,
    DocAmountComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-bank-transfer.component.html',
  styleUrl: './get-bank-transfer.component.scss',
})
export class GetBankTransferComponent implements OnInit, OnDestroy {
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
  private readonly bankTransferService = inject(BankTransferService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);

  private lastProjectIdForHeaderFilters: string | undefined;
  private searchDebounceTimer?: ReturnType<typeof setTimeout>;
  private readonly docRouteContext = signal<EDocContext | undefined>(undefined);
  protected readonly searchTerm = signal<string>('');
  protected searchInput = '';
  protected readonly selectedPaidFromAccount = signal<string | undefined>(
    undefined
  );
  protected readonly selectedHasPaidFromAccount = signal<
    'true' | 'false' | undefined
  >(undefined);
  protected readonly paidFromAccountFilterFieldConfig = computed(() =>
    getBankTransferPaidFromAccountFilterFieldConfig(
      this.docRouteContext() ?? EDocContext.PURCHASE
    )
  );
  protected readonly hasPaidFromAccountFilterFieldConfig = computed(() =>
    getBankTransferHasPaidFromAccountFilterFieldConfig(
      this.docRouteContext() ?? EDocContext.PURCHASE
    )
  );

  protected readonly pageHeaderConfig = computed(() =>
    this.getPageHeaderConfig()
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    effect(() => {
      const projectId = this.workspaceContext.selectedProjectId();
      this.workspaceContext.filterSubmitVersion();

      if (projectId !== this.lastProjectIdForHeaderFilters) {
        this.selectedPaidFromAccount.set(undefined);
        this.selectedHasPaidFromAccount.set(undefined);
        this.lastProjectIdForHeaderFilters = projectId;
      }

      if (this.tableFilterData) {
        this.loadBankTransferList();
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounceTimer);
  }

  ngOnInit(): void {
    const docContext = this.route.parent?.snapshot.data[
      'docContext'
    ] as EDocContext;
    this.docRouteContext.set(docContext);
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      getBankTransferTableConfig(docContext, loggedInUserId)
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.bankTransferService
            .getBankTransferList(this.prepareParamData())
            .pipe(
              finalize(() => this.table.setLoading(false)),
              catchError(error => {
                this.table.setData([]);
                this.logger.logUserAction(
                  'Failed to load bank transfers',
                  error
                );
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IBankTransferGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('Bank transfers loaded');
        },
      });
  }

  private loadBankTransferList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IBankTransferGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IBankTransferGetFormDto>(
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
      ...(this.selectedPaidFromAccount()
        ? { paidFromAccount: this.selectedPaidFromAccount() }
        : {}),
      ...(this.selectedHasPaidFromAccount()
        ? { hasPaidFromAccount: this.selectedHasPaidFromAccount() }
        : {}),
    };
  }

  protected onSearchInput(value: string): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.searchTerm.set(value.trim());
      this.loadBankTransferList();
    }, 400);
  }

  protected onPaidFromAccountFilterChange(value: unknown): void {
    this.selectedPaidFromAccount.set(
      typeof value === 'string' && value.length > 0 ? value : undefined
    );
    this.loadBankTransferList();
  }

  protected onHasPaidFromAccountFilterChange(value: unknown): void {
    this.selectedHasPaidFromAccount.set(
      value === 'true' || value === 'false' ? value : undefined
    );
    this.loadBankTransferList();
  }

  protected docBankTransferAmountSegments(
    row: IBankTransfer
  ): IDocAmountSegment[] {
    const isSales = this.docRouteContext() === EDocContext.SALES;
    return [
      {
        dataType: EDataType.CURRENCY,
        label: isSales ? 'Received' : 'Transfer',
        value: row.transferAmount,
      },
    ];
  }

  private mapTableData(
    response: IBankTransferGetBaseResponseDto[]
  ): IBankTransfer[] {
    return response.map(record => {
      const invoiceRef = record.invoice ?? record.bookPayment?.invoice ?? null;
      return {
        id: record.id,
        transferDate: record.transferDate,
        utrNumber: record.utrNumber,
        transferAmount: record.transferAmount,
        remarks: record.remarks,
        docWorkspaceContext: {
          companyName: record.site.company.name,
          partyName:
            record.partyType === EDocContext.SALES
              ? (record.contractor?.name ?? '—')
              : (record.vendor?.name ?? '—'),
          projectName: record.site.name,
          siteLocationSubtitle: `${record.site.city}, ${record.site.state}`,
        },
        documentReferenceHierarchy:
          DocReferenceHierarchy.forBankTransferDetailReference({
            poNumber: invoiceRef?.jmc?.po?.poNumber,
            jmcNumber: invoiceRef?.jmc?.jmcNumber,
            invoiceNumber: invoiceRef?.invoiceNumber,
            bookPayment:
              record.partyType === EDocContext.PURCHASE
                ? record.createdAt
                : null,
          }),
        transferProofAttachmentKeys: this.proofKeysForBankTransferRow(record),
        paymentAdviceReferenceNumber:
          record.paymentAdvice?.referenceNumber ?? null,
        paymentAdvicePdfKeys: record.paymentAdvice?.pdfKey
          ? [record.paymentAdvice.pdfKey]
          : [],
        originalRawData: record,
      };
    });
  }

  private proofKeysForBankTransferRow(
    record: IBankTransferGetBaseResponseDto
  ): string[] {
    const fromBookPayment =
      record.partyType === EDocContext.PURCHASE && record.proofFileKey
        ? [record.proofFileKey]
        : [];
    if (fromBookPayment.length > 0) {
      return fromBookPayment;
    }
    return record.proofFileKey ? [record.proofFileKey] : [];
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadBankTransferList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addBankTransfer') {
      this.openAddDialog();
    }
  }

  private openAddDialog(): void {
    const docContext = this.docRouteContext();
    if (!docContext) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      getBankTransferActionConfigMap(docContext)[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        projectName: this.workspaceContext.activeProjectId(),
        onSuccess: () => this.loadBankTransferList(),
      }
    );
  }

  protected handleTableActionClick(
    event: ITableActionClickEvent<IBankTransferGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const raw = selectedRows[0];

    if (!raw) {
      this.logger.error(
        'Bank transfer row action: selected row missing (unexpected)'
      );
      return;
    }

    if (actionType === EButtonActionType.VIEW) {
      this.showDetailDrawer(raw);
      return;
    }

    const selectedRecord =
      actionType === EButtonActionType.SEND_EMAIL && raw.paymentAdvice
        ? [
            {
              id: raw.paymentAdvice.id,
              referenceNumber: raw.paymentAdvice.referenceNumber,
              pdfKey: raw.paymentAdvice.pdfKey,
              vendor: { email: raw.vendor?.email ?? null },
            },
          ]
        : [raw];

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord,
      ...(actionType === EButtonActionType.EDIT
        ? { docContext: this.docRouteContext() }
        : {}),
      onSuccess: () => this.loadBankTransferList(),
    };

    const showRecordSummary = actionType !== EButtonActionType.EDIT;
    const recordDetail = showRecordSummary
      ? this.prepareRecordDetail(raw)
      : null;

    const docContext = this.docRouteContext();
    if (!docContext) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      getBankTransferActionConfigMap(docContext)[actionType],
      recordDetail,
      false,
      showRecordSummary,
      dynamicComponentInputs
    );
  }

  private prepareRecordDetail(
    row: IBankTransferGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const isSales = row.partyType === EDocContext.SALES;
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: isSales ? 'Received Date' : 'Transfer Date',
        value: row.transferDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'UTR / Reference',
        value: row.utrNumber,
      },
      {
        label: 'Amount',
        value: row.transferAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
    ];
    return {
      details: [
        {
          entryData,
          status: {
            entryType: row.partyType,
          },
        },
      ],
      entity: {
        name: row.utrNumber,
      },
    };
  }

  private showDetailDrawer(row: IBankTransferGetBaseResponseDto): void {
    const isSales = row.partyType === EDocContext.SALES;
    this.drawerService.showDrawer(GetBankTransferDetailComponent, {
      header: isSales ? 'Bank received details' : 'Bank transfer details',
      subtitle: 'Detailed view',
      componentData: { bankTransfer: row },
    });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    const isSales = this.docRouteContext() === EDocContext.SALES;
    return {
      title: '',
      subtitle: '',
      showHeaderButton: true,
      showGoBackButton: false,
      showHeaderFilter: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: isSales ? 'Add Bank Received' : 'Add Bank Transfer',
          actionName: 'addBankTransfer',
          permission: [APP_PERMISSION.BANK_TRANSFER_DOC.ADD],
        },
      ],
    };
  }
}
