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
  readonly loading = input(false);
  readonly showAction = input(true);
  readonly embedded = input(false);
  /** When set and missing count > 0, shows e.g. "PO · Missing" instead of "Missing · 1". */
  readonly missingStageLabel = input<string | null>(null);
  readonly viewDetails = output<void>();

  protected readonly isDual = computed(
    () => this.salesStatus() !== undefined || this.purchaseStatus() !== undefined
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
    this.buildMetrics(this.status() ?? EMPTY_PROJECT_DOCUMENT_STATUS)
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

  protected onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit();
  }

  private buildMetrics(
    status: IProjectDocumentStatus,
    context: 'sales' | 'purchase' | false = false
  ): IDocStatusMetric[] {
    const invoiceLabel =
      context === 'sales'
        ? 'To receive'
        : context === 'purchase'
          ? 'To pay'
          : 'To invoice';

    const missingStageLabel = this.missingStageLabel();

    return [
      this.buildMissingMetric(status, missingStageLabel, context !== false),
      this.buildMetric(
        invoiceLabel,
        status.toBeInvoicedAmount,
        EDocStatusMetricFormat.CURRENCY,
        EDocStatusTone.WARN,
        context !== false
      ),
      this.buildMetric(
        'Pending',
        status.pendingApprovalsCount,
        EDocStatusMetricFormat.COUNT,
        EDocStatusTone.INFO,
        context !== false
      ),
    ];
  }

  private buildMissingMetric(
    status: IProjectDocumentStatus,
    missingStageLabel: string | null,
    compact: boolean
  ): IDocStatusMetric {
    if (missingStageLabel && status.missingDocsCount > 0) {
      return {
        label: missingStageLabel,
        displayValue: 'Missing',
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
