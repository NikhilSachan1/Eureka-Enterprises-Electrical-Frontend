import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  QueryList,
  signal,
  untracked,
  ViewChildren,
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
import { AvatarService } from '@shared/services';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { finalize } from 'rxjs';
import { IPoBreakdownRecord } from '../../types/po-breakdown.interface';
import {
  EMPTY_PROJECT_DOCUMENT_STATUS,
  IProjectDocumentStatusTarget,
  IProjectPoBreakdownSnapshot,
} from '../../types/project-document-status.interface';
import { IDocGraph } from '../../types/project-document-status-detail.interface';
import { IProject } from '../../types/project.interface';
import { DocumentStatusService } from '../../services/document-status.service';
import { mapPoBreakdownRecords } from '../../utility/po-breakdown.mapper';
import {
  buildGraphCardView,
  buildMissingPoGraph,
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
import { ProjectDocumentStatusComponent } from '../project-document-status/project-document-status.component';

@Component({
  selector: 'app-project-document-status-detail',
  providers: [IndianCurrencyPipe, LayoutService],
  imports: [
    NgTemplateOutlet,
    DialogModule,
    PanelModule,
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly graphCache = new Map<string, IDocGraph>();
  private loadVersion = 0;
  protected readonly pageSize =
    APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;

  readonly visible = model(false);
  readonly project = input.required<IProject | IProjectDocumentStatusTarget>();
  readonly breakdownSnapshot = input<IProjectPoBreakdownSnapshot | null>(null);

  protected readonly icons = ICONS;
  protected readonly graphLayout = 'dagreNodesOnly';
  protected readonly graphLayoutSettings = {
    orientation: Orientation.LEFT_TO_RIGHT,
    marginX: 24,
    marginY: 24,
  };
  protected readonly buildGraphCardView = buildGraphCardView;

  @ViewChildren('poGraphRef')
  private readonly graphRefs?: QueryList<GraphComponent>;

  protected readonly docContext = signal<EDocContext>(EDocContext.SALES);
  protected readonly records = signal<IPoBreakdownRecord[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);

  protected readonly docContextAvailability = computed(() =>
    getProjectDocContextAvailability(this.project())
  );

  protected readonly contextOptions = computed(() => {
    const { hasContractor, hasVendor } = this.docContextAvailability();
    const options: { label: string; value: EDocContext }[] = [];

    if (hasContractor) {
      options.push({ label: 'Contractor', value: EDocContext.SALES });
    }

    if (hasVendor) {
      options.push({ label: 'Vendor', value: EDocContext.PURCHASE });
    }

    return options;
  });

  protected readonly showContextToggle = computed(
    () => this.contextOptions().length > 1
  );

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
    if (contextSnapshot) {
      const start = this.paginatorFirst();
      return contextSnapshot.records.slice(start, start + this.pageSize);
    }
    return this.records();
  });
  protected readonly displayTotalRecords = computed(() => {
    const contextSnapshot = this.activeContextSnapshot();
    if (contextSnapshot) {
      return contextSnapshot.totalRecords;
    }
    return this.totalRecords();
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
  protected readonly missingPoGraph = computed(() =>
    buildMissingPoGraph({ isSales: this.isSales() })
  );
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
    if (contextSnapshot) {
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

    return buildProjectDocumentStatusSummary(this.records(), this.isSales());
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        untracked(() => {
          this.docContext.set(EDocContext.SALES);
          this.page.set(1);
          this.records.set([]);
          this.totalRecords.set(0);
          this.loadError.set(null);
          this.loading.set(false);
          this.clearGraphCache();
        });
        return;
      }

      const availability = this.docContextAvailability();
      const validContexts = this.contextOptions().map(option => option.value);

      untracked(() => {
        if (
          validContexts.length &&
          !validContexts.includes(this.docContext())
        ) {
          this.docContext.set(getDefaultProjectDocContext(availability));
        }
      });

      this.project().id;
      this.docContext();
      this.page();
      this.breakdownSnapshot();

      if (this.breakdownSnapshot()) {
        untracked(() => {
          this.loading.set(false);
          this.loadError.set(null);
          this.records.set([]);
          this.totalRecords.set(0);
          this.scheduleFitAllGraphs();
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
    this.clearGraphCache();
    this.scheduleFitAllGraphs();
  }

  protected onDialogShow(): void {
    this.scheduleFitAllGraphs();
  }

  protected onPageChange(event: PaginatorState): void {
    const nextPage = Math.floor((event.first ?? 0) / this.pageSize) + 1;
    if (nextPage === this.page()) {
      return;
    }
    this.page.set(nextPage);
    if (!this.usesSnapshot()) {
      this.clearGraphCache();
    }
  }

  protected missingCount(record: IPoBreakdownRecord): number {
    return countPoNextMissing(record, this.isSales());
  }

  protected pendingCount(record: IPoBreakdownRecord): number {
    return countPoPendingApprovals(record);
  }

  protected poMetrics(record: IPoBreakdownRecord) {
    return buildPoPanelMetrics(record, this.isSales(), value =>
      this.formatCurrency(value)
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
    });
    this.graphCache.set(key, graph);
    return graph;
  }

  protected onGraphDrawComplete(graphRef: GraphComponent): void {
    this.scheduleGraphFit(graphRef);
  }

  protected formatCurrency(value: number): string {
    if (value <= 0) {
      return '—';
    }
    return this.currencyPipe.transform(value, 'full') || String(value);
  }

  private scheduleGraphFit(graphRef: GraphComponent): void {
    const fit = (): void => {
      this.fitGraph(graphRef);
    };

    requestAnimationFrame(() => {
      fit();
      setTimeout(fit, 150);
      setTimeout(fit, 400);
      setTimeout(fit, 700);
    });
  }

  private scheduleFitAllGraphs(): void {
    requestAnimationFrame(() => {
      this.fitAllGraphs();
      setTimeout(() => this.fitAllGraphs(), 150);
      setTimeout(() => this.fitAllGraphs(), 400);
      setTimeout(() => this.fitAllGraphs(), 700);
    });
  }

  private fitAllGraphs(): void {
    this.graphRefs?.forEach(graphRef => this.fitGraph(graphRef));
  }

  private fitGraph(graphRef: GraphComponent): void {
    if (!graphRef.hasGraphDims?.() || !graphRef.hasNodeDims?.()) {
      return;
    }

    graphRef.zoomToFit({ autoCenter: true, force: true });
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
          this.scheduleFitAllGraphs();
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
    return `${this.docContext()}-${this.page()}-${recordId}`;
  }

  private clearGraphCache(): void {
    this.graphCache.clear();
  }
}
