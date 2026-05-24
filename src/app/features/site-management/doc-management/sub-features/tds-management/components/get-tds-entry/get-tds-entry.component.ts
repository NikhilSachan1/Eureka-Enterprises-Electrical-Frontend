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
  IInputFieldsConfig,
  IPageHeaderConfig,
  ITableActionClickEvent,
} from '@shared/types';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { TableLazyLoadEvent } from 'primeng/table';
import { APP_CONFIG } from '@core/config';
import {
  createTdsEntryTableEnhancedConfig,
  TDS_ACTION_CONFIG_MAP,
  TDS_IS_VERIFIED_FILTER_FIELD_CONFIG,
  TDS_PARTY_TYPE_FILTER_FIELD_CONFIG,
} from '../../config';
import {
  ITdsEntryGetBaseResponseDto,
  ITdsEntryGetFormDto,
  ITdsEntryGetResponseDto,
} from '../../types/tds.dto';
import { ITdsEntry } from '../../types/tds.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { TdsService } from '../../services/tds.service';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { GetTdsEntryDetailComponent } from '../get-tds-entry-detail/get-tds-entry-detail.component';

@Component({
  selector: 'app-get-tds-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    DataTableComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
    DocAmountComponent,
  ],
  templateUrl: './get-tds-entry.component.html',
  styleUrl: './get-tds-entry.component.scss',
})
export class GetTdsEntryComponent implements OnInit {
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
  private readonly tdsService = inject(TdsService);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);

  protected readonly partyTypeFilterFieldConfig: IInputFieldsConfig =
    TDS_PARTY_TYPE_FILTER_FIELD_CONFIG;
  protected readonly isVerifiedFilterFieldConfig: IInputFieldsConfig =
    TDS_IS_VERIFIED_FILTER_FIELD_CONFIG;
  protected readonly selectedPartyType = signal<EDocContext | undefined>(
    undefined
  );
  protected readonly selectedIsVerified = signal<string | undefined>(undefined);

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
        this.loadTdsEntryList();
      }
    });
  }

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createTdsEntryTableEnhancedConfig()
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.tdsService.getTdsEntryList(this.prepareParamData()).pipe(
            finalize(() => this.table.setLoading(false)),
            catchError(error => {
              this.table.setData([]);
              this.logger.logUserAction(
                'Failed to load TDS register entries',
                error
              );
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ITdsEntryGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('TDS register entries loaded successfully');
        },
      });
  }

  protected docTdsAmountSegments(row: ITdsEntry): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Taxable',
        value: row.taxableAmount,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'TDS',
        value: row.tdsAmount,
      },
    ];
  }

  private loadTdsEntryList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): ITdsEntryGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<ITdsEntryGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    return {
      ...this.workspaceContext.filters(),
      ...base,
      ...(this.selectedPartyType()
        ? { partyType: this.selectedPartyType() }
        : {}),
      ...(this.selectedIsVerified()
        ? {
            verificationStatus:
              this.selectedIsVerified() === 'true' ? true : false,
          }
        : {}),
    };
  }

  protected onPartyTypeFilterChange(value: unknown): void {
    this.selectedPartyType.set(
      typeof value === 'string' && value.length > 0
        ? (value as EDocContext)
        : undefined
    );
    this.loadTdsEntryList();
  }

  protected onIsVerifiedFilterChange(value: unknown): void {
    this.selectedIsVerified.set(
      value === 'true' || value === 'false' ? value : undefined
    );
    this.loadTdsEntryList();
  }

  private mapTableData(response: ITdsEntryGetBaseResponseDto[]): ITdsEntry[] {
    return response.map(
      record =>
        ({
          id: record.id,
          partyType: record.partyType,
          paymentDate: record.bookPayment.bookingDate,
          taxableAmount: record.taxableAmount,
          tdsAmount: record.tdsAmount,
          verificationStatusLabel: record.isVerified ? 'Approved' : 'Pending',
          docWorkspaceContext: {
            companyName: record.site.company.name,
            partyName:
              record.partyType === EDocContext.SALES
                ? (record.contractor?.name ?? '—')
                : (record.vendor?.name ?? '—'),
            partyType:
              record.partyType === EDocContext.SALES ? 'Contractor' : 'Vendor',
            projectName: record.site.name,
            siteLocationSubtitle: `${record.site.city}, ${record.site.state}`,
          },
          documentReferenceHierarchy:
            DocReferenceHierarchy.forBankTransferDetailReference({
              poNumber: record.bookPayment.invoice.jmc?.po?.poNumber,
              jmcNumber: record.bookPayment.invoice.jmc?.jmcNumber,
              invoiceNumber: record.bookPayment.invoice.invoiceNumber,
              bookPayment: record.bookPayment.bookingDate,
            }),
          originalRawData: record,
        }) satisfies ITdsEntry
    );
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadTdsEntryList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addTdsPaymentRelease') {
      this.openAddTdsPaymentReleaseDialog();
    }
  }

  private openAddTdsPaymentReleaseDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      TDS_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        projectName: this.workspaceContext.activeProjectId(),
        onSuccess: () => {
          this.loadTdsEntryList();
        },
      }
    );
  }

  protected handleTdsEntryTableActionClick(
    event: ITableActionClickEvent<ITdsEntryGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const selectedFirstRow = selectedRows[0];

    if (!selectedFirstRow) {
      this.logger.error(
        'TDS entry row action: selected row missing (unexpected)'
      );
      return;
    }

    if (actionType === EButtonActionType.VIEW) {
      this.showTdsEntryDetailsDrawer(selectedFirstRow);
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => this.loadTdsEntryList(),
    };

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      TDS_ACTION_CONFIG_MAP[actionType],
      this.prepareTdsEntryRecordDetail(selectedFirstRow),
      false,
      true,
      dynamicComponentInputs
    );
  }

  private prepareTdsEntryRecordDetail(
    row: ITdsEntryGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const partyName =
      row.partyType === EDocContext.SALES
        ? (row.contractor?.name ?? '—')
        : (row.vendor?.name ?? '—');

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Payment date',
        value: row.bookPayment.bookingDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Taxable amount',
        value: row.taxableAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'TDS amount',
        value: row.tdsAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
    ];

    return {
      details: [
        {
          status: {
            entryType: row.partyType,
            approvalStatus: row.isVerified ? 'approved' : 'pending',
          },
          entryData,
        },
      ],
      entity: {
        name: partyName.trim(),
        subtitle: row.bookPayment.invoice.invoiceNumber,
      },
    };
  }

  private showTdsEntryDetailsDrawer(row: ITdsEntryGetBaseResponseDto): void {
    this.drawerService.showDrawer(GetTdsEntryDetailComponent, {
      header: 'TDS entry details',
      subtitle: 'Detailed view',
      componentData: { tdsEntry: row },
    });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: '',
      subtitle: '',
      showHeaderButton: true,
      showHeaderFilter: true,
      showGoBackButton: false,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'TDS Payment Release',
          actionName: 'addTdsPaymentRelease',
        },
      ],
    };
  }
}
