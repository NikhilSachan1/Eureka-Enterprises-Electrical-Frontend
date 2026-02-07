import { ETimelineAlign, ETimelineLayout } from './timeline.types';

export interface ITimelineConfig {
  value: unknown[];
  layout: ETimelineLayout;
  align: ETimelineAlign;
}
