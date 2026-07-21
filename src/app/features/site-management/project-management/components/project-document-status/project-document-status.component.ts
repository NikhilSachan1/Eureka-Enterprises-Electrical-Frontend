import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IndianCurrencyPipe } from '@shared/pipes/indian-currency.pipe';
import {
  IDocStatusMetric,
  IProjectDocumentStatus,
} from '../../types/project-document-status.interface';
import {
  EDocStatusMetricFormat,
  EDocStatusTone,
} from '../../types/project-document-status.enum';

@Component({
  selector: 'app-project-document-status',
  providers: [IndianCurrencyPipe],
  templateUrl: './project-document-status.component.html',
  styleUrl: './project-document-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDocumentStatusComponent {
  private readonly currencyPipe = inject(IndianCurrencyPipe);

  readonly status = input.required<IProjectDocumentStatus>();
  readonly viewDetails = output<void>();

  protected readonly metrics = computed((): IDocStatusMetric[] => {
    const s = this.status();

    return [
      this.buildMetric(
        'Missing',
        s.missingDocsCount,
        EDocStatusMetricFormat.COUNT,
        EDocStatusTone.DANGER
      ),
      this.buildMetric(
        'To invoice',
        s.toBeInvoicedAmount,
        EDocStatusMetricFormat.CURRENCY,
        EDocStatusTone.WARN
      ),
      this.buildMetric(
        'Pending',
        s.pendingApprovalsCount,
        EDocStatusMetricFormat.COUNT,
        EDocStatusTone.INFO
      ),
    ];
  });

  protected onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit();
  }

  private buildMetric(
    label: string,
    value: number,
    format: EDocStatusMetricFormat,
    activeTone: EDocStatusTone
  ): IDocStatusMetric {
    return {
      label,
      displayValue: this.formatValue(value, format),
      tone: value > 0 ? activeTone : EDocStatusTone.OK,
    };
  }

  private formatValue(value: number, format: EDocStatusMetricFormat): string {
    if (format === EDocStatusMetricFormat.CURRENCY) {
      return value > 0
        ? this.currencyPipe.transform(value, 'short') || String(value)
        : '—';
    }

    return String(value);
  }
}
