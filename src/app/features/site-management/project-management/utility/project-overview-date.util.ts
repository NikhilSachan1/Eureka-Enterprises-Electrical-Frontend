import {
  IDateFieldConfig,
  IEnhancedForm,
  IInputFieldsConfig,
} from '@shared/types';
import { toLocalCalendarDate } from '@shared/utility';
import { IProjectOverviewGetResponseDto } from '../types/project.dto';

export interface IProjectSiteDateRange {
  startDate?: string | null;
  endDate?: string | null;
}

export function parseProjectDateOnly(
  value: Date | string | null | undefined
): Date | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return toDateOnly(value);
}

function toDateOnly(value: Date | string): Date | undefined {
  return toLocalCalendarDate(value) ?? undefined;
}

export function resolveProjectMaxDate(endDate: Date): Date {
  return toDateOnly(endDate) ?? endDate;
}

export function setProjectDateFieldLoading(
  form: IEnhancedForm<Record<string, unknown>>,
  dateFieldName: string,
  loading: boolean
): void {
  const base = form.fieldConfigs[dateFieldName];
  if (!base) {
    return;
  }

  form.fieldConfigs[dateFieldName] = {
    ...base,
    dateConfig: {
      ...base.dateConfig,
      loading,
    },
  } as IInputFieldsConfig;
}

function applyProjectDateRangeBounds(
  form: IEnhancedForm<Record<string, unknown>>,
  dateFieldName: string,
  startDate?: string | null,
  endDate?: string | null,
  loading = false
): boolean {
  const base = form.fieldConfigs[dateFieldName];
  if (!base) {
    return false;
  }

  const minDate = startDate ? toDateOnly(startDate) : undefined;
  const parsedEndDate = endDate ? toDateOnly(endDate) : undefined;
  if (!minDate && !parsedEndDate) {
    form.fieldConfigs[dateFieldName] = {
      ...base,
      dateConfig: {
        ...base.dateConfig,
        loading: false,
      },
    } as IInputFieldsConfig;
    return false;
  }

  const maxDate = parsedEndDate
    ? resolveProjectMaxDate(parsedEndDate)
    : undefined;

  form.fieldConfigs[dateFieldName] = {
    ...base,
    dateConfig: {
      ...base.dateConfig,
      minDate,
      maxDate,
      loading,
    },
  } as IInputFieldsConfig;

  return true;
}

export function applyProjectDateRangeFromOverview(
  form: IEnhancedForm<Record<string, unknown>>,
  dateFieldName: string,
  defaultDateConfig: Partial<IDateFieldConfig> | undefined,
  overview: IProjectOverviewGetResponseDto
): boolean {
  void defaultDateConfig;
  const { startDate, endDate } = overview.site ?? {};
  return applyProjectDateRangeBounds(
    form,
    dateFieldName,
    startDate,
    endDate,
    false
  );
}

export function applyProjectDateRangeFromSite(
  form: IEnhancedForm<Record<string, unknown>>,
  dateFieldName: string,
  defaultDateConfig: Partial<IDateFieldConfig> | undefined,
  site?: IProjectSiteDateRange | null
): boolean {
  void defaultDateConfig;
  return applyProjectDateRangeBounds(
    form,
    dateFieldName,
    site?.startDate,
    site?.endDate,
    false
  );
}

export function resetProjectDateField(
  form: IEnhancedForm<Record<string, unknown>>,
  dateFieldName: string,
  defaultDateConfig: Partial<IDateFieldConfig> | undefined
): void {
  const base = form.fieldConfigs[dateFieldName];
  if (!base) {
    return;
  }

  form.fieldConfigs[dateFieldName] = {
    ...base,
    dateConfig: {
      ...base.dateConfig,
      minDate: undefined,
      maxDate: defaultDateConfig?.maxDate,
      loading: false,
    },
  } as IInputFieldsConfig;
}
