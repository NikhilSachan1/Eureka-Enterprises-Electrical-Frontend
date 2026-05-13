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
  REPORT_ACTION_CONFIG_MAP,
  REPORT_TABLE_ENHANCED_CONFIG,
} from '../../config';
import {
  IReportGetBaseResponseDto,
  IReportGetFormDto,
  IReportGetResponseDto,
} from '../../types/report.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ReportService } from '../../services/report.service';
import { IReport } from '../../types/report.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetReportDetailComponent } from '../get-report-detail/get-report-detail.component';
import { IProjectWorkspaceSearchFilterFormDto } from '@features/site-management/project-management/types/project.interface';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';

@Component({
  selector: 'app-get-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DataTableComponent],
  templateUrl: './get-report.component.html',
  styleUrl: './get-report.component.scss',
})
export class GetReportComponent implements OnInit {
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
  private readonly reportService = inject(ReportService);
  private readonly route = inject(ActivatedRoute);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );

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
        this.loadReportList();
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
      REPORT_TABLE_ENHANCED_CONFIG(this.docRouteContext())
    );
  }

  private loadReportList(): void {
    this.table.setLoading(true);

    const paramData = this.prepareParamData();

    this.reportService
      .getReportList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IReportGetResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });

          this.logger.logUserAction('Report records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load report records', error);
        },
      });
  }

  private prepareParamData(): IReportGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IReportGetFormDto>(
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

  private mapTableData(response: IReportGetBaseResponseDto[]): IReport[] {
    return response.map((record: IReportGetBaseResponseDto) => {
      const { site } = record;
      return {
        id: record.id,
        company: record.site.company,
        site,
        siteCityStateSubtitle: site ? `${site.city}, ${site.state}` : '',
        reportDate: record.reportDate,
        reportNumber: record.reportNumber,
        jmc: record.jmc,
        fileKeys: record.fileKey ? [record.fileKey] : [],
        contractor: record.contractor,
        vendor: record.vendor,
        originalRawData: record,
      } satisfies IReport;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadReportList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addReport') {
      this.openAddReportDialog();
    }
  }

  private openAddReportDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      REPORT_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        onSuccess: () => {
          this.loadReportList();
        },
      }
    );
  }

  protected handleReportTableActionClick(
    event: ITableActionClickEvent<IReportGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showReportDetailsDrawer(selectedFirstRow);
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadReportList();
      },
    };

    const showRecordSummary = actionType !== EButtonActionType.EDIT;
    const recordDetail = showRecordSummary
      ? this.prepareReportRecordDetail(selectedFirstRow)
      : null;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      REPORT_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      false,
      showRecordSummary,
      dynamicComponentInputs
    );
  }

  private prepareReportRecordDetail(
    selectedRow: IReportGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Report Date',
        value: selectedRow.reportDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'JMC Number',
        value: selectedRow.jmc?.jmcNumber ?? 'N/A',
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
          },
          entryData,
        },
      ],
      entity: {
        name: `${selectedRow.contractor?.name ?? ''} ${selectedRow.vendor?.name ?? ''}`.trim(),
        subtitle: selectedRow.reportNumber,
      },
    };
  }

  private showReportDetailsDrawer(rowData: IReportGetBaseResponseDto): void {
    this.logger.logUserAction('Opening report details drawer', rowData);

    this.drawerService.showDrawer(GetReportDetailComponent, {
      header: 'Report Details',
      subtitle: 'Detailed view of report',
      componentData: {
        report: rowData,
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
          label: 'Add Report',
          actionName: 'addReport',
        },
      ],
    };
  }
}
