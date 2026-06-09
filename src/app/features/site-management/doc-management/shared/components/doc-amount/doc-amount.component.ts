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

  /** Semantic tone → BEM class suffix (colors in SCSS for theme-aware contrast) */
  protected labelClass(tone: DocAmountTone): string {
    return `doc-amount__label doc-amount__label--${tone}`;
  }

  protected valueClass(tone: DocAmountTone): string {
    return `doc-amount__value doc-amount__value--${tone}`;
  }
}
