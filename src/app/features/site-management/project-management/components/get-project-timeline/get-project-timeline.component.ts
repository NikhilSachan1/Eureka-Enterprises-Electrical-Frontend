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
import { TimelineComponent } from '@shared/components/timeline/timeline.component';
import { ICONS } from '@shared/constants';
import { ETimelineLayout } from '@shared/types';
import { ProjectService } from '../../services/project.service';
import { IProjectTimelineGetResponseDto } from '../../types/project.dto';
import {
  IProjectTimelineEvent,
  IProjectTimelineMeta,
} from '../../types/project.interface';
import { DatePipe, NgClass } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { AppConfigurationService } from '@shared/services/app-configuration.service';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-get-project-timeline',
  imports: [TimelineComponent, DatePipe, NgClass],
  templateUrl: './get-project-timeline.component.html',
  styleUrl: './get-project-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectTimelineComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly timelineEvents = signal<IProjectTimelineEvent[]>([]);
  protected readonly timelineMeta = signal<IProjectTimelineMeta>(
    {} as IProjectTimelineMeta
  );

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  protected readonly icons = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;

  protected readonly timelineConfig = computed(() => ({
    value: this.timelineEvents(),
    layout: ETimelineLayout.VERTICAL,
  }));

  ngOnInit(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;

    if (!projectId) {
      this.isLoading.set(false);
      return;
    }

    this.loadTimeline(projectId);
  }

  private loadTimeline(projectId: string): void {
    this.projectService
      .getProjectTimeline(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectTimelineGetResponseDto) => {
          this.timelineMeta.set({
            siteName: response.siteName,
            currentStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.projectStatus(),
              response.currentStatus
            ),
            completionPercent: response.completionPercent,
            daysElapsed: response.daysElapsed,
            daysRemaining: response.daysRemaining,
          });
          this.timelineEvents.set(
            response.timeline.map(event => this.mapToTimelineEvent(event))
          );
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  private mapToTimelineEvent(
    event: IProjectTimelineGetResponseDto['timeline'][0]
  ): IProjectTimelineEvent {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      icon: this.icons.ACTIONS.CHECK,
    };
  }
}
