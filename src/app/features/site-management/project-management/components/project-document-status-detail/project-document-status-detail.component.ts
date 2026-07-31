import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { ICONS } from '@shared/constants';
import { AvatarService } from '@shared/services';
import { DialogModule } from 'primeng/dialog';
import { IProject } from '../../types/project.interface';
import { ProjectDocumentStatusComponent } from '../project-document-status/project-document-status.component';

@Component({
  selector: 'app-project-document-status-detail',
  imports: [
    DialogModule,
    StatusTagComponent,
    EmptyMessagesComponent,
    ProjectDocumentStatusComponent,
  ],
  templateUrl: './project-document-status-detail.component.html',
  styleUrl: './project-document-status-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDocumentStatusDetailComponent {
  private readonly avatarService = inject(AvatarService);

  readonly visible = model(false);
  readonly project = input.required<IProject>();

  protected readonly icons = ICONS;

  protected readonly avatarColor = computed(() => {
    const name = this.project().projectName.trim();
    return `#${this.avatarService.getConsistentColor(name)}`;
  });
}
