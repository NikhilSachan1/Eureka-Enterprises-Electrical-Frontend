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
  REPORT_ACTION_CONFIG_MAP,
  createReportTableEnhancedConfig,
} from '../../config';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  IReportGetBaseResponseDto,
  IReportGetFormDto,
  IReportGetResponseDto,
} from '../../types/report.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { ReportService } from '../../services/report.service';
import { IReport } from '../../types/report.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetReportDetailComponent } from '../get-report-detail/get-report-detail.component';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-get-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
  ],
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

  constructor() {
    effect(() => {
      this.workspaceContext.filterSubmitVersion();
      if (this.tableFilterData) {
        this.loadReportList();
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
      createReportTableEnhancedConfig(loggedInUserId)
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.reportService.getReportList(this.prepareParamData()).pipe(
            finalize(() => this.table.setLoading(false)),
            catchError(error => {
              this.table.setData([]);
              this.logger.logUserAction('Failed to load report records', error);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IReportGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('Report records loaded successfully');
        },
      });
  }

  private loadReportList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IReportGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IReportGetFormDto>(
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
    this.loadReportList();
  }

  private mapTableData(response: IReportGetBaseResponseDto[]): IReport[] {
    return response.map((record: IReportGetBaseResponseDto) => {
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
        reportDate: record.reportDate,
        reportNumber: record.reportNumber,
        jmc: record.jmc,
        fileKeys: record.fileKey ? [record.fileKey] : [],
        contractor: record.contractor,
        documentReferenceHierarchy: DocReferenceHierarchy.forReportRow({
          poNumber: record.jmc.po.poNumber,
          jmcNumber: record.jmc.jmcNumber,
        }),
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
        projectName: this.workspaceContext.activeProjectId(),
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
      showSearch: true,
      searchPlaceholder: 'Search by Report Number',
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Report',
          actionName: 'addReport',
          permission: [APP_PERMISSION.REPORT_DOC.ADD],
        },
      ],
    };
  }
}
