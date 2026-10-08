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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { AppPermissionService, LoggerService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import {
  SITE_ALLOCATION_EMPLOYEE_FILTER_FIELD_CONFIG,
  SITE_ALLOCATION_HISTORY_ACTION_CONFIG_MAP,
  SITE_ALLOCATION_HISTORY_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { ProjectService } from '../../services/project.service';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';
import { buildWorkspaceEmployeeFilterFieldConfig } from '../../utility/project-allocated-employee-filter.util';
import {
  ISiteAllocationGetBaseResponseDto,
  ISiteAllocationGetFormDto,
  ISiteAllocationGetResponseDto,
} from '../../types/project.dto';
import { ISiteAllocationHistory } from '../../types/site-allocation.interface';
import { parseProjectDateOnly } from '../../utility/project-overview-date.util';
import {
  ConfirmationDialogService,
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
import { toTitleCase } from '@shared/utility';
import { TableLazyLoadEvent } from 'primeng/table';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-get-site-allocation-history',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    DataTableComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-site-allocation-history.component.html',
  styleUrl: './get-site-allocation-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetSiteAllocationHistoryComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly projectService = inject(ProjectService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  private lastProjectIdForEmployeeFilter: string | undefined;

  protected readonly pageHeaderConfig = computed(
    (): IPageHeaderConfig => this.getPageHeaderConfig()
  );

  protected readonly showEmployeeFilter = computed(() =>
    this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.DSR.SEARCH_FILTER_EMPLOYEE_NAME
    )
  );

  protected readonly employeeFilterFieldConfig = computed(() =>
    buildWorkspaceEmployeeFilterFieldConfig(
      SITE_ALLOCATION_EMPLOYEE_FILTER_FIELD_CONFIG,
      this.workspaceContext.selectedProjectId(),
      this.workspaceContext.projectOverview(),
      this.workspaceContext.overviewSiteId()
    )
  );
  protected readonly selectedEmployeeName = signal<string | null>(null);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    effect(() => {
      const projectId = this.workspaceContext.selectedProjectId();
      this.workspaceContext.filterSubmitVersion();

      if (projectId !== this.lastProjectIdForEmployeeFilter) {
        this.selectedEmployeeName.set(null);
        this.lastProjectIdForEmployeeFilter = projectId;
      }

      if (this.tableFilterData) {
        this.loadAllocationHistory();
      }
    });
  }

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      SITE_ALLOCATION_HISTORY_TABLE_ENHANCED_CONFIG
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.projectService
            .getSiteAllocationHistory(this.prepareParamData())
            .pipe(
              finalize(() => this.table.setLoading(false)),
              catchError(error => {
                this.table.setData([]);
                this.logger.logUserAction(
                  'Failed to load site allocation history',
                  error
                );
                return EMPTY;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISiteAllocationGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Site allocation history loaded successfully'
          );
        },
      });
  }

  private loadAllocationHistory(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): ISiteAllocationGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<ISiteAllocationGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    const employeeName = this.selectedEmployeeName();

    return {
      ...this.workspaceContext.filters(),
      ...(employeeName ? { employeeName } : {}),
      ...base,
    };
  }

  private mapTableData(
    response: ISiteAllocationGetBaseResponseDto[]
  ): ISiteAllocationHistory[] {
    return response.map((record: ISiteAllocationGetBaseResponseDto) => {
      const { site, user } = record;
      const fullName = `${user.firstName} ${user.lastName}`.trim();

      const allocatedAt = new Date(record.allocatedAt);
      const deallocatedAt = record.deallocatedAt
        ? new Date(record.deallocatedAt)
        : null;

      const city = site.city.trim();
      const state = site.state.trim();
      const locationParts = [city, state].filter(Boolean);
      let roleLabel = record.role?.trim();
      roleLabel ??= '—';

      return {
        id: record.id,
        docWorkspaceContext: {
          projectName: site.name,
          siteLocationSubtitle: locationParts.length
            ? locationParts.join(', ')
            : '—',
        },
        user: {
          fullName,
          employeeId: user.employeeId,
        },
        role: roleLabel,
        allocationPeriod: deallocatedAt
          ? [allocatedAt, deallocatedAt]
          : [allocatedAt],
        createdAt: new Date(record.createdAt),
        allocationStatus: record.isCurrentlyAllocated
          ? 'Allocated'
          : 'Deallocated',
        originalRawData: record,
      } satisfies ISiteAllocationHistory;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadAllocationHistory();
  }

  protected handleAllocationHistoryActionClick(
    event: ITableActionClickEvent
  ): void {
    const record = event.selectedRows[0] as unknown as
      | ISiteAllocationGetBaseResponseDto
      | undefined;
    if (!record?.id) {
      return;
    }

    if (event.actionType === EButtonActionType.EDIT) {
      this.openAllocationDialog(EButtonActionType.EDIT, record);
      return;
    }

    if (event.actionType === EButtonActionType.DELETE) {
      this.openAllocationDialog(EButtonActionType.DELETE, record);
    }
  }

  private openAllocationDialog(
    actionType: EButtonActionType.EDIT | EButtonActionType.DELETE,
    record: ISiteAllocationGetBaseResponseDto
  ): void {
    const actionConfig = SITE_ALLOCATION_HISTORY_ACTION_CONFIG_MAP[actionType];
    if (!actionConfig) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      actionConfig,
      this.prepareRecordDetail(record),
      false,
      true,
      {
        selectedRecord: [record],
        onSuccess: () => {
          this.loadAllocationHistory();
        },
      }
    );
  }

  private prepareRecordDetail(
    record: ISiteAllocationGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const fullName = `${record.user.firstName} ${record.user.lastName}`.trim();
    const allocatedAt = parseProjectDateOnly(record.allocatedAt);
    const deallocatedAt = parseProjectDateOnly(record.deallocatedAt);
    const period =
      allocatedAt && deallocatedAt
        ? [allocatedAt, deallocatedAt]
        : allocatedAt
          ? [allocatedAt]
          : [];

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Role',
        value: record.role?.trim() || '—',
      },
      {
        label: 'Period',
        value: period,
        type: EDataType.RANGE,
        dataType: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
    ];

    return {
      details: [
        {
          status: {
            approvalStatus: record.isCurrentlyAllocated
              ? 'Allocated'
              : 'Deallocated',
          },
          entryData,
        },
      ],
      entity: {
        name: toTitleCase(fullName),
        subtitle: record.user.employeeId,
      },
    };
  }

  protected onEmployeeFilterChange(value: unknown): void {
    this.selectedEmployeeName.set(
      typeof value === 'string' && value.length > 0 ? value : null
    );
    this.loadAllocationHistory();
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: '',
      subtitle: '',
      showHeaderButton: false,
      showHeaderFilter: true,
      showGoBackButton: false,
    };
  }
}
