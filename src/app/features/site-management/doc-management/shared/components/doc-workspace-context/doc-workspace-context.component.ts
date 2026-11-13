import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AvatarService } from '@shared/services';
import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';

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
  private readonly avatarService = inject(AvatarService);

  readonly view = input.required<IDocWorkspaceContextView>();

  private readonly projectSeed = computed(() => {
    const raw = this.view().projectName?.trim() ?? '';
    return raw !== '' && raw !== '—' ? raw : '';
  });

  readonly leadBackground = computed(
    () => `#${this.avatarService.getConsistentColor(this.projectSeed())}`
  );

  /** Up to two initials of the project, e.g. "Doosan 765kv Ict Spare" → "DS". */
  protected readonly initials = computed(() => {
    const words = this.projectSeed()
      .split(/\s+/)
      .filter(word => /^[a-z]/i.test(word));
    if (!words.length) {
      return '—';
    }
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : '';
    return `${first}${last}`.toUpperCase();
  });

  protected readonly companyName = computed(() =>
    this.cleanValue(this.view().companyName)
  );

  protected readonly partyName = computed(() =>
    this.cleanValue(this.view().partyName)
  );

  /** "Contractor" / "Vendor" when the list knows the side, otherwise a neutral "Party". */
  protected readonly partyLabel = computed(() => {
    const type = this.view().partyType?.trim();
    return type ? type : 'Party';
  });

  protected readonly partyTone = computed(() => {
    const type = this.view().partyType?.trim().toLowerCase();
    return type === 'contractor' || type === 'vendor' ? type : 'party';
  });

  private cleanValue(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed && trimmed !== '—' ? trimmed : null;
  }
}
