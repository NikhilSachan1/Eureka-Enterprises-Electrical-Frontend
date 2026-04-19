import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { TimelineComponent } from '@shared/components/timeline/timeline.component';
import { ICONS } from '@shared/constants/icon.constants';
import { LoadingService } from '@shared/services';
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
import {
  IProjectTimelineEventView,
  IProjectTimelinePageView,
} from '../../types/project-timeline.interface';
import { ProjectTimelineService } from '../../services/project-timeline.service';

@Component({
  selector: 'app-get-project-timeline',
  imports: [CommonModule, TimelineComponent],
  templateUrl: './get-project-timeline.component.html',
  styleUrl: './get-project-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectTimelineComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly projectTimelineService = inject(ProjectTimelineService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly icons = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;

  private readonly projectId = signal<string>('');
  protected readonly timelinePage = signal<IProjectTimelinePageView | null>(
    null
  );

  protected readonly timelineConfig = computed<Partial<ITimelineConfig>>(
    () => ({
      value: this.timelinePage()?.events ?? [],
      layout: ETimelineLayout.VERTICAL,
      align: ETimelineAlign.LEFT,
    })
  );

  ngOnInit(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    this.projectId.set(projectId);
    this.loadProjectTimeline();
  }

  private loadProjectTimeline(): void {
    this.loadingService.show({
      title: 'Loading Project Timeline',
      message:
        "We're loading the project timeline. This will just take a moment.",
    });
    const paramData = this.prepareParamData();
    this.projectTimelineService
      .getProjectTimeline(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectTimelineGetResponseDto) => {
          this.timelinePage.set(this.mapApiResponseToTimelinePage(response));
          this.logger.logUserAction('Project timeline loaded successfully');
        },
        error: error => {
          this.timelinePage.set(null);
          this.logger.logUserAction('Failed to load project timeline', error);
        },
      });
  }

  private prepareParamData(): IProjectTimelineGetFormDto {
    return {
      projectName: this.projectId(),
    };
  }

  private mapApiResponseToTimelinePage(
    response: IProjectTimelineGetResponseDto
  ): IProjectTimelinePageView {
    const events: IProjectTimelineEventView[] = response.timeline.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      occurredAt: this.timelineOccurredAt(row.date, row.time),
      eventType: row.eventType,
      icon: ICONS.COMMON.HISTORY,
      actor: row.actor,
    }));

    return {
      events,
      eventCount: events.length,
    } satisfies IProjectTimelinePageView;
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
