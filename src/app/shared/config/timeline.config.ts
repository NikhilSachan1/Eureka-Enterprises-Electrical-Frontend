import {
  ETimelineAlign,
  ETimelineLayout,
  ITimelineConfig,
} from '@shared/types';

export const DEFAULT_TIMELINE_CONFIG: Partial<ITimelineConfig> = {
  layout: ETimelineLayout.HORIZONTAL,
  align: ETimelineAlign.LEFT,
  value: [],
};
