import { ISiteAllocationGetBaseResponseDto } from '../types/project.dto';

import {
  IEmployeeJourney,
  IJourneyFreeGap,
  IJourneyFreeWindow,
  IAllocationPeriod,
  IJourneyYear,
  IProjectRoster,
  IProjectRosterEntry,
} from '../types/allocation-journey.interface';
import {
  EJourneyEntryKind,
  TJourneyEntry,
} from '../types/allocation-journey.types';
import { fromDayNumber, parseCalendarDay, toDayNumber } from '@shared/utility';

/**
 * Builds the allocation drawers' data: one employee's journey across projects (with the free
 * days between allocations) and the people of one project. Dates are calendar days; a period's
 * end day is included and a running allocation counts up to today.
 */

function roleOf(record: ISiteAllocationGetBaseResponseDto): string {
  const role = record.role?.trim();
  // A blank role shows as a dash too, so this is not `??`.
  return role !== undefined && role !== '' ? role : '—';
}

/** On the project now: the same flag the summaries count "on site now" with. */
function isRunning(record: ISiteAllocationGetBaseResponseDto): boolean {
  return record.isCurrentlyAllocated;
}

/**
 * When an allocation ended, or null while it runs. Old data has ended allocations without a
 * deallocation date; their last change (the deallocation) stands in, else the start.
 */
export function endOf(
  record: ISiteAllocationGetBaseResponseDto,
  start: Date
): Date | null {
  if (isRunning(record)) {
    return null;
  }
  return (
    parseCalendarDay(record.deallocatedAt) ??
    parseCalendarDay(record.updatedAt) ??
    start
  );
}

function personName(
  user:
    | { firstName?: string | null; lastName?: string | null }
    | null
    | undefined
): string | null {
  const name = [user?.firstName, user?.lastName]
    .map(part => part?.trim() ?? '')
    .filter(part => part !== '')
    .join(' ');
  return name === '' ? null : name;
}

function locationOf(record: ISiteAllocationGetBaseResponseDto): string {
  return [record.site.city, record.site.state]
    .map(part => part?.trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * Days from start to end (or today while running), counted only inside the period when one is
 * given, like the summary tables; a backwards range counts as zero.
 */
function daysBetween(
  start: Date,
  end: Date | null,
  today: Date,
  period: IAllocationPeriod | null = null
): number {
  const first = Math.max(
    toDayNumber(start),
    period?.from ? toDayNumber(period.from) : -Infinity
  );
  const last = Math.min(
    toDayNumber(end ?? today),
    period?.to ? toDayNumber(period.to) : Infinity
  );
  return Math.max(0, last - first + 1);
}

/** The allocation-list filter for a period (allocations overlapping it); none for all time. */
export function periodRange(period: IAllocationPeriod | null): {
  dateRange?: (Date | null)[];
} {
  if (!period?.from && !period?.to) {
    return {};
  }
  // Only the ends that are set reach the server; an open end stays open.
  return { dateRange: [period.from, period.to] };
}

/** Groups entries (already newest first) by the year they start in. */
function groupByYear<T extends { start: Date }>(
  entries: T[]
): IJourneyYear<T>[] {
  const years: IJourneyYear<T>[] = [];
  for (const entry of entries) {
    const year = entry.start.getFullYear();
    const last = years.at(-1);
    if (last?.year === year) {
      last.entries.push(entry);
    } else {
      years.push({ year, entries: [entry] });
    }
  }
  return years;
}

export function startsOf(
  records: readonly ISiteAllocationGetBaseResponseDto[]
): { record: ISiteAllocationGetBaseResponseDto; start: Date }[] {
  return records
    .map(record => ({ record, start: parseCalendarDay(record.allocatedAt) }))
    .filter(
      (
        item
      ): item is { record: ISiteAllocationGetBaseResponseDto; start: Date } =>
        item.start !== null
    );
}

/**
 * One employee's allocations across projects, newest first, with their free stretches.
 *
 * With a window (the table's): free days are the window's days on no project — the same count as
 * the table — and the timeline also shows the free stretch before the first allocation and after
 * the last one. Without it, only gaps between allocations count.
 */
export function buildEmployeeJourney(
  records: readonly ISiteAllocationGetBaseResponseDto[],
  today: Date,
  window?: IJourneyFreeWindow,
  period: IAllocationPeriod | null = null
): IEmployeeJourney {
  const todayDay = toDayNumber(today);
  const allocations = startsOf(records).sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const chronological: TJourneyEntry[] = [];
  let coveredUntil: number | null = null;
  let allocatedDays = 0;
  let freeDays = 0;

  for (const { record, start } of allocations) {
    const end = endOf(record, start);
    const startDay = toDayNumber(start);
    const endDay = end ? toDayNumber(end) : Math.max(todayDay, startDay);

    if (coveredUntil !== null && startDay > coveredUntil + 1) {
      const days = startDay - coveredUntil - 1;
      freeDays += days;
      chronological.push({
        kind: EJourneyEntryKind.FREE,
        start: fromDayNumber(coveredUntil + 1),
        end: fromDayNumber(startDay - 1),
        days,
      });
    }

    const days = daysBetween(start, end, today, period);
    allocatedDays += days;
    chronological.push({
      kind: EJourneyEntryKind.ALLOCATION,
      id: record.id,
      projectName: record.site.name,
      projectLocation: locationOf(record),
      role: roleOf(record),
      start,
      end,
      days,
    });
    coveredUntil = Math.max(coveredUntil ?? endDay, endDay);
  }

  const windowFrom = parseCalendarDay(window?.from);
  const windowTo = parseCalendarDay(window?.to);
  if (windowFrom && windowTo) {
    const fromDay = toDayNumber(windowFrom);
    const toDay = toDayNumber(windowTo);
    const covered = coveredDays(allocations, today, fromDay, toDay);
    freeDays = Math.max(0, toDay - fromDay + 1 - covered.size);

    // Free before the first allocation, and from the last one's end to the window's end.
    const firstStart = allocations.length
      ? toDayNumber(allocations[0].start)
      : toDay + 1;
    if (firstStart > fromDay) {
      chronological.unshift(freeGap(fromDay, Math.min(firstStart - 1, toDay)));
    }
    if (coveredUntil !== null && coveredUntil < toDay) {
      chronological.push(freeGap(Math.max(coveredUntil + 1, fromDay), toDay));
    }
  }

  return {
    years: groupByYear(chronological.reverse()),
    allocationCount: allocations.length,
    projectCount: new Set(allocations.map(item => item.record.site.name)).size,
    allocatedDays,
    freeDays,
    currentProjects: [
      ...new Set(
        allocations
          .filter(item => isRunning(item.record))
          .map(item => item.record.site.name)
      ),
    ],
  };
}

/** Distinct days, inside [fromDay, toDay], that fall in any allocation. */
function coveredDays(
  allocations: readonly {
    record: ISiteAllocationGetBaseResponseDto;
    start: Date;
  }[],
  today: Date,
  fromDay: number,
  toDay: number
): Set<number> {
  const days = new Set<number>();
  const todayDay = toDayNumber(today);
  for (const { record, start } of allocations) {
    const end = endOf(record, start);
    const first = Math.max(toDayNumber(start), fromDay);
    const last = Math.min(end ? toDayNumber(end) : todayDay, toDay);
    for (let day = first; day <= last; day++) {
      days.add(day);
    }
  }
  return days;
}

function freeGap(fromDay: number, toDay: number): IJourneyFreeGap {
  return {
    kind: EJourneyEntryKind.FREE,
    start: fromDayNumber(fromDay),
    end: fromDayNumber(toDay),
    days: toDay - fromDay + 1,
  };
}

/**
 * Everyone who worked on one project, as one timeline (newest first, by year); each entry is
 * either still allocated or deallocated.
 */
export function buildProjectRoster(
  records: readonly ISiteAllocationGetBaseResponseDto[],
  today: Date,
  period: IAllocationPeriod | null = null
): IProjectRoster {
  const entries = startsOf(records)
    .map(({ record, start }): IProjectRosterEntry => {
      const end = endOf(record, start);
      return {
        id: record.id,
        fullName: `${record.user.firstName} ${record.user.lastName}`.trim(),
        employeeId: record.user.employeeId,
        role: roleOf(record),
        start,
        end,
        days: daysBetween(start, end, today, period),
        allocatedBy: personName(record.createdByUser),
        // The last change of an ended allocation is its deallocation.
        removedBy: end === null ? null : personName(record.updatedByUser),
      };
    })
    .sort((a, b) => b.start.getTime() - a.start.getTime());

  return {
    current: entries.filter(entry => entry.end === null),
    years: groupByYear(entries),
    totalPeople: new Set(records.map(record => record.user.id)).size,
    allocationCount: entries.length,
  };
}
