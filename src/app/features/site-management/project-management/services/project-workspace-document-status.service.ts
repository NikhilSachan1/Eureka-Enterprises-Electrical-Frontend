import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { AppConfigurationService } from '@shared/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { AppPermissionService, LoggerService } from '@core/services';
import { IPoBreakdownGetResponseDto } from '../types/project.dto';
import {
  EMPTY_PROJECT_DOCUMENT_STATUS,
  IProjectDocumentBreakdownCell,
  IProjectDocumentStatus,
  IProjectDocumentStatusTarget,
  IProjectPoBreakdownSnapshot,
} from '../types/project-document-status.interface';
import { DocumentStatusService } from './document-status.service';
import { ProjectWorkspaceContextService } from './project-workspace-context.service';
import {
  buildDocumentStatusTargetFromOverview,
  emptyDocumentBreakdownCell,
  hasDocumentStatusStakeholders,
  mapBreakdownResponse,
  mergePoBreakdownSnapshots,
  PO_BREAKDOWN_PAGE_SIZE,
} from '../utility/project-document-status.util';
import {
  buildWorkspaceRowDocumentStatus,
  getBreakdownRecords,
  normalizeWorkspaceRecordId,
  TWorkspaceDocStatusScope,
} from '../utility/workspace-document-status-row.util';

const DOC_CONTEXTS = [EDocContext.SALES, EDocContext.PURCHASE] as const;

@Injectable()
export class ProjectWorkspaceDocumentStatusService {
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);
  private readonly documentStatusService = inject(DocumentStatusService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly logger = inject(LoggerService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly destroyRef = inject(DestroyRef);

  private primaryLoadVersion = 0;
  private tableLoadVersion = 0;
  private loadedPrimarySiteId: string | undefined;
  private cachedPrimaryResponse: IPoBreakdownGetResponseDto | null = null;
  private readonly pendingTableSiteIds = new Set<string>();
  private readonly loadedTableSiteIds = new Set<string>();
  private readonly rowStatusIndex = new Map<string, IProjectDocumentStatus>();
  private readonly mergedTableSnapshot = signal<IProjectPoBreakdownSnapshot | null>(
    null
  );

  readonly breakdown = signal<IProjectDocumentBreakdownCell>(
    emptyDocumentBreakdownCell()
  );
  readonly tableBreakdownTick = signal(0);
  readonly tableBreakdownLoading = signal(false);

  readonly documentTarget = computed((): IProjectDocumentStatusTarget | null => {
    const projectId = this.resolveWorkspaceProjectId();
    const overview = this.workspaceContext.projectOverview();

    if (!projectId || !overview) {
      return null;
    }

    return buildDocumentStatusTargetFromOverview(
      projectId,
      overview,
      this.appConfigurationService.projectStatus()
    );
  });

  readonly hasProjectContext = computed(
    () => !!this.resolveWorkspaceProjectId()
  );

  readonly isAvailable = computed(() => {
    const target = this.documentTarget();
    return (
      this.canViewDocumentStatus() &&
      !!target &&
      hasDocumentStatusStakeholders(target)
    );
  });

  readonly snapshotForDetail = computed(() =>
    mergePoBreakdownSnapshots(
      this.breakdown().snapshot,
      this.mergedTableSnapshot()
    )
  );

  constructor() {
    effect(() => {
      this.workspaceContext.filterSubmitVersion();
      this.workspaceContext.selectedProjectId();
      this.workspaceContext.activeProjectId();
      this.workspaceContext.overviewSiteId();
      this.workspaceContext.projectOverview();
      this.workspaceContext.filters();

      const siteId = this.resolveWorkspaceProjectId();

      if (siteId && this.canViewDocumentStatus()) {
        this.loadPrimaryBreakdownForSite(siteId);
      } else {
        this.resetBreakdownState();
      }
    });

    effect(() => {
      this.documentTarget();

      if (!this.cachedPrimaryResponse) {
        return;
      }

      untracked(() => this.applyPrimaryBreakdownResponse());
    });
  }

  private canViewDocumentStatus(): boolean {
    return this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.PROJECT.DOCUMENT_STATUS
    );
  }

  ensureBreakdownForSiteIds(siteIds: readonly string[]): void {
    if (!this.canViewDocumentStatus()) {
      return;
    }

    const requestedSiteIds = [
      ...new Set(siteIds.map(id => id?.trim()).filter(Boolean)),
    ].filter(siteId => !this.pendingTableSiteIds.has(siteId));

    if (!requestedSiteIds.length) {
      return;
    }

    requestedSiteIds.forEach(siteId => {
      this.loadedTableSiteIds.delete(siteId);
      this.pendingTableSiteIds.add(siteId);
    });
    this.tableBreakdownLoading.set(true);

    const version = ++this.tableLoadVersion;

    this.documentStatusService
      .getPoBreakdown({
        siteId: requestedSiteIds,
        page: 1,
        pageSize: PO_BREAKDOWN_PAGE_SIZE,
      })
      .pipe(
        finalize(() => {
          if (version === this.tableLoadVersion) {
            this.tableBreakdownLoading.set(this.pendingTableSiteIds.size > 0);
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          if (version !== this.tableLoadVersion) {
            return;
          }

          this.finalizeTableSiteLoad(requestedSiteIds);
          this.mergeResponseIntoRowIndex(response);
          this.tableBreakdownTick.update(value => value + 1);
        },
        error: error => {
          if (version !== this.tableLoadVersion) {
            return;
          }

          this.finalizeTableSiteLoad(requestedSiteIds);
          this.logger.error('Failed to load workspace table document breakdown', error);
        },
      });
  }

  resolveRowStatus(
    recordId: string | null | undefined,
    scope: TWorkspaceDocStatusScope,
    docContext: EDocContext | undefined
  ): IProjectDocumentStatus {
    if (!recordId?.trim() || !docContext) {
      return EMPTY_PROJECT_DOCUMENT_STATUS;
    }

    const indexedStatus = this.rowStatusIndex.get(
      this.rowStatusKey(scope, recordId, docContext)
    );
    if (indexedStatus) {
      return indexedStatus;
    }

    const snapshot = this.snapshotForDetail();
    if (!snapshot) {
      return EMPTY_PROJECT_DOCUMENT_STATUS;
    }

    return buildWorkspaceRowDocumentStatus(
      scope,
      snapshot,
      recordId,
      docContext
    );
  }

  hasRowStatus(
    recordId: string | null | undefined,
    scope: TWorkspaceDocStatusScope,
    docContext: EDocContext | undefined
  ): boolean {
    if (!recordId?.trim() || !docContext) {
      return false;
    }

    return this.rowStatusIndex.has(
      this.rowStatusKey(scope, recordId, docContext)
    );
  }

  private loadPrimaryBreakdownForSite(siteId: string): void {
    const normalizedSiteId = siteId.trim();

    if (
      this.loadedPrimarySiteId === normalizedSiteId &&
      (this.breakdown().loading || this.breakdown().snapshot)
    ) {
      return;
    }

    const version = ++this.primaryLoadVersion;
    this.loadedPrimarySiteId = normalizedSiteId;
    this.cachedPrimaryResponse = null;
    this.breakdown.set(emptyDocumentBreakdownCell(true));

    this.documentStatusService
      .getPoBreakdown({
        siteId: [normalizedSiteId],
        page: 1,
        pageSize: PO_BREAKDOWN_PAGE_SIZE,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (version !== this.primaryLoadVersion) {
            return;
          }

          this.cachedPrimaryResponse = response;
          this.loadedTableSiteIds.add(normalizedSiteId);
          this.applyPrimaryBreakdownResponse();
          this.mergeResponseIntoRowIndex(response);
          this.tableBreakdownTick.update(value => value + 1);
        },
        error: error => {
          if (version !== this.primaryLoadVersion) {
            return;
          }

          this.loadedPrimarySiteId = undefined;
          this.cachedPrimaryResponse = null;
          this.breakdown.set({
            ...emptyDocumentBreakdownCell(false),
            error: true,
          });
          this.logger.error('Failed to load workspace document breakdown', error);
        },
      });
  }

  private applyPrimaryBreakdownResponse(): void {
    if (!this.cachedPrimaryResponse) {
      return;
    }

    this.breakdown.set(
      mapBreakdownResponse(this.cachedPrimaryResponse, this.documentTarget())
    );
  }

  private finalizeTableSiteLoad(siteIds: readonly string[]): void {
    siteIds.forEach(siteId => {
      this.pendingTableSiteIds.delete(siteId);
      this.loadedTableSiteIds.add(siteId);
    });
    this.tableBreakdownLoading.set(this.pendingTableSiteIds.size > 0);
  }

  private mergeResponseIntoRowIndex(response: IPoBreakdownGetResponseDto): void {
    const cell = mapBreakdownResponse(response, null);
    this.mergedTableSnapshot.update(current =>
      mergePoBreakdownSnapshots(current, cell.snapshot)
    );
    this.mergeSnapshotIntoRowIndex(cell.snapshot);
  }

  private mergeSnapshotIntoRowIndex(
    snapshot: IProjectPoBreakdownSnapshot | null
  ): void {
    if (!snapshot) {
      return;
    }

    for (const docContext of DOC_CONTEXTS) {
      const isSales = docContext === EDocContext.SALES;

      for (const po of getBreakdownRecords(snapshot, isSales)) {
        this.indexRowStatus('po', po.id, docContext, snapshot);

        for (const jmc of po.jmcs) {
          this.indexRowStatus('jmc', jmc.id, docContext, snapshot);

          if (jmc.report) {
            this.indexRowStatus('report', jmc.report.id, docContext, snapshot);
          }

          if (jmc.invoice) {
            this.indexRowStatus('invoice', jmc.invoice.id, docContext, snapshot);

            for (const bookPayment of jmc.invoice.bookPayments) {
              this.indexRowStatus(
                'bookPayment',
                bookPayment.id,
                docContext,
                snapshot
              );
            }
          }
        }
      }
    }
  }

  private indexRowStatus(
    scope: TWorkspaceDocStatusScope,
    recordId: string,
    docContext: EDocContext,
    snapshot: IProjectPoBreakdownSnapshot
  ): void {
    this.rowStatusIndex.set(
      this.rowStatusKey(scope, recordId, docContext),
      buildWorkspaceRowDocumentStatus(scope, snapshot, recordId, docContext)
    );
  }

  private rowStatusKey(
    scope: TWorkspaceDocStatusScope,
    recordId: string,
    docContext: EDocContext
  ): string {
    return `${scope}:${docContext}:${normalizeWorkspaceRecordId(recordId)}`;
  }

  private resetBreakdownState(): void {
    this.loadedPrimarySiteId = undefined;
    this.cachedPrimaryResponse = null;
    this.pendingTableSiteIds.clear();
    this.loadedTableSiteIds.clear();
    this.rowStatusIndex.clear();
    this.mergedTableSnapshot.set(null);
    this.tableBreakdownLoading.set(false);
    this.breakdown.set(emptyDocumentBreakdownCell());
    this.tableBreakdownTick.update(value => value + 1);
  }

  private resolveWorkspaceProjectId(): string | undefined {
    return (
      this.workspaceContext.selectedProjectId() ??
      this.workspaceContext.filters().projectName ??
      this.workspaceContext.overviewSiteId() ??
      this.workspaceContext.activeProjectId()
    );
  }
}
