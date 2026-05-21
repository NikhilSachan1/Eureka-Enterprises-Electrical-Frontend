import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { TimelineComponent } from '@shared/components/timeline/timeline.component';
import { SectionLoaderComponent } from '@shared/components/section-loader/section-loader.component';
import { ICONS } from '@shared/constants/icon.constants';
import {
  ETimelineAlign,
  ETimelineLayout,
  ITimelineConfig,
} from '@shared/types';
import { finalize } from 'rxjs';
import {
  IProjectTimelineGetFormDto,
  IProjectTimelineGetResponseDto,
} from '../../types/project-timeline.dto';
import { IProjectTimelineEventView } from '../../types/project-timeline.interface';
import { ProjectTimelineService } from '../../services/project-timeline.service';

@Component({
  selector: 'app-get-project-timeline',
  imports: [CommonModule, TimelineComponent, SectionLoaderComponent],
  templateUrl: './get-project-timeline.component.html',
  styleUrl: './get-project-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectTimelineComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly projectTimelineService = inject(ProjectTimelineService);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );

  protected readonly icons = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;

  protected readonly isLoading = signal(false);
  protected readonly events = signal<IProjectTimelineEventView[]>([]);

  protected readonly timelineConfig = computed<Partial<ITimelineConfig>>(
    () => ({
      value: this.events(),
      layout: ETimelineLayout.VERTICAL,
      align: ETimelineAlign.LEFT,
    })
  );

  constructor() {
    effect(() => {
      const projectId = this.projectWorkspaceContext.selectedProjectId();

      if (!projectId) {
        this.isLoading.set(false);
        this.events.set([]);
        return;
      }

      this.loadTimeline(projectId);
    });
  }

  private loadTimeline(projectId: string): void {
    this.isLoading.set(true);
    this.events.set([]);

    const paramData = this.prepareParamData(projectId);

    this.projectTimelineService
      .getProjectTimeline(paramData)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectTimelineGetResponseDto) => {
          this.events.set(this.mapTimelineEvents(response));
        },
        error: error => {
          this.events.set([]);
          this.logger.error('Failed to load project timeline', error);
        },
      });
  }

  private prepareParamData(projectName: string): IProjectTimelineGetFormDto {
    return {
      projectName,
    };
  }

  private mapTimelineEvents(
    response: IProjectTimelineGetResponseDto
  ): IProjectTimelineEventView[] {
    return (response.timeline ?? []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      occurredAt: this.timelineOccurredAt(row.date, row.time),
      icon: ICONS.COMMON.HISTORY,
      actor: row.actor,
    }));
  }

  private timelineOccurredAt(dateStr: string, timeStr: string): Date {
    const day = dateStr.trim();
    const cut = day.indexOf('T');
    const ymd = cut === -1 ? day : day.slice(0, cut);

    const raw = (timeStr ?? '').trim();
    if (raw) {
      const dot = raw.indexOf('.');
      const hms = dot === -1 ? raw : raw.slice(0, dot);
      const ms = Date.parse(`${ymd}T${hms}`);
      if (Number.isFinite(ms)) {
        return new Date(ms);
      }
    }

    const ms = Date.parse(day);
    return Number.isFinite(ms) ? new Date(ms) : new Date(0);
  }
}
