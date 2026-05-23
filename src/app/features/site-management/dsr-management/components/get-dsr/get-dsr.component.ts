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
import { CommonModule } from '@angular/common';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  DrawerService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import {
  EButtonActionType,
  IEnhancedTable,
  IInputFieldsConfig,
  IPageHeaderConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { catchError, EMPTY, finalize, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IDsrGetBaseResponseDto,
  IDsrGetFormDto,
  IDsrGetResponseDto,
} from '@features/site-management/dsr-management/types/dsr.dto';
import { GetDsrDetailComponent } from '../get-dsr-detail/get-dsr-detail.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  DSR_ACTION_CONFIG_MAP,
  DSR_EMPLOYEE_FILTER_FIELD_CONFIG,
  createDsrTableEnhancedConfig,
} from '@features/site-management/dsr-management/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { IDsr } from '@features/site-management/dsr-management/types/dsr.interface';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { IProjectWorkspaceSearchFilterFormDto } from '@features/site-management/project-management/types/project.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ICONS } from '@shared/constants';

@Component({
  selector: 'app-get-dsr',
  imports: [
    CommonModule,
    PageHeaderComponent,
    InputFieldComponent,
    DataTableComponent,
    ChipComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-dsr.component.html',
  styleUrl: './get-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly dsrService = inject(DsrService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );
  private readonly authService = inject(AuthService);

  protected readonly pageHeaderConfig = computed(
    (): IPageHeaderConfig => this.getPageHeaderConfig()
  );

  protected readonly employeeFilterFieldConfig: IInputFieldsConfig =
    DSR_EMPLOYEE_FILTER_FIELD_CONFIG;
  protected readonly selectedEmployeeNames = signal<string[]>([]);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    effect(() => {
      const workspaceFilter =
        this.projectWorkspaceContext.appliedWorkspaceFilter();
      untracked(() => {
        if (!workspaceFilter || !this.tableFilterData) {
          return;
        }
        this.loadDsrList();
      });
    });
  }

  ngOnInit(): void {
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      createDsrTableEnhancedConfig(loggedInUserId)
    );

    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.dsrService.getDSRList(this.prepareParamData()).pipe(
            finalize(() => this.table.setLoading(false)),
            catchError(error => {
              this.table.setData([]);
              this.logger.logUserAction('Failed to load DSR records', error);
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrGetResponseDto) => {
          const { records, totalRecords } = response;
          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('DSR records loaded successfully');
        },
      });
  }

  private loadDsrList(): void {
    this.loadTrigger$.next();
  }

  private prepareParamData(): IDsrGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IDsrGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    const { projectName, dateRange } =
      (this.projectWorkspaceContext.appliedWorkspaceFilter() ??
        {}) as IProjectWorkspaceSearchFilterFormDto;

    return {
      projectName,
      dateRange,
      employeeNames: this.selectedEmployeeNames(),
      ...base,
    };
  }

  private mapTableData(response: IDsrGetBaseResponseDto[]): IDsr[] {
    return response.map((record: IDsrGetBaseResponseDto) => {
      const { site } = record;

      return {
        id: record.id,
        docWorkspaceContext: {
          projectName: site.name,
          siteLocationSubtitle: `${site.city}, ${site.state}`,
        },
        reportDate: record.reportDate,
        createdByUser: {
          ...record.createdByUser,
          fullName: `${record.createdByUser.firstName} ${record.createdByUser.lastName}`,
        },
        workTypes: record.workTypes,
        reportingEngineerName: record.reportingEngineerName,
        reportingEngineerContact: record.reportingEngineerContact,
        remarks: record.remarks,
        originalRawData: record,
        dsrDocuments: record.documentKeys,
      } satisfies IDsr;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadDsrList();
  }

  protected onEmployeeFilterChange(value: unknown): void {
    this.selectedEmployeeNames.set(value as string[]);
    this.loadDsrList();
  }

  protected handleDsrTableActionClick(
    event: ITableActionClickEvent<IDsrGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showDsrDetailsDrawer(selectedFirstRow);
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadDsrList();
      },
    };

    const showRecordSummary = actionType !== EButtonActionType.EDIT;

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      DSR_ACTION_CONFIG_MAP[actionType],
      null,
      isBulk,
      showRecordSummary,
      dynamicComponentInputs
    );
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'addDsr') {
      this.openAddDsrDialog();
      return;
    }

    if (actionName === 'forceDsr') {
      this.openForceDsrDialog();
    }
  }

  private openAddDsrDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      DSR_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        projectName: this.projectWorkspaceContext.selectedProjectId(),
        onSuccess: () => {
          this.loadDsrList();
        },
      }
    );
  }

  private openForceDsrDialog(): void {
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.FORCE,
      DSR_ACTION_CONFIG_MAP[EButtonActionType.FORCE],
      null,
      false,
      false,
      {
        projectName: this.projectWorkspaceContext.selectedProjectId(),
        onSuccess: () => {
          this.loadDsrList();
        },
      }
    );
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
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_2,
          label: 'Force DSR',
          icon: ICONS.COMMON.FORCE,
          actionName: 'forceDsr',
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add DSR',
          actionName: 'addDsr',
        },
      ],
    };
  }

  private showDsrDetailsDrawer(rowData: IDsrGetBaseResponseDto): void {
    this.logger.logUserAction('Opening DSR details drawer', rowData);

    this.drawerService.showDrawer(GetDsrDetailComponent, {
      header: `DSR Details`,
      subtitle: `Detailed view of DSR`,
      componentData: {
        dsr: rowData,
      },
    });
  }
}
