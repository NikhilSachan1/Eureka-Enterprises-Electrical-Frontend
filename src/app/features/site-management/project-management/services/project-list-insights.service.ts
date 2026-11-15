import {
  DestroyRef,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { IProjectPnlSummary } from '@features/site-management/project-profitability/types/project-profitability.dto';
import { ProjectProfitabilityService } from '@features/site-management/project-profitability/services/project-profitability.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IPoBreakdownGetResponseDto } from '../types/po-breakdown.dto';
import { PO_BREAKDOWN_PAGE_SIZE } from '../utility/project-document-status.util';
import { DocumentStatusService } from './document-status.service';

/** Loading state of one project's figure in the list. */
export interface IListInsight<T> {
  loading: boolean;
  error: boolean;
  data: T | null;
}

type TBreakdownRecord = IPoBreakdownGetResponseDto['records'][number];

const LOADING = { loading: true, error: false, data: null } as const;
const FAILED = { loading: false, error: true, data: null } as const;

/**
 * Document status and P&L for the rows of the project list, fetched in batches. Each cell asks
 * for its project; requests made in the same tick go out as one call per kind (one PO breakdown
 * for all the page's sites, one P&L summary) instead of one call per row. Each cell still shows
 * its own loader and fills in when its data arrives.
 *
 * Provided by the project list component, so the cache lives as long as the list.
 */
@Injectable()
export class ProjectListInsightsService {
  private readonly documentStatusService = inject(DocumentStatusService);
  private readonly profitabilityService = inject(ProjectProfitabilityService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly docStatus = signal<
    ReadonlyMap<string, IListInsight<IPoBreakdownGetResponseDto>>
  >(new Map());
  private readonly pnl = signal<
    ReadonlyMap<string, IListInsight<IProjectPnlSummary>>
  >(new Map());

  private readonly pendingDocStatus = new Set<string>();
  private readonly pendingPnl = new Set<string>();
  private flushScheduled = false;

  docStatusOf(
    siteId: string
  ): IListInsight<IPoBreakdownGetResponseDto> | undefined {
    return this.docStatus().get(siteId);
  }

  pnlOf(siteId: string): IListInsight<IProjectPnlSummary> | undefined {
    return this.pnl().get(siteId);
  }

  requestDocStatus(siteId: string): void {
    if (this.docStatus().has(siteId)) {
      return;
    }
    this.docStatus.update(current => new Map(current).set(siteId, LOADING));
    this.pendingDocStatus.add(siteId);
    this.scheduleFlush();
  }

  requestPnl(siteId: string): void {
    if (this.pnl().has(siteId)) {
      return;
    }
    this.pnl.update(current => new Map(current).set(siteId, LOADING));
    this.pendingPnl.add(siteId);
    this.scheduleFlush();
  }

  /** Forget everything, e.g. when the list reloads, so the cells fetch fresh figures. */
  reset(): void {
    this.docStatus.set(new Map());
    this.pnl.set(new Map());
    this.pendingDocStatus.clear();
    this.pendingPnl.clear();
  }

  private scheduleFlush(): void {
    if (this.flushScheduled) {
      return;
    }
    this.flushScheduled = true;
    // After the table has rendered every cell of the page, so they share one call.
    setTimeout(() => {
      this.flushScheduled = false;
      this.flushDocStatus();
      this.flushPnl();
    });
  }

  private flushDocStatus(): void {
    const siteIds = [...this.pendingDocStatus];
    this.pendingDocStatus.clear();
    if (!siteIds.length) {
      return;
    }

    this.loadBreakdown(siteIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: bySite => {
          this.docStatus.update(current => {
            const next = new Map(current);
            for (const siteId of siteIds) {
              const records = bySite.get(siteId) ?? [];
              next.set(siteId, {
                loading: false,
                error: false,
                data: { records, totalRecords: records.length },
              });
            }
            return next;
          });
        },
        error: error => {
          this.markFailed(this.docStatus, siteIds);
          this.logger.error('Failed to load project document status', error);
        },
      });
  }

  /**
   * One PO breakdown call for all sites. If the shared page is too small to hold every PO, the
   * sites are fetched one by one instead, so no project is left with a partial count.
   */
  private loadBreakdown(
    siteIds: string[]
  ): Observable<Map<string, TBreakdownRecord[]>> {
    const fetch = (ids: string[]): Observable<IPoBreakdownGetResponseDto> =>
      this.documentStatusService.getPoBreakdown({
        siteId: ids,
        page: 1,
        pageSize: PO_BREAKDOWN_PAGE_SIZE,
      });

    return fetch(siteIds).pipe(
      switchMap(response =>
        response.totalRecords > response.records.length
          ? forkJoin(siteIds.map(id => fetch([id]))).pipe(
              map(responses => responses.flatMap(r => r.records))
            )
          : of(response.records)
      ),
      map(groupBySite)
    );
  }

  private flushPnl(): void {
    const siteIds = [...this.pendingPnl];
    this.pendingPnl.clear();
    if (!siteIds.length) {
      return;
    }

    this.profitabilityService
      .getProjectsPnlSummary({ siteId: siteIds })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const bySite = new Map(
            response.items.map(item => [item.siteId, item])
          );
          this.pnl.update(current => {
            const next = new Map(current);
            for (const siteId of siteIds) {
              next.set(siteId, {
                loading: false,
                error: !bySite.has(siteId),
                data: bySite.get(siteId) ?? null,
              });
            }
            return next;
          });
        },
        error: error => {
          this.markFailed(this.pnl, siteIds);
          this.logger.error('Failed to load project P&L summary', error);
        },
      });
  }

  private markFailed<T>(
    state: WritableSignal<ReadonlyMap<string, IListInsight<T>>>,
    siteIds: string[]
  ): void {
    state.update(current => {
      const next = new Map(current);
      for (const siteId of siteIds) {
        next.set(siteId, FAILED);
      }
      return next;
    });
  }
}

function groupBySite(
  records: TBreakdownRecord[]
): Map<string, TBreakdownRecord[]> {
  const grouped = new Map<string, TBreakdownRecord[]>();
  for (const record of records) {
    // The API sends the site on each PO record; the schema keeps it as a passthrough field.
    const { siteId } = record as { siteId?: string };
    if (siteId) {
      const list = grouped.get(siteId) ?? [];
      list.push(record);
      grouped.set(siteId, list);
    }
  }
  return grouped;
}
