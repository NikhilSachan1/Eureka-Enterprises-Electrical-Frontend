export interface IProjectTimelineEventView {
  id: string;
  title: string;
  description: string;
  occurredAt: Date;
  eventType: string;
  icon: string;
  actor: string | null;
}

export interface IProjectTimelinePageView {
  events: IProjectTimelineEventView[];
  eventCount: number;
}
