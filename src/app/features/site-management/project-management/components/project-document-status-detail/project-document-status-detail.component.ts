import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { GraphComponent, LayoutService, Orientation } from '@swimlane/ngx-graph';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorState } from 'primeng/paginator';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { ICONS } from '@shared/constants';
import { IndianCurrencyPipe } from '@shared/pipes/indian-currency.pipe';
import { AvatarService, RouterNavigationService } from '@shared/services';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize, Subject } from 'rxjs';
import { IPoBreakdownRecord } from '../../types/po-breakdown.interface';
import {
  EMPTY_PROJECT_DOCUMENT_STATUS,
  IProjectDocumentStatusTarget,
  IProjectPoBreakdownSnapshot,
} from '../../types/project-document-status.interface';
import { IDocGraph } from '../../types/project-document-status-detail.interface';
import { EDocChainStage } from '../../types/project-document-status-detail.enum';
import { IProject } from '../../types/project.interface';
import { DocumentStatusService } from '../../services/document-status.service';
import { mapPoBreakdownRecords } from '../../utility/po-breakdown.mapper';
import {
  buildGraphCardView,
  buildPoDocumentGraph,
} from '../../utility/project-document-status-graph.util';
import { buildPoPanelMetrics } from '../../utility/project-document-status-detail.util';
import {
  buildProjectDocumentStatusSummary,
  countPoNextMissing,
  countPoPendingApprovals,
} from '../../utility/project-document-status-chain.util';
import {
  getDefaultProjectDocContext,
  getProjectDocContextAvailability,
  isContractorDocContext,
  isProjectDocContextAvailable,
  sanitizePoBreakdownSnapshot,
} from '../../utility/project-doc-context.util';
import { buildProjectWorkspaceDocRoute } from '../../utility/project-workspace-navigation.util';
import {
  normalizeWorkspaceRecordId,
  TWorkspaceDocStatusScope,
} from '../../utility/workspace-document-status-row.util';
import { ProjectDocumentStatusComponent } from '../project-document-status/project-document-status.component';

@Component({
  selector: 'app-project-document-status-detail',
  providers: [IndianCurrencyPipe, LayoutService],
  imports: [
    NgTemplateOutlet,
    DialogModule,
    TagModule,
    FormsModule,
    SelectButtonModule,
    GraphComponent,
    ProgressSpinnerModule,
    StatusTagComponent,
    EmptyMessagesComponent,
    PaginatorComponent,
    ProjectDocumentStatusComponent,
  ],
  templateUrl: './project-document-status-detail.component.html',
  styleUrl: './project-document-status-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDocumentStatusDetailComponent {
  private readonly currencyPipe = inject(IndianCurrencyPipe);
  private readonly avatarService = inject(AvatarService);
  private readonly documentStatusService = inject(DocumentStatusService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly graphCache = new Map<string, IDocGraph>();
  private loadVersion = 0;
  private graphFitPass = 0;
  protected readonly pageSize =
    APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;

  readonly visible = model(false);
  readonly project = input.required<IProject | IProjectDocumentStatusTarget>();
  readonly breakdownSnapshot = input<IProjectPoBreakdownSnapshot | null>(null);
  readonly initialDocContext = input<EDocContext | null>(null);
  readonly autoExpandPoId = input<string | null>(null);
  readonly workspaceScope = input<TWorkspaceDocStatusScope | null>(null);

  protected readonly icons = ICONS;
  protected readonly graphLayout = 'dagreNodesOnly';
  protected readonly graphLayoutSettings = {
    orientation: Orientation.LEFT_TO_RIGHT,
    marginX: 72,
    marginY: 40,
  };
  protected readonly graphZoomToFit$ = new Subject<{
    autoCenter?: boolean;
    force?: boolean;
  }>();
  protected readonly buildGraphCardView = buildGraphCardView;

  protected readonly docContext = signal<EDocContext>(EDocContext.SALES);
  protected readonly records = signal<IPoBreakdownRecord[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly expandedPoId = signal<string | undefined>(undefined);

  protected readonly docContextAvailability = computed(() =>
    getProjectDocContextAvailability(this.project())
  );

  protected readonly contextOptions = computed(() => {
    const { hasContractor, hasVendor } = this.docContextAvailability();
    const options: { label: string; value: EDocContext; count: number }[] = [];

    if (hasContractor) {
      options.push({
        label: 'Contractor',
        value: EDocContext.SALES,
        count: this.getContextPoCount(EDocContext.SALES),
      });
    }

    if (hasVendor) {
      options.push({
        label: 'Vendor',
        value: EDocContext.PURCHASE,
        count: this.getContextPoCount(EDocContext.PURCHASE),
      });
    }

    return options;
  });

  protected readonly showContextToggle = computed(
    () => !this.initialDocContext() && this.contextOptions().length > 1
  );

  protected readonly isScopedView = computed(() => !!this.autoExpandPoId());

  protected readonly isSales = computed(() =>
    isContractorDocContext(this.docContext())
  );
  protected readonly usesSnapshot = computed(() => this.breakdownSnapshot() !== null);
  protected readonly sanitizedBreakdownSnapshot = computed(() => {
    const snapshot = this.breakdownSnapshot();
    if (!snapshot) {
      return null;
    }

    return sanitizePoBreakdownSnapshot(
      snapshot,
      this.docContextAvailability()
    );
  });
  protected readonly activeContextSnapshot = computed(() => {
    const snapshot = this.sanitizedBreakdownSnapshot();
    if (!snapshot) {
      return null;
    }

    if (!isProjectDocContextAvailable(this.docContextAvailability(), this.docContext())) {
      return null;
    }

    return this.isSales() ? snapshot.sales : snapshot.purchase;
  });
  protected readonly displayRecords = computed(() => {
    const contextSnapshot = this.activeContextSnapshot();
    const snapshotRecords = contextSnapshot?.records ?? [];

    if (snapshotRecords.length) {
      const start = this.paginatorFirst();
      return snapshotRecords.slice(start, start + this.pageSize);
    }

    return this.records();
  });
  protected readonly displayTotalRecords = computed(() => {
    const contextSnapshot = this.activeContextSnapshot();
    const snapshotRecords = contextSnapshot?.records ?? [];

    if (snapshotRecords.length) {
      return contextSnapshot!.totalRecords;
    }

    if (this.records().length || this.totalRecords()) {
      return this.totalRecords();
    }

    return contextSnapshot?.totalRecords ?? 0;
  });
  protected readonly paginatorFirst = computed(
    () => (this.page() - 1) * this.pageSize
  );
  protected readonly showMissingPoChain = computed(
    () =>
      !this.loading() &&
      !this.loadError() &&
      !this.displayTotalRecords() &&
      isProjectDocContextAvailable(
        this.docContextAvailability(),
        this.docContext()
      )
  );
  protected readonly missingPoEmptyState = computed(() => ({
    title: 'PO missing',
    description: 'Please update PO first.',
  }));
  protected readonly emptyState = computed(() =>
    this.loadError()
      ? {
          title: 'Unable to load document breakdown',
          description: this.loadError() ?? 'Please try again.',
        }
      : {
          title: 'Document context unavailable',
          description:
            'Link a contractor or vendor to this project to view document status.',
        }
  );
  protected readonly avatarColor = computed(() => {
    const name = this.project().projectName.trim();
    return `#${this.avatarService.getConsistentColor(name)}`;
  });
  protected readonly summaryStatus = computed(() => {
    const contextSnapshot = this.activeContextSnapshot();
    if (contextSnapshot?.records.length) {
      return contextSnapshot.summary;
    }

    if (
      this.loading() ||
      this.loadError() ||
      !isProjectDocContextAvailable(
        this.docContextAvailability(),
        this.docContext()
      )
    ) {
      return EMPTY_PROJECT_DOCUMENT_STATUS;
    }

    if (this.records().length) {
      return buildProjectDocumentStatusSummary(this.records(), this.isSales());
    }

    if (contextSnapshot) {
      return contextSnapshot.summary;
    }

    return buildProjectDocumentStatusSummary(this.records(), this.isSales());
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        untracked(() => {
          this.docContext.set(this.initialDocContext() ?? EDocContext.SALES);
          this.page.set(1);
          this.records.set([]);
          this.totalRecords.set(0);
          this.loadError.set(null);
          this.loading.set(false);
          this.clearGraphCache();
          this.expandedPoId.set(undefined);
        });
        return;
      }

      const availability = this.docContextAvailability();
      const validContexts = this.contextOptions().map(option => option.value);
      const lockedContext = this.initialDocContext();

      untracked(() => {
        if (lockedContext) {
          this.docContext.set(lockedContext);
        } else if (
          validContexts.length &&
          !validContexts.includes(this.docContext())
        ) {
          this.docContext.set(getDefaultProjectDocContext(availability));
        }

        this.applyAutoExpandPoPanel(this.displayRecords());
      });

      this.project().id;
      this.docContext();
      this.page();
      this.breakdownSnapshot();

      if (this.breakdownSnapshot()) {
        untracked(() => {
          const contextSnapshot = this.activeContextSnapshot();
          const snapshotNeedsRefetch =
            !!contextSnapshot &&
            contextSnapshot.totalRecords > 0 &&
            !contextSnapshot.records.length;

          if (snapshotNeedsRefetch) {
            this.loading.set(true);
            this.loadError.set(null);
            this.loadPoBreakdown();
            return;
          }

          this.loading.set(false);
          this.loadError.set(null);
          this.records.set([]);
          this.totalRecords.set(0);
          this.syncExpandedPoPanel();
        });
        return;
      }

      untracked(() => this.loadPoBreakdown());
    });
  }

  protected setDocContext(context: EDocContext): void {
    if (this.docContext() === context) {
      return;
    }
    this.docContext.set(context);
    this.page.set(1);
    this.expandedPoId.set(undefined);
    this.clearGraphCache();
    this.syncExpandedPoPanel();
  }

  protected onPageChange(event: PaginatorState): void {
    const nextPage = Math.floor((event.first ?? 0) / this.pageSize) + 1;
    if (nextPage === this.page()) {
      return;
    }
    this.page.set(nextPage);
    this.expandedPoId.set(undefined);
    if (!this.usesSnapshot()) {
      this.clearGraphCache();
    }
  }

  protected isPoExpanded(poId: string): boolean {
    if (this.isScopedView()) {
      return true;
    }

    return this.expandedPoId() === poId;
  }

  protected togglePoPanel(poId: string): void {
    if (this.isScopedView()) {
      return;
    }

    if (this.expandedPoId() === poId) {
      this.expandedPoId.set(undefined);
      return;
    }

    this.expandedPoId.set(poId);
    this.graphFitPass = 0;
    this.scheduleGraphZoomToFit();
  }

  protected missingCount(record: IPoBreakdownRecord): number {
    return countPoNextMissing(record, this.isSales(), {
      includePoUninvoicedBalance: this.shouldShowPoUninvoicedBalanceNode(),
    });
  }

  protected pendingCount(record: IPoBreakdownRecord): number {
    return countPoPendingApprovals(record);
  }

  protected poMetrics(record: IPoBreakdownRecord) {
    return buildPoPanelMetrics(
      record,
      this.isSales(),
      value => this.formatCurrency(value),
      { showPoUninvoicedBalanceNode: this.shouldShowPoUninvoicedBalanceNode() }
    );
  }

  protected poGraph(record: IPoBreakdownRecord): IDocGraph {
    const key = this.graphCacheKey(record.id);
    const cached = this.graphCache.get(key);
    if (cached) {
      return cached;
    }

    const graph = buildPoDocumentGraph(record, {
      isSales: this.isSales(),
      showPoUninvoicedBalanceNode: this.shouldShowPoUninvoicedBalanceNode(),
    });
    this.graphCache.set(key, graph);
    return graph;
  }

  protected formatCurrency(value: number): string {
    if (value <= 0) {
      return '—';
    }
    return this.currencyPipe.transform(value, 'full') || String(value);
  }

  protected onDialogShow(): void {
    this.graphFitPass = 0;
    this.applyAutoExpandPoPanel(this.displayRecords());
    this.syncExpandedPoPanel();
    this.scheduleGraphZoomToFit();
  }

  protected onDialogHide(): void {
    this.graphFitPass = 0;
  }

  protected onGraphDrawComplete(): void {
    if (this.graphFitPass >= 2) {
      return;
    }

    this.graphFitPass += 1;
    this.scheduleGraphZoomToFit();
  }

  protected navigateToWorkspaceDoc(stage: EDocChainStage, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const projectId = this.project().id;
    if (!projectId) {
      return;
    }

    void this.routerNavigationService.navigateWithQueryParams(
      buildProjectWorkspaceDocRoute(stage, this.isSales()),
      { projectId }
    );
    this.visible.set(false);
  }

  private scheduleGraphZoomToFit(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.graphZoomToFit$.next({ autoCenter: true, force: true });
      });
    });
  }

  private getContextPoCount(context: EDocContext): number {
    const snapshot = this.sanitizedBreakdownSnapshot();
    if (snapshot) {
      return context === EDocContext.SALES
        ? snapshot.sales.totalRecords
        : snapshot.purchase.totalRecords;
    }

    if (
      this.docContext() === context &&
      !this.loading() &&
      !this.loadError() &&
      isProjectDocContextAvailable(
        this.docContextAvailability(),
        context
      )
    ) {
      return this.displayTotalRecords();
    }

    return 0;
  }

  private loadPoBreakdown(): void {
    if (
      !isProjectDocContextAvailable(
        this.docContextAvailability(),
        this.docContext()
      )
    ) {
      this.records.set([]);
      this.totalRecords.set(0);
      this.loadError.set(null);
      this.loading.set(false);
      return;
    }

    const version = ++this.loadVersion;
    this.loading.set(true);
    this.loadError.set(null);

    this.documentStatusService
      .getPoBreakdown({
        siteId: [this.project().id],
        partyType: this.docContext(),
        page: this.page(),
        pageSize: this.pageSize,
      })
      .pipe(
        finalize(() => {
          if (version === this.loadVersion) {
            this.loading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          if (version !== this.loadVersion) {
            return;
          }
          this.records.set(mapPoBreakdownRecords(response.records));
          this.totalRecords.set(response.totalRecords);
          this.loadError.set(null);
          this.syncExpandedPoPanel();
        },
        error: () => {
          if (version !== this.loadVersion) {
            return;
          }
          this.records.set([]);
          this.totalRecords.set(0);
          this.loadError.set(
            'Document breakdown could not be loaded. Please try again.'
          );
        },
      });
  }

  private graphCacheKey(recordId: string): string {
    const scope = this.workspaceScope() ?? 'all';
    return `${this.docContext()}-${this.page()}-${scope}-${recordId}`;
  }

  private shouldShowPoUninvoicedBalanceNode(): boolean {
    const scope = this.workspaceScope();
    return !scope || scope === 'po';
  }

  private clearGraphCache(): void {
    this.graphCache.clear();
  }

  private syncExpandedPoPanel(): void {
    const records = this.displayRecords();

    if (this.autoExpandPoId()) {
      this.applyAutoExpandPoPanel(records);
      return;
    }

    const expandedId = this.expandedPoId();
    if (!expandedId) {
      return;
    }

    const isExpandedPoVisible = records.some(
      po =>
        po.id === expandedId ||
        normalizeWorkspaceRecordId(po.id) ===
          normalizeWorkspaceRecordId(expandedId)
    );

    if (!isExpandedPoVisible) {
      this.expandedPoId.set(undefined);
    }
  }

  private applyAutoExpandPoPanel(records: readonly IPoBreakdownRecord[]): void {
    const autoExpand = this.autoExpandPoId();
    if (!autoExpand) {
      return;
    }

    const match = records.find(
      po =>
        po.id === autoExpand ||
        normalizeWorkspaceRecordId(po.id) ===
          normalizeWorkspaceRecordId(autoExpand)
    );

    if (match) {
      this.expandedPoId.set(match.id);
      return;
    }

    if (this.isScopedView() && records.length === 1) {
      this.expandedPoId.set(records[0].id);
    }
  }
}
