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
import { transformDateFormat } from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { IAllocationPeriod } from '../types/allocation-journey.interface';
import { ProjectWorkspaceContextService } from '../services/project-workspace-context.service';
import { IWorkspaceSummaryGetFormDto } from '../types/project.dto';

/**
 * A summary tab of the project workspace (allocation "Employee wise" / "Project wise", DSR
 * "Project wise"): the server sums the rows and returns one page, filtered by the workspace
 * project and dates. Reloads when the table page changes or the workspace filters are applied.
 */
@Directive()
export abstract class WorkspaceSummaryTableBase<TRecord, TRow extends object> {
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
    params: IWorkspaceSummaryGetFormDto
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
  protected extraParams(): Partial<IWorkspaceSummaryGetFormDto> {
    return {};
  }

  /** The workspace date filter, for drawers opened from a row; null when none is set. */
  protected workspacePeriod(): IAllocationPeriod | null {
    const [from, to] = this.workspaceContext.filters().dateRange ?? [];
    return from || to ? { from: from ?? null, to: to ?? null } : null;
  }

  /** A drawer subtitle, with the workspace date filter when one is set. */
  protected periodSubtitle(text: string): string {
    const period = this.workspacePeriod();
    if (!period) {
      return text;
    }
    const format = (date: Date | null): string =>
      date ? transformDateFormat(date, APP_CONFIG.DATE_FORMATS.DEFAULT) : '…';
    return `${text} · ${format(period.from)} – ${format(period.to)}`;
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

  private buildParams(): IWorkspaceSummaryGetFormDto {
    const tableParams = this.tableFilterData
      ? this.paramsBuilder.buildQueryParams<IWorkspaceSummaryGetFormDto>(
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
