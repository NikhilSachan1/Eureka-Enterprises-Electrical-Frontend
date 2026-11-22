import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { EDocAmountTone } from '@features/site-management/doc-management/shared/types/doc-amount.types';
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
  protected readonly EDocAmountTone = EDocAmountTone;

  readonly segments = input<IDocAmountSegment[]>([]);

  /** The caller's tone; dates are always neutral. */
  protected segmentTone(seg: IDocAmountSegment): EDocAmountTone {
    return seg.dataType === EDataType.DATE ? EDocAmountTone.NEUTRAL : seg.tone;
  }

  /** Semantic tone → BEM class suffix (colors in SCSS for theme-aware contrast) */
  protected labelClass(tone: EDocAmountTone): string {
    return `doc-amount__label doc-amount__label--${tone}`;
  }

  protected valueClass(tone: EDocAmountTone): string {
    return `doc-amount__value doc-amount__value--${tone}`;
  }
}
