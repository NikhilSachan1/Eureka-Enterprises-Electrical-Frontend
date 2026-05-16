import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AvatarService } from '@shared/services';
import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';

@Component({
  selector: 'app-doc-workspace-context',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './doc-workspace-context.component.html',
  styleUrl: './doc-workspace-context.component.scss',
})
export class DocWorkspaceContextComponent {
  private readonly avatarService = inject(AvatarService);

  readonly view = input.required<IDocWorkspaceContextView>();

  readonly leadBackground = computed(() => {
    const raw = this.view().projectName.trim();
    const seed = raw !== '' && raw !== '—' ? raw : '';
    return `#${this.avatarService.getConsistentColor(seed)}`;
  });
}
