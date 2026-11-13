import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES } from '@shared/constants';
import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';

type PartySide = 'contractor' | 'vendor';

const SIDE_LABEL: Record<PartySide, string> = {
  contractor: 'Contractor',
  vendor: 'Vendor',
};

/** A row's own side, however the list spells it (Contractor / SALE, Vendor / PURCHASE). */
function sideOf(value: string | null | undefined): PartySide | null {
  const key = value?.trim().toUpperCase() ?? '';
  if (['CONTRACTOR', 'SALE', 'SALES'].includes(key)) {
    return 'contractor';
  }
  if (['VENDOR', 'PURCHASE'].includes(key)) {
    return 'vendor';
  }
  return null;
}

/**
 * Where a document belongs: the project (with its location), the client company it is for, and
 * the contractor / vendor on the other side. Shown in the first column of every document list.
 */
@Component({
  selector: 'app-doc-workspace-context',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './doc-workspace-context.component.html',
  styleUrl: './doc-workspace-context.component.scss',
})
export class DocWorkspaceContextComponent {
  private readonly router = inject(Router);

  readonly view = input.required<IDocWorkspaceContextView>();

  /**
   * The workspace tab the list sits in. Most lists don't pass a side per row — they live under
   * the contractor or vendor tab, so the tab says which one the party is.
   */
  private readonly tabSide: PartySide | null = ((): PartySide | null => {
    const segments = this.router.url.split(/[/?#]/);
    if (segments.includes(ROUTES.SITE.PROJECT.CONTRACTOR_DOC)) {
      return 'contractor';
    }
    if (segments.includes(ROUTES.SITE.PROJECT.VENDOR_DOC)) {
      return 'vendor';
    }
    return null;
  })();

  protected readonly companyName = computed(() =>
    this.cleanValue(this.view().companyName)
  );

  protected readonly partyName = computed(() =>
    this.cleanValue(this.view().partyName)
  );

  /** The row's own side first (lists that mix both, like GST / TDS), then the tab's. */
  private readonly side = computed<PartySide | null>(
    () => sideOf(this.view().partyType) ?? this.tabSide
  );

  protected readonly partyLabel = computed(() => {
    const side = this.side();
    return side ? SIDE_LABEL[side] : 'Party';
  });

  protected readonly partyTone = computed(() => this.side() ?? 'party');

  private cleanValue(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed && trimmed !== '—' ? trimmed : null;
  }
}
