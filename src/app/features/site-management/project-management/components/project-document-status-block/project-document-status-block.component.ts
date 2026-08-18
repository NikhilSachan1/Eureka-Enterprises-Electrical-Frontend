import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { AppConfigurationService } from '@shared/services';
import { IProjectOverviewGetResponseDto } from '../../types/project.dto';
import { IProject } from '../../types/project.interface';
import {
  IProjectDocumentBreakdownCell,
  IProjectDocumentStatusTarget,
  IProjectPoBreakdownSnapshot,
} from '../../types/project-document-status.interface';
import { DocumentStatusService } from '../../services/document-status.service';
import {
  buildDocumentStatusTargetFromOverview,
  emptyDocumentBreakdownCell,
  hasDocumentStatusStakeholders,
  mapBreakdownResponse,
  PO_BREAKDOWN_PAGE_SIZE,
  toDocumentStatusTarget,
} from '../../utility/project-document-status.util';
import { getProjectDocContextAvailability } from '../../utility/project-doc-context.util';
import { ProjectDocumentStatusComponent } from '../project-document-status/project-document-status.component';
import { ProjectDocumentStatusDetailComponent } from '../project-document-status-detail/project-document-status-detail.component';

@Component({
  selector: 'app-project-document-status-block',
  imports: [
    ProjectDocumentStatusComponent,
    ProjectDocumentStatusDetailComponent,
  ],
  templateUrl: './project-document-status-block.component.html',
  styleUrl: './project-document-status-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDocumentStatusBlockComponent {
  private readonly documentStatusService = inject(DocumentStatusService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly project = input<IProject | IProjectDocumentStatusTarget | null>(null);
  readonly projectId = input<string | null | undefined>(null);
  readonly overview = input<IProjectOverviewGetResponseDto | null>(null);
  readonly showHeader = input(false);
  readonly embedded = input(false);
  readonly showAction = input(true);
  readonly missingStageLabel = input<string | null>(null);
  readonly logSource = input('project-document-status-block');

  protected readonly breakdown = signal<IProjectDocumentBreakdownCell>(
    emptyDocumentBreakdownCell()
  );
  protected readonly detailVisible = signal(false);
  protected readonly detailSnapshot = signal<IProjectPoBreakdownSnapshot | null>(
    null
  );

  private loadVersion = 0;

  protected readonly resolvedProject = computed((): IProjectDocumentStatusTarget | null => {
    const directProject = this.project();
    if (directProject) {
      return toDocumentStatusTarget(directProject);
    }

    const id = this.projectId();
    const overview = this.overview();
    if (!id || !overview) {
      return null;
    }

    return buildDocumentStatusTargetFromOverview(
      id,
      overview,
      this.appConfigurationService.projectStatus()
    );
  });

  protected readonly isVisible = computed(() => {
    const project = this.resolvedProject();
    return !!project && hasDocumentStatusStakeholders(project);
  });

  protected readonly docContextAvailability = computed(() => {
    const project = this.resolvedProject();
    return project
      ? getProjectDocContextAvailability(project)
      : { hasContractor: false, hasVendor: false };
  });

  constructor() {
    effect(() => {
      const project = this.resolvedProject();
      const version = ++this.loadVersion;

      if (!project || !this.isVisible()) {
        this.breakdown.set(emptyDocumentBreakdownCell());
        return;
      }

      this.breakdown.set(emptyDocumentBreakdownCell(true));

      this.documentStatusService
        .getPoBreakdown({
          siteId: [project.id],
          page: 1,
          pageSize: PO_BREAKDOWN_PAGE_SIZE,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: response => {
            if (version !== this.loadVersion) {
              return;
            }

            this.breakdown.set(mapBreakdownResponse(project, response));
          },
          error: error => {
            if (version !== this.loadVersion) {
              return;
            }

            this.breakdown.set({
              ...emptyDocumentBreakdownCell(false),
              error: true,
            });
            this.logger.error('Failed to load project document breakdown', error);
          },
        });
    });
  }

  protected onViewDetails(): void {
    const project = this.resolvedProject();
    if (!project) {
      return;
    }

    this.detailSnapshot.set(this.breakdown().snapshot);
    this.detailVisible.set(true);
    this.logger.logUserAction('Document status view details opened', {
      projectId: project.id,
      source: this.logSource(),
    });
  }

  protected onDetailVisibleChange(visible: boolean): void {
    this.detailVisible.set(visible);
    if (!visible) {
      this.detailSnapshot.set(null);
    }
  }
}
