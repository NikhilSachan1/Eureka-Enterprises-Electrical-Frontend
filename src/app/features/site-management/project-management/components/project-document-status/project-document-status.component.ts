import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IndianCurrencyPipe } from '@shared/pipes/indian-currency.pipe';
import {
  EMPTY_PROJECT_DOCUMENT_STATUS,
  IDocStatusMetric,
  IProjectDocumentStatus,
} from '../../types/project-document-status.interface';
import {
  EDocStatusMetricFormat,
  EDocStatusTone,
} from '../../types/project-document-status.enum';

export type TDocStatusLayoutMode =
  | 'both'
  | 'contractor'
  | 'vendor'
  | 'single'
  | 'none';

/** How a side stands overall: documents missing, approvals waiting, or nothing to do. */
export type TDocStatusHealth = 'danger' | 'warn' | 'ok';

/** One side (contractor / vendor), or the only side, as the component shows it. */
export interface IDocStatusRow {
  key: 'contractor' | 'vendor' | 'single';
  label: string | null;
  metrics: IDocStatusMetric[];
  health: TDocStatusHealth;
  summary: string;
  /** The three columns of the grid; amount is absent where the surface hides it. */
  missing: IDocStatusMetric | null;
  pending: IDocStatusMetric | null;
  amount: IDocStatusMetric | null;
}

const HEALTH_SUMMARY: Record<TDocStatusHealth, string> = {
  danger: 'Needs documents',
  warn: 'Waiting for approval',
  ok: 'All in order',
};

/**
 * Document status of a project / PO / JMC as a small grid: a row per side, with what is missing,
 * what waits for approval and what is left to invoice or pay. Used in the project
 * list, the workspace tile, the PO / JMC tables and the missing-documents dialog.
 */
@Component({
  selector: 'app-project-document-status',
  imports: [NgTemplateOutlet],
  providers: [IndianCurrencyPipe],
  templateUrl: './project-document-status.component.html',
  styleUrl: './project-document-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDocumentStatusComponent {
  private readonly currencyPipe = inject(IndianCurrencyPipe);

  readonly status = input<IProjectDocumentStatus>();
  readonly salesStatus = input<IProjectDocumentStatus>();
  readonly purchaseStatus = input<IProjectDocumentStatus>();
  readonly showContractor = input(true);
  readonly showVendor = input(true);
  readonly contextLabel = input<'Contractor' | 'Vendor' | null>(null);
  readonly metricContext = input<'sales' | 'purchase' | null>(null);
  readonly loading = input(false);
  readonly showAction = input(true);
  readonly embedded = input(false);
  /** Compact horizontal pipeline for dialog/detail surfaces. */
  readonly compactStages = input(false);
  /** When set and missing count > 0, shows e.g. "PO · Missing" instead of "Missing · 1". */
  readonly missingStageLabel = input<string | null>(null);
  readonly showToInvoiceMetric = input(true);
  readonly viewDetails = output<void>();

  protected readonly isDual = computed(
    () =>
      this.salesStatus() !== undefined || this.purchaseStatus() !== undefined
  );

  protected readonly layoutMode = computed((): TDocStatusLayoutMode => {
    const contractor = this.showContractor();
    const vendor = this.showVendor();

    if (!contractor && !vendor) {
      return 'none';
    }

    if (this.isDual()) {
      if (contractor && vendor) {
        return 'both';
      }

      if (contractor) {
        return 'contractor';
      }

      if (vendor) {
        return 'vendor';
      }

      return 'none';
    }

    return 'single';
  });

  protected readonly metrics = computed((): IDocStatusMetric[] =>
    this.buildMetrics(
      this.status() ?? EMPTY_PROJECT_DOCUMENT_STATUS,
      this.metricContext() ?? false
    )
  );

  protected readonly contractorMetrics = computed((): IDocStatusMetric[] => {
    if (!this.showContractor()) {
      return [];
    }

    return this.buildMetrics(
      this.salesStatus() ?? this.status() ?? EMPTY_PROJECT_DOCUMENT_STATUS,
      'sales'
    );
  });

  protected readonly vendorMetrics = computed((): IDocStatusMetric[] => {
    if (!this.showVendor()) {
      return [];
    }

    return this.buildMetrics(
      this.purchaseStatus() ?? EMPTY_PROJECT_DOCUMENT_STATUS,
      'purchase'
    );
  });

  /** Sides to draw, in order; a single row when only one status is given. */
  /** The amount column, when any row has one. */
  protected readonly hasAmount = computed(() =>
    this.rows().some(row => row.amount)
  );

  protected readonly rows = computed((): IDocStatusRow[] => {
    switch (this.layoutMode()) {
      case 'both':
        return [
          this.toRow('contractor', 'Contractor', this.contractorMetrics()),
          this.toRow('vendor', 'Vendor', this.vendorMetrics()),
        ];
      case 'contractor':
        return [
          this.toRow('contractor', 'Contractor', this.contractorMetrics()),
        ];
      case 'vendor':
        return [this.toRow('vendor', 'Vendor', this.vendorMetrics())];
      case 'single': {
        const label = this.compactStages() ? null : this.contextLabel();
        const key =
          label === 'Contractor'
            ? 'contractor'
            : label === 'Vendor'
              ? 'vendor'
              : 'single';
        return [this.toRow(key, label, this.metrics())];
      }
      default:
        return [];
    }
  });

  protected onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit();
  }

  private toRow(
    key: IDocStatusRow['key'],
    label: string | null,
    metrics: IDocStatusMetric[]
  ): IDocStatusRow {
    const health: TDocStatusHealth = metrics.some(
      m => m.tone === EDocStatusTone.DANGER
    )
      ? 'danger'
      : metrics.some(m => m.tone === EDocStatusTone.INFO)
        ? 'warn'
        : 'ok';
    return {
      key,
      label,
      metrics,
      health,
      summary: HEALTH_SUMMARY[health],
      missing: metrics.find(m => m.label === 'Missing') ?? null,
      pending: metrics.find(m => m.label === 'Pending') ?? null,
      amount:
        metrics.find(m => m.label === 'To invoice' || m.label === 'To pay') ??
        null,
    };
  }

  private buildMetrics(
    status: IProjectDocumentStatus,
    context: 'sales' | 'purchase' | false = false
  ): IDocStatusMetric[] {
    const invoiceLabel =
      context === 'sales'
        ? 'To invoice'
        : context === 'purchase'
          ? 'To pay'
          : 'To invoice';

    const missingStageLabel = this.missingStageLabel();

    const metrics: IDocStatusMetric[] = [
      this.buildMissingMetric(status, missingStageLabel, context !== false),
    ];

    if (this.showToInvoiceMetric()) {
      metrics.push(
        this.buildMetric(
          invoiceLabel,
          status.toBeInvoicedAmount,
          EDocStatusMetricFormat.CURRENCY,
          EDocStatusTone.WARN,
          context !== false
        )
      );
    }

    metrics.push(
      this.buildMetric(
        'Pending',
        status.pendingApprovalsCount,
        EDocStatusMetricFormat.COUNT,
        EDocStatusTone.INFO,
        context !== false
      )
    );

    return metrics;
  }

  private buildMissingMetric(
    status: IProjectDocumentStatus,
    missingStageLabel: string | null,
    compact: boolean
  ): IDocStatusMetric {
    if (missingStageLabel && status.missingDocsCount > 0) {
      return {
        // Reads "PO missing" on the chip.
        label: 'Missing',
        displayValue: missingStageLabel,
        tone: EDocStatusTone.DANGER,
      };
    }

    return this.buildMetric(
      'Missing',
      status.missingDocsCount,
      EDocStatusMetricFormat.COUNT,
      EDocStatusTone.DANGER,
      compact
    );
  }

  private buildMetric(
    label: string,
    value: number,
    format: EDocStatusMetricFormat,
    activeTone: EDocStatusTone,
    compact: boolean
  ): IDocStatusMetric {
    return {
      label,
      displayValue: this.formatValue(value, format, compact),
      tone: value > 0 ? activeTone : EDocStatusTone.OK,
    };
  }

  private formatValue(
    value: number,
    format: EDocStatusMetricFormat,
    compact: boolean
  ): string {
    if (format === EDocStatusMetricFormat.CURRENCY) {
      return value > 0
        ? this.currencyPipe.transform(value, compact ? 'short' : 'full') ||
            String(value)
        : '—';
    }

    return String(value);
  }
}
