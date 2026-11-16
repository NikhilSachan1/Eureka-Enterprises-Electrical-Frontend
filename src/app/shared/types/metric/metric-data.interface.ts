import { EDataType } from '../common/data-types.type';
import { IKnobConfig } from '../knob/knob.interface';

export interface IMetric {
  label: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: string;
  type?: EDataType;
  format?: string;
  permission?: string[];
  metricType?: EDataType;
  knobConfig?: Partial<IKnobConfig>;
  /** When true, value column shows a spinner while backing data is loading. */
  valueLoading?: boolean;
  /**
   * Search-filter values this metric stands for. With a `filterTarget` on the card, clicking
   * the metric applies them to the list (clicking it again clears them). See {@link TMetricFilter}.
   */
  filter?: TMetricFilter;
}

/**
 * Filter field name → value a metric applies.
 * - a string is matched against the field's options by value or label, ignoring case, spaces,
 *   `_` and `-` (so `'work completed'` finds `WORK_COMPLETED`); multi-selects get `[value]`;
 * - a list of strings is tried in order and the first that matches an option wins;
 * - `null` clears the field, e.g. a "Total" metric clearing the status filter.
 */
export type TMetricFilter = Record<string, string | readonly string[] | null>;

/** What a metrics card filters when a metric is clicked; the page's search filter implements it. */
export interface IMetricFilterTarget {
  /** True when the filter bar has the fields this metric sets (fields can be hidden by permission). */
  canApplyMetricFilter(filter: TMetricFilter): boolean;
  /** True when the applied filters already match this metric. Must read signals, so cards update. */
  isMetricFilterActive(filter: TMetricFilter): boolean;
  /** Applies the metric's values and reloads the list, or clears them when already active. */
  applyMetricFilter(filter: TMetricFilter): void;
}

/** `kpi` = one centered figure, no panel header / list rows (same grid cell as other panels). */
export type IMetricGroupLayout = 'default' | 'kpi';

// Group of metrics with header
export interface IMetricGroup {
  id: string;
  title: string;
  icon?: string;
  metrics: IMetric[];
  permission?: string[];
  layout?: IMetricGroupLayout;
}
