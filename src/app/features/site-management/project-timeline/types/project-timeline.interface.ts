export interface IProjectTimelineEventView {
  id: string;
  title: string;
  description: string;
  occurredAt: Date;
  icon: string;
  actor: string | null;
}
