import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import type {
  IDocAmountSegment,
  DocAmountTone,
} from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { EDataType } from '@shared/types';

@Component({
  selector: 'app-doc-amount',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './doc-amount.component.html',
  styleUrl: './doc-amount.component.scss',
})
export class DocAmountComponent {
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly EDataType = EDataType;

  readonly segments = input<IDocAmountSegment[]>([]);

  /** Currency / semantics from label keywords */
  private static readonly LABEL_MAP: Record<DocAmountTone, string> = {
    taxable: 'font-medium text-emerald-800 shrink-0',
    deduction: 'font-medium text-rose-700 shrink-0',
    gst: 'font-medium text-amber-700 shrink-0',
    total: 'font-medium text-slate-700 shrink-0',
    invoiced: 'font-medium text-violet-700 shrink-0',
    booked: 'font-medium text-cyan-800 shrink-0',
    paid: 'font-semibold text-emerald-800 shrink-0',
    neutral: 'text-content-secondary shrink-0',
    muted: 'text-content-tertiary shrink-0',
  };

  private static readonly VALUE_MAP: Record<DocAmountTone, string> = {
    taxable: 'tabular-nums font-semibold text-emerald-900',
    deduction: 'tabular-nums font-semibold text-rose-900',
    gst: 'tabular-nums font-semibold text-amber-900',
    total: 'tabular-nums font-bold text-slate-900',
    invoiced: 'tabular-nums font-semibold text-violet-950',
    booked: 'tabular-nums font-semibold text-cyan-950',
    paid: 'tabular-nums font-bold text-emerald-950',
    neutral: 'tabular-nums font-medium text-content',
    muted: 'tabular-nums text-content-tertiary',
  };

  protected segmentTone(seg: IDocAmountSegment): DocAmountTone {
    if (seg.dataType === EDataType.DATE) {
      return 'neutral';
    }
    return DocAmountComponent.toneFromCurrencyLabel(seg.label);
  }

  private static toneFromCurrencyLabel(label: string): DocAmountTone {
    const key = label.trim().toLowerCase();
    const map: Record<string, DocAmountTone> = {
      taxable: 'taxable',
      gst: 'gst',
      total: 'total',
      invoiced: 'invoiced',
      booked: 'booked',
      paid: 'paid',
      deduction: 'deduction',
      tds: 'deduction',
      withholding: 'deduction',
    };
    return map[key] ?? 'neutral';
  }

  protected labelClass(tone: DocAmountTone): string {
    return DocAmountComponent.LABEL_MAP[tone];
  }

  protected valueClass(tone: DocAmountTone): string {
    return DocAmountComponent.VALUE_MAP[tone];
  }
}
