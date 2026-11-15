import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { ICONS } from '@shared/constants';
import { IndianCurrencyPipe } from '@shared/pipes/indian-currency.pipe';
import { IMetricGroup } from '@shared/types';
import { applyGroupMetricValueLoading } from '@shared/utility/metric.util';
import { Subscription } from 'rxjs';
import { EDocContext } from '../../../types/doc.enum';
import { IDocumentMetricsGetResponseDto } from '../../schemas/get-document-metrics.schema';
import { DocumentMetricsService } from '../../services/document-metrics.service';

/** Workspace tabs that show document metrics. */
export type TWorkspaceDocMetricsKind =
  | 'po'
  | 'jmc'
  | 'report'
  | 'invoice'
  | 'bookPayment'
  | 'advance';

const TITLES: Record<TWorkspaceDocMetricsKind, string> = {
  po: 'Total POs',
  jmc: 'Total JMCs',
  report: 'Total reports',
  invoice: 'Total invoices',
  bookPayment: 'Total bookings',
  advance: 'Total advances',
};

/**
 * Metrics above a workspace document tab: total and approval split for the document, plus the
 * figures that matter for it. Follows the workspace filters (project, company, contractor,
 * vendor, dates) and the tab's side; with no project chosen it covers every readable site.
 */
@Component({
  selector: 'app-workspace-doc-metrics',
  imports: [MetricsCardComponent],
  providers: [IndianCurrencyPipe],
  template: `<app-metrics-card [metricGroups]="groups()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceDocMetricsComponent {
  private readonly metricsService = inject(DocumentMetricsService);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);
  private readonly currencyPipe = inject(IndianCurrencyPipe);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly kind = input.required<TWorkspaceDocMetricsKind>();
  /** Contractor (SALE) or vendor (PURCHASE) tab. */
  readonly side = input<EDocContext | null>(null);

  private readonly metrics = signal<IDocumentMetricsGetResponseDto | null>(
    null
  );
  private readonly loading = signal(true);
  private request?: Subscription;

  protected readonly groups = computed(() =>
    applyGroupMetricValueLoading(this.buildGroups(), this.loading())
  );

  constructor() {
    effect(() => {
      this.workspaceContext.filterSubmitVersion();
      const filters = this.workspaceContext.filters();
      const side = this.side();
      untracked(() => this.load({ ...filters, docType: side }));
    });
  }

  private load(
    params: Parameters<DocumentMetricsService['getMetrics']>[0]
  ): void {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.request = this.metricsService
      .getMetrics(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.metrics.set(response);
          this.loading.set(false);
        },
        error: error => {
          this.metrics.set(null);
          this.loading.set(false);
          this.logger.error('Failed to load document metrics', error);
        },
      });
  }

  private buildGroups(): IMetricGroup[] {
    const kind = this.kind();
    const all = this.metrics();
    const groups: IMetricGroup[] = [
      {
        id: 'total',
        title: TITLES[kind],
        icon: ICONS.COMMON.FILE,
        layout: 'kpi',
        metrics: [{ label: '', value: all?.[kind].total ?? 0 }],
      },
    ];

    // Reports and bookings carry no approval split here.
    if (kind !== 'report' && kind !== 'bookPayment') {
      const doc = all?.[kind];
      groups.push({
        id: 'approval',
        title: 'By approval',
        icon: ICONS.COMMON.CHART,
        metrics: [
          { label: 'Approved', value: doc?.approved ?? 0 },
          { label: 'Pending', value: doc?.pending ?? 0 },
          { label: 'Rejected', value: doc?.rejected ?? 0 },
        ],
      });
    }

    groups.push(...this.extraGroups(kind, all));

    const unlock = this.unlockRequests(kind, all);
    if (unlock !== null) {
      groups.push({
        id: 'unlock',
        title: 'Unlock requests',
        icon: 'pi pi-lock-open',
        layout: 'kpi',
        metrics: [{ label: '', value: unlock }],
      });
    }

    return groups;
  }

  /** Open unlock requests, for the documents that can be locked; null for the rest. */
  private unlockRequests(
    kind: TWorkspaceDocMetricsKind,
    all: IDocumentMetricsGetResponseDto | null
  ): number | null {
    switch (kind) {
      case 'po':
      case 'jmc':
      case 'report':
      case 'invoice':
      case 'bookPayment':
        return all?.[kind].unlockRequests ?? 0;
      default:
        return null;
    }
  }

  /** What each document adds beyond its approval split. */
  private extraGroups(
    kind: TWorkspaceDocMetricsKind,
    all: IDocumentMetricsGetResponseDto | null
  ): IMetricGroup[] {
    const isVendor = this.side() === EDocContext.PURCHASE;

    switch (kind) {
      case 'jmc':
        // Only generated contractor JMCs wait for a signed copy.
        return isVendor
          ? []
          : [
              {
                id: 'signed',
                title: 'Signed copy missing',
                icon: ICONS.COMMON.EXCLAMATION_TRIANGLE,
                layout: 'kpi',
                metrics: [
                  { label: '', value: all?.jmc.signedCopyMissing ?? 0 },
                ],
              },
            ];
      case 'invoice': {
        const invoice = all?.invoice;
        return [
          {
            id: 'open',
            title: 'Invoices still open',
            icon: ICONS.COMMON.CLOCK,
            metrics: [
              {
                label: 'GST settlement',
                value: invoice?.gstPendingCount ?? 0,
              },
              {
                label: 'TDS settlement',
                value: invoice?.tdsPendingCount ?? 0,
              },
              {
                label: isVendor ? 'Payment to make' : 'Payment to receive',
                value: invoice?.paymentPendingCount ?? 0,
              },
            ],
          },
        ];
      }
      case 'bookPayment':
        return [
          {
            id: 'transferPending',
            title: 'Bank transfer pending',
            icon: ICONS.COMMON.CLOCK,
            layout: 'kpi',
            metrics: [
              {
                label: '',
                value: all?.bookPayment.transferPendingCount ?? 0,
              },
            ],
          },
        ];
      case 'advance': {
        const advance = all?.advance;
        return [
          {
            id: 'unadjusted',
            title: 'Still to adjust',
            icon: ICONS.EXPENSE.MONEY,
            metrics: [
              { label: 'Advances', value: advance?.unadjustedCount ?? 0 },
              {
                label: 'Amount',
                value: this.money(advance?.unadjustedAmount),
              },
            ],
          },
        ];
      }
      default:
        return [];
    }
  }

  private money(value: number | undefined): string {
    if (!value) {
      return '₹0';
    }
    return this.currencyPipe.transform(value, 'short') || String(value);
  }
}
