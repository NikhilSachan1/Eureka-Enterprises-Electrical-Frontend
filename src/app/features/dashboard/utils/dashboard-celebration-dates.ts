/** Local-calendar YYYY-MM-DD for dashboard celebration mocks. */
export function dashboardTodayYmd(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

export function addDaysToIsoDate(isoYmd: string, deltaDays: number): string {
  const [y, m, d] = isoYmd.split('-').map(Number);
  const dt = new Date(y, m - 1, d + deltaDays);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function celebrationTiming(
  rowDate: string,
  todayYmd: string = dashboardTodayYmd()
): { label: string; variant: 'today' | 'upcoming' } {
  return rowDate === todayYmd
    ? { label: 'Today', variant: 'today' }
    : { label: 'Upcoming', variant: 'upcoming' };
}
