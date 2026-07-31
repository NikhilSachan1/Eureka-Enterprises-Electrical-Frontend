import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { ICONS } from '@shared/constants';
import { AvatarService } from '@shared/services';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { IProject } from '../../types/project.interface';
import { ProjectDocumentStatusComponent } from '../project-document-status/project-document-status.component';

@Component({
  selector: 'app-project-document-status-detail',
  imports: [
    DialogModule,
    FormsModule,
    SelectButtonModule,
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
  protected readonly contextOptions = [
    { label: 'Sales', value: EDocContext.SALES },
    { label: 'Purchase', value: EDocContext.PURCHASE },
  ];

  protected readonly docContext = signal<EDocContext>(EDocContext.SALES);
  protected readonly isSales = computed(
    () => this.docContext() === EDocContext.SALES
  );
  protected readonly emptyState = computed(() =>
    this.isSales()
      ? {
          title: 'No sales orders found',
          description:
            'Sales document flow is not available for this project yet.',
        }
      : {
          title: 'No purchase orders found',
          description:
            'Purchase document flow is not available for this project yet.',
        }
  );

  protected readonly avatarColor = computed(() => {
    const name = this.project().projectName.trim();
    return `#${this.avatarService.getConsistentColor(name)}`;
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        this.docContext.set(EDocContext.SALES);
      }
    });
  }

  protected setDocContext(context: EDocContext): void {
    if (this.docContext() === context) {
      return;
    }
    this.docContext.set(context);
  }
}
