import type { ISiteAllocationGetBaseResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  endOf,
  startsOf,
} from '@features/site-management/project-management/utility/allocation-journey.util';
import { fromDayNumber, parseCalendarDay, toDayNumber } from '@shared/utility';
import type { IDsrGetBaseResponseDto } from '../types/dsr.dto';
import type {
  IDsrProjectTimeline,
  IDsrTimelineMonth,
  IDsrTimelineReport,
} from '../types/dsr-summary.interface';
import {
  EDsrTimelineEntryKind,
  TDsrTimelineEntry,
} from '../types/dsr-summary.types';

/**
 * A project's DSR timeline, newest first, by month. A day is expected when someone was allocated
 * that day (every day is a working day); it is reported when a DSR exists, and missing when it was
 * expected with none. Consecutive missing days are one entry. Same rule as the server's summary.
 */
export function buildDsrProjectTimeline(
  reports: readonly IDsrGetBaseResponseDto[],
  allocations: readonly ISiteAllocationGetBaseResponseDto[],
  today: Date,
  period: { from: Date | null; to: Date | null }
): IDsrProjectTimeline {
  const todayDay = toDayNumber(today);
  const toDay = Math.min(
    period.to ? toDayNumber(period.to) : todayDay,
    todayDay
  );
  const fromDay = period.from ? toDayNumber(period.from) : null;

  // Who was allocated on each day in the window.
  const allocatedOn = new Map<number, Set<string>>();
  for (const { record, start } of startsOf(allocations)) {
    const end = endOf(record, start);
    const first = Math.max(toDayNumber(start), fromDay ?? -Infinity);
    const last = Math.min(end ? toDayNumber(end) : todayDay, toDay);
    const name = `${record.user.firstName} ${record.user.lastName}`.trim();
    for (let day = first; day <= last; day++) {
      const people = allocatedOn.get(day) ?? new Set<string>();
      people.add(name);
      allocatedOn.set(day, people);
    }
  }

  // DSRs per day in the window.
  const reportsOn = new Map<number, IDsrTimelineReport[]>();
  const reporters = new Set<string>();
  const inWindow = reports.filter(report => {
    const date = parseCalendarDay(report.reportDate);
    if (!date) {
      return false;
    }
    const day = toDayNumber(date);
    return day <= toDay && (fromDay === null || day >= fromDay);
  });
  for (const report of inWindow) {
    const day = toDayNumber(parseCalendarDay(report.reportDate) ?? new Date());
    reporters.add(report.user.id);
    const list = reportsOn.get(day) ?? [];
    list.push({
      id: report.id,
      reporterName: `${report.user.firstName} ${report.user.lastName}`.trim(),
      employeeId: report.user.employeeId,
      workTypes: report.workTypes,
      reportingEngineerName: report.reportingEngineerName,
      remarks: report.remarks,
    });
    reportsOn.set(day, list);
  }

  const days = [...new Set([...allocatedOn.keys(), ...reportsOn.keys()])].sort(
    (a, b) => b - a
  );

  const entries: TDsrTimelineEntry[] = [];
  let expectedDays = 0;
  let reportedDays = 0;
  for (const day of days) {
    const dayReports = reportsOn.get(day);
    const people = allocatedOn.get(day);
    if (people) {
      expectedDays++;
      if (dayReports) {
        reportedDays++;
      }
    }

    if (dayReports) {
      entries.push({
        kind: EDsrTimelineEntryKind.REPORTED,
        day: fromDayNumber(day),
        reports: dayReports,
      });
    } else {
      addMissingDay(entries, day, people);
    }
  }

  return {
    months: groupByMonth(entries),
    expectedDays,
    reportedDays,
    missingDays: expectedDays - reportedDays,
    reporters: reporters.size,
  };
}

/** A missing day extends the run on the next (newer) day when contiguous, else starts one. */
function addMissingDay(
  entries: TDsrTimelineEntry[],
  day: number,
  people: Set<string> | undefined
): void {
  const last = entries.at(-1);
  if (
    last?.kind === EDsrTimelineEntryKind.MISSING &&
    toDayNumber(last.start) === day + 1
  ) {
    last.start = fromDayNumber(day);
    last.days++;
    last.allocatedPeople = [
      ...new Set([...last.allocatedPeople, ...(people ?? [])]),
    ];
    return;
  }
  entries.push({
    kind: EDsrTimelineEntryKind.MISSING,
    start: fromDayNumber(day),
    end: fromDayNumber(day),
    days: 1,
    allocatedPeople: [...(people ?? [])],
  });
}

/** Groups entries (already newest first) by the month of their latest day. */
function groupByMonth(entries: TDsrTimelineEntry[]): IDsrTimelineMonth[] {
  const months: IDsrTimelineMonth[] = [];
  for (const entry of entries) {
    const date =
      entry.kind === EDsrTimelineEntryKind.REPORTED ? entry.day : entry.end;
    const month = new Date(date.getFullYear(), date.getMonth(), 1);
    const current = months.at(-1);
    if (current?.month.getTime() === month.getTime()) {
      current.entries.push(entry);
    } else {
      months.push({ month, entries: [entry] });
    }
  }
  return months;
}
