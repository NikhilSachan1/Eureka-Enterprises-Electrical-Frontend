import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, switchMap, Subject } from 'rxjs';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { ProjectService } from '../../services/project.service';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';
import { IProjectDetailGetResponseDto } from '../../types/project.dto';

@Component({
  selector: 'app-project-workspace-info-card',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './project-workspace-info-card.component.html',
  styleUrl: './project-workspace-info-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectWorkspaceInfoCardComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);
  private readonly logger = inject(LoggerService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly projectDetail =
    signal<IProjectDetailGetResponseDto | null>(null);
  protected readonly isLoading = signal(false);

  private readonly loadTrigger$ = new Subject<string>();

  readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;

  constructor() {
    effect(() => {
      const filter = this.workspaceContext.docWorkspaceFilter();
      const projectId = (filter as Record<string, unknown>)?.['projectName'] as
        | string
        | undefined;
      if (projectId) {
        this.loadTrigger$.next(projectId);
      } else {
        this.projectDetail.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.loadTrigger$
      .pipe(
        switchMap(projectId => {
          this.isLoading.set(true);
          this.projectDetail.set(null);
          return this.projectService.getProjectDetailById({ projectId }).pipe(
            catchError(error => {
              this.logger.error('Failed to load project detail', error);
              this.isLoading.set(false);
              this.cdr.markForCheck();
              return EMPTY;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (detail: IProjectDetailGetResponseDto) => {
          this.projectDetail.set(detail);
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  protected get contractors(): string {
    const list = this.projectDetail()?.siteContractors;
    if (!list?.length) {
      return '—';
    }
    return list.map(sc => sc.contractor.name).join(', ');
  }
}
