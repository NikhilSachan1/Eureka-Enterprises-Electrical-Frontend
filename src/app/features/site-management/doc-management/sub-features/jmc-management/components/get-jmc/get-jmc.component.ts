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
  JMC_ACTION_CONFIG_MAP,
  createJmcTableEnhancedConfig,
} from '../../config';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  IJmcGetBaseResponseDto,
  IJmcGetFormDto,
  IJmcGetResponseDto,
} from '../../types/jmc.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { JmcService } from '../../services/jmc.service';
import { IJmc } from '../../types/jmc.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetJmcDetailComponent } from '../get-jmc-detail/get-jmc-detail.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { UnlockRequestComponent } from '@features/site-management/doc-management/shared/components/unlock-request/unlock-request.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-get-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    UnlockRequestComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-jmc.component.html',
  styleUrl: './get-jmc.component.scss',
})
export class GetJmcComponent implements OnInit {
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
  private readonly jmcService = inject(JmcService);
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

  constructor() {
    effect(() => {
      this.workspaceContext.filterSubmitVersion();
      if (this.tableFilterData) {
        this.loadJmcList();
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
      createJmcTableEnhancedConfig(loggedInUserId)
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.jmcService.getJmcList(this.prepareParamData()).pipe(
            finalize(() => this.table.setLoading(false)),
            catchError(error => {
              this.table.setData([]);
              this.logger.logUserAction('Failed to load JMC records', error);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IJmcGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('JMC records loaded successfully');
        },
      });
  }

  private loadJmcList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IJmcGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IJmcGetFormDto>(
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
    this.loadJmcList();
  }

  private mapTableData(response: IJmcGetBaseResponseDto[]): IJmc[] {
    return response.map((record: IJmcGetBaseResponseDto) => {
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
        jmcDate: record.jmcDate,
        jmcNumber: record.jmcNumber,
        po: record.po,
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
        documentReferenceHierarchy: DocReferenceHierarchy.forJmc(
          record.po.poNumber
        ),
        originalRawData: record,
      } satisfies IJmc;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadJmcList();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addJmc') {
      this.openAddJmcDialog();
      return;
    }

    if (actionName === 'generateJmc') {
      this.openGenerateJmcDialog();
    }
  }

  private openAddJmcDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      JMC_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        projectName: this.workspaceContext.activeProjectId(),
        onSuccess: () => {
          this.loadJmcList();
        },
      }
    );
  }

  private openGenerateJmcDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.GENERATE,
      JMC_ACTION_CONFIG_MAP[EButtonActionType.GENERATE],
      null,
      false,
      false,
      {
        docContext: this.docRouteContext(),
        projectName: this.workspaceContext.activeProjectId(),
        isSystemGenerated: true,
        onSuccess: () => {
          this.loadJmcList();
        },
      }
    );
  }

  protected handleJmcTableActionClick(
    event: ITableActionClickEvent<IJmcGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showJmcDetailsDrawer(selectedFirstRow);
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadJmcList();
      },
    };

    const showRecordSummary = actionType !== EButtonActionType.EDIT;
    const recordDetail = showRecordSummary
      ? this.prepareJmcRecordDetail(selectedFirstRow)
      : null;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      JMC_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      false,
      showRecordSummary,
      dynamicComponentInputs
    );
  }

  private prepareJmcRecordDetail(
    selectedRow: IJmcGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'JMC Date',
        value: selectedRow.jmcDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
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
        subtitle: `${selectedRow.jmcNumber}`,
      },
    };
  }

  private showJmcDetailsDrawer(rowData: IJmcGetBaseResponseDto): void {
    this.logger.logUserAction('Opening JMC details drawer', rowData);

    this.drawerService.showDrawer(GetJmcDetailComponent, {
      header: `JMC Details`,
      subtitle: `Detailed view of JMC`,
      componentData: {
        jmc: rowData,
      },
    });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    const headerButtonConfig: IPageHeaderConfig['headerButtonConfig'] = [
      {
        ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
        label: 'Add JMC',
        actionName: 'addJmc',
        permission: [APP_PERMISSION.JMC_DOC.ADD],
      },
    ];

    if (this.docRouteContext() === EDocContext.SALES) {
      headerButtonConfig.push({
        ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_2,
        label: 'Generate JMC',
        actionName: 'generateJmc',
        permission: [APP_PERMISSION.JMC_DOC.GENERATE_JMC_DOC],
      });
    }

    return {
      title: '',
      subtitle: '',
      showHeaderButton: true,
      showGoBackButton: false,
      showSearch: true,
      searchPlaceholder: 'Search by JMC Number',
      headerButtonConfig,
    };
  }
}
