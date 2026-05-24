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
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  createGstEntryTableEnhancedConfig,
  GST_ACTION_CONFIG_MAP,
  GST_IS_VERIFIED_FILTER_FIELD_CONFIG,
  GST_PARTY_TYPE_FILTER_FIELD_CONFIG,
} from '../../config';
import {
  IGstEntryGetBaseResponseDto,
  IGstEntryGetFormDto,
  IGstEntryGetResponseDto,
} from '../../types/gst.dto';
import { IGstEntry } from '../../types/gst.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { GstService } from '../../services/gst.service';
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
import { GetGstEntryDetailComponent } from '../get-gst-entry-detail/get-gst-entry-detail.component';

@Component({
  selector: 'app-get-gst-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    DataTableComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
    DocAmountComponent,
  ],
  templateUrl: './get-gst-entry.component.html',
  styleUrl: './get-gst-entry.component.scss',
})
export class GetGstEntryComponent implements OnInit {
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
  private readonly gstService = inject(GstService);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);

  protected readonly partyTypeFilterFieldConfig: IInputFieldsConfig =
    GST_PARTY_TYPE_FILTER_FIELD_CONFIG;
  protected readonly isVerifiedFilterFieldConfig: IInputFieldsConfig =
    GST_IS_VERIFIED_FILTER_FIELD_CONFIG;
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
        this.loadGstEntryList();
      }
    });
  }

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createGstEntryTableEnhancedConfig()
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.gstService.getGstEntryList(this.prepareParamData()).pipe(
            finalize(() => this.table.setLoading(false)),
            catchError(error => {
              this.table.setData([]);
              this.logger.logUserAction(
                'Failed to load GST register entries',
                error
              );
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IGstEntryGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('GST register entries loaded successfully');
        },
      });
  }

  protected docGstAmountSegments(row: IGstEntry): IDocAmountSegment[] {
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
      },
    ];
  }

  private loadGstEntryList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IGstEntryGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IGstEntryGetFormDto>(
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
    this.loadGstEntryList();
  }

  protected onIsVerifiedFilterChange(value: unknown): void {
    this.selectedIsVerified.set(
      value === 'true' || value === 'false' ? value : undefined
    );
    this.loadGstEntryList();
  }

  private mapTableData(response: IGstEntryGetBaseResponseDto[]): IGstEntry[] {
    return response.map(
      record =>
        ({
          id: record.id,
          partyType: record.partyType,
          invoiceDate: record.invoice.invoiceDate,
          taxableAmount: record.taxableAmount,
          gstAmount: record.gstAmount,
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
          documentReferenceHierarchy: DocReferenceHierarchy.forBookPaymentRow({
            poNumber: record.invoice.jmc?.po?.poNumber,
            jmcNumber: record.invoice.jmc?.jmcNumber,
            invoiceNumber: record.invoice.invoiceNumber,
          }),
          originalRawData: record,
        }) satisfies IGstEntry
    );
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadGstEntryList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addGstPaymentRelease') {
      this.openAddGstPaymentReleaseDialog();
    }
  }

  private openAddGstPaymentReleaseDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      GST_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        projectName: this.workspaceContext.activeProjectId(),
        onSuccess: () => {
          this.loadGstEntryList();
        },
      }
    );
  }

  protected handleGstEntryTableActionClick(
    event: ITableActionClickEvent<IGstEntryGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const selectedFirstRow = selectedRows[0];

    if (!selectedFirstRow) {
      this.logger.error(
        'GST entry row action: selected row missing (unexpected)'
      );
      return;
    }

    if (actionType === EButtonActionType.VIEW) {
      this.showGstEntryDetailsDrawer(selectedFirstRow);
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => this.loadGstEntryList(),
    };

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      GST_ACTION_CONFIG_MAP[actionType],
      this.prepareGstEntryRecordDetail(selectedFirstRow),
      false,
      true,
      dynamicComponentInputs
    );
  }

  private prepareGstEntryRecordDetail(
    row: IGstEntryGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const partyName =
      row.partyType === EDocContext.SALES
        ? (row.contractor?.name ?? '—')
        : (row.vendor?.name ?? '—');

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Invoice date',
        value: row.invoice.invoiceDate,
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
        label: 'GST amount',
        value: row.gstAmount,
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
        subtitle: row.invoice.invoiceNumber,
      },
    };
  }

  private showGstEntryDetailsDrawer(row: IGstEntryGetBaseResponseDto): void {
    this.drawerService.showDrawer(GetGstEntryDetailComponent, {
      header: 'GST entry details',
      subtitle: 'Detailed view',
      componentData: { gstEntry: row },
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
          label: 'GST Payment Release',
          actionName: 'addGstPaymentRelease',
          permission: [APP_PERMISSION.GST.RELEASE],
        },
      ],
    };
  }
}
