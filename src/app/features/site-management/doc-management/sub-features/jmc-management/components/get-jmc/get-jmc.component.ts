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
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { APP_CONFIG } from '@core/config';
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
import { JMC_ACTION_CONFIG_MAP, JMC_TABLE_ENHANCED_CONFIG } from '../../config';
import {
  IJmcGetBaseResponseDto,
  IJmcGetFormDto,
  IJmcGetResponseDto,
} from '../../types/jmc.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { JmcService } from '../../services/jmc.service';
import { IJmc } from '../../types/jmc.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetJmcDetailComponent } from '../get-jmc-detail/get-jmc-detail.component';
import { IProjectWorkspaceSearchFilterFormDto } from '@features/site-management/project-management/types/project.interface';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { UnlockRequestComponent } from '@features/site-management/doc-management/shared/components/unlock-request/unlock-request.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
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
        this.loadJmcList();
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
    this.table = this.dataTableService.createTable(JMC_TABLE_ENHANCED_CONFIG);
  }

  private loadJmcList(): void {
    this.table.setLoading(true);

    const paramData = this.prepareParamData();

    this.jmcService
      .getJmcList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IJmcGetResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });

          this.logger.logUserAction('JMC records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load JMC records', error);
        },
      });
  }

  private prepareParamData(): IJmcGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IJmcGetFormDto>(
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
    return {
      title: '',
      subtitle: '',
      showHeaderButton: true,
      showGoBackButton: false,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add JMC',
          actionName: 'addJmc',
        },
      ],
    };
  }
}
