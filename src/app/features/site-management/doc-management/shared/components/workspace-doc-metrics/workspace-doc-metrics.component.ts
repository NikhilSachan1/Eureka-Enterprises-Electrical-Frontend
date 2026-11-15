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
  | 'advance'
  | 'gst'
  | 'tds';

const TITLES: Record<TWorkspaceDocMetricsKind, string> = {
  po: 'Total POs',
  jmc: 'Total JMCs',
  report: 'Total reports',
  invoice: 'Total invoices',
  bookPayment: 'Total bookings',
  advance: 'Total advances',
  gst: 'GST entries',
  tds: 'TDS entries',
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
      const doc = this.kind();
      untracked(() => this.load({ ...filters, docType: side, doc }));
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
        metrics: [{ label: '', value: all?.[kind]?.total ?? 0 }],
      },
    ];

    // Approval split only for documents that go through approval.
    if (
      kind === 'po' ||
      kind === 'jmc' ||
      kind === 'invoice' ||
      kind === 'advance'
    ) {
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
        return all?.[kind]?.unlockRequests ?? 0;
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
                  { label: '', value: all?.jmc?.signedCopyMissing ?? 0 },
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
                value: all?.bookPayment?.transferPendingCount ?? 0,
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
      case 'gst': {
        const gst = all?.gst;
        return [
          {
            id: 'gstVerification',
            title: 'Portal verification',
            icon: ICONS.COMMON.CHART,
            metrics: [
              { label: 'Verified', value: gst?.verified ?? 0 },
              { label: 'Pending', value: gst?.verificationPending ?? 0 },
            ],
          },
          {
            id: 'gstHold',
            title: 'Held GST',
            icon: ICONS.COMMON.CLOCK,
            metrics: [
              {
                label: 'Pending',
                value: gst?.holdPending ?? 0,
                subtitle: this.money(gst?.holdPendingAmount),
              },
              { label: 'In process', value: gst?.holdInProcess ?? 0 },
              { label: 'Settled', value: gst?.holdSettled ?? 0 },
            ],
          },
        ];
      }
      case 'tds': {
        const tds = all?.tds;
        const groups: IMetricGroup[] = [
          {
            id: 'tdsVerification',
            title: 'Verification (26Q / 26AS)',
            icon: ICONS.COMMON.CHART,
            metrics: [
              { label: 'Verified', value: tds?.verified ?? 0 },
              { label: 'Pending', value: tds?.verificationPending ?? 0 },
            ],
          },
        ];
        // Only vendor TDS is deposited by us through a challan.
        if (!this.side() || isVendor) {
          groups.push({
            id: 'tdsChallan',
            title: 'Challan (vendor)',
            icon: ICONS.COMMON.CLOCK,
            metrics: [
              { label: 'Deposited', value: tds?.challanDeposited ?? 0 },
              {
                label: 'Pending',
                value: tds?.challanPending ?? 0,
                subtitle: this.money(tds?.challanPendingAmount),
              },
            ],
          });
        }
        return groups;
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
