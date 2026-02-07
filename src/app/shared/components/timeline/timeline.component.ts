import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { ITimelineConfig } from '@shared/types';
import { DEFAULT_TIMELINE_CONFIG } from '@shared/config';

@Component({
  selector: 'app-timeline',
  imports: [CommonModule, TimelineModule],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  config = input.required<Partial<ITimelineConfig>>();

  // Content templates from parent component
  contentTemplate = contentChild<TemplateRef<unknown>>('content');
  markerTemplate = contentChild<TemplateRef<unknown>>('marker');

  protected timelineConfig = computed(() => this.buildTimelineConfig());

  private buildTimelineConfig(): ITimelineConfig {
    const finalConfig: ITimelineConfig = {
      ...DEFAULT_TIMELINE_CONFIG,
      ...this.config(),
    } as ITimelineConfig;

    return finalConfig;
  }
}
