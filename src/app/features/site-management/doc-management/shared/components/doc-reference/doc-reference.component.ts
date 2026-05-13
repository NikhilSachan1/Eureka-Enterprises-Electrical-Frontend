import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { IDocReferenceSegment } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

@Component({
  selector: 'app-doc-reference',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './doc-reference.component.html',
  styleUrl: './doc-reference.component.scss',
})
export class DocReferenceComponent {
  readonly segments = input<IDocReferenceSegment[]>([]);

  protected reversedSegments(): IDocReferenceSegment[] {
    const raw = this.segments();
    return raw?.length ? [...raw].reverse() : [];
  }

  protected docKindTone(label: string): string {
    const k = label.trim().toLowerCase();
    if (
      k.includes('purchase') ||
      k === 'po' ||
      (k.includes('order') && k.includes('purchase'))
    ) {
      return 'po';
    }
    if (k.includes('jmc')) {
      return 'jmc';
    }
    if (k.includes('report')) {
      return 'report';
    }
    if (k.includes('invoice')) {
      return 'invoice';
    }
    if (
      k.includes('payment') ||
      k.includes('advice') ||
      k.includes('transfer')
    ) {
      return 'payment';
    }
    let h = 0;
    for (let i = 0; i < k.length; i++) {
      h = (Math.imul(31, h) + k.charCodeAt(i)) | 0;
    }
    return `x${Math.abs(h) % 4}`;
  }
}
