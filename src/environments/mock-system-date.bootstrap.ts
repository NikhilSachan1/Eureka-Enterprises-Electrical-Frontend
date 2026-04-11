import { environment } from './environment';

/** `YYYY-MM-DD` only → local date at noon; anything else → `Date` parse (e.g. ISO with time). */
function parseMockSystemInstant(raw: string): number | null {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0).getTime();
  }
  const NativeDate = Date;
  const ms = new NativeDate(s).getTime();
  if (Number.isNaN(ms)) {
    return null;
  }
  return ms;
}

/**
 * Must be imported before any other app code in `main.ts` so `Date` / `Date.now()`
 * match the configured mock clock for local dev.
 */
function applyMockSystemDate(): void {
  if (environment.PRODUCTION) {
    return;
  }
  const raw = environment.MOCK_SYSTEM_DATE;
  if (raw === null || raw === '') {
    return;
  }

  const targetMs = parseMockSystemInstant(raw ?? '');
  if (targetMs === null) {
    console.warn(
      '[MOCK_SYSTEM_DATE] Invalid value (use YYYY-MM-DD or a parseable ISO datetime):',
      raw
    );
    return;
  }

  const OriginalDate = Date;
  const offset = targetMs - OriginalDate.now();

  class MockSystemDate extends OriginalDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(OriginalDate.now() + offset);
      } else {
        super(...(args as Parameters<DateConstructor>));
      }
    }

    static override now(): number {
      return OriginalDate.now() + offset;
    }

    static override parse(s: string): number {
      return OriginalDate.parse(s);
    }

    static override UTC(...args: Parameters<typeof Date.UTC>): number {
      return OriginalDate.UTC(...args);
    }
  }

  (globalThis as unknown as { Date: DateConstructor }).Date =
    MockSystemDate as unknown as DateConstructor;

  console.warn(
    `[MOCK_SYSTEM_DATE] Mock clock: ${new OriginalDate(targetMs).toString()} (input: ${raw})`
  );
}

applyMockSystemDate();
