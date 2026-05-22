import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '@core/services';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import {
  EButtonActionType,
  IEnhancedTable,
  IEnhancedTableConfig,
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
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  DSR_ACTION_CONFIG_MAP,
  DSR_TABLE_ENHANCED_CONFIG,
} from '@features/site-management/dsr-management/config';
import { IDsr } from '@features/site-management/dsr-management/types/dsr.interface';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { IProjectWorkspaceSearchFilterFormDto } from '@features/site-management/project-management/types/project.interface';

@Component({
  selector: 'app-get-dsr',
  imports: [CommonModule, DataTableComponent, ChipComponent],
  templateUrl: './get-dsr.component.html',
  styleUrl: './get-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
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
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  private readonly loadTrigger$ = new Subject<void>();

  constructor() {
    effect(() => {
      this.projectWorkspaceContext.docWorkspaceFilter();
      untracked(() => {
        if (this.tableFilterData) {
          this.loadDsrList();
        }
      });
    });
  }

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      DSR_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
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
      (this.projectWorkspaceContext.docWorkspaceFilter() ??
        {}) as IProjectWorkspaceSearchFilterFormDto;

    return {
      projectName,
      dateRange,
      ...base,
    };
  }

  private mapTableData(response: IDsrGetBaseResponseDto[]): IDsr[] {
    return response.map((record: IDsrGetBaseResponseDto) => {
      return {
        id: record.id,
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

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditDsr(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadDsrList();
      },
    };

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      DSR_ACTION_CONFIG_MAP[actionType],
      null,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
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

  private navigateToEditDsr(dsrId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.DSR,
        ROUTES.SITE.DSR.EDIT,
        dsrId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction('Navigation error while editing DSR', error);
    }
  }
}
