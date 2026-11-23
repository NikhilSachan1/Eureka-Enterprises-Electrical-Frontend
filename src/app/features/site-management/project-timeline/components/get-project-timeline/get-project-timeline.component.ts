import { CommonModule } from '@angular/common';
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
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { TimelineComponent } from '@shared/components/timeline/timeline.component';
import { SectionLoaderComponent } from '@shared/components/section-loader/section-loader.component';
import { ICONS } from '@shared/constants/icon.constants';
import {
  ETimelineAlign,
  ETimelineLayout,
  ITimelineConfig,
} from '@shared/types';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import {
  IProjectTimelineGetFormDto,
  IProjectTimelineGetResponseDto,
} from '../../types/project-timeline.dto';
import { IProjectTimelineEventView } from '../../types/project-timeline.interface';
import { ProjectTimelineService } from '../../services/project-timeline.service';
import { transformDateFormat } from '@shared/utility';

/** Events shown in the workspace tile; the rest open in the full timeline. */
const RECENT_EVENTS = 4;

/**
 * Project activity in the workspace: the latest few events as a compact list, with the full
 * timeline a click away.
 */
@Component({
  selector: 'app-get-project-timeline',
  imports: [
    CommonModule,
    DialogModule,
    TimelineComponent,
    SectionLoaderComponent,
  ],
  templateUrl: './get-project-timeline.component.html',
  styleUrl: './get-project-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectTimelineComponent {
  readonly projectId = input.required<string>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly projectTimelineService = inject(ProjectTimelineService);

  protected readonly icons = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;

  protected readonly isLoading = signal(false);
  protected readonly events = signal<IProjectTimelineEventView[]>([]);
  /** Newest first, as the API returns them. */
  protected readonly recentEvents = computed(() =>
    this.events().slice(0, RECENT_EVENTS)
  );
  protected readonly fullTimelineVisible = signal(false);

  protected readonly timelineConfig = computed<Partial<ITimelineConfig>>(
    () => ({
      value: this.events(),
      layout: ETimelineLayout.VERTICAL,
      align: ETimelineAlign.LEFT,
    })
  );

  constructor() {
    effect(() => {
      const projectId = this.projectId()?.trim();
      if (!projectId) {
        this.events.set([]);
        return;
      }

      this.loadTimeline(projectId);
    });
  }

  /** "just now", "5m ago", "3h ago", "2d ago", else the date. */
  protected relativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) {
      return 'just now';
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}d ago`;
    }
    return transformDateFormat(date, APP_CONFIG.DATE_FORMATS.DAY_MONTH);
  }

  private loadTimeline(projectId: string): void {
    this.isLoading.set(true);
    this.events.set([]);

    const paramData = this.prepareParamData();

    this.projectTimelineService
      .getProjectTimeline(projectId, paramData)
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

  private prepareParamData(): IProjectTimelineGetFormDto {
    return {
      limit: 50,
    };
  }

  private mapTimelineEvents(
    response: IProjectTimelineGetResponseDto
  ): IProjectTimelineEventView[] {
    return (response.timeline ?? []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      occurredAt: this.timelineOccurredAt(row.date, row.time ?? '00:00'),
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
