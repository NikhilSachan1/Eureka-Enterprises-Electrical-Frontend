import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { TimelineComponent } from '@shared/components/timeline/timeline.component';
import {
  ETimelineAlign,
  ETimelineLayout,
  ITimelineConfig,
} from '@shared/types';
import { ICONS } from '@shared/constants';

interface ISiteTimelineEvent {
  title: string;
  description: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'in-progress';
  icon?: string;
}
@Component({
  selector: 'app-get-project-timeline',
  imports: [TimelineComponent],
  templateUrl: './get-project-timeline.component.html',
  styleUrl: './get-project-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectTimelineComponent {
  icons = ICONS;

  private readonly timelineEvents = signal<ISiteTimelineEvent[]>([
    {
      title: 'Site Created',
      description: 'Created by Admin User',
      date: '01 Oct 2025',
      time: '05:30 AM',
      status: 'completed',
      icon: this.icons.ACTIONS.CHECK,
    },
    {
      title: 'Contractors Assigned',
      description: '3 contractors assigned to the site',
      date: '02 Oct 2025',
      time: '05:30 AM',
      status: 'completed',
      icon: this.icons.ACTIONS.CHECK,
    },
    {
      title: 'Employees Allocated',
      description: '5 employees assigned',
      date: '13 Oct 2025',
      time: '05:30 AM',
      status: 'completed',
      icon: this.icons.ACTIONS.CHECK,
    },
    {
      title: 'Site Started (ON_HOLD)',
      description: 'Work commenced',
      date: '15 Oct 2025',
      time: '05:30 AM',
      status: 'completed',
      icon: this.icons.ACTIONS.CHECK,
    },
    {
      title: 'First PO Uploaded',
      description: 'PO-2026-001: ₹1.20 Cr',
      date: '15 Oct 2025',
      time: '05:30 AM',
      status: 'completed',
      icon: this.icons.ACTIONS.CHECK,
    },
  ]);

  protected readonly timelineConfig = computed<Partial<ITimelineConfig>>(
    () => ({
      value: this.timelineEvents(),
      layout: ETimelineLayout.VERTICAL,
      align: ETimelineAlign.LEFT,
    })
  );
}
