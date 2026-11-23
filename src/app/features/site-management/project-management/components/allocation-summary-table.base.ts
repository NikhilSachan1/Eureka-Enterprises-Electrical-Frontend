import {
  DestroyRef,
  Directive,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  catchError,
  EMPTY,
  finalize,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { LoggerService } from '@core/services';
import {
  DrawerService,
  TableServerSideParamsBuilderService,
} from '@shared/services';
import { IEnhancedTable } from '@shared/types';
import { ProjectWorkspaceContextService } from '../services/project-workspace-context.service';
import { IAllocationSummaryGetFormDto } from '../types/project.dto';

/**
 * A summary tab of the allocation history ("Employee wise" / "Project wise"): the server sums the
 * allocations and returns one page of rows, filtered by the workspace project and dates.
 * Reloads when the table page changes or the workspace filters are applied.
 */
@Directive()
export abstract class AllocationSummaryTableBase<TRecord, TRow extends object> {
  protected readonly workspaceContext = inject(ProjectWorkspaceContextService);
  protected readonly drawerService = inject(DrawerService);
  protected readonly logger = inject(LoggerService);
  protected readonly destroyRef = inject(DestroyRef);
  private readonly paramsBuilder = inject(TableServerSideParamsBuilderService);

  protected abstract readonly table: IEnhancedTable;
  /** Shown in the logs when loading fails. */
  protected abstract readonly summaryName: string;

  private tableFilterData?: TableLazyLoadEvent;
  private readonly loadTrigger$ = new Subject<void>();

  protected abstract fetchPage(
    params: IAllocationSummaryGetFormDto
  ): Observable<{ records: TRecord[]; totalRecords: number }>;

  protected abstract toRow(record: TRecord): TRow;

  constructor() {
    this.loadTrigger$
      .pipe(
        switchMap(() => {
          this.table.setLoading(true);
          return this.fetchPage(this.buildParams()).pipe(
            finalize(() => this.table.setLoading(false)),
            catchError(error => {
              this.table.setLoadError();
              this.table.updateTableConfig({ totalRecords: 0 });
              this.logger.logUserAction(
                `Failed to load ${this.summaryName}`,
                error
              );
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe(({ records, totalRecords }) => {
        // Row interfaces have no index signature, which the generic table API expects.
        const rows = records.map(record => this.toRow(record));
        this.table.setData(rows as unknown as Record<string, unknown>[]);
        this.table.updateTableConfig({ totalRecords });
      });

    // Workspace filters applied: reload (the table asks for its first page itself).
    effect(() => {
      this.workspaceContext.filterSubmitVersion();
      this.workspaceContext.filters();
      untracked(() => {
        if (this.tableFilterData) {
          this.loadTrigger$.next();
        }
      });
    });
  }

  /** Filters a tab adds on top of the workspace ones (e.g. one employee). */
  protected extraParams(): Partial<IAllocationSummaryGetFormDto> {
    return {};
  }

  /** Loads the current page again, once the table has asked for one. */
  protected reload(): void {
    if (this.tableFilterData) {
      this.loadTrigger$.next();
    }
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadTrigger$.next();
  }

  private buildParams(): IAllocationSummaryGetFormDto {
    const tableParams = this.tableFilterData
      ? this.paramsBuilder.buildQueryParams<IAllocationSummaryGetFormDto>(
          this.tableFilterData,
          this.table.getHeaders()
        )
      : {};
    const { projectName, dateRange } = this.workspaceContext.filters();

    return {
      ...tableParams,
      ...(projectName ? { projectName } : {}),
      ...(dateRange?.[0] ? { dateRange } : {}),
      ...this.extraParams(),
    };
  }
}
